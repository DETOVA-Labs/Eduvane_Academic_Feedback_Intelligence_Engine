import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "../config/env.js";

interface RateBucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, RateBucket>();

export function installSecurity(app: express.Express) {
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true
    })
  );
  app.use(helmet());
  app.use(express.json({ limit: "8mb" }));

  app.use((request, response, next) => {
    const ipKey = request.ip || "unknown";
    const now = Date.now();
    const windowMs = 60_000;
    const maxRequests = 120;
    const current = buckets.get(ipKey);

    if (!current || now - current.windowStart > windowMs) {
      buckets.set(ipKey, { count: 1, windowStart: now });
      next();
      return;
    }

    if (current.count >= maxRequests) {
      response.status(429).json({
        error: "Rate limit exceeded. Please retry shortly."
      });
      return;
    }

    current.count += 1;
    next();
  });
}
