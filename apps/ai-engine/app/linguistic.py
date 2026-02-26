"""
Overview: linguistic.py
Purpose: Applies controlled linguistic variability after intent selection and before rendering output text.
Notes: Keeps communicative intent stable while varying surface form with role-safe guardrails.
"""

from __future__ import annotations

import random
from typing import Literal, Optional, Sequence, Tuple

from .memory import memory

Role = Literal["TEACHER", "STUDENT", "UNKNOWN"]
Intent = Literal["ANALYSIS", "QUESTION_GENERATION", "CONVERSATIONAL"]

Variant = Tuple[str, str]
_rng = random.SystemRandom()

GREETING_TOKENS = {
    "hi",
    "hello",
    "hey",
    "good morning",
    "good afternoon",
    "good evening",
}


def _is_greeting_message(text: str) -> bool:
    clean = text.strip().lower()
    if not clean:
        return False
    return clean in GREETING_TOKENS or any(clean.startswith(token + " ") for token in GREETING_TOKENS)


def _pick_variant(session_id: str, act: str, options: Sequence[Variant]) -> str:
    state = memory.get(session_id)
    last_structure = state.last_structure_by_act.get(act)

    # First pass: avoid exact repeats and avoid consecutive structural duplicates.
    filtered = [
        (structure, text)
        for structure, text in options
        if text not in state.recent_phrases and structure != last_structure
    ]
    if not filtered:
        # Second pass: allow structural reuse but still avoid exact sentence repetition.
        filtered = [(structure, text) for structure, text in options if text not in state.recent_phrases]
    if not filtered:
        # Final fallback: all options available (should be rare with current pool size).
        filtered = list(options)

    structure, text = _rng.choice(filtered)
    state.last_structure_by_act[act] = structure
    return text


def realize_role_clarification(session_id: str) -> str:
    text = _pick_variant(
        session_id,
        "role_clarification",
        (
            ("direct_prompt", "Please confirm your role once: Student or Teacher."),
            ("choice_prompt", "Before we continue, please confirm your role: Student or Teacher."),
            ("readiness_prompt", "To tailor responses correctly, please choose your role: Student or Teacher."),
            ("setup_prompt", "Quick setup: are you working as a Student or a Teacher?"),
        ),
    )
    realized = _ensure_unique(session_id, text)
    memory.remember_phrase(session_id, realized)
    return realized


def realize_role_clarification_follow_up(session_id: str) -> str:
    text = _pick_variant(
        session_id,
        "role_clarification_followup",
        (
            ("tailor_tone", "Once your role is set, I will tailor tone and feedback format."),
            ("tailor_style", "After role confirmation, I will adapt language and response style accordingly."),
            ("tailor_perspective", "As soon as your role is confirmed, I will adjust perspective and guidance format."),
            ("tailor_scope", "Confirming role lets me align response framing to your context."),
        ),
    )
    realized = _ensure_unique(session_id, text)
    memory.remember_phrase(session_id, realized)
    return realized


def _greeting_prefix(session_id: str, role: Role) -> str:
    if role == "TEACHER":
        options: Sequence[Variant] = (
            ("welcome_professional", "Welcome."),
            ("steady_intro", "Good to see you."),
            ("supportive_open", "Hello."),
            ("ready_open", "Thanks for joining."),
        )
    elif role == "STUDENT":
        options = (
            ("warm_open", "Hi there."),
            ("friendly_open", "Hello."),
            ("steady_open", "Good to see you."),
            ("ready_open", "Hi."),
        )
    else:
        options = (
            ("neutral_open", "Hello."),
            ("calm_open", "Welcome."),
            ("supportive_open", "Hi there."),
            ("ready_open", "Good to have you here."),
        )
    return _pick_variant(session_id, f"greeting_{role.lower()}", options)


def _readiness_line(session_id: str, role: Role) -> str:
    if role == "TEACHER":
        options: Sequence[Variant] = (
            ("upload_first", "Share student work or a target skill, and I will return focused feedback."),
            ("analysis_first", "Upload an artifact or describe the objective, and I will provide analysis."),
            ("path_forward", "Provide the task context or upload work, and I will guide the next step."),
            ("direct_support", "Send the work sample when ready, and I will help structure the response plan."),
        )
    elif role == "STUDENT":
        options = (
            ("upload_first", "Upload your work or ask for practice, and I will help you move forward."),
            ("practice_first", "Share what you are working on, and we can review it together."),
            ("calm_support", "When you are ready, send your work and I will guide the next step."),
            ("direct_support", "Type your question or upload your work, and I will help from there."),
        )
    else:
        options = (
            ("neutral_path", "Share your goal or upload work, and I will suggest the next step."),
            ("exploratory_path", "You can start with a question or send a file for analysis."),
            ("guided_path", "Type what you need help with, or upload work to review."),
            ("ready_path", "Start with a prompt or an upload, and I will take it from there."),
        )
    return _pick_variant(session_id, f"readiness_{role.lower()}", options)


