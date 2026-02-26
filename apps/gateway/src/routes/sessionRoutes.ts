import { Router } from "express";
import { z } from "zod";
import { EduvaneRole } from "../contracts.js";
import { supabaseAdminClient } from "../lib/supabase.js";
import { setRoleOverride } from "../services/sessionRoleMemory.js";

const roleSchema = z.object({
  role: z.enum(["TEACHER", "STUDENT"])
});

export const sessionRouter = Router();

sessionRouter.get("/me", (request, response) => {
  if (!request.eduSession) {
    response.status(401).json({ error: "No active session." });
    return;
  }

  response.json({
    userId: request.eduSession.userId,
    role: request.eduSession.role
  });
});

sessionRouter.post("/role", async (request, response) => {
  if (!request.eduSession) {
    response.status(401).json({ error: "No active session." });
    return;
  }

  const parsed = roleSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Role must be TEACHER or STUDENT." });
    return;
  }

  try {
    const role: EduvaneRole = parsed.data.role;
    setRoleOverride(request.eduSession.userId, role);
    request.eduSession.role = role;

    if (!request.eduSession.isGuest && supabaseAdminClient) {
      await supabaseAdminClient.auth.admin.updateUserById(
        request.eduSession.userId,
        {
          user_metadata: { role }
        }
      );
    }

    response.json({
      userId: request.eduSession.userId,
      role: request.eduSession.role
    });
  } catch (error) {
    response.status(500).json({ error: "Unable to update role." });
  }
});
