import { EduvaneRole } from "../contracts.js";

const roleOverrides = new Map<string, EduvaneRole>();

export function setRoleOverride(userId: string, role: EduvaneRole): void {
  roleOverrides.set(userId, role);
}

export function getRoleOverride(userId: string): EduvaneRole | undefined {
  return roleOverrides.get(userId);
}