def _analysis_transition(session_id: str, role: Role, has_upload: bool) -> str:
    if role == "TEACHER":
        uploaded_options: Sequence[Variant] = (
            ("upload_received", "Upload received. Preparing focused diagnostic feedback."),
            ("artifact_received", "Work artifact received. Starting analysis now."),
            ("submission_ack", "Submission received. Reviewing for instructional next steps."),
            ("review_start", "File received. Beginning targeted review."),
        )
        text_only_options: Sequence[Variant] = (
            ("text_review_start", "Understood. Building analysis from the current details."),
            ("text_ack", "Acknowledged. Preparing a focused review."),
            ("text_transition", "Noted. Starting diagnostic analysis now."),
            ("text_support", "Request received. I will return structured feedback."),
        )
    elif role == "STUDENT":
        uploaded_options = (
            ("upload_received", "Got your upload. I am reviewing it now."),
            ("artifact_received", "File received. Starting your analysis now."),
            ("submission_ack", "Your work is in. I will break down what to improve."),
            ("review_start", "Upload received. Let us review it step by step."),
        )
        text_only_options = (
            ("text_review_start", "Understood. I am building your feedback now."),
            ("text_ack", "Got it. I will analyze this and guide your next step."),
            ("text_transition", "Thanks for sharing that. I am preparing your review."),
            ("text_support", "I hear you. Let us turn this into focused feedback."),
        )
    else:
        uploaded_options = (
            ("upload_received", "Upload received. Running analysis now."),
            ("artifact_received", "File received. Preparing a focused review."),
            ("submission_ack", "Work sample received. Starting evaluation."),
            ("review_start", "Upload is in. Building feedback now."),
        )
        text_only_options = (
            ("text_review_start", "Understood. I am preparing a focused analysis."),
            ("text_ack", "Acknowledged. I will review this now."),
            ("text_transition", "Got it. I am building feedback from your request."),
            ("text_support", "Request received. Starting analysis now."),
        )

    if has_upload:
        return _pick_variant(session_id, f"analysis_transition_upload_{role.lower()}", uploaded_options)
    return _pick_variant(session_id, f"analysis_transition_text_{role.lower()}", text_only_options)


def _question_transition(session_id: str, role: Role) -> str:
    if role == "TEACHER":
        options: Sequence[Variant] = (
            ("set_intro", "Building a focused practice set now."),
            ("set_transition", "Preparing questions aligned to observed gaps."),
            ("set_start", "Question set generation is in progress."),
            ("set_ack", "Understood. Generating targeted prompts for instruction."),
        )
    elif role == "STUDENT":
        options = (
            ("set_intro", "Great. I am generating focused practice now."),
            ("set_transition", "Let us build questions matched to your current gaps."),
            ("set_start", "Working on a targeted practice set for you now."),
            ("set_ack", "Understood. I will generate questions you can use right away."),
        )
    else:
        options = (
            ("set_intro", "Preparing a focused practice set now."),
            ("set_transition", "Generating questions aligned to this request."),
            ("set_start", "Question generation is underway."),
            ("set_ack", "Understood. Building a targeted question set."),
        )
    return _pick_variant(session_id, f"question_transition_{role.lower()}", options)


def _conversation_confirmation(session_id: str, role: Role) -> str:
    if role == "TEACHER":
        options: Sequence[Variant] = (
            ("confirm_professional", "Understood."),
            ("confirm_calm", "Noted."),
            ("confirm_ready", "Acknowledged."),
            ("confirm_support", "Request received."),
        )
    elif role == "STUDENT":
        options = (
            ("confirm_warm", "Got it."),
            ("confirm_calm", "Understood."),
            ("confirm_ready", "I hear you."),
            ("confirm_support", "Thanks for sharing that."),
        )
    else:
        options = (
            ("confirm_neutral", "Understood."),
            ("confirm_calm", "Got it."),
            ("confirm_ready", "Acknowledged."),
            ("confirm_support", "Thanks for sharing."),
        )
    return _pick_variant(session_id, f"conversation_confirm_{role.lower()}", options)


