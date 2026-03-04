/**
 * Overview: session.ts
 * Purpose: Implements part of the Eduvane application behavior for this module.
 * Notes: Keep exports focused and update comments when behavior changes.
 */

import { EduvaneRole } from "./contracts.js";

export interface EduSessionContext {
  userId: string;
  role: EduvaneRole;
  accessToken?: string;
  isGuest: boolean;
}

export function normalizeRole(rawRole: unknown): EduvaneRole {
  if (typeof rawRole !== "string") {
    return "UNKNOWN";
  }
  const upper = rawRole.toUpperCase();
  if (upper === "TEACHER" || upper === "STUDENT") {
    return upper;
  }
  return "UNKNOWN";
}
