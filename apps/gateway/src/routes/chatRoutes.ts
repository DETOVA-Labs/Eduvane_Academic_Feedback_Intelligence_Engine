/**
 * Overview: chatRoutes.ts
 * Purpose: Implements part of the Eduvane application behavior for this module.
 * Notes: Keep exports focused and update comments when behavior changes.
 */

import { Router } from "express";
import { z } from "zod";
import { requestAIEngine } from "../clients/aiEngineClient.js";
import { GatewayChatRequest } from "../contracts.js";
import {
  getConversationHistory,
  listConversationSummaries,
  saveConversationExchange
} from "../services/historyStore.js";
import { realizeLinguisticResponse } from "../services/linguisticRealizer.js";
import { shapeAIRequest } from "../services/requestShaper.js";

const uploadSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  base64Data: z.string().min(1)
});

const baseRequestSchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().default(""),
  uploads: z.array(uploadSchema).default([])
});

const requestSchema = baseRequestSchema
  .refine((value: z.infer<typeof baseRequestSchema>) => value.message.trim().length > 0 || value.uploads.length > 0, {
    message: "Message or upload is required."
  });

export const chatRouter = Router();

chatRouter.get("/history", async (request, response) => {
  if (!request.eduSession) {
    response.status(401).json({ error: "No active session." });
    return;
  }

  try {
    const summaries = await listConversationSummaries(request.eduSession.userId);
    response.json(summaries);
  } catch (error) {
    response.status(500).json({ error: "Unable to load conversation history." });
  }
});

chatRouter.get("/history/:sessionId", async (request, response) => {
  if (!request.eduSession) {
    response.status(401).json({ error: "No active session." });
    return;
  }

  try {
    const turns = await getConversationHistory(
      request.eduSession.userId,
      request.params.sessionId
    );
    response.json(turns);
  } catch (error) {
    response.status(500).json({ error: "Unable to load conversation session." });
  }
});

chatRouter.post("/intent", async (request, response) => {
  if (!request.eduSession) {
    response.status(401).json({ error: "No active session." });
    return;
  }

  const parsed = requestSchema.safeParse({
    sessionId: request.body?.sessionId || `intent-${Date.now()}`,
    message: request.body?.message || "",
    uploads: request.body?.uploads || []
  });
  if (!parsed.success) {
    response.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid input." });
    return;
  }

  try {
    const body = parsed.data as GatewayChatRequest;
    const aiRequest = shapeAIRequest({
      body,
      session: request.eduSession,
      history: []
    });
    const aiResponse = await requestAIEngine(aiRequest);

    response.json({
      intent: aiResponse.intent,
      role: aiResponse.role
    });
  } catch (error) {
    response.status(502).json({
      error: "Unable to classify request intent."
    });
  }
});

chatRouter.post("/respond", async (request, response) => {
  if (!request.eduSession) {
    response.status(401).json({ error: "No active session." });
    return;
  }

  const parsed = requestSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid input." });
    return;
  }

  try {
    const body = parsed.data as GatewayChatRequest;
    const priorTurns = await getConversationHistory(
      request.eduSession.userId,
      body.sessionId
    );

    const aiRequest = shapeAIRequest({
      body,
      session: request.eduSession,
      history: priorTurns
    });
    const aiResponse = await requestAIEngine(aiRequest);
    const recentOutputs = priorTurns
      .filter((turn) => turn.role === "assistant")
      .map((turn) => turn.content)
      .slice(-8);
    const realization = await realizeLinguisticResponse({
      sessionId: aiResponse.sessionId,
      intent: aiResponse.intent,
      role: aiResponse.role,
      userMessage: body.message,
      baseResponseText: aiResponse.responseText,
      baseFollowUpSuggestion: aiResponse.followUpSuggestion,
      recentOutputs
    });
    const finalResponse = {
      ...aiResponse,
      responseText: realization.responseText,
      followUpSuggestion: realization.followUpSuggestion
    };

    if (!realization.applied) {
      console.info("linguistic_realization_fallback", {
        sessionId: aiResponse.sessionId,
        reason: realization.fallbackReason
      });
    }

    await saveConversationExchange({
      userId: request.eduSession.userId,
      sessionId: aiResponse.sessionId,
      userMessage: body.message.trim() || "Uploaded student work for analysis.",
      assistantMessage: finalResponse.responseText
    });

    response.json(finalResponse);
  } catch (error) {
    response.status(502).json({
      error: "Unable to complete Eduvane orchestration request."
    });
  }
});
