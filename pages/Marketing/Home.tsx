import React, { useState, useRef } from 'react';
import { 
  CheckCircle2, 
  Star, 
  ArrowRight, 
  Video,
  BookOpen, 
  Clock, 
  Heart, 
  BarChart3, 
  Award,
  ChevronDown,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  HelpCircle,
  Mail,
  Zap,
  PhoneCall,
  Globe,
  MessageCircle,
  Users,
  Sparkles,
  Trophy,
  X,
  ExternalLink,
  ThumbsUp,
  Reply,
  Target,
  Shield,
  Activity,
  Briefcase,
  Calendar
} from 'lucide-react';
import { COURSES } from '../../constants';
import { Review, BrandingAssets, User } from '../../types';
import { Logo } from '../../components/Layout';

interface HomeProps {
  onNavigate: (path: string) => void;
  reviews: Review[];
  links?: any;
  branding: BrandingAssets;
  onLike: (id: string) => void;
  onReply: (id: string, text: string) => void;
  onAddReview: (text: string, rating: number) => Promise<boolean>;
  userLikes: string[];
  currentUser: User | null;
}

const ReviewReplyInput: React.FC<{ reviewId: string; reviewerName: string; onReply: (id: string, text: string) => void; currentUser: User | null; onNavigate: (path: string) => void }> = ({ reviewId, reviewerName, onReply, currentUser, onNavigate }) => {
  const [text, setText] = useState('');
  
  const handleInteraction = () => {
    if (!currentUser) {
      onNavigate('/login');
    }
  };

  const handleSend = () => {
    if (!currentUser) {
      onNavigate('/login');
      return;
    }
    if (text.trim()) {
      onReply(reviewId, text.trim());
      setText('');
    }
  };

  return (
    <div className="mt-4 flex items-center gap-2">
      <input 
        type="text" 
        placeholder={currentUser ? `Reply to ${reviewerName}...` : "Login to reply..."} 
        value={text}
        onFocus={handleInteraction}
        onChange={(e) => setText(e.target.value)}
        className="flex-grow text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition"
      />
      <button 
        onClick={handleSend}
        className="p-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition shadow-sm"
      >
        <Reply className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export const Home: React.FC<HomeProps> = ({ onNavigate, reviews, links, branding, onLike, onReply, onAddReview, userLikes, currentUser }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showChatOptions, setShowChatOptions] = useState(false);
  const [showChannelOptions, setShowChannelOptions] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const faqs = [
    { 
      q: "Are classes live or recorded?", 
      a: "Both. Live classes are recorded for later review, so you never have to worry about missing a session." 
    },
    { 
      q: "Can repeat test-takers join?", 
      a: "Yes. Our program is designed to support repeat test-takers with a clear, structured, and confidence-building approach to ensure you pass this time." 
    },
    { 
      q: "Do you help international nurses?", 
      a: "Absolutely. We specialize in supporting international nurses in their journey to licensure and global career transitions." 
    },
    { 
      q: "What if I miss a live class?", 
      a: "You will have access to the recording instantly in your student dashboard." 
    }
  ];

  const handleAddReviewClick = () => {
    if (!currentUser) {
      onNavigate('/login');
    } else {
      setIsReviewModalOpen(true);
    }
  };

  const handleSubmitReview = async () => {
    const success = await onAddReview(reviewText, rating);
    if (success) {
      setReviewSubmitted(true);
      setReviewText('');
    } else {
      alert("Failed to submit review. Please try again.");
    }
  };

  const intensiveCourse = COURSES.find(c => c.id === 'intensive-nclex');

  const OptionModal = ({ title, options, onClose }: { title: string, options: { label: string, link: string, icon: any, color: string }[], onClose: () => void }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-300 hover:text-slate-900"><X className="w-5 h-5" /></button>
        <h3 className="text-xl font-serif font-bold text-slate-900 mb-6 pr-8">{title}</h3>
        <div className="space-y-3">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => { if(opt.link !== '#') window.open(opt.link, '_blank'); onClose(); }}
              className={`w-full flex items-center justify-between p-5 rounded-[1.25rem] border-2 border-slate-50 hover:border-brand-200 hover:bg-slate-50 transition group`}
            >
              <div className="flex items-center">
                <div className={`${opt.color} p-2.5 rounded-xl text-white mr-4 shadow-lg shadow-black/5`}>{opt.icon}</div>
                <span className="font-bold text-slate-800">{opt.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const ReviewCard = ({ review }: { review: Review }) => (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex">
          {[...Array(review.rating)].map((_, starIdx) => (
            <Star key={starIdx} className="w-4 h-4 text-yellow-400 fill-current" />
          ))}
        </div>
        <span className="text-[10px] text-slate-400 font-bold uppercase">{review.createdAt.toLocaleDateString()}</span>
      </div>
      <p className="text-slate-600 mb-6 italic flex-grow leading-relaxed">"{review.text}"</p>
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center">
          {review.avatar ? (
            <img src={review.avatar} alt={review.name} className="w-10 h-10 rounded-full mr-3 shadow-inner object-cover border border-slate-100" />
          ) : (
            <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center mr-3 font-black text-brand-600 text-xs shadow-inner">
              {review.name.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-bold text-slate-900 text-sm">{review.name}</p>
            <p className="text-[10px] font-black uppercase text-brand-500 tracking-wider">{review.role}</p>
          </div>
        </div>
        <button 
          onClick={() => {
            if (!currentUser) onNavigate('/login');
            else onLike(review.id);
          }} 
          className={`flex items-center px-3 py-1.5 rounded-full transition ${userLikes.includes(review.id) ? 'bg-brand-50 text-brand-600' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <ThumbsUp className={`w-4 h-4 mr-1.5 ${userLikes.includes(review.id) ? 'fill-current' : ''}`} />
          <span className="text-xs font-black">{review.likes}</span>
        </button>
      </div>

      {(review.replies || []).length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-50 space-y-4">
          {review.replies.map(r => (
            <div key={r.id} className="bg-slate-50 p-4 rounded-2xl ml-4 relative">
              <div className="absolute top-4 left-0 w-2 h-px bg-slate-200 -ml-2"></div>
              <div className="flex items-center gap-2 mb-1">
                {r.avatar && <img src={r.avatar} className="w-4 h-4 rounded-full" />}
                <p className="text-[10px] font-black text-brand-600 uppercase">{r.name}</p>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      )}

      <ReviewReplyInput reviewId={review.id} reviewerName={review.name} onReply={onReply} currentUser={currentUser} onNavigate={onNavigate} />
    </div>
  );

  return (
    <div className="bg-white">
      {showChatOptions && (
        <OptionModal 
          title="Connect With Us"
          onClose={() => setShowChatOptions(false)}
          options={[
            { label: 'WhatsApp Messenger', link: links?.whatsapp || 'https://wa.me/message/WW3VSMB2DHYUF1', icon: <MessageCircle className="w-5 h-5" />, color: 'bg-green-500' },
            { label: 'Telegram Hub', link: links?.telegram || 'https://t.me/+r0sIS5RfnuFhYmFk', icon: <Globe className="w-5 h-5" />, color: 'bg-[#0ea5e9]' }
          ]}
        />
      )}

      {showChannelOptions && (
        <OptionModal 
          title="Join Community"
          onClose={() => setShowChannelOptions(false)}
          options={[
            { label: 'WhatsApp Group', link: links?.whatsappAcademyGroup || 'https://chat.whatsapp.com/JpfoDTxUBSRCmXUu597Y44?mode=gi_t', icon: <MessageCircle className="w-5 h-5" />, color: 'bg-green-600' },
            { label: 'Telegram Channel', link: links?.telegramAcademyHub || 'https://t.me/+r0sIS5RfnuFhYmFk', icon: <Globe className="w-5 h-5" />, color: 'bg-brand-600' }
          ]}
        />
      )}

      {/* Hero Section */}
      <section className="relative pt-16 pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-50 rounded-bl-[200px] -z-10 hidden lg:block"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center bg-brand-100 text-brand-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-nowrap">
                 <Globe className="w-3 h-3 mr-2" /> Global NCLEX Excellence
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-slate-900 leading-tight mb-6">
                Pass Your NCLEX With <span className="text-brand-600">Confidence</span>
              </h1>
              <p className="text-xl text-slate-700 font-bold mb-6">Simple. Supportive. Proven NCLEX Preparation.</p>
              <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                Graceful Path Global Health provides structured, easy-to-understand NCLEX review classes designed to help nursing graduates pass on their first or next attempt.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                <button 
                  onClick={() => onNavigate(currentUser ? '/dashboard' : '/login')}
                  className="bg-brand-600 text-white px-8 py-4 rounded-2xl font-bold text-base hover:bg-brand-700 transition shadow-xl shadow-brand-100 flex items-center justify-center animate-soft-pulse"
                >
                  Enroll Now
                </button>
                <button 
                  onClick={() => setShowChatOptions(true)}
                  className="bg-white text-slate-800 border-2 border-slate-200 px-8 py-4 rounded-2xl font-bold text-base hover:border-brand-500 hover:text-brand-600 transition flex items-center justify-center shadow-lg"
                >
                  Book Free Consultation
                </button>
                <button 
                  onClick={() => setShowChannelOptions(true)}
                  className="bg-green-600 text-white px-8 py-4 rounded-2xl font-bold text-base hover:bg-green-700 transition shadow-xl flex items-center justify-center"
                >
                  Join Free Classes
                </button>
              </div>
            </div>
            <div className="mt-16 lg:mt-0 relative">
              <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white group">
                <img src={branding.heroImage} alt="Professional Nurses" className="w-full h-auto group-hover:scale-105 transition duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>
              </div>
              <div className="absolute -bottom-4 -left-4 md:-bottom-8 md:-left-8 bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl z-20 border border-gray-100 max-w-[200px] md:max-w-[240px]">
                <div className="flex items-center mb-2 md:mb-3">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-current" />)}
                </div>
                <p className="text-xs md:text-sm font-bold text-slate-800 leading-relaxed italic">"Join our community of nurses passing with confidence!"</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section id="our-services" className="py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center bg-brand-100 text-brand-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <Briefcase className="w-3 h-3 mr-2" /> Professional Solutions
            </div>
            <h2 className="text-4xl font-serif font-bold text-slate-900 mb-6">Our Services</h2>
            <p className="text-lg text-slate-600 font-medium leading-relaxed">
              We provide comprehensive support to help nurses achieve their international career goals through expert guidance and structured preparation programs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "NCLEX-RN Preparation",
                desc: "Comprehensive training designed to equip you with the knowledge, strategies, and confidence needed to successfully pass the NCLEX-RN examination.",
                icon: <Stethoscope className="w-6 h-6" />
              },
              {
                title: "IELTS Preparation",
                desc: "Focused coaching to help you achieve your target band score, with structured lessons, practice tests, and exam strategies.",
                icon: <Globe className="w-6 h-6" />
              },
              {
                title: "USRN Registration Guidance",
                desc: "Step-by-step support throughout the United States Registered Nurse (USRN) registration process, ensuring a smooth and stress-free experience.",
                icon: <ShieldCheck className="w-6 h-6" />
              },
              {
                title: "CANRN Registration Guidance",
                desc: "Professional guidance through the Canadian Registered Nurse (CANRN) registration process, helping you meet all requirements efficiently.",
                icon: <Award className="w-6 h-6" />
              },
              {
                title: "AUSRN Registration Guidance",
                desc: "Unlock your nursing career in Australia. We provide expert guidance through the AHPRA registration pathway, including specialized preparation for the NCLEX-RN and OSCE. From initial assessment to clinical readiness, we ensure you meet the high standards of the Australian healthcare system and transition smoothly to life 'Down Under'.",
                icon: <Activity className="w-6 h-6" />
              },
              {
                title: "Exam Scheduling Assistance",
                desc: "We assist you in booking your exams promptly and correctly, ensuring all requirements are met and helping you secure a convenient test date and location.",
                icon: <Calendar className="w-6 h-6" />
              }
            ].map((service, i) => (
              <div key={i} className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:border-brand-200 transition-all duration-500 group">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-8 text-brand-600 shadow-sm group-hover:bg-brand-600 group-hover:text-white transition-all duration-500">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{service.title}</h3>
                <p className="text-slate-600 leading-relaxed font-medium">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Section - Enhanced eye-catching design */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        {/* New Eye-catching background elements */}
        <div className="absolute top-10 right-10 opacity-[0.05] text-brand-900 -z-0 hidden xl:block animate-soft-pulse">
          <Stethoscope className="w-80 h-80 rotate-12" />
        </div>
        <div className="absolute bottom-20 left-10 opacity-[0.05] text-brand-900 -z-0 hidden xl:block animate-pulse">
          <Activity className="w-64 h-64 -rotate-12" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            <div className="lg:col-span-5 mb-16 lg:mb-0 relative">
              <div className="relative z-10 rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white bg-white group">
                <img 
                  src={branding.founderImage} 
                  alt="Founder Uchenna Amakor" 
                  className="w-full h-auto object-cover transform transition duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-10 left-10 text-white border-l-4 border-brand-500 pl-6">
                  <p className="text-2xl font-bold uppercase tracking-tight">Registered Nurse, Educator.</p>
                  <p className="text-brand-300 font-black tracking-[0.2em] uppercase text-xs mt-2 italic">Academy Founder</p>
                </div>
              </div>
              {/* Floating Decorative Badge */}
              <div className="absolute -top-6 -right-6 bg-brand-600 p-5 rounded-3xl shadow-xl z-20 text-white animate-bounce">
                <Trophy className="w-8 h-8 mb-1" />
                <span className="text-[8px] font-black uppercase tracking-widest">Visionary</span>
              </div>
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-brand-500/10 rounded-full blur-[80px] -z-10"></div>
            </div>
            <div className="lg:col-span-7">
              <div className="inline-flex items-center bg-brand-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-10 shadow-lg shadow-brand-200">
                <Sparkles className="w-4 h-4 mr-2" /> MEET OUR FOUNDER
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-8 leading-tight">
                "Passion Meets <span className="text-brand-600">NCLEX Preparation</span>"
              </h2>
              <div className="space-y-6 text-xl text-slate-700 font-medium leading-relaxed italic mb-10 bg-white/50 backdrop-blur-sm p-8 rounded-3xl border border-brand-50 shadow-sm">
                <p>Hi, I’m Uchenna Amakor, Founder of Graceful Path Global Health.</p>
                <p>Leading the Next Generation of Licensed Nurses, where Passion Meets NCLEX Preparation. Your NCLEX Prep Starts with Me, and I am committed to Your NCLEX Victory at first attempt.</p>
              </div>
              
              {/* Added Pillar boxes for more eye-catching content */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="flex items-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <Target className="w-5 h-5 text-brand-500 mr-3" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-700">Exam Focused</span>
                </div>
                <div className="flex items-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <Shield className="w-5 h-5 text-brand-500 mr-3" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-700">Safety First</span>
                </div>
              </div>

              <div className="flex items-center space-x-12">
                <div className="text-center">
                  <p className="text-4xl font-black text-brand-600">500+</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Lives Impacted</p>
                </div>
                <div className="h-10 w-px bg-slate-200"></div>
                <div className="text-center">
                  <p className="text-4xl font-black text-brand-600">100%</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Success Focus</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Graceful Path Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-serif font-bold text-slate-900 mb-6">Why Choose Graceful Path?</h2>
            <p className="text-xl text-brand-600 font-black tracking-tight">We don’t just teach content — we teach you how to think like the NCLEX.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Video />, title: "Live & recorded simplified lectures", desc: "Complex concepts simplified for absolute clarity." },
              { icon: <BookOpen />, title: "Full NCLEX content review", desc: "Comprehensive coverage of all critical nursing systems." },
              { icon: <BarChart3 />, title: "Weekly assessments & evaluations", desc: "Track your progress with targeted professional evaluation." },
              { icon: <Heart />, title: "Supportive, student-focused teaching", desc: "We provide a warm environment that builds clinical confidence." },
              { icon: <ShieldCheck />, title: "First-time & repeat test-takers", desc: "Proven strategies optimized for every testing attempt." },
              { icon: <Globe />, title: "International Nurses", desc: "Global transition support and licensure guidance for RNs worldwide." }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-[2rem] border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-xl transition group hover:-translate-y-1 duration-500">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition shadow-sm text-brand-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed text-base font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clinical Excellence Worldwide Section */}
      <section className="py-24 relative overflow-hidden bg-brand-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center text-white">
          <div className="inline-flex items-center bg-brand-500/20 backdrop-blur-md px-6 py-2 rounded-full border border-brand-400/30 mb-10">
            <Users className="w-5 h-5 mr-3 text-brand-300" />
            <span className="font-black tracking-[0.2em] uppercase text-[10px]">Clinical Excellence Worldwide</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-10 max-w-4xl mx-auto leading-tight">
            Bridging the Gap to Your Global Nursing Career
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
            {[
              { val: '100%', label: 'PASS RATE' },
              { val: '100%', label: 'DEDICATED SUPPORT' },
              { val: '24/7', label: 'STUDY ACCESS' },
              { val: '1:1', label: 'CLINICAL FOCUS' }
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-4xl font-bold text-brand-400 mb-2">{stat.val}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-200">{stat.label}</p>
              </div>
            ))}
          </div>
          <button onClick={() => onNavigate(currentUser ? '/dashboard' : '/login')} className="bg-brand-500 text-white px-12 py-5 rounded-2xl font-bold text-lg hover:bg-brand-400 transition shadow-2xl animate-soft-pulse">
            Start Your Journey Today
          </button>
        </div>
      </section>

      {/* Who We Are Section */}
      <section id="who-we-are" className="py-24 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-24 items-center">
            <div className="mb-12 lg:mb-0 relative">
              <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white bg-white">
                <img src={branding.aboutImage} alt="Graceful Path Leadership" className="w-full h-auto object-cover" />
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-serif font-bold text-slate-900 mb-8">Who We Are</h2>
              <div className="space-y-6 text-lg text-slate-600 leading-relaxed font-medium">
                <p>Graceful Path Global Health was created to support nursing students and graduates who want a clear, structured, and confidence-building approach to NCLEX preparation.</p>
                <p>We understand how overwhelming NCLEX can feel. Our mission is to simplify complex concepts, strengthen critical thinking, and guide students step-by-step toward success.</p>
              </div>
              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-8 text-slate-900 underline decoration-brand-200 decoration-4 underline-offset-8">Teaching Approach</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-12">
                  {["Simple explanations", "NCLEX-style thinking", "High-yield focus", "Encouraging environment"].map((item, i) => (
                    <li key={i} className="flex items-center font-bold text-slate-800 text-base">
                      <CheckCircle2 className="w-5 h-5 text-brand-500 mr-3" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-8 bg-brand-600 rounded-[2.5rem] text-white shadow-xl italic text-xl font-serif">“We walk with you — every step of the way to licensure.”</div>
            </div>
          </div>
        </div>
      </section>

      {/* Updated Success Spotlight Section (Tutor Eniola) */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-50 rounded-[3rem] lg:rounded-[4rem] overflow-hidden shadow-sm border border-brand-100/50">
            <div className="lg:grid lg:grid-cols-2 items-stretch">
              <div className="p-12 lg:p-20 flex flex-col justify-center">
                <div className="inline-flex items-center text-brand-600 font-black uppercase tracking-[0.2em] text-[10px] mb-8">
                  <Sparkles className="w-5 h-5 mr-3 text-brand-400" /> ACADEMY EXPERTISE
                </div>
                <h2 className="text-4xl lg:text-5xl font-serif font-bold text-slate-900 mb-8 leading-tight">
                  Meet Your <span className="text-brand-600">Expert Mentor</span>
                </h2>
                <div className="text-xl text-slate-600 mb-10 leading-relaxed font-bold italic">
                  <p>“Hi, I’m Eniola Ayokunmi, one of the tutors in Graceful Path Global Health.</p>
                  <p className="mt-4">Here to Help You Pass — The First Time. Teaching You to Think Like a Nurse, and helping You Turn Hard Work into Licensure.”</p>
                </div>
                <div className="flex items-center space-x-4 mb-10">
                   <div className="bg-brand-600 p-2.5 rounded-xl text-white shadow-lg"><Award className="w-5 h-5" /></div>
                   <p className="font-black text-slate-900 text-lg uppercase">Registered Nurse, Educator.</p>
                </div>
                <button onClick={() => onNavigate(currentUser ? '/dashboard' : '/login')} className="w-fit bg-slate-900 text-white px-12 py-5 rounded-2xl font-bold text-lg hover:bg-black transition shadow-2xl animate-soft-pulse">Start Your Success Story</button>
              </div>
              <div className="relative h-[450px] lg:h-auto overflow-hidden group">
                <img src={branding.tutorImage} alt="Tutor Eniola Ayokunmi" className="absolute inset-0 w-full h-full object-cover object-center transition duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent"></div>
                <div className="absolute bottom-10 left-10 text-white border-l-4 border-brand-500 pl-6">
                  <p className="text-2xl font-bold uppercase tracking-tight">Registered Nurse, Educator.</p>
                  <p className="text-brand-300 font-black tracking-[0.2em] uppercase text-xs mt-2 italic">Graceful Path Success Story</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">What Our Students Say</h2>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium">Real stories from nurses who transformed their careers with Graceful Path.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {reviews.slice(0, 3).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <button 
              onClick={() => setShowAllReviews(true)}
              className="px-8 py-4 bg-white border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-slate-50 hover:border-brand-500 transition shadow-sm"
            >
              See All Reviews ({reviews.length})
            </button>
            <button 
              onClick={handleAddReviewClick}
              className="px-8 py-4 bg-brand-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-brand-700 transition shadow-xl flex items-center group"
            >
              <Star className="w-4 h-4 mr-3 group-hover:rotate-12 transition" /> Add Academy Review
            </button>
          </div>
        </div>
      </section>

      {/* All Reviews Modal */}
      {showAllReviews && (
        <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h2 className="text-xl font-serif font-bold text-slate-900">Success Stories</h2>
                <button 
                  onClick={() => setShowAllReviews(false)}
                  className="p-2 bg-white text-slate-400 hover:text-slate-900 rounded-xl shadow-sm border border-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-grow overflow-y-auto p-6 bg-slate-50/50">
                 {reviews.length === 0 ? (
                   <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-xs italic">No additional reviews yet.</div>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {reviews.map(review => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Add Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
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
                <button onClick={() => { setIsReviewModalOpen(false); setReviewSubmitted(false); }} className="w-full py-5 bg-slate-900 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl">Back to Academy</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inspiring Excellence Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative mb-16 lg:mb-0">
              <div className="relative z-10 rounded-[3.5rem] overflow-hidden shadow-2xl border-6 border-white transform -rotate-2 hover:rotate-0 transition duration-700">
                <img 
                  src={branding.spotlightImage} 
                  alt="Graceful Path Success Story" 
                  className="w-full h-auto object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/30 to-transparent"></div>
              </div>
              
              <div className="absolute top-1/2 -right-8 transform -translate-y-1/2 flex flex-col items-center bg-white p-6 rounded-[2.5rem] shadow-xl border border-brand-50 z-20 animate-bounce">
                <Trophy className="w-10 h-10 text-yellow-500 mb-2" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 text-nowrap">Goal Achieved</span>
              </div>
            </div>

            <div className="text-center lg:text-left">
              <div className="inline-flex items-center bg-brand-600 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-10 shadow-xl shadow-brand-200">
                Inspiring Excellence
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 mb-8 leading-tight">
                Your Dreams of <span className="text-brand-600">Greatness</span> Are Within Reach
              </h2>
              <p className="text-xl text-slate-700 font-bold mb-10 leading-relaxed italic">
                "At Graceful Path, we don't just see students; we see future healthcare leaders. Every victory is a testament to simplified education and focus."
              </p>
              <div className="space-y-6 text-lg text-slate-600 mb-12">
                <p className="flex items-center justify-center lg:justify-start font-bold text-slate-800">
                  <CheckCircle2 className="w-6 h-6 text-brand-500 mr-4 shadow-sm" /> Real Nurses, Real Results
                </p>
                <p className="flex items-center justify-center lg:justify-start font-bold text-slate-800">
                  <CheckCircle2 className="w-6 h-6 text-brand-500 mr-4 shadow-sm" /> Mentorship That Actually Matters
                </p>
              </div>
              <button 
                onClick={() => onNavigate(currentUser ? '/dashboard' : '/login')}
                className="bg-brand-600 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-brand-700 transition shadow-xl animate-soft-pulse transform hover:scale-105"
              >
                Join Successful Nurses
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Programs & Courses Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-serif font-bold text-center text-slate-900 mb-16">Programs & Courses</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 flex flex-col hover:translate-y-[-8px] transition duration-500 group">
              <div className="p-10 flex flex-col h-full bg-gradient-to-b from-brand-50/50 to-white">
                <h3 className="text-2xl font-bold text-slate-900 mb-5 group-hover:text-brand-600 transition">{intensiveCourse?.title}</h3>
                <p className="text-slate-600 mb-8 leading-relaxed italic text-base font-medium">{intensiveCourse?.description}</p>
                <div className="space-y-4 mb-10 flex-grow">
                  <h4 className="font-black text-[10px] text-brand-600 uppercase tracking-[0.2em] mb-4">Course Modules:</h4>
                  {intensiveCourse?.included?.map((inc, i) => (
                    <div key={i} className="flex items-start text-slate-800 font-bold text-sm">
                      <ChevronRight className="w-4 h-4 text-brand-400 mr-2 flex-shrink-0" />
                      {inc}
                    </div>
                  ))}
                </div>
                <button onClick={() => onNavigate(currentUser ? '/dashboard' : '/login')} className="w-full py-5 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 transition shadow-xl animate-soft-pulse">Enroll Now</button>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[3rem] p-10 flex flex-col text-left text-white shadow-2xl hover:translate-y-[-8px] transition duration-500">
              <h3 className="text-2xl font-bold mb-5">Subject-Focused Classes</h3>
              <p className="text-slate-400 text-lg mb-8 font-medium">Targeted instruction for Pharmacology, Maternity, Mental Health, and EKG.</p>
              <ul className="space-y-4 mb-12 flex-grow">
                {["Pharmacology Mastery", "Maternity Nursing", "Mental Health", "EKG Interpretation"].map(s => (
                  <li key={s} className="flex items-center text-base font-bold"><div className="w-2 h-2 rounded-full bg-brand-500 mr-4"></div>{s}</li>
                ))}
              </ul>
              <button onClick={() => onNavigate(currentUser ? '/dashboard' : '/login')} className="w-full py-5 bg-white text-slate-900 font-bold rounded-2xl hover:bg-gray-100 transition animate-soft-pulse">Join a Class</button>
            </div>

            <div className="bg-gray-50 rounded-[3rem] p-10 flex flex-col text-left border border-gray-200 hover:translate-y-[-8px] transition duration-500 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-900 mb-5">Private Tutoring</h3>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed font-medium">Personalized one-on-one NCLEX coaching with individualized study plans.</p>
              <ul className="space-y-4 mb-12 flex-grow text-sm font-black text-slate-800">
                {["Custom Study Roadmap", "Focus Weak Areas", "Flexible Scheduling"].map(p => (
                  <li key={p} className="flex items-center"><CheckCircle2 className="w-4 h-4 text-brand-500 mr-3" />{p}</li>
                ))}
              </ul>
              <button onClick={() => onNavigate('/contact')} className="w-full py-5 bg-brand-100 text-brand-700 font-bold rounded-2xl hover:bg-brand-200 transition">Request Private Tutoring</button>
            </div>
          </div>
        </div>
      </section>

      {/* Free Resources Section */}
      <section id="free-resources" className="py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-brand-50 rounded-[4rem] p-16 md:p-24 border border-brand-100 text-center shadow-sm">
            <h2 className="text-4xl font-serif font-bold text-slate-900 mb-6">NCLEX Study Support</h2>
            <p className="text-2xl text-brand-600 font-black mb-12 uppercase tracking-tight">Access Free Resources</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {["Test-taking strategies", "Weekly study tips", "Practice questions", "Time management"].map(res => (
                <div key={res} className="bg-white p-6 rounded-2xl shadow-lg border border-brand-100 font-bold text-slate-800 text-base">{res}</div>
              ))}
            </div>
            <button onClick={() => onNavigate('/resources')} className="bg-brand-600 text-white px-12 py-5 rounded-2xl font-bold text-xl hover:bg-brand-700 transition shadow-2xl animate-soft-pulse">Download Free Handouts</button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-serif font-bold text-center text-slate-900 mb-16">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border-2 border-slate-100 rounded-[2rem] overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-8 text-left hover:bg-slate-50 transition"
                >
                  <span className="font-bold text-xl text-slate-800 pr-6">{faq.q}</span>
                  <div className={`p-1.5 rounded-full transition-all duration-300 ${openFaq === i ? 'bg-brand-600 text-white rotate-180' : 'bg-slate-100 text-slate-400'}`}>
                    <ChevronDown className="w-6 h-6" />
                  </div>
                </button>
                {openFaq === i && (
                  <div className="p-8 pt-0 text-lg text-slate-600 bg-slate-50 leading-relaxed font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section Preview */}
      <section id="contact" className="py-24 bg-slate-900 text-white text-center">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-serif font-bold mb-8">Connect With The Academy</h2>
          <p className="text-xl opacity-70 mb-16 max-w-2xl mx-auto font-medium">Friendly, responsive, student-focused support. We are here to guide your success.</p>
          <div className="flex flex-col md:flex-row justify-center gap-12 text-lg">
             <div onClick={() => window.location.href = `mailto:admin@gracefulpathglobalhealth.com`} className="cursor-pointer group">
               <div className="bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-600 transition">
                 <Mail className="w-8 h-8 text-brand-400 group-hover:text-white transition" />
               </div>
               <p className="font-bold text-xl mb-1">Direct Email</p>
               <p className="opacity-60 font-medium text-sm">admin@gracefulpathglobalhealth.com</p>
             </div>
             <div onClick={() => setShowChatOptions(true)} className="cursor-pointer group">
               <div className="bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-600 transition">
                 <MessageCircle className="w-8 h-8 text-brand-400 group-hover:text-white transition" />
               </div>
               <p className="font-bold text-xl mb-1">Chat Support</p>
               <p className="opacity-60 underline font-medium text-sm">WhatsApp & Telegram</p>
             </div>
             <div onClick={() => setShowChannelOptions(true)} className="cursor-pointer group">
               <div className="bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-500 transition">
                 <Globe className="w-8 h-8 text-brand-400 group-hover:text-white transition" />
               </div>
               <p className="font-bold text-xl mb-1">Social Hubs</p>
               <p className="opacity-60 underline font-medium text-sm">Join our community</p>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};