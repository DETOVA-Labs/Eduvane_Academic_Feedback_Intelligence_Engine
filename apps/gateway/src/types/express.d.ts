/**
 * Overview: express.d.ts
 * Purpose: Implements part of the Eduvane application behavior for this module.
 * Notes: Keep exports focused and update comments when behavior changes.
 */

import { EduSessionContext } from "../session.js";

declare global {
  namespace Express {
    interface Request {
      eduSession?: EduSessionContext;
    }
  }
}

export {};
