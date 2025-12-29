
import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/standalone/LandingPage.tsx';
import { Dashboard } from './components/standalone/Dashboard.tsx';
import { UploadFlow } from './components/standalone/UploadFlow.tsx';
import { PracticeFlow } from './components/standalone/PracticeFlow.tsx';
import { HistoryView } from './components/standalone/HistoryView.tsx';
import { VaneIcon } from './constants.tsx';
import { Submission, PracticeSet, UserProfile } from './types.ts';
import { SupabaseService, supabase } from './services/SupabaseService.ts';
import { AIOrchestrator } from './services/AIOrchestrator.ts';
import { LogOut, Loader2, Info, LayoutDashboard, Camera, Sparkles, History, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [view, setView] = useState<'DASHBOARD' | 'UPLOAD' | 'PRACTICE' | 'HISTORY'>('DASHBOARD');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [practiceSets, setPracticeSets] = useState<PracticeSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [routeParams, setRouteParams] = useState<{ subject?: string; topic?: string }>({});
  const [orchestratorReady, setOrchestratorReady] = useState<boolean | null>(null);

  useEffect(() => {
    const init = async () => {
      // Validate AI Orchestrator configuration
      const ready = await AIOrchestrator.validateConfiguration();
      setOrchestratorReady(ready);

      if (SupabaseService.isConfigured()) {
        const { data: { session: currentSession } } = await supabase!.auth.getSession();
        setSession(currentSession);
        if (currentSession) await fetchUserData(currentSession.user.id);
        else setLoading(false);

        const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, newSession) => {
          setSession(newSession);
          if (newSession) fetchUserData(newSession.user.id);
          else {
            setProfile(null);
            setLoading(false);
          }
        });
        return () => subscription.unsubscribe();
      } else {
        setLoading(false);
      }
    };
    init();
  }, []);

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
      setProfile(prof || { id: userId, email: session?.user?.email || (isGuest ? 'guest@eduvane.local' : ''), xp_total: 0 });
    } catch (e) {
      console.error("Error fetching user data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestStart = (initialView: 'DASHBOARD' | 'UPLOAD' | 'PRACTICE' = 'DASHBOARD') => {
    setIsGuest(true);
    setView(initialView);
    fetchUserData('GUEST_USER');
  };

  const handleStart = (initialView: 'DASHBOARD' | 'UPLOAD' | 'PRACTICE' = 'DASHBOARD') => {
    if (SupabaseService.isConfigured()) {
      SupabaseService.auth.signIn();
    } else {
      handleGuestStart(initialView);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      if (SupabaseService.isConfigured() && session) {
        await SupabaseService.auth.signOut();
      }
      setIsGuest(false);
      setSession(null);
      setProfile(null);
      setView('DASHBOARD');
      setRouteParams({});
    } catch (e) {
      console.error("Sign out error:", e);
    } finally {
      setLoading(false);
    }
  };

  const currentUserId = session?.user?.id || 'GUEST_USER';

  const saveSubmission = async (sub: Submission) => {
    await SupabaseService.submissions.save(currentUserId, sub);
    setSubmissions([sub, ...submissions]);
  };

  const savePracticeSet = async (set: PracticeSet) => {
    await SupabaseService.practice.save(currentUserId, set);
    setPracticeSets([set, ...practiceSets]);
  };

  const handleCommand = (intent: string, subject?: string, topic?: string) => {
    setRouteParams({ subject, topic });
    if (intent === 'PRACTICE') setView('PRACTICE');
    else if (intent === 'ANALYZE') setView('UPLOAD');
    else if (intent === 'HISTORY') setView('HISTORY');
    else setView('DASHBOARD');
  };

  if (orchestratorReady === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1E3A5F] p-8 text-white text-center">
        <div className="max-w-md space-y-6">
          <AlertTriangle size={64} className="mx-auto text-amber-500" />
          <h1 className="text-3xl font-black">Intelligence Engine Offline</h1>
          <p className="opacity-70">The system intelligence API key is missing. Please ensure your environment is correctly configured for the Gemini API.</p>
        </div>
      </div>
    );
  }

  if (!session && !isGuest) {
    return (
      <LandingPage 
        onStart={(intent) => handleStart(intent)} 
        onGuest={() => handleGuestStart()} 
      />
    );
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]">
      <Loader2 className="animate-spin text-[#1FA2A6]" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC]">
      {(!SupabaseService.isConfigured() || isGuest) && (
        <div className="bg-[#F2A900] text-[#1E3A5F] px-4 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 z-[60]">
          <Info size={14} /> Guest Mode: Local Persistence Active
        </div>
      )}
      
      <header className="bg-[#1E3A5F] text-white p-4 md:p-6 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-3 cursor-pointer group" onClick={() => { setView('DASHBOARD'); setRouteParams({}); }}>
            <VaneIcon color="#1FA2A6" size={28} className="md:w-8 md:h-8 transition-transform group-hover:rotate-12" />
            <h1 className="text-lg md:text-xl font-black tracking-tighter uppercase">EDUVANE</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => setView('UPLOAD')} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${view === 'UPLOAD' ? 'text-[#1FA2A6]' : 'text-slate-300 hover:text-white'}`}>Evaluate</button>
            <button onClick={() => setView('PRACTICE')} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${view === 'PRACTICE' ? 'text-[#1FA2A6]' : 'text-slate-300 hover:text-white'}`}>Practice</button>
            <button onClick={() => setView('HISTORY')} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${view === 'HISTORY' ? 'text-[#1FA2A6]' : 'text-slate-300 hover:text-white'}`}>Progress</button>
          </nav>

          <div className="flex items-center gap-3 md:gap-4">
            <span className="text-[9px] md:text-[10px] font-black bg-[#1FA2A6] px-3 py-1 rounded-full text-white shadow-sm">
              {profile?.xp_total || 0} XP
            </span>
            <button onClick={handleSignOut} className="text-slate-400 hover:text-red-400 transition-colors p-1">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto py-6 md:py-10 px-4 mb-20 md:mb-0">
        {view === 'DASHBOARD' && (
          <Dashboard 
            onAction={setView} 
            onCommand={handleCommand}
            submissions={submissions} 
            profile={profile} 
          />
        )}
        {view === 'UPLOAD' && (
          <UploadFlow 
            userId={currentUserId}
            onComplete={saveSubmission} 
            onBack={() => setView('DASHBOARD')} 
          />
        )}
        {view === 'PRACTICE' && (
          <PracticeFlow 
            initialSubject={routeParams.subject}
            onSave={savePracticeSet} 
            onBack={() => setView('DASHBOARD')} 
          />
        )}
        {view === 'HISTORY' && (
          <HistoryView 
            submissions={submissions} 
            practiceSets={practiceSets} 
            onBack={() => setView('DASHBOARD')} 
          />
        )}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 shadow-2xl">
        <button onClick={() => setView('DASHBOARD')} className={`flex flex-col items-center gap-1 ${view === 'DASHBOARD' ? 'text-[#1FA2A6]' : 'text-slate-400'}`}>
          <LayoutDashboard size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">Hub</span>
        </button>
        <button onClick={() => setView('UPLOAD')} className={`flex flex-col items-center gap-1 ${view === 'UPLOAD' ? 'text-[#1FA2A6]' : 'text-slate-400'}`}>
          <Camera size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">Evaluate</span>
        </button>
        <button onClick={() => setView('PRACTICE')} className={`flex flex-col items-center gap-1 ${view === 'PRACTICE' ? 'text-[#1FA2A6]' : 'text-slate-400'}`}>
          <Sparkles size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">Practice</span>
        </button>
        <button onClick={() => setView('HISTORY')} className={`flex flex-col items-center gap-1 ${view === 'HISTORY' ? 'text-[#1FA2A6]' : 'text-slate-400'}`}>
          <History size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">Timeline</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
