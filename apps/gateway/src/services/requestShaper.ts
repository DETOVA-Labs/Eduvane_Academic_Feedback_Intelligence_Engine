/**
 * Overview: requestShaper.ts
 * Purpose: Implements part of the Eduvane application behavior for this module.
 * Notes: Keep exports focused and update comments when behavior changes.
 */

import {
  AIEngineRequest,
  ConversationTurn,
  GatewayChatRequest
} from "../contracts.js";
import { EduSessionContext } from "../session.js";

export function shapeAIRequest(input: {
  body: GatewayChatRequest;
  session: EduSessionContext;
  history: ConversationTurn[];
}): AIEngineRequest {
  return {
    userId: input.session.userId,
    role: input.session.role,
    sessionId: input.body.sessionId,
    message: input.body.message,
    uploads: input.body.uploads,
    history: input.history.slice(-12)
  };
}
