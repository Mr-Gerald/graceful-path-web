import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, BookOpen, Video, FileText, Calendar, Award, BarChart3, ChevronRight, 
  PlayCircle, Clock, ChevronLeft, Sparkles, ExternalLink, LogOut, Bell, CheckCircle2, 
  Lock, Download, Star, MessageCircle, X, Menu, Trash2, Heart, ShieldCheck, Zap, Globe, CreditCard,
  User as UserIcon, Camera, Key, Mail, Phone, AtSign, Edit2, Upload as UploadIcon, ChevronDown, CheckCircle
} from 'lucide-react';
import { User, PracticeTest, QuizQuestion } from '../../types';
import { Logo } from '../../components/Layout';
import { supabase } from '../../services/supabaseClient';
import { COUNTRY_LIST } from '../../constants';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
  addReview: (text: string, rating: number) => Promise<boolean>;
  notifications: any[];
  onDeleteNotification: (id: string) => void;
  courseContent: any;
  practiceTests: PracticeTest[];
  materials: any[];
  links: any;
  examDate: string;
  onUpdateProfile: () => void;
}

const getRelativeTime = (dateInput: any) => {
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return 'Recently';
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 84400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch (e) {
    return 'Recently';
  }
};

const ComingSoon = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-500">
    <div className="bg-brand-50 p-12 rounded-[3rem] border border-brand-100 shadow-xl shadow-brand-100/10 max-w-md">
      <div className="bg-white w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm">
        <Sparkles className="w-8 h-8 text-brand-500" />
      </div>
      <h3 className="text-3xl font-serif font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-brand-600 font-black uppercase tracking-[0.3em] text-[10px]">Experience Coming Soon</p>
    </div>
  </div>
);

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ 
  user, onLogout, addReview, notifications, onDeleteNotification, 
  courseContent, practiceTests, materials, links, examDate, onUpdateProfile
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [zoomedAvatar, setZoomedAvatar] = useState<string | null>(null);

  // Quiz State
  const [activeTest, setActiveTest] = useState<PracticeTest | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [showCorrections, setShowCorrections] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  // Profile Edit States
  const [editName, setEditName] = useState(user.name);
  const [editUsername, setEditUsername] = useState(user.username);
  const [editPhone, setEditPhone] = useState(user.phoneNumber || '');
  const [editAvatar, setEditAvatar] = useState(user.avatar || '');
  const [editEmail, setEditEmail] = useState(user.email);
  const [editCountry, setEditCountry] = useState(user.country || 'Nigeria');
  const [newPassword, setNewPassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ text: '', type: '' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const DASHBOARD_LINKS = [
    { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'My Courses', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'Live Classes', icon: <Video className="w-5 h-5" /> },
    { label: 'Practice Tests', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Materials', icon: <FileText className="w-5 h-5" /> },
    { label: 'My Profile', icon: <UserIcon className="w-5 h-5" /> },
    { label: 'Calendar', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Certificates', icon: <Award className="w-5 h-5" /> },
  ];

  useEffect(() => {
    if (currentView === 'Practice Tests' && !activeTest && practiceTests.length > 0) {
      // If there's only one test and it's not locked, auto-select it
      const availableTests = practiceTests.filter(test => {
        const isLocked = !user.hasPaidLive && (test.difficulty === 'medium' || test.difficulty === 'hard');
        return !isLocked;
      });
      
      if (availableTests.length === 1) {
        handleStartTest(availableTests[0]);
      }
    }
  }, [currentView, practiceTests, user.hasPaidLive]);

  const handleStartTest = (test: PracticeTest) => {
    setActiveTest(test);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizFinished(false);
    setShowCorrections(false);
    setShowPaywall(false);
  };

  const handleSelectOption = (optionIndex: number) => {
    if (!activeTest) return;
    const q = activeTest.questions[currentQuestionIndex];
    setUserAnswers({ ...userAnswers, [q.id]: optionIndex });
  };

  const handleNextQuestion = () => {
    if (!activeTest) return;
    
    // Freemium Paywall Logic: Free users hit a wall after 15 questions
    if (!user.hasPaidLive && currentQuestionIndex === 14) {
      setShowPaywall(true);
      return;
    }

    if (currentQuestionIndex < activeTest.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleUpgradeToPremium = () => {
    const msg = encodeURIComponent(`Hello Admin, I just completed the free trial and I'm ready to upgrade my Graceful Path account to Premium to unlock all practice tests!`);
    window.open(`https://wa.me/message/WW3VSMB2DHYUF1?text=${msg}`, '_blank');
  };

  const calculateScore = () => {
    if (!activeTest) return 0;
    let correct = 0;
    const totalAllowed = !user.hasPaidLive ? Math.min(15, activeTest.questions.length) : activeTest.questions.length;
    
    activeTest.questions.slice(0, totalAllowed).forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) correct++;
    });
    return Math.round((correct / totalAllowed) * 100);
  };

  const openAsset = (data: string, title: string) => {
    if (!data) return;

    try {
      if (data.startsWith('data:')) {
        const arr = data.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const url = URL.createObjectURL(blob);
        
        // Use a hidden link for better browser compatibility
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        // For PDFs, we want to view, not download, if possible
        if (mime !== 'application/pdf') {
          link.download = title || 'download';
        }
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Revoke after a longer delay to ensure the browser has opened it
        setTimeout(() => URL.revokeObjectURL(url), 120000);
      } else {
        const link = document.createElement('a');
        link.href = data;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      console.error("Error opening asset:", e);
      // Ultimate fallback
      const link = document.createElement('a');
      link.href = data;
      link.download = title || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage({ text: '', type: '' });

    try {
      // We build the update object dynamically
      const updateData: any = {
        name: editName,
        username: editUsername,
      };

      // Only add these if they are supported by your schema
      // The try/catch block below will handle the "missing column" error gracefully
      if (editPhone) updateData.phone_number = editPhone;
      if (editCountry) updateData.country = editCountry;
      if (editAvatar !== undefined) updateData.avatar = editAvatar === '' ? null : editAvatar;

      const { error: profileError } = await supabase.from('profiles').update(updateData).eq('id', user.id);

      if (profileError) {
        // If any column is missing, we fall back to a basic update of just name/username
        if (profileError.message.includes('column') || profileError.code === '42703') {
          const { error: retryError } = await supabase.from('profiles').update({
            name: editName,
            username: editUsername,
          }).eq('id', user.id);
          
          if (retryError) throw retryError;
          setProfileMessage({ 
            text: 'Profile updated. (Note: Some fields like Country/Phone/Avatar require adding columns to your Supabase table).', 
            type: 'success' 
          });
        } else {
          throw profileError;
        }
      } else {
        if (editEmail !== user.email) {
          const { error: emailError } = await supabase.auth.updateUser({ email: editEmail });
          if (emailError) throw emailError;
          setProfileMessage({ text: 'Profile updated. Check your new email for a verification link.', type: 'success' });
        } else {
          setProfileMessage({ text: 'Profile updated successfully!', type: 'success' });
        }
      }

      onUpdateProfile();
    } catch (err: any) {
      setProfileMessage({ text: err.message, type: 'error' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    setProfileLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword('');
      setProfileMessage({ text: 'Password changed successfully!', type: 'success' });
    } catch (err: any) {
      setProfileMessage({ text: err.message, type: 'error' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    const success = await addReview(reviewText, rating);
    if (success) {
      setReviewSubmitted(true);
      setReviewText('');
    } else {
      alert("Failed to submit review. Please try again.");
    }
  };

  const handleContactAdminPayment = (platform: 'whatsapp' | 'telegram') => {
    const msg = encodeURIComponent(`Hi Admin, I'm ${user.name} and I want to inquire about the enrollment fee to unlock Live Classes in the Graceful Path dashboard.`);
    const url = platform === 'whatsapp' 
      ? `https://wa.me/message/WW3VSMB2DHYUF1?text=${msg}`
      : `https://t.me/+r0sIS5RfnuFhYmFk?text=${msg}`;
    window.open(url, '_blank');
  };

  const renderLiveClasses = () => {
    if (!user.hasPaidLive) {
      return (
        <div className="animate-in fade-in duration-700 max-w-4xl mx-auto">
          <div className="bg-white p-6 sm:p-20 rounded-[3rem] sm:rounded-[4rem] border-2 border-brand-50 shadow-2xl shadow-brand-100/20 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 hidden sm:block">
               <div className="bg-brand-50 text-brand-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Premium Content</div>
             </div>
             <div className="bg-brand-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
               <Lock className="w-10 h-10 text-brand-600" />
             </div>
             <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-6 text-slate-900">Unlock Live Professional Coaching</h2>
             <p className="text-base sm:text-xl text-slate-500 mb-12 max-w-xl mx-auto leading-relaxed font-medium">Join our interactive clinical preparation sessions with licensed educators. Transform your study routine into licensure victory.</p>
             
             <div className="bg-slate-50 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 mb-12 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 mb-8 mx-auto">Flexible Enrollment Options</p>
                <div className="flex justify-center">
                  <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-slate-100 inline-block min-w-[300px]">
                    <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Pricing & Billing</p>
                    <p className="text-2xl sm:text-3xl font-black text-brand-600 tracking-tight leading-tight">Please Contact Admin for Enrollment Fee</p>
                    <p className="mt-4 text-xs font-medium text-slate-500 italic max-w-xs mx-auto">Fees are tailored based on your region and target NCLEX attempt cycle.</p>
                  </div>
                </div>
             </div>

             <div className="space-y-4">
                <p className="text-xs sm:text-sm font-bold text-slate-400 mb-4 italic">Proceed to secure your spot via official verification:</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                   <button 
                    onClick={() => handleContactAdminPayment('whatsapp')}
                    className="flex-1 max-w-xs mx-auto sm:mx-0 bg-green-600 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-green-700 transition flex items-center justify-center"
                   >
                     <MessageCircle className="w-5 h-5 mr-3" /> WhatsApp Admin
                   </button>
                   <button 
                    onClick={() => handleContactAdminPayment('telegram')}
                    className="flex-1 max-w-xs mx-auto sm:mx-0 bg-brand-600 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-brand-700 transition flex items-center justify-center"
                   >
                     <Globe className="w-5 h-5 mr-3" /> Telegram Admin
                   </button>
                </div>
                <p className="mt-8 text-[10px] sm:text-xs font-medium text-slate-400 max-w-sm mx-auto">After payment confirmation, your academy access will be unlocked instantly by the administrator.</p>
             </div>
          </div>
        </div>
      );
    }

    return (
      <div className="animate-in slide-in-from-right-5 duration-500 max-w-4xl">
        <h2 className="text-3xl font-serif font-bold mb-4 text-slate-900 uppercase">Virtual Learning Hub</h2>
        <div className="bg-white p-10 sm:p-16 rounded-[3rem] border-2 border-brand-50 shadow-xl shadow-brand-100/20 text-center">
           <div className="bg-brand-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm">
             <Video className="w-10 h-10 text-brand-600" />
           </div>
           <h3 className="text-2xl font-serif font-bold mb-4 text-slate-900">Next Professional Session</h3>
           <p className="text-slate-500 mb-10 text-base max-w-md mx-auto">Prepare your workspace and join our interactive clinical preparation group.</p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <button onClick={() => window.open(links?.liveSessionZoom || '#', '_blank')} className="bg-brand-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-brand-200 hover:bg-brand-700 transition">
               <Video className="w-5 h-5 mr-3 inline" /> Join Session
             </button>
             <button onClick={() => window.open(links?.paidLiveWhatsapp || '#', '_blank')} className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-green-200 hover:bg-green-700 transition">
               <MessageCircle className="w-5 h-5 mr-3 inline" /> WhatsApp Team
             </button>
             <a href={links?.paidLiveTelegram || '#'} target="_blank" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition flex items-center justify-center">
               <Globe className="w-5 h-5 mr-3" /> Telegram Hub
             </a>
           </div>
        </div>
      </div>
    );
  };

  const renderView = () => {
    switch (currentView) {
      case 'Calendar': return <ComingSoon title="Study Calendar" />;
      case 'Certificates': return <ComingSoon title="Certificates Hub" />;
      case 'Practice Tests':
        if (activeTest) {
          if (quizFinished) {
            const score = calculateScore();
            return (
              <div className="animate-in zoom-in duration-300 max-w-3xl mx-auto py-10">
                <div className="bg-white p-12 rounded-[4rem] text-center border-2 border-brand-50 shadow-2xl">
                  <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner ${score >= 75 ? 'bg-green-50 text-green-500' : 'bg-brand-50 text-brand-600'}`}>
                    <CheckCircle className="w-16 h-16" />
                  </div>
                  <h2 className="text-4xl font-serif font-bold text-slate-900 mb-2">Exam Result</h2>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-8">{activeTest.title}</p>
                  
                  <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 mb-10">
                    <p className="text-7xl font-black text-slate-900 mb-2">{score}%</p>
                    <p className="text-xs font-black uppercase text-slate-400 tracking-widest">{score >= 75 ? 'Clinical Readiness Confirmed' : 'Needs Further Review'}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={() => setShowCorrections(true)} className="flex-1 bg-brand-600 text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-brand-700 transition">View Corrections</button>
                    <button onClick={() => setActiveTest(null)} className="flex-1 bg-slate-900 text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition">Back to Hub</button>
                  </div>
                </div>

                {showCorrections && (
                  <div className="mt-12 space-y-8 animate-in slide-in-from-bottom-5 duration-500">
                    <h3 className="text-2xl font-serif font-bold text-slate-900 px-4">Detailed Correction Review</h3>
                    {activeTest.questions.slice(0, !user.hasPaidLive ? 15 : activeTest.questions.length).map((q, i) => (
                      <div key={q.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                           <span className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500">Q{i+1}</span>
                           <p className="font-bold text-slate-900 text-lg">{q.question}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                           {q.options.map((opt, idx) => {
                             const isUserAnswer = userAnswers[q.id] === idx;
                             const isCorrectAnswer = q.correctAnswer === idx;
                             let colorClass = 'bg-slate-50 text-slate-500 border-slate-100';
                             if (isCorrectAnswer) colorClass = 'bg-green-50 text-green-700 border-green-200';
                             if (isUserAnswer && !isCorrectAnswer) colorClass = 'bg-red-50 text-red-700 border-red-200';
                             
                             return (
                               <div key={idx} className={`p-5 rounded-2xl border-2 font-bold text-sm flex items-center justify-between ${colorClass}`}>
                                 {opt}
                                 {isCorrectAnswer && <CheckCircle className="w-4 h-4" />}
                                 {isUserAnswer && !isCorrectAnswer && <X className="w-4 h-4" />}
                               </div>
                             );
                           })}
                        </div>
                        <div className="bg-brand-50 p-6 rounded-3xl border border-brand-100">
                           <p className="text-[10px] font-black uppercase text-brand-600 tracking-widest mb-2 flex items-center gap-2">
                             <Zap className="w-3 h-3" /> Clinical Educator's Note:
                           </p>
                           <p className="text-slate-700 font-medium leading-relaxed italic">"{q.explanation}"</p>
                        </div>
                      </div>
                    ))}
                    
                    {!user.hasPaidLive && (
                      <div className="bg-gradient-to-br from-brand-600 to-brand-800 p-10 rounded-[3rem] text-center shadow-2xl relative overflow-hidden mt-10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-400 opacity-20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
                        <div className="relative z-10">
                          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
                            <Lock className="w-10 h-10 text-brand-100" />
                          </div>
                          <h3 className="text-3xl font-serif font-bold text-white mb-4">Unlock 105 More Questions</h3>
                          <p className="text-brand-100 mb-8 max-w-xl mx-auto text-lg">
                            Imagine having this level of detailed breakdown for all 120 questions. Don't leave your NCLEX success to chance.
                          </p>
                          <button 
                            onClick={handleUpgradeToPremium}
                            className="bg-white text-brand-900 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-brand-50 transition transform hover:scale-105"
                          >
                            Upgrade to Premium Now
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          }

          if (showPaywall) {
            return (
              <div className="animate-in zoom-in duration-300 max-w-3xl mx-auto py-10">
                <div className="bg-gradient-to-br from-brand-600 to-brand-800 p-12 rounded-[4rem] text-center shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-400 opacity-20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
                  <div className="relative z-10">
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border border-white/20">
                      <Lock className="w-12 h-12 text-brand-100" />
                    </div>
                    <h2 className="text-4xl font-serif font-bold text-white mb-4">Great start! Ready to master the rest?</h2>
                    <p className="text-brand-100 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                      You have successfully completed the foundational question set. To ensure you are fully prepared for the NCLEX, you need exposure to complex, high-level passing standard questions.
                      <br/><br/>
                      Join our Premium Cohort today to instantly unlock the remaining 105 questions, advanced difficulty modes, and comprehensive rationales.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button 
                        onClick={handleUpgradeToPremium}
                        className="flex-1 bg-white text-brand-900 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-brand-50 transition transform hover:scale-105"
                      >
                        👑 Upgrade to Premium (Contact Admin)
                      </button>
                      <button 
                        onClick={() => { setShowPaywall(false); setQuizFinished(true); }}
                        className="flex-1 bg-transparent border-2 border-brand-400 text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-700/50 transition"
                      >
                        See Results of Answered Questions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          if (!activeTest.questions || activeTest.questions.length === 0) {
            return (
              <div className="animate-in fade-in duration-500 max-w-4xl mx-auto py-20 text-center">
                <div className="bg-white p-12 rounded-[4rem] border-2 border-brand-50 shadow-2xl">
                  <div className="bg-brand-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 text-brand-600">
                    <BookOpen className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">No Questions Found</h2>
                  <p className="text-slate-500 mb-10 font-medium">This assessment doesn't have any questions yet. Please contact the administrator.</p>
                  <button onClick={() => setActiveTest(null)} className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition">Back to Hub</button>
                </div>
              </div>
            );
          }

          const q = activeTest.questions[currentQuestionIndex];
          return (
            <div className="animate-in fade-in duration-500 max-w-4xl mx-auto py-6">
              <header className="flex items-center justify-between mb-12">
                 <button onClick={() => setActiveTest(null)} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"><X className="w-5 h-5 text-slate-500" /></button>
                 <div className="text-center">
                    <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-1">{activeTest.title}</p>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-48 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500 transition-all duration-300" style={{width: `${((currentQuestionIndex + 1) / (!user.hasPaidLive ? 120 : activeTest.questions.length)) * 100}%`}}></div>
                      </div>
                      <span className="text-[10px] font-black text-slate-400">{currentQuestionIndex + 1} / {!user.hasPaidLive ? 120 : activeTest.questions.length}</span>
                    </div>
                 </div>
                 <div className="p-3 bg-slate-900 text-white rounded-xl font-mono text-xs flex items-center">
                   <Clock className="w-3.5 h-3.5 mr-2 text-brand-400" /> {activeTest.duration}
                 </div>
              </header>

              <div className="bg-white p-10 sm:p-16 rounded-[4rem] border-2 border-brand-50 shadow-2xl relative">
                <div className="mb-12">
                  <span className="bg-brand-100 text-brand-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block">Clinical Case Scenario</span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 leading-tight">{q.question}</h2>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-12">
                  {q.options.map((opt, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full p-6 text-left rounded-[1.5rem] border-2 transition-all duration-300 flex items-center group ${userAnswers[q.id] === idx ? 'bg-brand-600 border-brand-600 text-white shadow-xl shadow-brand-100' : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-brand-300'}`}
                    >
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs mr-6 transition ${userAnswers[q.id] === idx ? 'bg-white/20' : 'bg-white shadow-sm group-hover:bg-brand-50'}`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-base font-bold">{opt}</span>
                    </button>
                  ))}
                </div>

                <button 
                  onClick={handleNextQuestion}
                  disabled={userAnswers[q.id] === undefined}
                  className="w-full py-6 bg-slate-900 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl hover:bg-black transition-all shadow-xl disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {currentQuestionIndex === activeTest.questions.length - 1 ? 'Finish Exam' : 'Confirm & Next Question'}
                </button>
              </div>
            </div>
          );
        }

        return (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-3xl font-serif font-bold mb-4 text-slate-900 uppercase tracking-tight">Readiness Assessments</h2>
            <div className="flex items-center gap-4 mb-10">
              <p className="text-sm font-black uppercase tracking-widest text-slate-500">Filter by Difficulty:</p>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as 'all' | 'easy' | 'medium' | 'hard')}
                className="p-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 outline-none focus:border-brand-500"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            {!user.hasPaidLive && (
              <div className="bg-brand-50 border border-brand-100 p-6 rounded-[2rem] mb-8 flex items-start sm:items-center gap-4 shadow-sm">
                <div className="bg-white p-3 rounded-xl shadow-sm">
                  <Award className="w-6 h-6 text-brand-600" />
                </div>
                <div>
                  <h4 className="font-bold text-brand-900 text-sm sm:text-base">Free Tier: Foundational NCLEX Review (15 Questions)</h4>
                  <p className="text-brand-700 text-xs sm:text-sm mt-1">Upgrade to Premium to unlock the complete 120-question mastery bank across all difficulty levels.</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {practiceTests.filter(test => selectedDifficulty === 'all' || test.difficulty === selectedDifficulty).length === 0 ? (
                <div className="bg-white p-20 rounded-[3rem] border border-slate-100 text-center">
                  <p className="text-slate-400 font-bold italic">No exams available for this cohort yet.</p>
                </div>
              ) : practiceTests.filter(test => selectedDifficulty === 'all' || test.difficulty === selectedDifficulty).map((test, i) => {
                const isLocked = !user.hasPaidLive && (test.difficulty === 'medium' || test.difficulty === 'hard');
                return (
                  <div key={i} className={`bg-white p-8 rounded-[2.5rem] border border-gray-100 flex flex-col sm:flex-row items-center justify-between group hover:border-brand-500 transition-all duration-300 gap-6 shadow-sm ${isLocked ? 'opacity-80' : ''}`}>
                    <div className="flex items-center w-full">
                      <div className="bg-slate-50 p-6 rounded-[2rem] mr-8 shadow-inner relative">
                        <BarChart3 className="w-10 h-10 text-brand-400 group-hover:text-brand-600 transition" />
                        {isLocked && (
                          <div className="absolute -top-2 -right-2 bg-amber-100 text-amber-600 p-2 rounded-full shadow-sm">
                            <Lock className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                          {test.title}
                          {isLocked && <span className="text-[10px] bg-amber-100 text-amber-700 px-3 py-1 rounded-full uppercase tracking-widest font-black">Premium</span>}
                        </h4>
                        <p className="text-sm text-slate-400 font-black uppercase tracking-widest mt-1 flex items-center gap-4">
                          <span>{test.questions?.length || 0} Professional Questions</span>
                          <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                          <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {test.duration} Limit</span>
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => isLocked ? handleUpgradeToPremium() : handleStartTest(test)} 
                      className={`${isLocked ? 'bg-amber-500 hover:bg-amber-600' : 'bg-brand-600 hover:bg-brand-700'} text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition w-full sm:w-auto transform hover:scale-105`}
                    >
                      {isLocked ? 'Unlock Premium' : 'Start Professional Exam'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'My Profile':
        return (
          <div className="animate-in fade-in duration-500 pb-12">
            <h2 className="text-3xl font-serif font-bold mb-2 text-slate-900 uppercase tracking-tight">Account Settings</h2>
            <p className="text-lg text-slate-500 mb-10 font-medium">Manage your clinical profile and security details.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-4">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm text-center">
                  <div className="relative inline-block mb-6 group">
                    <div 
                      className="w-32 h-32 rounded-full overflow-hidden border-4 border-brand-50 shadow-inner bg-slate-50 cursor-pointer relative"
                      onClick={() => setZoomedAvatar(editAvatar || null)}
                    >
                      {editAvatar ? (
                        <img src={editAvatar} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <UserIcon className="w-full h-full p-8 text-slate-200" />
                      )}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <Sparkles className="text-white w-6 h-6" />
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      className="absolute bottom-0 right-0 bg-brand-600 text-white p-2.5 rounded-full shadow-lg hover:bg-brand-700 transition"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    {editAvatar && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditAvatar(''); }}
                        className="absolute bottom-0 left-0 bg-red-500 text-white p-2.5 rounded-full shadow-lg hover:bg-red-600 transition"
                        title="Remove Profile Picture"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{user.name}</h3>
                  <p className="text-brand-600 font-black uppercase tracking-widest text-[10px] mt-1">{user.role}</p>
                  
                  <div className="mt-8 space-y-3">
                    <div className="flex items-center text-xs font-bold text-slate-500 bg-slate-50 p-4 rounded-xl">
                      <Mail className="w-4 h-4 mr-3 text-brand-400" /> {user.email}
                    </div>
                    <div className="flex items-center text-xs font-bold text-slate-500 bg-slate-50 p-4 rounded-xl">
                      <Phone className="w-4 h-4 mr-3 text-brand-400" /> {user.phoneNumber || 'No phone set'}
                    </div>
                    <div className="flex items-center text-xs font-bold text-slate-500 bg-slate-50 p-4 rounded-xl">
                      <Globe className="w-4 h-4 mr-3 text-brand-400" /> {user.country || 'No country set'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-10">
                <form onSubmit={handleUpdateProfile} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                  <h4 className="text-lg font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-brand-500" /> Personal Details
                  </h4>
                  {profileMessage.text && (
                    <div className={`p-4 rounded-xl text-sm font-bold ${profileMessage.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                      {profileMessage.text}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                      <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-500 transition font-bold text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Username</label>
                      <input type="text" value={editUsername} onChange={e => setEditUsername(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-500 transition font-bold text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                      <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-500 transition font-bold text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                      <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-500 transition font-bold text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Country of Residence</label>
                      <select value={editCountry} onChange={e => setEditCountry(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-500 transition font-bold text-sm">
                        {COUNTRY_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <button type="submit" disabled={profileLoading} className="bg-brand-600 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-brand-700 transition disabled:opacity-50">
                    {profileLoading ? 'Saving...' : 'Update Profile'}
                  </button>
                </form>

                <form onSubmit={handleChangePassword} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                  <h4 className="text-lg font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                    <Key className="w-4 h-4 text-brand-500" /> Security
                  </h4>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">New Password</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-500 transition font-bold text-sm" />
                  </div>
                  <button type="submit" disabled={profileLoading || !newPassword} className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-black transition disabled:opacity-50">
                    Change Password
                  </button>
                </form>
              </div>
            </div>
          </div>
        );
      case 'My Courses':
        if (!user.isApproved) {
          return (
            <div className="animate-in fade-in duration-700 max-w-4xl mx-auto">
              <div className="bg-white p-6 sm:p-20 rounded-[3rem] sm:rounded-[4rem] border-2 border-brand-50 shadow-2xl shadow-brand-100/20 text-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 hidden sm:block">
                   <div className="bg-brand-50 text-brand-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Restricted Access</div>
                 </div>
                 <div className="bg-brand-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
                   <Lock className="w-10 h-10 text-brand-600" />
                 </div>
                 <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-6 text-slate-900">Program Enrollment Required</h2>
                 <p className="text-base sm:text-xl text-slate-500 mb-12 max-w-xl mx-auto leading-relaxed font-medium">Your account is currently awaiting administrative approval. Once approved, you will have full access to our structured clinical modules.</p>
                 
                 <div className="space-y-4">
                    <p className="text-xs sm:text-sm font-bold text-slate-400 mb-4 italic">Need immediate assistance? Contact our support team:</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                       <button 
                        onClick={() => handleContactAdminPayment('whatsapp')}
                        className="flex-1 max-w-xs mx-auto sm:mx-0 bg-green-600 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-green-700 transition flex items-center justify-center"
                       >
                         <MessageCircle className="w-5 h-5 mr-3" /> WhatsApp Support
                       </button>
                    </div>
                 </div>
              </div>
            </div>
          );
        }
        return (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-3xl font-serif font-bold mb-4 text-slate-900 uppercase tracking-tight">Preparation Program</h2>
            <p className="text-lg text-slate-500 mb-10 font-medium">Access your structured clinical modules for global licensure.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {['FOUNDATIONS', 'INTEGRATION', 'MASTERY'].map((stage, i) => {
                const isActive = (stage === 'FOUNDATIONS') || (stage === 'INTEGRATION' && user.progress >= 60);
                const items = courseContent[stage] || [];
                return (
                  <div key={stage} className={`p-10 rounded-[3rem] border-2 flex flex-col transition-all duration-500 ${isActive ? 'bg-white border-brand-50 shadow-xl shadow-brand-100/20' : 'bg-slate-100 border-slate-100 opacity-60'}`}>
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black tracking-tight">{stage}</h3>
                      {!isActive && <Lock className="w-5 h-5 text-slate-300" />}
                    </div>
                    <div className="space-y-3 mb-10 flex-grow">
                      {items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-sm font-bold text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 group">
                          <div 
                            className="flex items-center cursor-pointer hover:text-brand-600 transition flex-grow"
                            onClick={() => {
                              if (item.assetData) {
                                openAsset(item.assetData, item.title);
                              }
                            }}
                          >
                            {item.type === 'video' ? <Video className="w-4 h-4 mr-3 text-brand-500" /> : <FileText className="w-4 h-4 mr-3 text-brand-500" />}
                            {item.title}
                            {item.assetData && <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition" />}
                          </div>
                          {item.assetData && (
                            <button onClick={(e) => {
                              e.stopPropagation();
                              const link = document.createElement('a');
                              link.href = item.assetData;
                              link.download = item.title;
                              link.click();
                            }} className="p-2 opacity-0 group-hover:opacity-100 transition text-brand-600 hover:bg-brand-100 rounded-lg">
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button 
                      disabled={!isActive} 
                      onClick={() => {
                        if (isActive && items.length > 0) {
                          const firstItem = items[0];
                          if (firstItem.assetData) {
                            openAsset(firstItem.assetData, firstItem.title);
                          } else if (firstItem.contentUrl) {
                            openAsset(firstItem.contentUrl, firstItem.title);
                          }
                        }
                      }}
                      className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 ${isActive ? 'bg-brand-600 text-white shadow-lg shadow-brand-200 hover:bg-brand-700' : 'bg-slate-200 text-slate-400'}`}
                    >
                      {isActive ? (user.progress === 0 ? 'Start Module' : 'Continue Module') : 'Locked'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'Live Classes':
        return renderLiveClasses();
      case 'Materials':
        if (!user.isApproved) {
          return (
            <div className="animate-in fade-in duration-700 max-w-4xl mx-auto">
              <div className="bg-white p-6 sm:p-20 rounded-[3rem] sm:rounded-[4rem] border-2 border-brand-50 shadow-2xl shadow-brand-100/20 text-center relative overflow-hidden">
                 <div className="bg-brand-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
                   <Lock className="w-10 h-10 text-brand-600" />
                 </div>
                 <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-6 text-slate-900">Study Materials Locked</h2>
                 <p className="text-base sm:text-xl text-slate-500 mb-12 max-w-xl mx-auto leading-relaxed font-medium">Access to premium study resources and PDF materials requires administrative approval.</p>
                 <button 
                  onClick={() => handleContactAdminPayment('whatsapp')}
                  className="bg-brand-600 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-brand-700 transition"
                 >
                   Request Access
                 </button>
              </div>
            </div>
          );
        }
        return (
          <div className="animate-in fade-in duration-500">
             <h2 className="text-3xl font-serif font-bold mb-8 text-slate-900">Study Resources</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
               {materials.map((doc, i) => (
                 <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 text-center group hover:border-brand-500 transition-all duration-300 cursor-pointer shadow-sm hover:-translate-y-1">
                   <div className="bg-slate-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                     <FileText className="w-10 h-10 text-slate-300 group-hover:text-brand-600 transition" />
                   </div>
                   <p className="font-bold text-slate-800 mb-6 text-base">{doc.title}</p>
                   <div className="w-full grid grid-cols-2 gap-3">
                     <button 
                       onClick={() => {
                         if (doc.assetData) {
                           openAsset(doc.assetData, doc.title);
                         } else {
                           alert("No file attached to this material yet.");
                         }
                       }} 
                       className="py-4 bg-slate-100 text-slate-900 rounded-2xl hover:bg-slate-200 transition font-black text-[10px] uppercase tracking-widest flex items-center justify-center"
                     >
                       <ExternalLink className="w-4 h-4 mr-2" /> Open
                     </button>
                     <button 
                       onClick={() => {
                         if (doc.assetData) {
                           const link = document.createElement('a');
                           link.href = doc.assetData;
                           link.download = doc.title;
                           link.click();
                         }
                       }} 
                       className="py-4 bg-brand-600 text-white rounded-2xl shadow-xl shadow-brand-100 hover:bg-brand-700 transition font-black text-[10px] uppercase tracking-widest flex items-center justify-center"
                     >
                       <Download className="w-4 h-4 mr-2" /> Save
                     </button>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        );
      default:
        return (
          <div className="animate-in fade-in duration-500">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">Welcome back, Nurse {user.name}! 👋</h1>
                <p className="text-lg text-slate-500 mt-2 font-medium">Achieve your licensure by <span className="text-brand-600 font-bold">{examDate}</span>.</p>
              </div>
              <div className="flex items-center gap-4 relative">
                <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="p-4 bg-white border border-gray-200 rounded-2xl text-slate-400 hover:text-brand-600 transition shadow-sm relative group">
                  <Bell className="w-6 h-6" />
                  {notifications.length > 0 && <span className="absolute top-3.5 right-3.5 w-3 h-3 bg-brand-500 rounded-full border-2 border-white"></span>}
                </button>
                {isNotificationsOpen && (
                  <div className="absolute top-16 right-0 w-80 bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl z-[60] overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-800">Alert Center</h3>
                      <button onClick={() => setIsNotificationsOpen(false)} className="p-1 hover:bg-white rounded-lg transition"><X className="w-4 h-4 text-slate-400" /></button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? <p className="p-10 text-center text-slate-400 text-sm italic">No new alerts</p> :
                        notifications.map(n => (
                          <div key={n.id} className="p-6 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition relative group/notif">
                            <p className="font-bold text-base text-slate-900 mb-1">{n.title}</p>
                            <p className="text-sm text-slate-500 mb-3 font-medium">{n.text}</p>
                            <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest">{getRelativeTime(n.created_at)}</p>
                            <button onClick={() => onDeleteNotification(n.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition opacity-0 group-hover/notif:opacity-100"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                <div className="bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm flex items-center">
                  <Calendar className="w-5 h-5 text-brand-500 mr-3" />
                  <span className="font-black text-[10px] uppercase tracking-widest text-slate-700">Exam: {examDate}</span>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-brand-600 p-10 rounded-[3rem] text-white shadow-xl shadow-brand-100 flex flex-col justify-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-4">Clinical Readiness</p>
                <p className="text-5xl font-black mb-6">{user.progress}%</p>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                  <div className="bg-white h-full" style={{ width: `${user.progress}%` }}></div>
                </div>
              </div>
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Daily Insight</p>
                <div className="flex items-start">
                  <Zap className="w-6 h-6 text-yellow-500 mr-4 flex-shrink-0" />
                  <p className="text-lg text-slate-700 font-serif font-bold italic leading-relaxed">"Assess the patient first, never the equipment. Safety is your top NCLEX priority."</p>
                </div>
              </div>
              <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-lg">
                <p className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em] mb-4">Recent Activity</p>
                <div className="space-y-4">
                   <div className="flex items-center text-sm font-bold opacity-90">
                     <CheckCircle2 className="w-4 h-4 mr-3 text-brand-500" /> Logged in successfully
                   </div>
                   <div className="flex items-center text-sm font-bold opacity-90">
                     <ShieldCheck className="w-4 h-4 mr-3 text-brand-500" /> System Hub Synced
                   </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2">
                 <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm group cursor-pointer hover:border-brand-500 transition-all duration-300">
                    <div className="flex items-center mb-8">
                      <div className="bg-brand-50 p-5 rounded-2xl mr-6 text-brand-600 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition shadow-sm"><PlayCircle className="w-10 h-10" /></div>
                      <div>
                        <h4 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Clinical Reasoning Mastery</h4>
                        <p className="text-lg text-slate-500 font-medium mt-1">{user.progress === 0 ? 'Start your journey now.' : 'Pick up where you left off.'}</p>
                      </div>
                    </div>
                    <button onClick={() => setCurrentView('My Courses')} className="w-full py-6 bg-brand-600 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl animate-soft-pulse shadow-lg shadow-brand-100">
                      {user.progress === 0 ? 'Start Program' : 'Continue Program'}
                    </button>
                 </div>
              </div>
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm text-center flex flex-col justify-center">
                 <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 shadow-sm">
                   <Heart className="w-8 h-8 fill-current" />
                 </div>
                 <h4 className="text-xl font-bold mb-3">How are we doing?</h4>
                 <p className="text-base text-slate-500 mb-8 font-medium">Your feedback helps us empower more nurses globally.</p>
                 <button onClick={() => setIsReviewModalOpen(true)} className="w-full py-4 bg-slate-50 text-brand-600 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-brand-600 hover:text-white transition-all">Leave Academy Review</button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row transition-all duration-300">
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 sticky top-0 z-50">
        <Logo />
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-3 bg-slate-50 rounded-xl"><Menu className="w-6 h-6 text-slate-700" /></button>
      </div>

      <aside className={`${isCollapsed ? 'lg:w-24' : 'lg:w-80'} ${isMobileMenuOpen ? 'fixed inset-0 z-50 bg-white flex' : 'hidden lg:flex'} border-r border-gray-100 flex-col transition-all duration-300 bg-white`}>
        <div className="hidden lg:block border-b border-slate-50 mb-6"><Logo /></div>
        <nav className="flex-grow px-6 space-y-2 mt-4 overflow-y-auto">
          {DASHBOARD_LINKS.map(l => (
            <button key={l.label} onClick={() => { setCurrentView(l.label); setIsMobileMenuOpen(false); setActiveTest(null); }} className={`w-full flex items-center px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${currentView === l.label ? 'bg-brand-600 text-white shadow-xl shadow-brand-100' : 'text-slate-400 hover:bg-brand-50 hover:text-brand-600'}`}>
              <span className={isCollapsed && !isMobileMenuOpen ? '' : 'mr-5'}>{l.icon}</span>
              {(!isCollapsed || isMobileMenuOpen) && l.label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-50">
          <button onClick={onLogout} className="w-full flex items-center justify-center p-5 bg-red-50 text-red-500 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm">
            <LogOut className="w-4 h-4 mr-3" /> Log Out Platform
          </button>
        </div>
      </aside>

      <main className="flex-grow pt-10 px-6 sm:px-12 pb-24 overflow-y-auto h-screen transition-all duration-500"><div className="max-w-6xl mx-auto">{renderView()}</div></main>

      {/* Profile Picture Zoom Modal */}
      {zoomedAvatar && (
        <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <button 
            onClick={() => setZoomedAvatar(null)}
            className="absolute top-8 right-8 text-white/60 hover:text-white transition p-2 hover:bg-white/10 rounded-full"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="relative max-w-2xl w-full aspect-square animate-in zoom-in-95 duration-300">
            <img 
              src={zoomedAvatar} 
              alt="Zoomed Profile" 
              className="w-full h-full object-cover rounded-[3rem] shadow-2xl border-4 border-white/20"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-12 text-center relative shadow-2xl animate-in zoom-in duration-300">
            {!reviewSubmitted ? (
              <>
                <button onClick={() => setIsReviewModalOpen(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition"><X className="w-6 h-6" /></button>
                <div className="bg-brand-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm"><Star className="w-10 h-10 text-yellow-400 fill-current" /></div>
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Share Your Victory</h2>
                <p className="text-lg text-slate-500 mb-8 font-medium">How has Graceful Path empowered your journey?</p>
                <div className="flex justify-center gap-3 mb-8">
                  {[1,2,3,4,5].map(s => <button key={s} onClick={() => setRating(s)} className="transition hover:scale-110"><Star className={`w-8 h-8 ${s <= rating ? 'text-yellow-400 fill-current' : 'text-slate-100'}`} /></button>)}
                </div>
                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Tell your success story..." className="w-full p-6 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20 mb-8 border-2 border-slate-100 font-medium text-base resize-none" rows={4} />
                <button onClick={handleSubmitReview} disabled={!reviewText.trim()} className="w-full py-5 bg-brand-600 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-brand-100">Submit Academy Review</button>
              </>
            ) : (
              <div className="py-10 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-50 text-green-500 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner"><CheckCircle2 className="w-12 h-12" /></div>
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">Review Received!</h2>
                <p className="text-lg text-slate-500 mb-12 leading-relaxed max-w-sm mx-auto font-medium">Thank you for your kind words! Your feedback will now inspire hundreds of future nursing professionals.</p>
                <button onClick={() => { setIsReviewModalOpen(false); setReviewSubmitted(false); }} className="w-full py-5 bg-slate-900 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl">Back to Dashboard</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};