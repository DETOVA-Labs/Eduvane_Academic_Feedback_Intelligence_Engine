"""
Overview: question_generation.py
Purpose: Defines part of the Eduvane runtime behavior for this module.
Notes: Keep logic cohesive and update docstrings/comments when behavior changes.
"""

from __future__ import annotations

from typing import List


def extract_learning_gaps(message: str) -> List[str]:
    lowered = message.lower()
    candidates = []
    for token in [
        "fractions",
        "decimals",
        "algebra",
        "linear equations",
        "geometry",
        "grammar",
        "reading comprehension",
        "chemistry",
        "physics",
    ]:
        if token in lowered:
            candidates.append(token)

    if not candidates and message.strip():
        candidates.append(message.strip()[:42])

    return candidates[:3]


def generate_questions(gaps: List[str]) -> List[str]:
    focus = gaps[0] if gaps else "the target skill"
    return [
        f"Solve two problems that apply {focus} in different contexts.",
        f"Explain each step you used to solve a {focus} problem in plain text.",
        f"Create one new {focus} question and solve it completely.",
    ]
