
import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, BookOpen, Settings, Plus, LogOut, LayoutDashboard, Trash2, Send, X, 
  Upload, Menu, Globe, Phone, MessageCircle, Video, FileText, Calendar, ShieldAlert, Edit2, Check, Image, Key, Lock, Camera, Star, Zap, CheckCircle, ChevronRight, Save, File, BarChart3, Sparkles
} from 'lucide-react';
import { BrandingAssets, Review, PracticeTest, QuizQuestion } from '../../types';
import { Logo } from '../../components/Layout';
import { supabase } from '../../services/supabaseClient';
import { geminiService } from '../../services/geminiService';

interface AdminPanelProps {
  onLogout: () => void;
  users: any[];
  onDeleteUser: (id: string) => void;
  onApprovePayment: (id: string) => void;
  onApproveUser: (id: string) => void;
  onSendNotification: (title: string, text: string, userId: string | 'ALL') => void;
  courseContent: any;
  setCourseContent: any;
  practiceTests: PracticeTest[];
  setPracticeTests: any;
  materials: any[];
  setMaterials: any;
  globalLinks: any;
  setGlobalLinks: any;
  branding: BrandingAssets;
  setBranding: (b: BrandingAssets) => void;
  examDate: string;
  setExamDate: (d: string) => void;

  isSaving?: boolean;
  onSave?: () => void;
  reviews: Review[];
  onDeleteReview: (id: string) => void;
}

