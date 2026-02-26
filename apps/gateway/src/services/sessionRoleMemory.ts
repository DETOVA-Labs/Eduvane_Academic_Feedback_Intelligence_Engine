/**
 * Overview: sessionRoleMemory.ts
 * Purpose: Implements part of the Eduvane application behavior for this module.
 * Notes: Keep exports focused and update comments when behavior changes.
 */

import { EduvaneRole } from "../contracts.js";

const roleOverrides = new Map<string, EduvaneRole>();

export function setRoleOverride(userId: string, role: EduvaneRole): void {
  roleOverrides.set(userId, role);
}

export function getRoleOverride(userId: string): EduvaneRole | undefined {
  return roleOverrides.get(userId);
}
