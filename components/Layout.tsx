import React, { useState } from 'react';
import { Menu, X, User as UserIcon, LogIn, PhoneCall, MessageCircle, LogOut, Globe } from 'lucide-react';
import { NAV_LINKS } from '../constants';
import { UserRole } from '../types';

export const Logo = () => (
  <div className="flex flex-col items-center justify-center cursor-pointer group scale-95 md:scale-100" onClick={() => window.location.hash = '/'}>
    <img 
      src="https://scontent.flos3-2.fna.fbcdn.net/v/t1.15752-9/627752552_2511858222545536_1185950041510102102_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=0024fc&_nc_ohc=rk8yn6_f2v4Q7kNvwF5_Nqr&_nc_oc=Adl-JvHCIA6urfsCJTKkNhn2cRm0JSHeovALL736y7iSpLkzhfFykX4NY9d-WG48JUA&_nc_ad=z-m&_nc_cid=1361&_nc_zt=23&_nc_ht=scontent.flos3-2.fna&oh=03_Q7cD4gG0Us99OppOz9pI2XVOozOxqTYN-fxMUMIKY_igRSWB3g&oe=69B740BC" 
      alt="Graceful Path Logo" 
      className="h-9 w-auto mb-0.5 transform group-hover:scale-110 transition duration-500" 
    />
    <h1 className="text-lg font-black text-[#0c4a6e] tracking-tight leading-none text-nowrap">Graceful path</h1>
    <div className="flex items-center w-full mt-1 px-0.5">
      <div className="flex-1 h-[1px] bg-[#0ea5e9] opacity-40"></div>
      <span className="px-1.5 text-[7px] font-black text-[#0ea5e9] tracking-[0.2em] uppercase text-nowrap">GLOBAL HEALTH</span>
      <div className="flex-1 h-[1px] bg-[#0ea5e9] opacity-40"></div>
    </div>
  </div>
);

interface LayoutProps {
  children: React.ReactNode;
  userRole?: UserRole;
  onNavigate: (path: string) => void;
  currentPath: string;
  links?: any;
}

