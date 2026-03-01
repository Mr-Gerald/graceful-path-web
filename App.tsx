import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Home } from './pages/Marketing/Home';
import { StudentDashboard } from './pages/Dashboard/StudentDashboard';
import { AdminPanel } from './pages/Admin/AdminPanel';
import { AIChatbot } from './components/AIChatbot';
import { UserRole, User, Review, BrandingAssets } from './types';
import { COURSES, COUNTRY_LIST } from './constants';
import { supabase } from './services/supabaseClient';
import { Mail, CheckCircle2, Globe } from 'lucide-react';

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(window.location.hash.replace('#', '') || '/');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [loginInput, setLoginInput] = useState({ email: '', password: '' });
  const [registerInput, setRegisterInput] = useState({ username: '', name: '', email: '', phoneNumber: '', country: 'Nigeria', password: '', confirmPassword: '' });
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userLikes, setUserLikes] = useState<string[]>([]);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const [examDate, setExamDate] = useState('April 25, 2026');
  const [brandingAssets, setBrandingAssets] = useState<BrandingAssets>({
    founderImage: 'https://scontent.flos3-1.fna.fbcdn.net/v/t1.15752-9/628093216_1651982299306414_6375344138528513967_n.jpg?stp=dst-jpg_p480x480_tt6&_nc_cat=105&ccb=1-7&_nc_sid=0024fc&_nc_ohc=_I0sZIfD2WUQ7kNvwEJk1Is&_nc_oc=AdnWNlDSN2ZX3zyxw0emeeuGaRHwr8TKnQEyigZ5grU2qGF9NsOALUf6J4RFYwAykbo&_nc_ad=z-m&_nc_cid=1361&_nc_zt=23&_nc_ht=scontent.flos3-1.fna&oh=03_Q7cD4gFCb1g_37kFxGLsTwKWkVSbxByRx5-UM7lERl0VK0wFKg&oe=69B5DBF9',
    tutorImage: 'https://scontent.flos3-1.fna.fbcdn.net/v/t1.15752-9/627203980_1475357854098105_7236853765634707511_n.jpg?stp=dst-jpg_p480x480_tt6&_nc_cat=101&ccb=1-7&_nc_sid=0024fc&_nc_ohc=HURhymfjPSgQ7kNvwGB5YnV&_nc_oc=AdlyVEeNzPGs-tNBctuvt9oFttwPlCnOSIUrRKDwFRNoy8A40Jy-7L9Dy81GbsYK6zQ&_nc_ad=z-m&_nc_cid=1361&_nc_zt=23&_nc_ht=scontent.flos3-1.fna&oh=03_Q7cD4gEzYD-PbOL1fUqERPctJ1jNeV4ptv0YeE3t1pLbiT7tjw&oe=69B6F767',
    heroImage: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=1200',
    spotlightImage: 'https://scontent.flos3-1.fna.fbcdn.net/v/t1.15752-9/632852888_913916964939791_2375503991545664594_n.jpg?stp=dst-jpg_p480x480_tt6&_nc_cat=102&ccb=1-7&_nc_sid=0024fc&_nc_ohc=z55305SkPywQ7kNvwHzd2Bu&_nc_oc=AdlT_7qEOZGKg6R124aP3ps5cl3u0ecr_6XKBFFBCVRbKzanoqw9gi3ErasooGUXgRY&_nc_ad=z-m&_nc_cid=1361&_nc_zt=23&_nc_ht=scontent.flos3-1.fna&oh=03_Q7cD4gE0E3G_Noe0rhegZ72djUR_Fd593h-MsoFIrYJSUjTQlw&oe=69B5CE09',
    aboutImage: 'https://scontent.flos2-1.fna.fbcdn.net/v/t1.15752-9/624556295_26467964679502247_7242184259108918363_n.jpg?stp=dst-jpg_s480x480_tt6&_nc_cat=108&ccb=1-7&_nc_sid=0024fc&_nc_ohc=Vk_RbZuta2QQ7kNvwGX6IjN&_nc_oc=AdkS_kZ4LyvXIZdNzP950Lk8La-203j6A4NkNeXy6a1H9E5cXdAbScM8lgN1xMDNkj8&_nc_ad=z-m&_nc_cid=1361&_nc_zt=23&_nc_ht=scontent.flos2-1.fna&oh=03_Q7cD4gHDh6DbDLSY9cmVUOGeri6bNr0hNalxiRV8OqAgMwzT_A&oe=69B099A1'
  });

  const [globalLinks, setGlobalLinks] = useState({
    whatsapp: 'https://wa.me/message/WW3VSMB2DHYUF1',
    telegram: 'https://t.me/+r0sIS5RfnuFhYmFk',
    phone: '+44 7470 539081',
    liveSessionZoom: '#',
    telegramAcademyHub: 'https://t.me/+r0sIS5RfnuFhYmFk',
    whatsappAcademyGroup: 'https://chat.whatsapp.com/JpfoDTxUBSRCmXUu597Y44?mode=gi_t',
    paidLiveWhatsapp: 'https://chat.whatsapp.com/BaGfbAOYkNbJ6nlC53fwV8?mode=gi_t',
    paidLiveTelegram: 'https://t.me/+6bok-db_704xNmE0'
  });

  const [courseContent, setCourseContent] = useState<any>({
    FOUNDATIONS: [],
    INTEGRATION: [],
    MASTERY: []
  });

  const [practiceTests, setPracticeTests] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [geminiKeys, setGeminiKeys] = useState<string[]>([]);

  // 1. Initial Data Fetching from Supabase
  useEffect(() => {
    const initApp = async () => {
      // Start fetching everything in parallel
      const sessionPromise = supabase.auth.getSession();
      const configPromise = fetchSiteConfig();
      const reviewsPromise = fetchReviews();
      const notificationsPromise = fetchNotifications();

      // We only strictly WAIT for the session and basic config to show the UI
      // This makes the "Loading Academy" screen disappear much faster
      const [{ data: { session } }] = await Promise.all([
        sessionPromise,
        configPromise
      ]);
      
      if (session?.user) {
        // Profile fetch is fast, but we can even do this in parallel with the rest
        await fetchUserProfile(session.user.id);
      }
      
      // Ensure reviews and notifications are also handled, but they don't block the UI shell
      await Promise.all([reviewsPromise, notificationsPromise]);
      
      setIsLoading(false);
    };

    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsResettingPassword(true);
        setCurrentPath('/login');
        setError('');
      }
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setCurrentUser(null);
        setAllStudents([]); 
        setError('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    let { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    
    // If profile doesn't exist (PGRST116 is the code for 0 rows returned by single()), create it
    if (error && error.code === 'PGRST116') {
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        const meta = authData.user.user_metadata;
        const newProfile = {
          id: userId,
          username: meta.username || authData.user.email?.split('@')[0] || 'user',
          name: meta.name || 'New User',
          email: authData.user.email || '',
          phone_number: meta.phone_number || '',
          country: meta.country || '',
          role: meta.role || 'STUDENT',
          progress: 0,
          has_paid_live: false,
          is_approved: false
        };
        
        const { data: insertedData, error: insertError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();
          
        if (!insertError && insertedData) {
          data = insertedData;
          error = null;
        }
      }
    }

    if (data && !error) {
      // Use the profile data directly. We don't need to call auth.getUser() 
      // as we already have the session/user context from the caller.
      const user: User = {
        id: data.id,
        username: data.username,
        name: data.name,
        email: data.email || '', // Assuming email is stored in profiles or passed
        phoneNumber: data.phone_number,
        country: data.country,
        role: data.role as UserRole,
        progress: data.progress,
        avatar: data.avatar,
        hasPaidLive: data.has_paid_live,
        isApproved: data.is_approved,
        enrolledDate: data.enrolled_date
      };
      setCurrentUser(user);
      
      if (data.role === UserRole.ADMIN) {
        fetchAllStudents();
      }
      return user;
    }
    return null;
  };

  const fetchAllStudents = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'STUDENT');
    if (data) setAllStudents(data as any);
  };

  const fetchReviews = async () => {
    const { data } = await supabase.from('reviews').select('*, review_replies(*)').order('created_at', { ascending: false });
    if (data) {
      const formattedReviews: Review[] = data.map(r => ({
        id: r.id,
        name: r.name,
        avatar: r.avatar,
        text: r.text,
        rating: r.rating,
        role: r.role,
        likes: r.likes,
        replies: (r.review_replies || []).map((rp: any) => ({
          id: rp.id,
          name: rp.name,
          avatar: rp.avatar,
          text: rp.text,
          createdAt: new Date(rp.created_at)
        })),
        createdAt: new Date(r.created_at)
      }));
      setReviews(formattedReviews);
    }
  };

  const handleDeleteReview = async (id: string) => {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (!error) {
      setReviews(prev => prev.filter(r => r.id !== id));
      addNotification("Review Removed", "System clean-up completed by Admin.", 'ALL');
    }
  };

  const fetchNotifications = async () => {
    const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (data) setNotifications(data);
  };

  const fetchSiteConfig = async () => {
    // 1. Fetch essential config first (small data)
    const { data: essentials } = await supabase
      .from('site_config')
      .select('*')
      .in('id', ['branding', 'links', 'exam_date']);

    if (essentials) {
      const branding = essentials.find(d => d.id === 'branding')?.data;
      const links = essentials.find(d => d.id === 'links')?.data;
      const edate = essentials.find(d => d.id === 'exam_date')?.data;

      if (branding) setBrandingAssets(branding);
      if (links) setGlobalLinks(links);
      if (edate) setExamDate(edate.date);
    }

    // 2. Fetch heavier content in background
    supabase
      .from('site_config')
      .select('*')
      .in('id', ['course_content', 'practice_tests', 'materials', 'gemini_keys'])
      .then(({ data: content }) => {
        if (content) {
          const course = content.find(d => d.id === 'course_content')?.data;
          const tests = content.find(d => d.id === 'practice_tests')?.data;
          const mats = content.find(d => d.id === 'materials')?.data;
          const keys = content.find(d => d.id === 'gemini_keys')?.data;

          if (course) setCourseContent(course);
          if (tests) setPracticeTests(tests);
          if (mats) setMaterials(mats);
          if (keys) setGeminiKeys(keys.keys || []);
        }
        setHasLoadedInitialData(true);
      });
  };

  const latestConfig = React.useRef({
    brandingAssets,
    globalLinks,
    courseContent,
    practiceTests,
    materials,
    geminiKeys,
    examDate
  });

  useEffect(() => {
    latestConfig.current = {
      brandingAssets,
      globalLinks,
      courseContent,
      practiceTests,
      materials,
      geminiKeys,
      examDate
    };
  }, [brandingAssets, globalLinks, courseContent, practiceTests, materials, geminiKeys, examDate]);

  const saveSiteConfig = async () => {
    if (currentUser?.role !== UserRole.ADMIN || !hasLoadedInitialData) return;
    setIsSaving(true);
    try {
      const currentConfig = latestConfig.current;
      const configs = [
        { id: 'branding', data: currentConfig.brandingAssets },
        { id: 'links', data: currentConfig.globalLinks },
        { id: 'course_content', data: currentConfig.courseContent },
        { id: 'practice_tests', data: currentConfig.practiceTests },
        { id: 'materials', data: currentConfig.materials },
        { id: 'gemini_keys', data: { keys: currentConfig.geminiKeys } },
        { id: 'exam_date', data: { date: currentConfig.examDate } }
      ];

      for (const config of configs) {
        // Check if row exists first
        const { data: existing } = await supabase.from('site_config').select('id').eq('id', config.id).maybeSingle();
        
        if (existing) {
          // Row exists, update it
          const { error } = await supabase.from('site_config').update({ data: config.data }).eq('id', config.id);
          if (error) {
            console.error(`Failed to update ${config.id}:`, error);
            throw error;
          }
        } else {
          // Row does not exist, insert it
          const { error: insertError } = await supabase.from('site_config').insert(config);
          if (insertError) {
            console.error(`Failed to insert ${config.id}:`, insertError);
            throw insertError;
          }
        }
      }
      
      console.log("Site configuration persisted successfully.");
    } catch (err: any) {
      console.error("Failed to persist site configuration:", err);
      setError(`Failed to save changes: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === UserRole.ADMIN && hasLoadedInitialData) {
      const timer = setTimeout(() => {
        saveSiteConfig();
      }, 2000); // Debounce auto-save
      return () => clearTimeout(timer);
    }
  }, [brandingAssets, globalLinks, courseContent, practiceTests, materials, examDate, geminiKeys, currentUser, hasLoadedInitialData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginInput.email,
        password: loginInput.password,
      });
      if (error) {
        setError(error.message);
        setIsLoading(false);
      } else if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        setIsLoading(false);
        navigate(profile?.role === 'ADMIN' ? '/admin' : '/dashboard');
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (registerInput.password !== registerInput.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: registerInput.email,
      password: registerInput.password,
      options: {
        data: { 
          name: registerInput.name, 
          username: registerInput.username,
          phone_number: registerInput.phoneNumber,
          country: registerInput.country,
          role: 'STUDENT' 
        }
      }
    });

    if (error) {
      if (error.message.includes('Database error')) {
        setError("We're having trouble setting up your account. Please try again in a moment.");
      } else {
        setError(error.message);
      }
      return;
    }

    if (data.user) {
      if (!data.session) {
        setRegSuccess(true);
      } else {
        await fetchUserProfile(data.user.id);
        addNotification("Welcome to the Academy!", "Start your journey to success today!", data.user.id);
        navigate('/dashboard');
      }
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResendSuccess(false);
    setIsVerifying(true);
    
    const { data, error } = await supabase.auth.verifyOtp({
      email: registerInput.email,
      token: otpCode,
      type: 'signup'
    });

    if (error) {
      let friendlyError = error.message;
      if (error.message.toLowerCase().includes('expired')) {
        friendlyError = "The verification code has expired. Please request a new code below.";
      } else if (error.message.toLowerCase().includes('invalid')) {
        friendlyError = "The verification code is incorrect. Please check your email and try again.";
      }
      setError(friendlyError);
      setIsVerifying(false);
      return;
    }

    if (data.session && data.user) {
      const profile = await fetchUserProfile(data.user.id);
      
      if (!profile) {
        // If profile creation completely failed, log them out and show an error
        await supabase.auth.signOut();
        setError("Your account was verified, but we couldn't set up your profile. Please contact support.");
        setIsVerifying(false);
        return;
      }
      
      addNotification("Welcome to the Academy!", "Start your journey to success today!", data.user.id);
      setRegSuccess(false);
      setIsRegistering(false);
      navigate('/dashboard');
    }
    setIsVerifying(false);
  };

  const handleResendOtp = async () => {
    setError('');
    setResendSuccess(false);
    setIsResending(true);
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: registerInput.email
    });

    if (error) {
      setError(error.message);
    } else {
      setResendSuccess(true);
    }
    setIsResending(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setAllStudents([]);
    setError('');
    navigate('/');
  };

  const handleLikeReview = async (id: string) => {
    if (!currentUser) { navigate('/login'); return; }
    const isLiking = !userLikes.includes(id);
    const review = reviews.find(r => r.id === id);
    if (!review) return;

    const newLikes = isLiking ? review.likes + 1 : Math.max(0, review.likes - 1);
    const { error } = await supabase.from('reviews').update({ likes: newLikes }).eq('id', id);
    
    if (!error) {
      setReviews(prev => prev.map(r => r.id === id ? { ...r, likes: newLikes } : r));
      setUserLikes(prev => isLiking ? [...prev, id] : prev.filter(lid => lid !== id));
    }
  };

  const handleReplyReview = async (id: string, text: string) => {
    if (!currentUser) { navigate('/login'); return; }
    const review = reviews.find(r => r.id === id);
    if (!review) return;

    const taggedText = `@${review.name} ${text}`;
    const { error } = await supabase.from('review_replies').insert({
      review_id: id,
      name: currentUser.name,
      avatar: currentUser.avatar,
      text: taggedText
    });

    if (!error) {
      await fetchReviews();
      addNotification("New Reply!", `${currentUser.name} replied to a story.`, 'ALL');
    }
  };

  const addReview = async (text: string, rating: number) => {
    if (!currentUser) { navigate('/login'); return; }
    
    const reviewData: any = {
      user_id: currentUser.id,
      name: currentUser.name,
      text,
      rating,
      role: 'Nursing Student'
    };
    if (currentUser.avatar) reviewData.avatar = currentUser.avatar;

    const { error } = await supabase.from('reviews').insert(reviewData);
    if (!error) {
      await fetchReviews();
      addNotification("Review Published", "Thank you for sharing your journey!", currentUser.id);
    } else {
      console.error("Failed to add review:", error);
      // Fallback if user_id or avatar column doesn't exist
      if (error.code === '42703' || error.code === 'PGRST204' || error.message.includes('column') || error.message.includes('schema cache')) {
        const fallbackData: any = {
          name: currentUser.name,
          text,
          rating,
          role: 'Nursing Student'
        };
        
        const { error: retryError } = await supabase.from('reviews').insert(fallbackData);
        if (!retryError) {
          await fetchReviews();
          addNotification("Review Published", "Thank you for sharing your journey!", currentUser.id);
        } else {
          console.error("Failed to add review on retry:", retryError);
        }
      }
    }
  };

  const addNotification = async (title: string, text: string, userId: string | 'ALL') => {
    await supabase.from('notifications').insert({ user_id: userId, title, text });
    fetchNotifications();
  };

  const handleApprovePayment = async (userId: string) => {
    const { error } = await supabase.from('profiles').update({ has_paid_live: true }).eq('id', userId);
    if (!error) {
      if (currentUser?.id === userId) setCurrentUser({ ...currentUser, hasPaidLive: true });
      addNotification("Access Unlocked!", "Your premium academy content is now ready.", userId);
      fetchAllStudents();
    }
  };

  const handleUnapprovePayment = async (userId: string) => {
    const { error } = await supabase.from('profiles').update({ has_paid_live: false }).eq('id', userId);
    if (!error) {
      if (currentUser?.id === userId) setCurrentUser({ ...currentUser, hasPaidLive: false });
      addNotification("Access Revoked", "Your premium academy access has been revoked.", userId);
      fetchAllStudents();
    }
  };

  const handleApproveUser = async (userId: string) => {
    const { error } = await supabase.from('profiles').update({ is_approved: true }).eq('id', userId);
    if (!error) {
      if (currentUser?.id === userId) setCurrentUser({ ...currentUser, isApproved: true });
      addNotification("Account Approved!", "You now have full access to Materials and Courses.", userId);
      fetchAllStudents();
    }
  };

  const handleUnapproveUser = async (userId: string) => {
    const { error } = await supabase.from('profiles').update({ is_approved: false }).eq('id', userId);
    if (!error) {
      if (currentUser?.id === userId) setCurrentUser({ ...currentUser, isApproved: false });
      addNotification("Account Unapproved", "Your account access has been revoked.", userId);
      fetchAllStudents();
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/';
      setCurrentPath(hash);
      setError(''); // Clear error on navigation
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
    setError(''); // Clear error on navigation
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
          <p className="mt-6 font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">Loading Academy...</p>
        </div>
      </div>
    );
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/#login`,
    });
    if (error) setError(error.message);
    else setResetSuccess(true);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setError(error.message);
    else {
      setIsResettingPassword(false);
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        setCurrentPath('/login');
      }, 3000);
    }
  };

  const renderContent = () => {
    switch (currentPath) {
      case '/':
        return <Home onNavigate={navigate} reviews={reviews} links={globalLinks} branding={brandingAssets} onLike={handleLikeReview} onReply={handleReplyReview} onAddReview={addReview} userLikes={userLikes} currentUser={currentUser} />;
      case '/dashboard':
        return currentUser ? (
          <StudentDashboard user={currentUser} onLogout={handleLogout} addReview={addReview} notifications={notifications.filter(n => n.user_id === 'ALL' || n.user_id === currentUser.id)} onDeleteNotification={async (id) => { await supabase.from('notifications').delete().eq('id', id); fetchNotifications(); }} courseContent={courseContent} practiceTests={practiceTests} materials={materials} links={globalLinks} examDate={examDate} onUpdateProfile={() => fetchUserProfile(currentUser.id)} />
        ) : <Home onNavigate={navigate} reviews={reviews} links={globalLinks} branding={brandingAssets} onLike={handleLikeReview} onReply={handleReplyReview} onAddReview={addReview} userLikes={userLikes} currentUser={currentUser} />;
      case '/admin':
        return currentUser?.role === UserRole.ADMIN ? (
          <AdminPanel 
            reviews={reviews} 
            onDeleteReview={handleDeleteReview} 
            onLogout={handleLogout} 
            users={allStudents} 
            onDeleteUser={async (id) => { await supabase.from('profiles').delete().eq('id', id); fetchAllStudents(); }} 
            onApprovePayment={handleApprovePayment} 
            onUnapprovePayment={handleUnapprovePayment}
            onApproveUser={handleApproveUser} 
            onUnapproveUser={handleUnapproveUser}
            onSendNotification={addNotification} 
            courseContent={courseContent} 
            setCourseContent={setCourseContent} 
            practiceTests={practiceTests} 
            setPracticeTests={setPracticeTests} 
            materials={materials} 
            setMaterials={setMaterials} 
            globalLinks={globalLinks} 
            setGlobalLinks={setGlobalLinks} 
            branding={brandingAssets} 
            setBranding={setBrandingAssets} 
            examDate={examDate} 
            setExamDate={setExamDate} 
            isSaving={isSaving} 
            onSave={saveSiteConfig} 
          />
        ) : <Home onNavigate={navigate} reviews={reviews} links={globalLinks} branding={brandingAssets} onLike={handleLikeReview} onReply={handleReplyReview} onAddReview={addReview} userLikes={userLikes} currentUser={currentUser} />;
      case '/login':
        if (isResettingPassword) {
          return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border border-gray-100">
                <h2 className="text-3xl font-serif font-bold text-center mb-2">Reset Password</h2>
                <p className="text-center text-slate-500 mb-8">Enter your new password below.</p>
                {error && <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100">{error}</div>}
                {resetSuccess ? (
                  <div className="text-center p-8">
                    <div className="bg-green-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-green-500">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <p className="text-slate-900 font-bold">Password reset successful!</p>
                    <p className="text-sm text-slate-500">Redirecting to login...</p>
                  </div>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <input type="password" placeholder="New Password" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                    <input type="password" placeholder="Confirm New Password" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required />
                    <button type="submit" className="w-full py-5 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 transition shadow-xl mt-4">
                      Update Password
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        }
        if (isForgotPassword) {
          return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border border-gray-100">
                <h2 className="text-3xl font-serif font-bold text-center mb-2">Recover Password</h2>
                <p className="text-center text-slate-500 mb-8">Enter your email to receive a reset link.</p>
                {error && <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100">{error}</div>}
                {resetSuccess ? (
                  <div className="text-center p-8">
                    <div className="bg-brand-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand-600">
                      <Mail className="w-8 h-8" />
                    </div>
                    <p className="text-slate-900 font-bold">Check your email!</p>
                    <p className="text-sm text-slate-500">We've sent a recovery link to your inbox.</p>
                    <button onClick={() => { setIsForgotPassword(false); setResetSuccess(false); }} className="mt-8 text-brand-600 font-bold hover:underline">Back to Login</button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <input type="email" placeholder="Email Address" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required />
                    <button type="submit" className="w-full py-5 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 transition shadow-xl mt-4">
                      Send Reset Link
                    </button>
                    <button type="button" onClick={() => setIsForgotPassword(false)} className="w-full text-sm font-bold text-slate-400 hover:text-slate-600 transition">Cancel</button>
                  </form>
                )}
              </div>
            </div>
          );
        }
        if (regSuccess) {
          return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-md rounded-[2.5rem] p-12 shadow-2xl border border-gray-100 text-center animate-in zoom-in duration-300">
                <div className="bg-brand-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-brand-500 shadow-inner">
                  <Mail className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4 uppercase tracking-tight">Verify Your Email</h2>
                <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed">
                  We sent an 8-digit code to <span className="text-brand-600 font-bold">{registerInput.email}</span>. Enter it below to activate your account.
                </p>
                {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">{error}</div>}
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <input
                    type="text"
                    required
                    maxLength={8}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="00000000"
                    className="w-full bg-slate-50 p-5 rounded-2xl border-2 border-slate-100 outline-none text-center text-3xl font-black tracking-[0.25em] focus:border-brand-500 transition shadow-sm"
                  />
                  <button 
                    type="submit"
                    disabled={isVerifying || otpCode.length !== 8}
                    className="w-full py-5 bg-brand-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-brand-700 transition shadow-xl disabled:opacity-50"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify Code'}
                  </button>
                </form>
                
                {resendSuccess && (
                  <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-2xl text-sm font-bold border border-green-100">
                    A new code has been sent to your email!
                  </div>
                )}
                
                <div className="mt-6 flex flex-col items-center gap-4">
                  <button 
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="text-brand-600 font-bold text-sm hover:text-brand-700 transition disabled:opacity-50"
                  >
                    {isResending ? 'Sending...' : "Didn't receive a code? Resend"}
                  </button>
                  <button 
                    onClick={() => { setRegSuccess(false); setIsRegistering(false); setError(''); setOtpCode(''); setResendSuccess(false); }}
                    className="text-slate-400 font-bold text-sm hover:text-brand-600 transition"
                  >
                    Cancel and return to login
                  </button>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border border-gray-100">
              <h2 className="text-3xl font-serif font-bold text-center mb-2">{isRegistering ? 'Join the Academy' : 'Student Login'}</h2>
              <p className="text-center text-slate-500 mb-8">{isRegistering ? 'Start your journey to global licensure.' : 'Welcome back, future nurse!'}</p>
              {error && <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100">{error}</div>}
              <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
                {isRegistering && (
                  <>
                    <input name="name" id="reg-name" autoComplete="name" type="text" placeholder="Full Name" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={registerInput.name} onChange={e => setRegisterInput({...registerInput, name: e.target.value})} required />
                    <input name="email" id="reg-email" autoComplete="email" type="email" placeholder="Email Address" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={registerInput.email} onChange={e => setRegisterInput({...registerInput, email: e.target.value})} required />
                    <input name="tel" id="reg-tel" autoComplete="tel" type="tel" placeholder="Phone Number" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={registerInput.phoneNumber} onChange={e => setRegisterInput({...registerInput, phoneNumber: e.target.value})} required />
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"><Globe className="w-4 h-4" /></div>
                      <select name="country" id="reg-country" autoComplete="country-name" value={registerInput.country} onChange={e => setRegisterInput({...registerInput, country: e.target.value})} className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none appearance-none font-bold text-sm text-slate-700">
                        {COUNTRY_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <input name="username" id="reg-username" autoComplete="username" type="text" placeholder="Username" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={registerInput.username} onChange={e => setRegisterInput({...registerInput, username: e.target.value})} required />
                  </>
                )}
                {!isRegistering && (
                   <input name="email" id="login-email" autoComplete="email" type="email" placeholder="Email Address" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={loginInput.email} onChange={e => setLoginInput({...loginInput, email: e.target.value})} required />
                )}
                <div className="space-y-4">
                  <input name="password" id={isRegistering ? "reg-password" : "login-password"} autoComplete={isRegistering ? "new-password" : "current-password"} type="password" placeholder="Password" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={isRegistering ? registerInput.password : loginInput.password} onChange={e => isRegistering ? setRegisterInput({...registerInput, password: e.target.value}) : setLoginInput({...loginInput, password: e.target.value})} required />
                  {isRegistering && (
                    <input name="confirmPassword" id="reg-confirm-password" autoComplete="new-password" type="password" placeholder="Confirm Password" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={registerInput.confirmPassword} onChange={e => setRegisterInput({...registerInput, confirmPassword: e.target.value})} required />
                  )}
                  {!isRegistering && (
                    <button type="button" onClick={() => setIsForgotPassword(true)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-600 transition block ml-auto mt-2">Forgotten Password?</button>
                  )}
                </div>
                <button type="submit" className="w-full py-5 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 transition shadow-xl mt-4">
                  {isRegistering ? 'Create Account' : 'Sign In'}
                </button>
              </form>
              <div className="mt-8 text-center">
                <button onClick={() => { setIsRegistering(!isRegistering); setError(''); }} className="text-sm font-bold text-brand-600 hover:underline">
                  {isRegistering ? 'Already have an account? Login' : 'New student? Register here'}
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <Home onNavigate={navigate} reviews={reviews} links={globalLinks} branding={brandingAssets} onLike={handleLikeReview} onReply={handleReplyReview} onAddReview={addReview} userLikes={userLikes} currentUser={currentUser} />;
    }
  };

  return (
    <Layout userRole={currentUser?.role} onNavigate={navigate} currentPath={currentPath} links={globalLinks}>
      {renderContent()}
      <AIChatbot />
    </Layout>
  );
};

export default App;