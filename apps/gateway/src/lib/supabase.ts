/**
 * Overview: supabase.ts
 * Purpose: Implements part of the Eduvane application behavior for this module.
 * Notes: Keep exports focused and update comments when behavior changes.
 */

import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

export const supabaseAuthClient =
  env.SUPABASE_URL && env.SUPABASE_ANON_KEY
    ? createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
        auth: { autoRefreshToken: false, persistSession: false }
      })
    : null;

export const supabaseAdminClient =
  env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false }
      })
    : null;
