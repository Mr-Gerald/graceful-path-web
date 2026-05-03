import React from 'react';
import { User, Review, BrandingAssets, GlobalLinks } from '../../types';
import { Logo } from '../../components/Layout';

interface HomeProps {
  onNavigate: (path: string) => void;
  reviews: Review[];
  links: GlobalLinks;
  branding: BrandingAssets;
  onLike: (id: string) => void;
  onReply: (id: string, text: string) => void;
  onAddReview: (text: string, rating: number) => Promise<boolean>;
  userLikes: string[];
  currentUser: User | null;
}

const ReviewCard = ({ review }: { review: Review }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const textRef = React.useRef<HTMLParagraphElement>(null);
  const [isLong, setIsLong] = React.useState(false);

  React.useEffect(() => {
    if (textRef.current) {
      const style = getComputedStyle(textRef.current);
      const lineHeight = parseInt(style.lineHeight);
      if (!isNaN(lineHeight) && lineHeight > 0) {
        const lines = textRef.current.scrollHeight / lineHeight;
        setIsLong(lines > 6.5);
      } else {
        // Fallback check if lineHeight is 'normal'
        setIsLong(textRef.current.scrollHeight > 156); // approx 6 lines * 26px
      }
    }
  }, [review.text]);

  return (
    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col h-full shadow-sm hover:shadow-md transition-all duration-500">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center font-black shadow-sm overflow-hidden flex-shrink-0">
          {review.avatar ? (
            <img src={review.avatar} alt={review.name || 'Student'} className="w-full h-full object-cover" />
          ) : (
            (review.name || 'S').charAt(0)
          )}
        </div>
        <div>
          <h3 className="font-bold text-slate-900">{review.name || 'Nursing Student'}</h3>
          <p className="text-[10px] font-black uppercase text-brand-500 tracking-widest">{review.role || 'Nursing Student'}</p>
        </div>
      </div>
      <div className="flex-grow">
        <div className="flex items-center text-yellow-400 mb-3">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`} viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <p 
          ref={textRef}
          className={`text-slate-600 italic leading-relaxed transition-all duration-500 ${!isExpanded ? 'line-clamp-6' : ''}`}
        >
          "{review.text}"
        </p>
        {isLong && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 text-[10px] font-black uppercase tracking-widest text-brand-600 hover:text-brand-700 transition flex items-center gap-1"
          >
            {isExpanded ? 'Show Less' : 'Read Full Story'}
            <svg className={`w-3 h-3 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export const Home: React.FC<HomeProps> = ({ 
  onNavigate, 
  reviews, 
  links, 
  branding, 
  onLike, 
  onReply, 
  onAddReview, 
  userLikes, 
  currentUser 
}) => {
  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
          <Logo src={branding.logo} />
          <nav className="hidden md:flex items-center gap-10">
            <button onClick={() => onNavigate('/')} className="text-sm font-black uppercase tracking-widest text-slate-500 hover:text-brand-600 transition">Academy Home</button>
            <button onClick={() => onNavigate('/login')} className="px-10 py-4 bg-brand-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-700 transition-all shadow-xl shadow-brand-100 transform hover:scale-105 active:scale-95">Student Access</button>
          </nav>
        </div>
      </header>

      <main className="pt-40 pb-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-32">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-brand-100 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"></span>
              </span>
              April Cohort Enrollment Active
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tight mb-8 leading-[0.85] animate-in fade-in slide-in-from-bottom-6 duration-1000">
              Master Your <br />
              <span className="text-brand-600 relative">
                NCLEX
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-brand-200" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 25 0 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
              </span> 
              <br />
              Journey
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              Transform clinical confusion into licensed confidence with our structured mentorship.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
              <button 
                onClick={() => onNavigate('/register')}
                className="w-full sm:w-auto px-12 py-5 bg-brand-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-700 transition-all shadow-2xl shadow-brand-200 transform hover:scale-105 active:scale-95"
              >
                Enroll in Academy
              </button>
              <button 
                onClick={() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-12 py-5 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                View Success Stories
              </button>
            </div>
          </div>

          <div id="testimonials" className="pt-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div className="max-w-xl">
                 <h2 className="text-4xl md:text-5xl font-serif font-black text-slate-900 mb-4">Voice of Excellence</h2>
                 <p className="text-slate-500 font-medium text-lg italic">"They came with questions, they left with licenses. Here are some of our latest mastery success stories."</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex -space-x-3">
                    {reviews.slice(0, 5).map((r, i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                        {r.avatar ? (
                          <img src={r.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-brand-100 text-brand-600 text-[10px] font-black">
                            {(r.name || 'S').charAt(0)}
                          </div>
                        )}
                      </div>
                    ))}
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Join {reviews.length}+ Successful Nurses</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 py-32 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
            <div className="col-span-1 md:col-span-2">
               <div className="flex flex-col items-start mb-10">
                 <Logo src={branding.logo} className="!items-start" />
               </div>
               <p className="text-xl text-slate-400 max-w-xl mb-12 font-medium leading-relaxed italic">
                 "Our mission is simple: To provide the highest quality NCLEX preparation for the next generation of global nurses."
               </p>
               <div className="flex items-center gap-8">
                  <a href={links.whatsappAcademyGroup} className="text-brand-400 hover:text-brand-300 font-black uppercase tracking-[0.2em] text-[10px] transition underline underline-offset-8">WhatsApp Hub</a>
                  <a href={links.telegramAcademyHub} className="text-brand-400 hover:text-brand-300 font-black uppercase tracking-[0.2em] text-[10px] transition underline underline-offset-8">Telegram Node</a>
               </div>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-8 px-1">Connect with Tutor</h3>
              <div className="space-y-4">
                <a href={links.whatsapp} className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition group">
                  <span className="font-black text-xs uppercase tracking-widest">WhatsApp Support</span>
                  <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center group-hover:scale-110 transition"><svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c1.1e-4-5.45 4.434-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.393 0 12.028c0 2.119.554 4.188 1.605 6.002L0 24l6.142-1.613a11.782 11.782 0 005.903 1.579h.01c6.634 0 12.032-5.394 12.036-12.031a11.81 11.81 0 00-3.535-8.503z"/></svg></div>
                </a>
                <a href={links.telegram} className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition group">
                  <span className="font-black text-xs uppercase tracking-widest">Telegram Channel</span>
                  <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center group-hover:scale-110 transition"><svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24"><path d="M11.944 0C5.346 0 0 5.348 0 11.948c0 6.598 5.346 11.948 11.944 11.948 6.598 0 11.944-5.35 11.944-11.948C23.888 5.348 18.542 0 11.944 0zm5.459 8.24l-1.89 8.91c-.14.64-.52.8-.21.05l-2.88-2.12-1.39 1.34c-.15.15-.28.28-.57.28l.206-2.92 5.32-4.81c.23-.21-.05-.33-.35-.13l-6.58 4.14-2.83-.88c-.62-.19-.63-.61.13-.91l11.05-4.26c.51-.19.96.11.8.81z"/></svg></div>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-32 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">© 2026 Graceful Path Global Health. Licensed Preparation.</p>
            <div className="flex gap-8">
               <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Privacy Protocol</span>
               <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Mastery Terms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
