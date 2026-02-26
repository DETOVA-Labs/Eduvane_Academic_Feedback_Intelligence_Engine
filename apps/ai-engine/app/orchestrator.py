"""
Overview: orchestrator.py
Purpose: Defines part of the Eduvane runtime behavior for this module.
Notes: Keep logic cohesive and update docstrings/comments when behavior changes.
"""

from __future__ import annotations

from .handwriting import evaluate_handwriting
from .intent import detect_intent
from .memory import memory
from .models import AIEngineRequest, AIEngineResponse, Role
from .question_generation import extract_learning_gaps, generate_questions
from .synthesis import (
    build_analysis_response,
    build_conversational_response,
    build_question_prompt,
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
        response = AIEngineResponse(
            sessionId=request.sessionId,
            role=role,
            intent="CONVERSATIONAL",
            responseText=_role_clarification_prompt(),
            followUpSuggestion="Once your role is set, I will tailor tone and feedback format."
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

        response = AIEngineResponse(
            sessionId=request.sessionId,
            role=role,
            intent="ANALYSIS",
            responseText=response_text,
            handwritingFeedback=handwriting_feedback,
            followUpSuggestion="Upload the next attempt when ready, and I will compare progress."
        )
    elif intent == "QUESTION_GENERATION":
        gaps = state.learning_gaps or extract_learning_gaps(request.message)
        questions = generate_questions(gaps)
        response = AIEngineResponse(
            sessionId=request.sessionId,
            role=role,
            intent="QUESTION_GENERATION",
            responseText=build_question_prompt(role, questions),
            generatedQuestions=questions,
            followUpSuggestion="Attempt these questions first, then upload your responses for feedback."
        )
    else:
        response = AIEngineResponse(
            sessionId=request.sessionId,
            role=role,
            intent="CONVERSATIONAL",
            responseText=build_conversational_response(role, request.message),
        )

    memory.append_turn(request.sessionId, "user", request.message)
    memory.append_turn(request.sessionId, "assistant", response.responseText)
    return response
