import React from 'react';
import { User, Review, BrandingAssets, GlobalLinks } from '../../types';

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
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={branding.logo} alt="Logo" className="w-10 h-10 rounded-lg" />
            <span className="font-black text-xl tracking-tighter text-slate-900">ACADEMY</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => onNavigate('/')} className="text-sm font-medium text-slate-600 hover:text-brand-600">Home</button>
            <button onClick={() => onNavigate('/login')} className="px-6 py-2.5 bg-brand-600 text-white rounded-full text-sm font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200">Login</button>
          </nav>
        </div>
      </header>

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-6 leading-[0.9]">
              Master Your <span className="text-brand-600">NCLEX</span> Journey
            </h1>
            <p className="text-xl text-slate-600 mb-10">
              The most comprehensive nursing education platform designed for success.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => onNavigate('/register')}
                className="w-full sm:w-auto px-10 py-4 bg-brand-600 text-white rounded-full font-black text-lg hover:bg-brand-700 transition-all shadow-xl shadow-brand-200"
              >
                Get Started Now
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.slice(0, 3).map((review) => (
              <div key={review.id} className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                    {review.avatar && <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{review.name}</h3>
                    <p className="text-xs text-slate-500">{review.role}</p>
                  </div>
                </div>
                <p className="text-slate-600 italic">"{review.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">© 2026 Academy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