def _follow_up_line(session_id: str, role: Role, intent: Intent) -> Optional[str]:
    if intent == "ANALYSIS":
        if role == "TEACHER":
            options: Sequence[Variant] = (
                ("analysis_followup_a", "Upload the next attempt when ready, and I will compare progress."),
                ("analysis_followup_b", "Share the next draft when available, and I will track change over time."),
                ("analysis_followup_c", "When the student revises, upload the new attempt and I will compare outcomes."),
                ("analysis_followup_d", "Please upload the follow-up attempt, and I will provide a progress comparison."),
            )
        elif role == "STUDENT":
            options = (
                ("analysis_followup_a", "Upload your next attempt when ready, and I will compare your progress."),
                ("analysis_followup_b", "Try a revision and upload it, then I will review what improved."),
                ("analysis_followup_c", "When you are ready, send your next version and I will compare it for you."),
                ("analysis_followup_d", "Upload your follow-up attempt and I will help you track improvement."),
            )
        else:
            options = (
                ("analysis_followup_a", "Upload the next attempt when ready, and I will compare progress."),
                ("analysis_followup_b", "Share a revised version next, and I will provide a comparison."),
                ("analysis_followup_c", "Send the follow-up attempt when available, and I will track the change."),
                ("analysis_followup_d", "Upload the next draft and I will compare the results."),
            )
        return _ensure_unique(session_id, _pick_variant(session_id, f"followup_analysis_{role.lower()}", options))

    if intent == "QUESTION_GENERATION":
        if role == "TEACHER":
            options = (
                ("q_followup_a", "Have the student attempt these, then upload responses for feedback."),
                ("q_followup_b", "Ask the student to complete these and upload the work for review."),
                ("q_followup_c", "Once attempted, upload student responses and I will provide targeted feedback."),
                ("q_followup_d", "Please upload completed responses next, and I will assess the outcomes."),
            )
        elif role == "STUDENT":
            options = (
                ("q_followup_a", "Try these questions first, then upload your responses for feedback."),
                ("q_followup_b", "Complete these and share your work, and I will review it."),
                ("q_followup_c", "Work through these questions, then upload your answers for analysis."),
                ("q_followup_d", "When finished, upload your responses and I will guide the next step."),
            )
        else:
            options = (
                ("q_followup_a", "Attempt these questions first, then upload responses for feedback."),
                ("q_followup_b", "Complete the set and upload the results for review."),
                ("q_followup_c", "Try these questions, then share responses for analysis."),
                ("q_followup_d", "When ready, upload responses and I will provide feedback."),
            )
        return _ensure_unique(session_id, _pick_variant(session_id, f"followup_question_{role.lower()}", options))

    return None


def _ensure_unique(session_id: str, text: str) -> str:
    state = memory.get(session_id)
    if text not in state.recent_phrases:
        return text

    tails = (
        ("continue_a", " I am ready for the next step."),
        ("continue_b", " Share the next detail when ready."),
        ("continue_c", " We can continue from here."),
        ("continue_d", " I can proceed as soon as you are ready."),
    )
    for structure, tail in tails:
        candidate = f"{text}{tail}"
        if candidate not in state.recent_phrases and state.last_structure_by_act.get("uniqueness_tail") != structure:
            state.last_structure_by_act["uniqueness_tail"] = structure
            return candidate
    return text


def realize_response(
    session_id: str,
    role: Role,
    intent: Intent,
    user_text: str,
    has_upload: bool,
    base_text: str,
    base_follow_up: Optional[str] = None,
) -> tuple[str, Optional[str]]:
    response_text = base_text.strip()
    follow_up = base_follow_up

    if intent == "ANALYSIS":
        transition = _analysis_transition(session_id, role, has_upload)
        response_text = _ensure_unique(session_id, f"{transition} {response_text}".strip())
        follow_up = _follow_up_line(session_id, role, intent)
    elif intent == "QUESTION_GENERATION":
        transition = _question_transition(session_id, role)
        response_text = _ensure_unique(session_id, f"{transition} {response_text}".strip())
        follow_up = _follow_up_line(session_id, role, intent)
    else:
        if _is_greeting_message(user_text) and not has_upload:
            greeting = _greeting_prefix(session_id, role)
            readiness = _readiness_line(session_id, role)
            response_text = _ensure_unique(session_id, f"{greeting} {readiness}".strip())
        else:
            confirm = _conversation_confirmation(session_id, role)
            response_text = _ensure_unique(session_id, f"{confirm} {response_text}".strip())

    memory.remember_phrase(session_id, response_text)
    if follow_up:
        memory.remember_phrase(session_id, follow_up)
    return response_text, follow_up
