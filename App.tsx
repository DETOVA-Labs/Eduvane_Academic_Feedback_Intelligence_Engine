/**
 * Overview: App.tsx
 * Purpose: Implements part of the Eduvane application behavior for this module.
 * Notes: Keep exports focused and update comments when behavior changes.
 */


import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/standalone/LandingPage.tsx';
import { AuthScreen } from './components/standalone/AuthScreen.tsx';
import { Dashboard } from './components/standalone/Dashboard.tsx';
import { VaneIcon } from './constants.tsx';
import { Submission, PracticeSet, UserProfile } from './types.ts';
import { SupabaseService, supabase } from './services/SupabaseService.ts';
import { LogOut, Loader2, Info, Moon, Sun, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [practiceSets, setPracticeSets] = useState<PracticeSet[]>([]);
  
  const [guestSubmissions, setGuestSubmissions] = useState<Submission[]>([]);
  const [guestPracticeSets, setGuestPracticeSets] = useState<PracticeSet[]>([]);

  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('eduvane-theme') as Theme) || 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches);
      if (isDark) root.classList.add('dark');
      else root.classList.remove('dark');
    };

    applyTheme();
    localStorage.setItem('eduvane-theme', theme);

    const listener = () => {
      if (theme === 'system') applyTheme();
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  const fetchUserData = async (userId: string) => {
    setLoading(true);
    try {
      const [subs, sets, prof] = await Promise.all([
        SupabaseService.submissions.list(userId),
        SupabaseService.practice.list(userId),
        SupabaseService.profile.get(userId)
      ]);
      setSubmissions(subs);
      setPracticeSets(sets);
      setProfile(prof || { id: userId, email: 'user@eduvane.ai', xp_total: 0 });
    } catch (e) {
      console.error("Error fetching user data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      // Handle Demo Login event
      const onDemoLogin = () => {
        const demoUser = JSON.parse(localStorage.getItem('eduvane_demo_session') || '{}');
        if (demoUser.id) {
          SupabaseService.profile.upsert({
            id: demoUser.id,
            email: demoUser.email || 'demo@eduvane.ai',
            xp_total: 120,
            first_name: demoUser.given_name,
            last_name: demoUser.family_name,
            google_user_id: demoUser.google_user_id
          });
          setSession({ user: demoUser });
          setIsGuest(false);
          fetchUserData(demoUser.id);
        }
      };
      window.addEventListener('eduvane_demo_login', onDemoLogin);

      // Check existing sessions (Supabase or Demo)
      const demoSession = localStorage.getItem('eduvane_demo_session');
      if (SupabaseService.isConfigured()) {
        const { data: { session: currentSession } } = await supabase!.auth.getSession();
        if (currentSession) {
          await SupabaseService.profile.syncFromAuthUser(currentSession.user);
          setSession(currentSession);
          await fetchUserData(currentSession.user.id);
        } else if (demoSession) {
          onDemoLogin();
        } else {
          setLoading(false);
        }

        const { data: { subscription } } = supabase!.auth.onAuthStateChange(async (_event, newSession) => {
          if (newSession) {
            await SupabaseService.profile.syncFromAuthUser(newSession.user);
            setSession(newSession);
            await fetchUserData(newSession.user.id);
            setIsGuest(false);
          } else if (!localStorage.getItem('eduvane_demo_session')) {
            setSession(null);
            setProfile(null);
            setSubmissions([]);
            setPracticeSets([]);
            setLoading(false);
          }
        });
        return () => {
          subscription.unsubscribe();
          window.removeEventListener('eduvane_demo_login', onDemoLogin);
        };
      } else {
        if (demoSession) {
          onDemoLogin();
        } else {
          setLoading(false);
        }
        return () => window.removeEventListener('eduvane_demo_login', onDemoLogin);
      }
    };
    init();
  }, []);

  const handleGuestStart = () => {
    setIsGuest(true);
  };

  const handleSignUpClick = () => {
    setAuthMode('signup');
    setShowAuth(true);
  };

  const handleSignInClick = () => {
    setAuthMode('signin');
    setShowAuth(true);
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await SupabaseService.auth.signOut();
      setIsGuest(false);
      setSession(null);
      setProfile(null);
      setShowAuth(false);
      setSubmissions([]);
      setPracticeSets([]);
      setGuestSubmissions([]);
      setGuestPracticeSets([]);
    } catch (e) {
      console.error("Sign out error:", e);
    } finally {
      setLoading(false);
    }
  };

  const currentUserId = session?.user?.id;

  const saveSubmission = async (sub: Submission) => {
    if (session && currentUserId) {
      await SupabaseService.submissions.save(currentUserId, sub);
      setSubmissions((current) => [sub, ...current]);
    } else {
      setGuestSubmissions((current) => [sub, ...current]);
    }
  };

  const savePracticeSet = async (set: PracticeSet) => {
    if (session && currentUserId) {
      await SupabaseService.practice.save(currentUserId, set);
      setPracticeSets((current) => [set, ...current]);
    } else {
      setGuestPracticeSets((current) => [set, ...current]);
    }
  };

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const ThemeIcon = () => {
    const Icon = (theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor) as React.ComponentType<{ size?: number }>;
    return <Icon size={18} />;
  };

  if (!session && !isGuest) {
    if (showAuth) {
      return (
        <AuthScreen 
          initialMode={authMode} 
          onBack={() => setShowAuth(false)}
        />
      );
    }
    return (
      <LandingPage 
        onSignUp={handleSignUpClick}
        onSignIn={handleSignInClick}
        onGuest={handleGuestStart} 
      />
    );
  }

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F9FC] dark:bg-slate-950 p-6 text-center">
      <Loader2 className="animate-spin text-[#1FA2A6] mb-4" size={32} />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Reviewing your profile...</p>
    </div>
  );

  const activeSubmissions = session ? submissions : guestSubmissions;
  const activePracticeSets = session ? practiceSets : guestPracticeSets;

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-[#F7F9FC] dark:bg-slate-950 transition-colors duration-200">
      {isGuest && (
        <div className="shrink-0 bg-[#1E3A5F] dark:bg-slate-900 text-white/80 px-4 py-2 text-[11px] font-medium flex items-center justify-center gap-2 z-[60]">
          <Info size={14} className="text-[#1FA2A6]" /> 
          Guest Mode: Your activity is temporary and will be cleared on refresh.
        </div>
      )}
      
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 md:px-8 sticky top-0 z-50 h-16 flex items-center transition-colors">
        <div className="max-w-6xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <VaneIcon color="#1FA2A6" size={24} />
            <h1 className="text-lg font-bold tracking-tight text-[#1E3A5F] dark:text-slate-100">Eduvane</h1>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme} 
              className="p-2 text-slate-400 hover:text-[#1FA2A6] dark:hover:text-slate-100 transition-colors"
              title={`Switch Theme`}
            >
              <ThemeIcon />
            </button>

            <button onClick={handleSignOut} className="text-slate-400 hover:text-red-500 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain max-w-6xl mx-auto w-full py-4 px-4 md:py-6">
        <Dashboard 
          userId={currentUserId || 'GUEST'}
          profile={profile}
          submissions={activeSubmissions}
          practiceSets={activePracticeSets}
          onSaveSubmission={saveSubmission}
          onSavePracticeSet={savePracticeSet}
        />
      </main>
    </div>
  );
};

export default App;
