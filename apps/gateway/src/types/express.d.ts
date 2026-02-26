import { EduSessionContext } from "../session.js";

declare global {
  namespace Express {
    interface Request {
      eduSession?: EduSessionContext;
    }
  }
}

export {};
