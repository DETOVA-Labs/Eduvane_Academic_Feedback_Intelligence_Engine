import { NextFunction, Request, Response } from "express";
import { supabaseAuthClient } from "../lib/supabase.js";
import { getRoleOverride } from "../services/sessionRoleMemory.js";
import { normalizeRole } from "../session.js";

function guestUserId(request: Request): string {
  return request.header("x-guest-user-id") || `guest:${request.ip || "local"}`;
}

export async function resolveSession(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const authorization = request.header("authorization") || "";
  const token =
    authorization.toLowerCase().startsWith("bearer ") && authorization.length > 7
      ? authorization.slice(7)
      : "";

  if (token && !supabaseAuthClient) {
    response
      .status(503)
      .json({ error: "Supabase auth is not configured on the gateway." });
    return;
  }

  if (token && supabaseAuthClient) {
    const { data, error } = await supabaseAuthClient.auth.getUser(token);
    if (error || !data.user) {
      response.status(401).json({ error: "Invalid Supabase session token." });
      return;
    }

    const userMetadataRole = normalizeRole(data.user.user_metadata?.role);
    const appMetadataRole = normalizeRole(data.user.app_metadata?.role);
    const profileRole =
      userMetadataRole !== "UNKNOWN"
        ? userMetadataRole
        : appMetadataRole !== "UNKNOWN"
          ? appMetadataRole
          : "UNKNOWN";
    const overrideRole = getRoleOverride(data.user.id);

    request.eduSession = {
      userId: data.user.id,
      role: overrideRole || profileRole,
      accessToken: token,
      isGuest: false
    };
    next();
    return;
  }

  const guestId = guestUserId(request);
  const overrideRole = getRoleOverride(guestId);

  request.eduSession = {
    userId: guestId,
    role: overrideRole || "UNKNOWN",
    isGuest: true
  };
  next();
}