const FileUploadButton: React.FC<{ 
  onUpload: (base64: string) => void; 
  label: string; 
  icon: React.ReactNode;
  className?: string;
  assetData?: string;
}> = ({ onUpload, label, icon, className, assetData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onUpload(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <button 
        onClick={() => fileInputRef.current?.click()} 
        className={className || `flex-grow p-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center transition ${assetData ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-white text-slate-400 border border-slate-200'}`}
      >
        {assetData ? <Check className="w-4 h-4 mr-2" /> : icon} {label}
      </button>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="*/*"
      />
    </>
  );
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  onLogout, users, onDeleteUser, onApprovePayment, onApproveUser, onSendNotification, 
  courseContent, setCourseContent, practiceTests, setPracticeTests, 
  materials, setMaterials, globalLinks, setGlobalLinks, branding, setBranding, examDate, setExamDate,

  reviews, onDeleteReview, isSaving, onSave
}) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState<any[]>([]);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    const { data, error } = await supabase.from('api_keys').select('*');
    if (data) setApiKeys(data);
    if (error) console.error('Error fetching API keys:', error);
  };
  
  // Advanced Quiz Management
  const [editingTest, setEditingTest] = useState<PracticeTest | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiConfig, setAiConfig] = useState({ topic: '', count: 5, difficulty: 'medium' as 'easy' | 'medium' | 'hard' });
  const [showAiModal, setShowAiModal] = useState(false);

  const [notificationTarget, setNotificationTarget] = useState<string | 'ALL'>('ALL');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifText, setNotifText] = useState('');

  // Admin Security
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityMessage, setSecurityMessage] = useState({ text: '', type: '' });

  const adminLinks = [
    { label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Students', icon: <Users className="w-5 h-5" /> },
    { label: 'Reviews', icon: <Star className="w-5 h-5" /> },
    { label: 'Courses', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'Assessments', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Materials', icon: <FileText className="w-5 h-5" /> },
    { label: 'Global Settings', icon: <Globe className="w-5 h-5" /> },
    { label: 'API Keys', icon: <Key className="w-5 h-5" /> },
  ];

  const handleAddApiKey = async () => {
    const { data, error } = await supabase.from('api_keys').insert({ key_value: '' }).select();
    if (data) setApiKeys(prev => [...prev, data[0]]);
    if (error) console.error('Error adding API key:', error);
  };

  const handleUpdateApiKey = async (id: string, value: string) => {
    const { error } = await supabase.from('api_keys').update({ key_value: value }).eq('id', id);
    if (error) console.error('Error updating API key:', error);
  };

  const handleDeleteApiKey = async (id: string) => {
    const { error } = await supabase.from('api_keys').delete().eq('id', id);
    if (!error) setApiKeys(prev => prev.filter(key => key.id !== id));
    if (error) console.error('Error deleting API key:', error);
  };

  const handleUpdateAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPassword) return;
    setSecurityLoading(true);
    setSecurityMessage({ text: '', type: '' });
    try {
      const { error } = await supabase.auth.updateUser({ password: newAdminPassword });
      if (error) throw error;
      setNewAdminPassword('');
      setSecurityMessage({ text: 'Admin password updated successfully!', type: 'success' });
    } catch (err: any) {
      setSecurityMessage({ text: err.message, type: 'error' });
    } finally {
      setSecurityLoading(false);
    }
  };




  const handleGenericFileUpload = (onComplete: (base64: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onComplete(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const ImageInputGroup = ({ label, value, field }: { label: string, value: string, field: keyof BrandingAssets }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    return (
      <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{label}</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow">
            <input 
              value={value} 
              onChange={e => setBranding({...branding, [field]: e.target.value})} 
              placeholder="Paste image URL here..."
              className="w-full bg-white p-4 rounded-xl border border-slate-100 text-[10px] font-mono outline-none focus:border-brand-500" 
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-4 bg-brand-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-700 transition flex items-center shadow-lg shadow-brand-100"
            >
              <Upload className="w-4 h-4 mr-2" /> Device
            </button>
            <input type="file" ref={fileInputRef} onChange={handleGenericFileUpload(b64 => setBranding({...branding, [field]: b64}))} accept="image/*" className="hidden" />
            <button onClick={() => setBranding({...branding, [field]: ''})} className="p-4 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>
        {value && <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 h-24 w-full"><img src={value} alt={label} className="w-full h-full object-cover" /></div>}
      </div>
    );
  };

  const handleGenerateAIQuestions = async () => {
    if (!aiConfig.topic) return;
    setIsGeneratingAI(true);
    try {
      await geminiService.generateAssessment(
        aiConfig.topic, 
        aiConfig.count, 
        aiConfig.difficulty,
        (newQuestion) => {
          if (editingTest) {
            setEditingTest(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                questions: [...prev.questions, newQuestion]
              };
            });
            if (onSave) onSave();
          }
        }
      );
      // We don't close the modal immediately so user can see "workings" (questions appearing)
      // but we can show a success state or just let them close it when done.
    } catch (err) {
      console.error("AI Generation failed:", err);
      alert("Failed to generate questions. Please check your API keys and connection.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Students':
        return (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm animate-in fade-in duration-500">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-slate-50 border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Student</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Contact</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Progress</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.length === 0 ? (
                    <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold italic">No students registered yet.</td></tr>
                  ) : (
                    users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 transition group">
                        <td className="px-8 py-5">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center font-black mr-4 shadow-sm flex-shrink-0">
                              {u.avatar ? <img src={u.avatar} className="w-full h-full rounded-xl object-cover" /> : u.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{u.name}</p>
                              <p className="text-[10px] font-black uppercase text-slate-400">@{u.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-xs font-bold text-slate-600">{u.email || 'No email'}</p>
                          <p className="text-[10px] text-slate-400">{u.phone_number || 'No phone'}</p>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-500" style={{ width: `${u.progress}%` }}></div>
                            </div>
                            <span className="text-[10px] font-black text-slate-900">{u.progress}%</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col gap-2">
                            {u.is_approved ? (
                              <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100 text-center">Approved</span>
                            ) : (
                              <button onClick={() => onApproveUser(u.id)} className="px-3 py-1 bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-brand-600 hover:bg-brand-700 transition">Approve User</button>
                            )}
                            {u.has_paid_live ? (
                              <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100 text-center">Premium Access</span>
                            ) : (
                              <button onClick={() => onApprovePayment(u.id)} className="px-3 py-1 bg-brand-50 text-brand-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-brand-100 hover:bg-brand-600 hover:text-white transition">Approve Premium</button>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => { setNotificationTarget(u.id); setNotifTitle('Direct Message'); setShowNotifyModal(true); }} className="p-2 text-slate-400 hover:text-brand-600 transition"><Send className="w-4 h-4" /></button>
                            <button onClick={() => onDeleteUser(u.id)} className="p-2 text-slate-400 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'Reviews':
        return (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm animate-in fade-in duration-500">
             <div className="overflow-x-auto w-full">
               <table className="w-full text-sm border-collapse">
                 <thead className="bg-slate-50 border-b border-gray-100">
                   <tr>
                     <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Reviewer</th>
                     <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Rating</th>
                     <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Content</th>
                     <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {reviews.length === 0 ? (
                     <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold italic">No academy reviews yet.</td></tr>
                   ) : (
                     reviews.map(r => (
                       <tr key={r.id} className="hover:bg-slate-50 transition group">
                         <td className="px-8 py-5">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center font-black mr-4 shadow-sm flex-shrink-0">
                                  {r.avatar ? <img src={r.avatar} className="w-full h-full rounded-xl object-cover" /> : r.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{r.name}</p>
                                <p className="text-[10px] font-black uppercase text-brand-500">{r.role}</p>
                              </div>
                            </div>
                         </td>
                         <td className="px-8 py-5">
                            <div className="flex items-center text-yellow-400">
                               {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-current' : 'opacity-20'}`} />)}
                            </div>
                         </td>
                         <td className="px-8 py-5">
                            <p className="text-slate-600 font-medium max-w-md line-clamp-2 italic">"{r.text}"</p>
                         </td>
                         <td className="px-8 py-5 text-right">
                           <button onClick={() => onDeleteReview(r.id)} className="p-3 text-slate-300 hover:text-red-500 transition hover:bg-red-50 rounded-xl"><Trash2 className="w-5 h-5" /></button>
                         </td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        );
      case 'Global Settings':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-500 pb-20">
            <div className="xl:col-span-8 space-y-8">
               <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-12">
                 <div>
                   <h3 className="text-2xl font-serif font-bold mb-8 text-slate-900 flex items-center gap-3">
                     <Image className="w-6 h-6 text-brand-500" /> Homepage Photos (5 Total)
                   </h3>
                   <div className="grid grid-cols-1 gap-6">
                      <ImageInputGroup label="1. Main Hero Image" value={branding.heroImage} field="heroImage" />
                      <ImageInputGroup label="2. Founder Biography Image" value={branding.founderImage} field="founderImage" />
                      <ImageInputGroup label="3. Expert Mentor Spotlight (Eniola)" value={branding.tutorImage} field="tutorImage" />
                      <ImageInputGroup label="4. Who We Are Section Image" value={branding.aboutImage} field="aboutImage" />
                      <ImageInputGroup label="5. Inspiring Excellence Goal Image" value={branding.spotlightImage} field="spotlightImage" />
                   </div>
                 </div>

                 <div>
                   <h3 className="text-2xl font-serif font-bold mb-8 text-slate-900 flex items-center gap-3">
                     <Globe className="w-6 h-6 text-brand-500" /> Communication Nodes (Community Links)
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Homepage WhatsApp Hub</p>
                        <input value={globalLinks.whatsappAcademyGroup} onChange={e => setGlobalLinks({...globalLinks, whatsappAcademyGroup: e.target.value})} className="bg-transparent w-full outline-none text-xs font-bold text-slate-700" />
                      </div>
                      <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Homepage Telegram Node</p>
                        <input value={globalLinks.telegramAcademyHub} onChange={e => setGlobalLinks({...globalLinks, telegramAcademyHub: e.target.value})} className="bg-transparent w-full outline-none text-xs font-bold text-slate-700" />
                      </div>
                      <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Admin Support WhatsApp</p>
                        <input value={globalLinks.whatsapp} onChange={e => setGlobalLinks({...globalLinks, whatsapp: e.target.value})} className="bg-transparent w-full outline-none text-xs font-bold text-slate-700" />
                      </div>
                      <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Admin Support Telegram</p>
                        <input value={globalLinks.telegram} onChange={e => setGlobalLinks({...globalLinks, telegram: e.target.value})} className="bg-transparent w-full outline-none text-xs font-bold text-slate-700" />
                      </div>
                   </div>
                 </div>
               </div>
            </div>

            <div className="xl:col-span-4 space-y-8">
              <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-xl">
                 <h3 className="text-xl font-serif font-bold mb-8 flex items-center gap-3">
                   <Lock className="w-5 h-5 text-brand-400" /> Academy & Paid Live Links
                 </h3>
                 <div className="space-y-6">
                   <div>
                     <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-2">Live Session (Zoom/Google Meet)</p>
                     <input value={globalLinks.liveSessionZoom} onChange={e => setGlobalLinks({...globalLinks, liveSessionZoom: e.target.value})} className="w-full bg-white/5 p-5 rounded-[1.25rem] border border-white/10 outline-none text-[10px] font-mono" />
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-2">Paid Live WhatsApp Group</p>
                     <input value={globalLinks.paidLiveWhatsapp} onChange={e => setGlobalLinks({...globalLinks, paidLiveWhatsapp: e.target.value})} className="w-full bg-white/5 p-5 rounded-[1.25rem] border border-white/10 outline-none text-[10px] font-mono" />
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-2">Paid Live Telegram Hub</p>
                     <input value={globalLinks.paidLiveTelegram} onChange={e => setGlobalLinks({...globalLinks, paidLiveTelegram: e.target.value})} className="w-full bg-white/5 p-5 rounded-[1.25rem] border border-white/10 outline-none text-[10px] font-mono" />
                   </div>
                   <div className="pt-10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-400 mb-1">Current Exam Cohort</p>
                      <input value={examDate} onChange={e => setExamDate(e.target.value)} className="bg-transparent w-full outline-none font-black text-3xl text-white border-b-2 border-white/10 pb-2" />
                   </div>
                 </div>
              </div>
            </div>
          </div>
        );
      case 'Assessments':
        if (editingTest) {
          return (
            <div className="animate-in fade-in duration-500">
               <div className="flex items-center justify-between mb-10 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-slate-900">Quiz Editor: {editingTest.title}</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{editingTest.questions.length} Active Questions</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setShowAiModal(true)}
                      className="bg-brand-50 text-brand-600 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-brand-100 transition"
                    >
                      <Sparkles className="w-4 h-4" /> Generate with AI
                    </button>
                    <button onClick={() => {
                      const idx = practiceTests.findIndex(t => t.id === editingTest.id);
                      if (idx === -1) return;
                      const copy = [...practiceTests];
                      copy[idx] = { ...editingTest };
                      setPracticeTests(copy);
                      setEditingTest(null);
                    }} className="bg-brand-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2"><Save className="w-4 h-4" /> Save & Exit</button>
                  </div>
               </div>
               
               <div className="space-y-8 pb-32">
                 {editingTest.questions.map((q, qIdx) => (
                   <div key={q.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative group">
                      <button onClick={() => {
                        const newQs = [...editingTest.questions];
                        newQs.splice(qIdx, 1);
                        setEditingTest({...editingTest, questions: newQs});
                      }} className="absolute top-8 right-8 text-red-400 hover:text-red-600 transition"><Trash2 className="w-5 h-5" /></button>
                      
                      <div className="flex items-center gap-3 mb-6">
                        <span className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-black">#{qIdx+1}</span>
                        <input value={q.question} onChange={e => {
                          const newQs = [...editingTest.questions];
                          newQs[qIdx].question = e.target.value;
                          setEditingTest({...editingTest, questions: newQs});
                        }} className="flex-grow bg-slate-50 p-4 rounded-xl font-bold border-none outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="Clinical Scenario Question..." />
                        <select 
                          value={q.difficulty || 'medium'} 
                          onChange={e => {
                            const newQs = [...editingTest.questions];
                            newQs[qIdx].difficulty = e.target.value as any;
                            setEditingTest({...editingTest, questions: newQs});
                          }}
                          className="bg-white p-4 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 outline-none"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                         {q.options.map((opt, oIdx) => (
                           <div key={oIdx} className="flex items-center gap-2">
                             <button 
                               onClick={() => {
                                 const newQs = [...editingTest.questions];
                                 newQs[qIdx].correctAnswer = oIdx;
                                 setEditingTest({...editingTest, questions: newQs});
                               }}
                               className={`w-10 h-10 rounded-xl flex-shrink-0 transition ${q.correctAnswer === oIdx ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}
                             >
                               {String.fromCharCode(65 + oIdx)}
                             </button>
                             <input value={opt} onChange={e => {
                               const newQs = [...editingTest.questions];
                               newQs[qIdx].options[oIdx] = e.target.value;
                               setEditingTest({...editingTest, questions: newQs});
                             }} className="flex-grow bg-slate-50 p-4 rounded-xl text-sm font-medium outline-none" placeholder={`Option ${oIdx+1}`} />
                           </div>
                         ))}
                      </div>

                      <div className="bg-brand-50 p-6 rounded-[2rem] border border-brand-100">
                         <p className="text-[10px] font-black uppercase text-brand-400 tracking-widest mb-2 flex items-center gap-2"><Zap className="w-3 h-3" /> Correction / Rationale</p>
                         <textarea value={q.explanation} onChange={e => {
                           const newQs = [...editingTest.questions];
                           newQs[qIdx].explanation = e.target.value;
                           setEditingTest({...editingTest, questions: newQs});
                         }} className="w-full bg-transparent outline-none font-medium text-sm italic min-h-[4rem] resize-none" placeholder="Provide clinical reasoning for this question..." />
                      </div>
                   </div>
                 ))}
                 <button onClick={() => {
                   const newQs = [...editingTest.questions, { id: Date.now().toString(), question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '', difficulty: 'medium' as QuizQuestion['difficulty'] }];
                   setEditingTest({...editingTest, questions: newQs});
                 }} className="w-full py-10 border-4 border-dashed border-slate-200 rounded-[3rem] text-slate-300 font-black uppercase tracking-widest hover:border-brand-300 hover:text-brand-300 transition flex flex-col items-center justify-center gap-2">
                    <Plus className="w-8 h-8" /> Add Clinical Question
                 </button>
               </div>
            </div>
          );
        }
        return (
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm animate-in fade-in duration-500">
             <div className="flex items-center justify-between mb-10">
               <h3 className="text-2xl font-serif font-bold text-slate-900 uppercase">Practice Exam Directory</h3>
               <button onClick={() => setPracticeTests([...practiceTests, { id: Date.now().toString(), title: 'New Assessment', duration: '60m', questions: [], difficulty: 'medium' }])} className="bg-brand-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-100">Create New Exam</button>
             </div>
             <div className="space-y-6">
                {practiceTests.map((t, i) => (
                  <div key={t.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-between group hover:border-brand-300 transition shadow-sm">
                     <div className="flex items-center gap-6">
                       <div className="bg-white p-4 rounded-2xl shadow-sm"><BarChart3 className="w-8 h-8 text-brand-500" /></div>
                       <div>
                         <input value={t.title} onChange={e => {
                           const copy = [...practiceTests]; 
                           copy[i] = { ...copy[i], title: e.target.value };
                           setPracticeTests(copy);
                         }} className="bg-transparent font-black text-xl outline-none block text-slate-800 w-full mb-1" />
                         <div className="flex items-center gap-4">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t.questions.length} Questions</span>
                            <input value={t.duration} onChange={e => {
                              const copy = [...practiceTests]; 
                              copy[i] = { ...copy[i], duration: e.target.value };
                              setPracticeTests(copy);
                            }} className="bg-transparent text-[10px] text-slate-400 font-black uppercase tracking-widest w-12 border-b border-slate-200" />
                         </div>
                       </div>
                     </div>
                     <div className="flex items-center gap-3">
                       <button onClick={() => setEditingTest(t)} className="bg-white p-4 rounded-xl text-brand-600 shadow-sm hover:bg-brand-600 hover:text-white transition font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><Edit2 className="w-4 h-4" /> Manage Qs</button>
                       <button onClick={() => setPracticeTests(practiceTests.filter(pt => pt.id !== t.id))} className="text-red-400 p-4 hover:bg-red-50 rounded-xl transition"><Trash2 className="w-5 h-5" /></button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        );
      case 'Courses':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-500 pb-32">
            {['FOUNDATIONS', 'INTEGRATION', 'MASTERY'].map(stage => (
              <div key={stage} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black tracking-tight">{stage}</h3>
                  <button onClick={() => {
                    const newContent = {...courseContent};
                    newContent[stage] = [...(newContent[stage] || []), { title: 'New Lesson', type: 'video', assetData: '' }];
                    setCourseContent(newContent);
                  }} className="p-3 bg-brand-50 text-brand-600 rounded-xl hover:bg-brand-600 hover:text-white transition shadow-sm"><Plus className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  {courseContent[stage]?.map((item: any, idx: number) => (
                    <div key={idx} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group">
                      <div className="flex items-center justify-between mb-4">
                        <input value={item.title} onChange={e => {
                          const newContent = {...courseContent};
                          newContent[stage] = [...newContent[stage]];
                          newContent[stage][idx] = { ...newContent[stage][idx], title: e.target.value };
                          setCourseContent(newContent);
                        }} className="bg-transparent font-bold text-slate-800 outline-none w-full" />
                        <button onClick={() => {
                          const newContent = {...courseContent};
                          newContent[stage].splice(idx, 1);
                          setCourseContent(newContent);
                        }} className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="flex items-center gap-2">
                         <FileUploadButton 
                           label={item.assetData ? 'File Linked' : 'Upload Asset'}
                           icon={<Upload className="w-4 h-4 mr-2" />}
                           assetData={item.assetData}
                           onUpload={(b64) => {
                             const newContent = {...courseContent};
                             newContent[stage] = [...newContent[stage]];
                             newContent[stage][idx] = { ...newContent[stage][idx], assetData: b64 };
                             setCourseContent(newContent);
                           }}
                         />
                         <select value={item.type} onChange={e => {
                           const newContent = {...courseContent};
                           newContent[stage][idx].type = e.target.value;
                           setCourseContent(newContent);
                         }} className="bg-white p-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 outline-none">
                           <option value="video">Video</option>
                           <option value="pdf">PDF</option>
                         </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      case 'Materials':
        return (
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm animate-in fade-in duration-500">
             <div className="flex items-center justify-between mb-10">
               <h3 className="text-2xl font-serif font-bold text-slate-900 uppercase">Materials Hub</h3>
               <button onClick={() => setMaterials([...materials, { title: 'New Handout', assetData: '' }])} className="bg-brand-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-100">Add Handout</button>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {materials.map((m, i) => (
                  <div key={i} className="p-8 border border-slate-100 rounded-[2.5rem] text-center bg-slate-50 relative group hover:border-brand-400 transition-all shadow-sm">
                    <button onClick={() => setMaterials(materials.filter((_, idx) => idx !== i))} className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition p-2"><Trash2 className="w-4 h-4" /></button>
                    <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <FileText className="w-8 h-8 text-brand-600" />
                    </div>
                    <input value={m.title} onChange={e => {
                      const copy = [...materials]; 
                      copy[i] = { ...copy[i], title: e.target.value };
                      setMaterials(copy);
                    }} className="bg-transparent text-sm font-bold outline-none text-center w-full text-slate-700 mb-6" />
                    
                    <FileUploadButton 
                      label={m.assetData ? 'Attached' : 'Add File'}
                      icon={<Upload className="w-4 h-4 mr-2" />}
                      assetData={m.assetData}
                      onUpload={(b64) => {
                        const copy = [...materials]; 
                        copy[i] = { ...copy[i], assetData: b64 };
                        setMaterials(copy);
                      }}
                      className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center transition ${m.assetData ? 'bg-green-50 text-green-600' : 'bg-white text-slate-400 border border-slate-200'}`}
                    />
                  </div>
                ))}
             </div>
          </div>
        );
      case 'API Keys':
        return (
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-serif font-bold text-slate-900 uppercase">Gemini API Key Manager</h3>
                <p className="text-slate-400 font-medium text-sm italic">Manage multiple keys for automatic rotation and high-volume generation.</p>
              </div>
              <button 
                onClick={handleAddApiKey}
                className="bg-brand-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-100 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add New Key
              </button>
            </div>

            <div className="space-y-4">
              {apiKeys.length === 0 ? (
                <div className="py-20 text-center border-4 border-dashed border-slate-50 rounded-[3rem]">
                  <Key className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-300 font-black uppercase tracking-widest text-xs">No API Keys Configured</p>
                </div>
              ) : (
                apiKeys.map((key, i) => (
                  <div key={i} className="flex items-center gap-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 group">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-slate-400 font-black shadow-sm group-hover:text-brand-600 transition">#{i+1}</div>
                    <div className="flex-grow relative">
                      <input 
                        type="password"
                        value={key.key_value} 
                        onChange={e => setApiKeys(prev => prev.map(k => k.id === key.id ? { ...k, key_value: e.target.value } : k))}
                        onBlur={e => handleUpdateApiKey(key.id, e.target.value)}
                        placeholder="Paste Gemini API Key here..."
                        className="w-full bg-white p-4 rounded-xl border border-slate-100 text-xs font-mono outline-none focus:border-brand-500 pr-12" 
                      />
                      <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-200" />
                    </div>
                    <button 
                      onClick={() => handleDeleteApiKey(key.id)}
                      className="p-4 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-12 p-8 bg-brand-50 rounded-[2.5rem] border border-brand-100 flex items-start gap-6">
              <div className="bg-white p-4 rounded-2xl shadow-sm"><ShieldAlert className="w-6 h-6 text-brand-600" /></div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1 uppercase tracking-tight">Security Note</h4>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  These keys are stored securely in your private database. They are only used for generating clinical questions and study materials. 
                  If a key hits a rate limit, the system will automatically rotate to the next available key.
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-500">
            <div className="bg-brand-600 p-10 rounded-[3rem] text-white shadow-xl shadow-brand-100">
              <Users className="w-12 h-12 mb-8 opacity-60" />
              <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em] mb-2">Total Students</p>
              <p className="text-6xl font-black tracking-tighter">{users.length}</p>
            </div>
            <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-xl">
              <Calendar className="w-12 h-12 mb-8 text-brand-400 opacity-60" />
              <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em] mb-2">Exam Cycle</p>
              <p className="text-3xl font-black leading-tight">{examDate}</p>
            </div>
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
              <ShieldAlert className="w-10 h-10 mb-6 text-brand-500" />
              <h4 className="text-xl font-serif font-bold text-slate-900 mb-2">Hub Secure</h4>
              <p className="text-slate-400 font-medium text-sm italic">Backups active.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row transition-all duration-300">
      <div className="lg:hidden flex items-center justify-between p-4 bg-slate-900 text-white sticky top-0 z-50 shadow-lg">
        <Logo />
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2"><Menu className="w-7 h-7" /></button>
      </div>

      <aside className={`w-full lg:w-80 bg-slate-900 text-white flex-col ${isMobileMenuOpen ? 'fixed inset-0 z-[100] flex' : 'hidden lg:flex'} transition-all duration-300 shadow-2xl overflow-y-auto h-screen sticky top-0`}>
        <div className="flex items-center justify-center lg:justify-start px-4 py-6 border-b border-white/5 mb-6"><Logo /></div>
        <nav className="flex-grow px-6 space-y-3">
          {adminLinks.map(l => (
            <button key={l.label} onClick={() => { setActiveTab(l.label); setIsMobileMenuOpen(false); setEditingTest(null); }} className={`w-full flex items-center p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-200 ${activeTab === l.label ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <span className="mr-5">{l.icon}</span> {l.label}
            </button>
          ))}
        </nav>
        <div className="p-8 border-t border-white/5 mt-auto">
          <button onClick={onLogout} className="w-full p-5 bg-red-600/10 text-red-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl border border-red-400/20 hover:bg-red-600 hover:text-white transition duration-300">Log Out Hub</button>
        </div>
      </aside>

      <main className="flex-grow p-6 lg:p-12 overflow-x-hidden">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-16 gap-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2 uppercase tracking-tight">{activeTab}</h1>
            <p className="text-slate-400 font-bold text-xs tracking-widest uppercase">Academy Global Administrator</p>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {onSave && (
              <button 
                onClick={onSave}
                disabled={isSaving}
                className={`flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition shadow-xl ${isSaving ? 'bg-slate-100 text-slate-400' : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-100'}`}
              >
                {isSaving ? <Zap className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
            <button onClick={() => setShowNotifyModal(true)} className="flex-grow sm:flex-grow-0 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center shadow-xl hover:bg-slate-800 transition transform hover:-translate-y-1"><Send className="w-4 h-4 mr-3" /> Broadcast Alert</button>
          </div>
        </header>
        {renderTabContent()}
      </main>

      {showNotifyModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 relative animate-in slide-in-from-bottom-5 duration-300 shadow-2xl">
            <button onClick={() => setShowNotifyModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition"><X className="w-6 h-6" /></button>
            <h2 className="text-2xl font-serif font-bold mb-8 pr-12 text-slate-900 uppercase tracking-tight">Notification Center</h2>
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 mb-2">Audience</p>
                <select value={notificationTarget} onChange={e => setNotificationTarget(e.target.value)} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-sm font-bold shadow-sm focus:border-brand-500 transition">
                  <option value="ALL">All Students</option>
                  {users.map(u => <option key={u.id} value={u.id}>Direct Alert: {u.name}</option>)}
                </select>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 mb-2">Header</p>
                <input value={notifTitle} onChange={e => setNotifTitle(e.target.value)} placeholder="Subject..." className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-sm shadow-sm focus:border-brand-500 font-bold transition" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 mb-2">Message</p>
                <textarea value={notifText} onChange={e => setNotifText(e.target.value)} placeholder="Type details..." className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-sm shadow-sm focus:border-brand-500 font-medium transition min-h-[8rem] resize-none" rows={4} />
              </div>
              <button onClick={() => { onSendNotification(notifTitle, notifText, notificationTarget); setShowNotifyModal(false); }} className="w-full py-5 bg-brand-600 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:bg-brand-700 transition mt-2">Confirm & Broadcast</button>
            </div>
          </div>
        </div>
      )}

      {showAiModal && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 relative animate-in slide-in-from-bottom-5 duration-300 shadow-2xl">
            <button onClick={() => setShowAiModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition"><X className="w-6 h-6" /></button>
            <div className="bg-brand-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-brand-600">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-2 text-slate-900 uppercase tracking-tight">AI Assessment Generator</h2>
            <p className="text-slate-500 text-sm mb-8 font-medium">Describe the topic and difficulty, and Gemini will craft professional NCLEX questions for you.</p>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Topic / Focus Area</label>
                <input 
                  value={aiConfig.topic} 
                  onChange={e => setAiConfig({...aiConfig, topic: e.target.value})}
                  placeholder="e.g., Cardiovascular System, Pharmacology, Pediatrics..." 
                  className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-sm font-bold focus:border-brand-500 transition"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Question Count</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="120"
                    value={aiConfig.count} 
                    onChange={e => setAiConfig({...aiConfig, count: parseInt(e.target.value) || 5})}
                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-sm font-bold focus:border-brand-500 transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Difficulty</label>
                  <select 
                    value={aiConfig.difficulty} 
                    onChange={e => setAiConfig({...aiConfig, difficulty: e.target.value as any})}
                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-sm font-bold focus:border-brand-500 transition"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={handleGenerateAIQuestions}
                disabled={isGeneratingAI || !aiConfig.topic}
                className="w-full py-5 bg-brand-600 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:bg-brand-700 transition mt-4 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isGeneratingAI ? (
                  <>
                    <Zap className="w-4 h-4 animate-pulse" /> Generating Questions...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Generate Assessment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
