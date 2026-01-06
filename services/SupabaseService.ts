
import { createClient } from '@supabase/supabase-js';
import { Submission, PracticeSet, UserProfile } from '../types.ts';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

// Initialize Supabase only if configuration is present
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

/**
 * EDUVANE SUPABASE SERVICE
 * Resilient implementation: Falls back to local/demo mode if env vars are missing.
 */
export const SupabaseService = {
  isConfigured: () => !!supabase,

  auth: {
    signIn: async () => {
      if (!supabase) {
        console.warn("Supabase not configured. Simulating successful Google Auth for Demo purposes.");
        // Mock a brief delay to simulate redirect
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Trigger a fake session for the app to pick up
        const mockUser = { id: 'demo-user-123', email: 'demo@eduvane.ai' };
        localStorage.setItem('eduvane_demo_session', JSON.stringify(mockUser));
        window.dispatchEvent(new Event('eduvane_demo_login'));
        return;
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: window.location.origin,
        }
      });

      if (error) throw error;
    },
    signOut: async () => {
      localStorage.removeItem('eduvane_demo_session');
      if (supabase) {
        await supabase.auth.signOut();
      }
      window.location.reload();
    }
  },

  profile: {
    get: async (userId: string): Promise<UserProfile | null> => {
      if (!supabase) {
        const demoProfile = localStorage.getItem('eduvane_demo_profile');
        return demoProfile ? JSON.parse(demoProfile) : { id: userId, email: 'demo@eduvane.ai', xp_total: 120 };
      }
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (error) console.error("Profile Fetch Error:", error);
      return data;
    },
    upsert: async (profile: UserProfile) => {
      if (!supabase) {
        localStorage.setItem('eduvane_demo_profile', JSON.stringify(profile));
        return;
      }
      const { error } = await supabase.from('profiles').upsert(profile);
      if (error) console.error("Profile Upsert Error:", error);
    }
  },

  submissions: {
    list: async (userId: string): Promise<Submission[]> => {
      if (!supabase) {
        const demoData = localStorage.getItem('eduvane_demo_submissions');
        return demoData ? JSON.parse(demoData) : [];
      }
      const { data, error } = await supabase.from('submissions').select('*').eq('user_id', userId).order('timestamp', { ascending: false });
      if (error) console.error("Submissions Fetch Error:", error);
      return data || [];
    },
    save: async (userId: string, sub: Submission) => {
      if (!supabase) {
        const demoData = localStorage.getItem('eduvane_demo_submissions');
        const list = demoData ? JSON.parse(demoData) : [];
        localStorage.setItem('eduvane_demo_submissions', JSON.stringify([sub, ...list]));
        return;
      }
      const { error } = await supabase.from('submissions').insert({ ...sub, user_id: userId });
      if (error) throw error;
    }
  },

  practice: {
    list: async (userId: string): Promise<PracticeSet[]> => {
      if (!supabase) {
        const demoData = localStorage.getItem('eduvane_demo_practice');
        return demoData ? JSON.parse(demoData) : [];
      }
      const { data, error } = await supabase.from('practice_sets').select('*').eq('user_id', userId).order('timestamp', { ascending: false });
      if (error) console.error("Practice Sets Fetch Error:", error);
      return data || [];
    },
    save: async (userId: string, set: PracticeSet) => {
      if (!supabase) {
        const demoData = localStorage.getItem('eduvane_demo_practice');
        const list = demoData ? JSON.parse(demoData) : [];
        localStorage.setItem('eduvane_demo_practice', JSON.stringify([set, ...list]));
        return;
      }
      const { error } = await supabase.from('practice_sets').insert({ ...set, user_id: userId });
      if (error) throw error;
    }
  },

  storage: {
    upload: async (userId: string, base64: string): Promise<string> => {
      // Direct base64 for fallback or demo modes
      if (!supabase || userId.includes('demo') || userId === 'GUEST') {
        return `data:image/jpeg;base64,${base64}`;
      }
      
      try {
        const filePath = `${userId}/${Date.now()}.jpg`;
        const res = await fetch(`data:image/jpeg;base64,${base64}`);
        const blob = await res.blob();
        
        const { error: uploadError } = await supabase.storage
          .from('work_uploads')
          .upload(filePath, blob);
          
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('work_uploads').getPublicUrl(filePath);
        return data.publicUrl;
      } catch (e) {
        console.error("Storage Upload Error:", e);
        return `data:image/jpeg;base64,${base64}`;
      }
    }
  }
};
