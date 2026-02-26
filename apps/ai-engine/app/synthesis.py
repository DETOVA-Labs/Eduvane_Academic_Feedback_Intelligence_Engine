"""
Overview: synthesis.py
Purpose: Defines part of the Eduvane runtime behavior for this module.
Notes: Keep logic cohesive and update docstrings/comments when behavior changes.
"""

from __future__ import annotations

from typing import List, Literal

Role = Literal["TEACHER", "STUDENT", "UNKNOWN"]


def role_prefix(role: Role) -> str:
    if role == "TEACHER":
        return "The student"
    if role == "STUDENT":
        return "You"
    return "This work"


def build_analysis_response(role: Role, gaps: List[str]) -> str:
    subject_focus = ", ".join(gaps[:2]) if gaps else "core concepts in this submission"

    if role == "TEACHER":
        return (
            f"The student shows partial understanding in {subject_focus}. "
            "Reasoning steps are present, but there are consistency gaps in execution. "
            "Targeted reteaching with one worked example and one independent check should improve retention."
        )

    if role == "STUDENT":
        return (
            f"You show partial understanding in {subject_focus}. "
            "Your reasoning steps are visible, and a few checkpoints need tighter consistency. "
            "One guided example followed by one independent retry will strengthen this skill."
        )

    return (
        f"This work shows partial understanding in {subject_focus}. "
        "Reasoning is visible with a few consistency gaps that can be addressed through guided practice."
    )


def build_question_prompt(role: Role, questions: List[str]) -> str:
    lines = [f"{idx + 1}. {question}" for idx, question in enumerate(questions)]
    joined = "\n".join(lines)

    if role == "TEACHER":
        return (
            "Generated practice set aligned to observed gaps:\n"
            f"{joined}\n"
            "Please ask the student to attempt these and upload the response for feedback."
        )

    if role == "STUDENT":
        return (
            "Here are focused practice questions linked to your current gaps:\n"
            f"{joined}\n"
            "Try these first, then upload your work and I will review it."
        )

    return (
        "Here are focused practice questions linked to this conversation:\n"
        f"{joined}\n"
        "Attempt them and upload the results for feedback."
    )


def build_conversational_response(role: Role, text: str) -> str:
    clean = text.strip()
    if not clean:
        if role == "TEACHER":
            return (
                "Please share the student task or upload work, and I will provide targeted feedback."
            )
        return "Share your question or upload your work, and I will guide the next step."

    if role == "TEACHER":
        return (
            "The request is understood. Please share the student work artifact or target skill, "
            "and I will return analysis or question generation aligned to that need."
        )

    return (
        "I can help with feedback or guided practice. Share your work or ask for focused questions on a topic."
    )
