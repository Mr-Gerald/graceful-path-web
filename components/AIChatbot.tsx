
import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageSquare, Loader2, Sparkles, User as UserIcon, Bot } from 'lucide-react';
import { geminiService } from '../services/geminiService';

export const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string, grounding?: any[] }[]>([
    { role: 'model', text: 'Hi! I am Grace, your AI clinical tutor from Graceful Path Global Health. How can I help you today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      // Correctly map current messages to the history format expected by the Gemini service
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const response = await geminiService.chat(userMsg, history);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: response.text || 'Sorry, I encountered an error.',
        grounding: response.grounding
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'I am sorry, something went wrong. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-brand-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-lg mr-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Grace - AI Tutor</h3>
                <p className="text-[10px] opacity-80">Powered by Gemini Pro</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-md">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-brand-100 ml-2' : 'bg-brand-600 mr-2 text-white'}`}>
                    {msg.role === 'user' ? <UserIcon className="w-4 h-4 text-brand-600" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-brand-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 shadow-sm border border-gray-100 rounded-tl-none'
                  }`}>
                    {msg.text}
                    
                    {/* Mandatory Grounding Source Display */}
                    {msg.grounding && msg.grounding.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] text-slate-400">
                        <p className="font-bold mb-1 uppercase tracking-tighter">Sources:</p>
                        {msg.grounding.map((chunk, idx) => (
                          chunk.web && (
                            <a 
                              key={idx} 
                              href={chunk.web.uri} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="block text-brand-600 hover:underline mb-0.5 truncate"
                            >
                              {chunk.web.title || chunk.web.uri}
                            </a>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 shadow-sm p-3 rounded-2xl rounded-tl-none flex items-center text-slate-400">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything clinical..."
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-2 p-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-2">
              Grace is an AI and can make mistakes. Verify clinical info.
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'bg-slate-800' : 'bg-brand-600'} text-white p-4 rounded-full shadow-2xl hover:scale-110 transition flex items-center justify-center`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
};
