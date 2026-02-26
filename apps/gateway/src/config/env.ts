/**
 * Overview: env.ts
 * Purpose: Implements part of the Eduvane application behavior for this module.
 * Notes: Keep exports focused and update comments when behavior changes.
 */

import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const schema = z.object({
  PORT: z.coerce.number().default(8080),
  NODE_ENV: z.string().default("development"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  AI_ENGINE_URL: z.string().default("http://localhost:8090"),
  AI_ENGINE_SHARED_SECRET: z.string().default("change-me")
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const formatted = parsed.error.issues
    .map((issue: z.ZodIssue) => issue.path.join("."))
    .join(", ");
  throw new Error(`Invalid gateway environment: ${formatted}`);
}

export const env = parsed.data;
