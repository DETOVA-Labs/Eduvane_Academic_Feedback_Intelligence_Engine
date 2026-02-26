import express from "express";
import { env } from "./config/env.js";
import { resolveSession } from "./middleware/auth.js";
import { installSecurity } from "./middleware/security.js";
import { chatRouter } from "./routes/chatRoutes.js";
import { sessionRouter } from "./routes/sessionRoutes.js";

const app = express();
installSecurity(app);
app.use(resolveSession);

app.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "eduvane-gateway",
    version: "0.1.0"
  });
});

app.use("/api/v1/session", sessionRouter);
app.use("/api/v1/chat", chatRouter);

app.use((_request, response) => {
  response.status(404).json({ error: "Route not found." });
});

app.listen(env.PORT, () => {
  console.log(`Eduvane gateway listening on http://localhost:${env.PORT}`);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection in gateway:", error);
});
