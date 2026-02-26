from __future__ import annotations

from typing import Literal

from .models import AIEngineRequest

Intent = Literal["ANALYSIS", "QUESTION_GENERATION", "CONVERSATIONAL"]


ANALYSIS_HINTS = {
    "analyze",
    "analysis",
    "review",
    "feedback",
    "check",
    "evaluate",
    "marking",
}

QUESTION_HINTS = {
    "question",
    "questions",
    "practice",
    "worksheet",
    "generate",
    "quiz",
}


def detect_intent(request: AIEngineRequest) -> Intent:
    text = request.message.lower().strip()
    if request.uploads:
        return "ANALYSIS"
    if any(token in text for token in QUESTION_HINTS):
        return "QUESTION_GENERATION"
    if any(token in text for token in ANALYSIS_HINTS):
        return "ANALYSIS"
    return "CONVERSATIONAL"