export const Layout: React.FC<LayoutProps> = ({ children, userRole = UserRole.GUEST, onNavigate, currentPath, links }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const showNav = !currentPath.startsWith('/dashboard') && !currentPath.startsWith('/admin');

  const handleNavClick = (path: string, isExternal?: boolean) => {
    if (isExternal) {
      window.open(links?.whatsapp || 'https://wa.me/message/WW3VSMB2DHYUF1', '_blank');
      return;
    }
    
    if (path === '/about') {
      if (currentPath === '/') {
        document.getElementById('who-we-are')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        onNavigate('/');
        setTimeout(() => {
          document.getElementById('who-we-are')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else if (path === '/services') {
      if (currentPath === '/') {
        document.getElementById('our-services')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        onNavigate('/');
        setTimeout(() => {
          document.getElementById('our-services')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else if (path === '/resources') {
      if (currentPath === '/') {
        document.getElementById('free-resources')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        onNavigate('/');
        setTimeout(() => {
          document.getElementById('free-resources')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else if (path === '/reviews') {
      if (currentPath === '/') {
        document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        onNavigate('/');
        setTimeout(() => {
          document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else if (path === '/contact') {
      if (currentPath === '/') {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        onNavigate('/');
        setTimeout(() => {
          document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      onNavigate(path);
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {showNav && (
        <div className="bg-brand-900 text-white text-[10px] md:text-xs py-2.5 px-4 text-center font-bold tracking-widest uppercase">
          Enrollment for the April Cohort is NOW OPEN! <button onClick={() => onNavigate(userRole === UserRole.GUEST ? '/login' : '/dashboard')} className="underline ml-2 hover:text-brand-300 transition">Secure your spot →</button>
        </div>
      )}

      {showNav && (
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20">
              <div className="flex items-center">
                <Logo />
                <div className="hidden lg:ml-10 lg:flex lg:space-x-6">
                  {NAV_LINKS.map((link) => (
                    <button
                      key={link.path}
                      onClick={() => handleNavClick(link.path, link.isExternal)}
                      className={`inline-flex items-center px-1 pt-1 text-sm font-bold transition-all duration-300 text-nowrap ${
                        currentPath === link.path 
                          ? 'text-brand-600 underline underline-offset-8 decoration-2' 
                          : 'text-slate-500 hover:text-brand-500'
                      }`}
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="hidden lg:flex items-center space-x-6">
                {userRole === UserRole.GUEST ? (
                  <>
                    <button 
                      onClick={() => onNavigate('/login')}
                      className="text-slate-500 hover:text-brand-600 font-bold text-sm flex items-center transition"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Student Login
                    </button>
                    <button 
                      onClick={() => onNavigate('/login')}
                      className="bg-brand-600 text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-brand-700 transition shadow-xl shadow-brand-100 transform hover:scale-105 animate-soft-pulse"
                    >
                      Enroll Now
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => onNavigate(userRole === UserRole.ADMIN ? '/admin' : '/dashboard')}
                    className="flex items-center bg-brand-50 text-brand-700 px-6 py-3 rounded-2xl font-bold text-sm border border-brand-100 hover:bg-brand-100 transition"
                  >
                    <UserIcon className="w-4 h-4 mr-2" />
                    Dashboard Hub
                  </button>
                )}
              </div>

              <div className="flex items-center lg:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="inline-flex items-center justify-center p-3 rounded-2xl text-slate-500 hover:bg-slate-50"
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>

          {isMenuOpen && (
            <div className="lg:hidden bg-white border-t border-gray-100 pb-6 pt-4 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-1 px-4">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => handleNavClick(link.path, link.isExternal)}
                    className="block w-full text-left px-4 py-4 rounded-2xl text-base font-bold text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition"
                  >
                    {link.label}
                  </button>
                ))}
                <hr className="my-4 border-gray-100" />
                {userRole === UserRole.GUEST ? (
                  <div className="space-y-3 px-4">
                    <button onClick={() => { onNavigate('/login'); setIsMenuOpen(false); }} className="w-full text-left font-bold text-slate-600 flex items-center py-2"><LogIn className="w-4 h-4 mr-3" /> Student Login</button>
                    <button onClick={() => { onNavigate('/login'); setIsMenuOpen(false); }} className="w-full bg-brand-600 text-white px-6 py-4 rounded-2xl font-bold text-center animate-soft-pulse shadow-lg">Enroll Now</button>
                  </div>
                ) : (
                  <div className="px-4">
                    <button onClick={() => { onNavigate(userRole === UserRole.ADMIN ? '/admin' : '/dashboard'); setIsMenuOpen(false); }} className="w-full bg-brand-50 text-brand-700 px-6 py-4 rounded-2xl font-bold border border-brand-100 flex items-center justify-center"><UserIcon className="w-4 h-4 mr-2" /> Dashboard Hub</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>
      )}

      <main className="flex-grow">
        {children}
      </main>

      {showNav && (
        <footer className="bg-slate-900 text-white py-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600 rounded-full blur-[150px] opacity-10 -mr-48 -mt-48"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
              <div className="col-span-1 md:col-span-2 flex flex-col items-center md:items-start">
                <div className="mb-8 scale-110">
                  <Logo />
                </div>
                <p className="text-slate-400 max-w-md mb-10 text-base leading-relaxed font-medium text-center md:text-left">
                  Empowering nurses worldwide with structured, simple, and confidence-building clinical preparation. 
                  We walk with you — every step of the way to licensure.
                </p>
                <div className="flex space-x-6">
                  <a href={links?.whatsapp || "#"} target="_blank" rel="noopener noreferrer" className="bg-green-600 p-3 rounded-xl hover:scale-110 transition duration-300 shadow-lg shadow-green-500/20"><MessageCircle className="w-5 h-5" /></a>
                  <a href={links?.telegram || "#"} target="_blank" rel="noopener noreferrer" className="bg-brand-600 p-3 rounded-xl hover:scale-110 transition duration-300 shadow-lg shadow-brand-500/20"><Globe className="w-5 h-5" /></a>
                  <a href={`tel:${links?.phone || "+447470539081"}`} className="bg-white/5 p-3 rounded-xl hover:bg-brand-600 transition duration-300 hover:scale-110 shadow-sm"><PhoneCall className="w-5 h-5" /></a>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-6 text-white">Programs</h3>
                <ul className="space-y-3 text-slate-400 font-medium text-sm">
                  <li><button onClick={() => onNavigate('/courses')} className="hover:text-brand-400 transition">Intensive Review</button></li>
                  <li><button onClick={() => onNavigate('/courses')} className="hover:text-brand-400 transition">Pharmacology Mastery</button></li>
                  <li><button onClick={() => onNavigate('/courses')} className="hover:text-brand-400 transition">Maternity & OB</button></li>
                  <li><button onClick={() => onNavigate('/courses')} className="hover:text-brand-400 transition">Private Tutoring</button></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-6 text-white">Support</h3>
                <ul className="space-y-3 text-slate-400 font-medium text-sm">
                  <li><button onClick={() => handleNavClick('/about')} className="hover:text-brand-400 transition">Who We Are</button></li>
                  <li><button onClick={() => handleNavClick('/resources')} className="hover:text-brand-400 transition">Free Resources</button></li>
                  <li><button onClick={() => onNavigate('/faq')} className="hover:text-brand-400 transition">FAQs</button></li>
                  <li><button onClick={() => handleNavClick('/contact')} className="hover:text-brand-400 transition">Contact Us</button></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 mt-16 pt-8 text-center">
              <p className="text-slate-500 font-medium text-sm">&copy; {new Date().getFullYear()} Graceful Path Global Health. All rights reserved.</p>
              <p className="mt-2 text-brand-400 font-bold tracking-wide text-xs">Email: admin@gracefulpathglobalhealth.com</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
