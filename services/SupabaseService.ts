/**
 * Overview: SupabaseService.ts
 * Purpose: Implements part of the Eduvane application behavior for this module.
 * Notes: Keep exports focused and update comments when behavior changes.
 */


import { createClient } from '@supabase/supabase-js';
import { Submission, PracticeSet, UserProfile } from '../types.ts';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

// Initialize Supabase only if configuration is present
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

const profileCacheKey = (userId: string) => `eduvane_profile_cache_${userId}`;

// Extracts normalized profile fields from Supabase auth user metadata.
const buildProfileFromAuthUser = (user: any): UserProfile => {
  const metadata = user?.user_metadata || {};
  const identities = Array.isArray(user?.identities) ? user.identities : [];
  const googleIdentity = identities.find((identity: any) => identity?.provider === 'google');
  const googleUserId = googleIdentity?.id || metadata.sub || metadata.provider_id;

  return {
    id: user.id,
    email: user.email || '',
    xp_total: 0,
    first_name: metadata.given_name || metadata.full_name?.split(' ')?.[0] || undefined,
    last_name: metadata.family_name || undefined,
    google_user_id: user?.app_metadata?.provider === 'google' ? googleUserId : undefined
  };
};

const cacheProfile = (profile: UserProfile) => {
  localStorage.setItem(profileCacheKey(profile.id), JSON.stringify(profile));
};

const readCachedProfile = (userId: string): UserProfile | null => {
  const raw = localStorage.getItem(profileCacheKey(userId));
  return raw ? JSON.parse(raw) : null;
};

/**
 * EDUVANE SUPABASE SERVICE
 * Resilient implementation: Falls back to local/demo mode if env vars are missing.
 */
export const SupabaseService = {
  isConfigured: () => !!supabase,

  auth: {
    signIn: async () => {
      return SupabaseService.auth.signInWithGoogle();
    },
    signInWithGoogle: async () => {
      if (!supabase) {
        console.warn("Supabase not configured. Simulating successful Google Auth for Demo purposes.");
        // Mock a brief delay to simulate redirect
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Trigger a fake session for the app to pick up
        const mockUser = {
          id: 'demo-user-123',
          email: 'demo@eduvane.ai',
          given_name: 'Demo',
          family_name: 'User',
          google_user_id: 'google-demo-user-123'
        };
        localStorage.setItem('eduvane_demo_session', JSON.stringify(mockUser));
        SupabaseService.profile.upsert({
          id: mockUser.id,
          email: mockUser.email,
          xp_total: 120,
          first_name: mockUser.given_name,
          last_name: mockUser.family_name,
          google_user_id: mockUser.google_user_id
        });
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
    signInWithEmail: async (email: string, password: string) => {
      if (!supabase) {
        throw new Error("SUPABASE_CONFIG_MISSING: Email sign-in is unavailable in demo mode.");
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    signUpWithEmail: async (email: string, password: string) => {
      if (!supabase) {
        throw new Error("SUPABASE_CONFIG_MISSING: Email sign-up is unavailable in demo mode.");
      }
      const { error } = await supabase.auth.signUp({ email, password });
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
      const cached = readCachedProfile(userId);
      if (!data) {
        return cached;
      }
      const merged: UserProfile = {
        ...data,
        first_name: data.first_name || cached?.first_name,
        last_name: data.last_name || cached?.last_name,
        google_user_id: data.google_user_id || cached?.google_user_id
      };
      cacheProfile(merged);
      return merged;
    },
    upsert: async (profile: UserProfile) => {
      cacheProfile(profile);
      if (!supabase) {
        localStorage.setItem('eduvane_demo_profile', JSON.stringify(profile));
        return;
      }
      const payload = {
        id: profile.id,
        email: profile.email,
        xp_total: profile.xp_total,
        first_name: profile.first_name,
        last_name: profile.last_name,
        google_user_id: profile.google_user_id
      };
      const { error } = await supabase.from('profiles').upsert(payload);
      if (error) {
        console.error("Profile Upsert Error:", error);
        // Fallback for older profile schema while preserving local profile memory.
        const { error: fallbackError } = await supabase
          .from('profiles')
          .upsert({ id: profile.id, email: profile.email, xp_total: profile.xp_total });
        if (fallbackError) {
          console.error("Profile Upsert Fallback Error:", fallbackError);
        }
      }
    },
    syncFromAuthUser: async (user: any) => {
      if (!user?.id) return;
      const existing = await SupabaseService.profile.get(user.id);
      const extracted = buildProfileFromAuthUser(user);
      await SupabaseService.profile.upsert({
        id: user.id,
        email: extracted.email || existing?.email || '',
        xp_total: existing?.xp_total ?? 0,
        first_name: extracted.first_name || existing?.first_name,
        last_name: extracted.last_name || existing?.last_name,
        google_user_id: extracted.google_user_id || existing?.google_user_id
      });
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
