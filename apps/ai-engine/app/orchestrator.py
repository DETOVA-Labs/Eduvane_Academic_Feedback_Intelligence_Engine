"""
Overview: orchestrator.py
Purpose: Defines part of the Eduvane runtime behavior for this module.
Notes: Keep logic cohesive and update docstrings/comments when behavior changes.
"""

from __future__ import annotations

import os

from .handwriting import evaluate_handwriting
from .intent import detect_intent
from .linguistic import (
    realize_response,
    realize_role_clarification,
    realize_role_clarification_follow_up,
)
from .memory import memory
from .models import AIEngineRequest, AIEngineResponse, Role
from .question_generation import extract_learning_gaps, generate_questions
from .synthesis import (
    build_analysis_response,
    build_conversational_response,
    build_question_prompt,
)

legacy_linguistic_enabled = (
    os.getenv("AI_ENGINE_LINGUISTIC_LEGACY_ENABLED", "false").strip().lower()
    in {"1", "true", "yes", "on"}
)


def resolve_role(request_role: Role, session_id: str) -> Role:
    state = memory.get(session_id)
    if request_role != "UNKNOWN":
        memory.set_role(session_id, request_role)
        return request_role
    if state.role != "UNKNOWN":
        return state.role
    return "UNKNOWN"


def _role_clarification_prompt() -> str:
    return "Please confirm your role once: Student or Teacher."


def run_orchestration(request: AIEngineRequest) -> AIEngineResponse:
    role = resolve_role(request.role, request.sessionId)
    state = memory.get(request.sessionId)
    intent = detect_intent(request)

    if role == "UNKNOWN" and not state.asked_role_clarification:
        state.asked_role_clarification = True
        if legacy_linguistic_enabled:
            clarification_text = realize_role_clarification(request.sessionId)
            clarification_follow_up = realize_role_clarification_follow_up(
                request.sessionId
            )
        else:
            clarification_text = _role_clarification_prompt()
            clarification_follow_up = (
                "Once your role is set, I will tailor tone and feedback format."
            )
        response = AIEngineResponse(
            sessionId=request.sessionId,
            role=role,
            intent="CONVERSATIONAL",
            responseText=clarification_text,
            followUpSuggestion=clarification_follow_up
        )
        memory.append_turn(request.sessionId, "user", request.message)
        memory.append_turn(request.sessionId, "assistant", response.responseText)
        return response

    if intent == "ANALYSIS":
        gaps = extract_learning_gaps(request.message)
        memory.remember_gaps(request.sessionId, gaps)
        has_pdf = any(upload.mimeType.lower() == "application/pdf" for upload in request.uploads)
        handwriting_feedback = evaluate_handwriting(bool(request.uploads), has_pdf)
        response_text = build_analysis_response(role, gaps)
        follow_up = "Upload the next attempt when ready, and I will compare progress."
        if legacy_linguistic_enabled:
            response_text, follow_up = realize_response(
                session_id=request.sessionId,
                role=role,
                intent="ANALYSIS",
                user_text=request.message,
                has_upload=bool(request.uploads),
                base_text=response_text,
                base_follow_up=follow_up,
            )
        response = AIEngineResponse(
            sessionId=request.sessionId,
            role=role,
            intent="ANALYSIS",
            responseText=response_text,
            handwritingFeedback=handwriting_feedback,
            followUpSuggestion=follow_up
        )
    elif intent == "QUESTION_GENERATION":
        gaps = state.learning_gaps or extract_learning_gaps(request.message)
        questions = generate_questions(gaps)
        response_text = build_question_prompt(role, questions)
        follow_up = (
            "Attempt these questions first, then upload your responses for feedback."
        )
        if legacy_linguistic_enabled:
            response_text, follow_up = realize_response(
                session_id=request.sessionId,
                role=role,
                intent="QUESTION_GENERATION",
                user_text=request.message,
                has_upload=bool(request.uploads),
                base_text=response_text,
                base_follow_up=follow_up,
            )
        response = AIEngineResponse(
            sessionId=request.sessionId,
            role=role,
            intent="QUESTION_GENERATION",
            responseText=response_text,
            generatedQuestions=questions,
            followUpSuggestion=follow_up
        )
    else:
        response_text = build_conversational_response(role, request.message)
        follow_up = None
        if legacy_linguistic_enabled:
            response_text, follow_up = realize_response(
                session_id=request.sessionId,
                role=role,
                intent="CONVERSATIONAL",
                user_text=request.message,
                has_upload=bool(request.uploads),
                base_text=response_text,
                base_follow_up=None,
            )
        response = AIEngineResponse(
            sessionId=request.sessionId,
            role=role,
            intent="CONVERSATIONAL",
            responseText=response_text,
            followUpSuggestion=follow_up,
        )

    memory.append_turn(request.sessionId, "user", request.message)
    memory.append_turn(request.sessionId, "assistant", response.responseText)
    return response
