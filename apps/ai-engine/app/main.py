from __future__ import annotations

import os

from fastapi import FastAPI, Header, HTTPException

from .models import AIEngineRequest, AIEngineResponse
from .orchestrator import run_orchestration

shared_secret = os.getenv("AI_ENGINE_SHARED_SECRET", "change-me")

app = FastAPI(title="Eduvane AI Engine", version="0.1.0")


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "eduvane-ai-engine", "version": "0.1.0"}


@app.post("/v1/intelligence/respond", response_model=AIEngineResponse)
def respond(
    request: AIEngineRequest,
    x_eduvane_shared_secret: str = Header(default=""),
) -> AIEngineResponse:
    if shared_secret and x_eduvane_shared_secret != shared_secret:
        raise HTTPException(status_code=401, detail="Unauthorized engine request.")

    try:
        return run_orchestration(request)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to complete orchestration.",
        ) from exc
