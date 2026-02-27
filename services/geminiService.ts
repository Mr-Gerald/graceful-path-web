
import { GoogleGenAI, Type } from "@google/genai";
import { supabase } from '../services/supabaseClient';

// Use multiple possible environment variables for the API key to ensure compatibility
// Use multiple possible environment variables for the API key to ensure compatibility
const getKeys = async () => {
  const { data, error } = await supabase.from('api_keys').select('key_value').eq('is_active', true);
  if (error) {
    console.error('Error fetching API keys from Supabase:', error);
    return [];
  }
  return data.map(row => row.key_value);
};

let currentKeyIndex = 0;

const callWithKeyRotation = async (fn: (ai: GoogleGenAI) => Promise<any>, onProgress?: (message: string) => void) => {
  const keys = await getKeys();
  if (keys.length === 0) {
    const errorMessage = "Gemini API Key is missing. Please add keys in Admin Panel.";
    if (onProgress) onProgress(errorMessage);
    throw new Error(errorMessage);
  }

  const maxRetries = keys.length;
  let lastError: any = null;

  for (let i = 0; i < maxRetries; i++) {
    const key = keys[currentKeyIndex];
    if (onProgress) onProgress(`🔑 Authenticating with Gemini Engine (Key ${currentKeyIndex + 1}/${keys.length})...`);
    const ai = new GoogleGenAI({ apiKey: key });
    
    try {
      return await fn(ai);
    } catch (error: any) {
      lastError = error;
      // If it's a rate limit error (429), switch to next key
      if (error.message?.includes('429') || error.status === 429) {
        console.warn(`Rate limit hit for key ${currentKeyIndex}. Switching to next key...`);
        currentKeyIndex = (currentKeyIndex + 1) % keys.length;
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

export const geminiService = {
  /**
   * General chatbot for clinical nursing queries.
   */
  async chat(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
    return await callWithKeyRotation(async (ai) => {
      // Initialize chat with history for better context awareness
      const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        history,
        config: {
          systemInstruction: `You are an expert clinical nursing tutor for Graceful Path Global Health. 
          Your goal is to help nursing students and professionals excel in their exams and global career transitions.
          Brand voice: Supportive, professional, clear, and simplified. 
          Focus on clinical reasoning and safety. Use Google Search to find latest clinical guidelines if asked about current standards.`,
          tools: [{ googleSearch: {} }]
        }
      });
      
      const result = await chat.sendMessage({ message });
      return {
        text: result.text,
        grounding: result.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      };
    });
  },

  /**
   * Analyze medical images or study notes.
   */
  async analyzeStudyMaterial(base64Image: string, prompt: string) {
    return await callWithKeyRotation(async (ai) => {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
            { text: prompt || "Explain this medical diagram or study note in simple clinical terms." }
          ]
        }
      });
      return response.text;
    });
  },

  /**
   * Generate a study schedule based on user's weak areas.
   */
  async generateStudyPlan(weakAreas: string[], examDate: string) {
    return await callWithKeyRotation(async (ai) => {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a structured clinical study plan focusing on: ${weakAreas.join(', ')}. 
        The target exam date is ${examDate}. Provide the response in JSON format.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              plan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    week: { type: Type.NUMBER },
                    focus: { type: Type.STRING },
                    tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                }
              }
            }
          }
        }
      });
      return JSON.parse(response.text || '{}');
    });
  },

  /**
   * Generate NCLEX-style assessment questions with streaming support.
   */
  async generateAssessment(
    topic: string, 
    count: number, 
    difficulty: 'easy' | 'medium' | 'hard',
    onQuestionGenerated?: (question: any) => void,
    onProgress?: (message: string) => void
  ) {
    const batchSize = 1; // Set to 1 for better streaming experience
    const batches = count;
    let allQuestions: any[] = [];

    if (onProgress) onProgress(`🧠 Brainstorming ${count} clinical scenarios on ${topic}...`);

    for (let i = 0; i < batches; i++) {
      try {
        const batchQuestions = await callWithKeyRotation(async (ai) => {
          if (onProgress) onProgress(`📝 Generating Question ${i + 1} of ${count}...`);
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate 1 NCLEX-style multiple choice question on the topic: ${topic}. 
            Difficulty level: ${difficulty}. 
            This is question ${i + 1} of ${count}.
            The question must have 4 options, 1 correct answer (index 0-3), and a detailed clinical rationale/explanation.`,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.NUMBER },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "options", "correctAnswer", "explanation"]
              }
            }
          });
          
          if (onProgress) onProgress(`✅ Validating options and clinical reasoning for Question ${i + 1}...`);
          const qData = JSON.parse(response.text || '{}');
          if (qData.question) {
            const formattedQ = {
              ...qData,
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              difficulty
            };
            return [formattedQ];
          }
          return [];
        });

        if (batchQuestions.length > 0) {
          const q = batchQuestions[0];
          allQuestions.push(q);
          if (onQuestionGenerated) {
            onQuestionGenerated(q);
          }
        }
      } catch (error) {
        console.error(`Failed to generate question ${i + 1}:`, error);
        // Continue to next question if one fails
      }
    }

    return allQuestions;
  }
};
