
import { createClient } from '@supabase/supabase-js';
import { Submission, PracticeSet, UserProfile } from '../types.ts';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

// Only initialize Supabase if configuration is present
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export const SupabaseService = {
  isConfigured: () => !!supabase,

  auth: {
    signIn: async () => {
      if (!supabase) {
        throw new Error("SUPABASE_CONFIG_MISSING: Authentication requires SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) throw error;
    },
    signOut: async () => {
      if (supabase) {
        await supabase.auth.signOut();
      } else {
        // Fallback for local cleanup if supabase isn't available
        window.location.reload();
      }
    }
  },

  profile: {
    get: async (userId: string): Promise<UserProfile | null> => {
      if (!supabase) return null;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (error) console.error("Profile Fetch Error:", error);
      return data;
    },
    upsert: async (profile: UserProfile) => {
      if (!supabase) return;
      const { error } = await supabase.from('profiles').upsert(profile);
      if (error) console.error("Profile Upsert Error:", error);
    }
  },

  submissions: {
    list: async (userId: string): Promise<Submission[]> => {
      if (!supabase) return [];
      const { data, error } = await supabase.from('submissions').select('*').eq('user_id', userId).order('timestamp', { ascending: false });
      if (error) console.error("Submissions Fetch Error:", error);
      return data || [];
    },
    save: async (userId: string, sub: Submission) => {
      if (!supabase) return;
      const { error } = await supabase.from('submissions').insert({ ...sub, user_id: userId });
      if (error) throw error;
    }
  },

  practice: {
    list: async (userId: string): Promise<PracticeSet[]> => {
      if (!supabase) return [];
      const { data, error } = await supabase.from('practice_sets').select('*').eq('user_id', userId).order('timestamp', { ascending: false });
      if (error) console.error("Practice Sets Fetch Error:", error);
      return data || [];
    },
    save: async (userId: string, set: PracticeSet) => {
      if (!supabase) return;
      const { error } = await supabase.from('practice_sets').insert({ ...set, user_id: userId });
      if (error) throw error;
    }
  },

  storage: {
    upload: async (userId: string, base64: string): Promise<string> => {
      // Guest mode uses base64 URL directly
      if (!supabase || userId === 'GUEST') return `data:image/jpeg;base64,${base64}`;
      
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
        // Fallback to base64 if storage fails but auth is fine
        return `data:image/jpeg;base64,${base64}`;
      }
    }
  }
};
