/**
 * Overview: server.ts
 * Purpose: Implements part of the Eduvane application behavior for this module.
 * Notes: Keep exports focused and update comments when behavior changes.
 */

import express from "express";
import { env } from "./config/env.js";
import { resolveSession } from "./middleware/auth.js";
import { installSecurity } from "./middleware/security.js";
import { chatRouter } from "./routes/chatRoutes.js";
import { sessionRouter } from "./routes/sessionRoutes.js";

// Builds the HTTP server that fronts session and chat orchestration endpoints.
const app = express();

// Applies global middleware before route handlers.
installSecurity(app);
app.use(resolveSession);

// Lightweight liveness probe for infra health checks.
app.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "eduvane-gateway",
    version: "0.1.0"
  });
});

// Mounts versioned API routers.
app.use("/api/v1/session", sessionRouter);
app.use("/api/v1/chat", chatRouter);

// Final fallback for unknown endpoints.
app.use((_request, response) => {
  response.status(404).json({ error: "Route not found." });
});

// Starts listening on configured gateway port.
app.listen(env.PORT, () => {
  console.log(`Eduvane gateway listening on http://localhost:${env.PORT}`);
});

// Logs unhandled promise rejections for operational visibility.
process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection in gateway:", error);
});
