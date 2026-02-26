from __future__ import annotations

from .models import HandwritingFeedback


def evaluate_handwriting(has_upload: bool, has_pdf: bool) -> HandwritingFeedback:
    if not has_upload:
        return HandwritingFeedback(
            legibility="Not assessed in this response.",
            lineConsistency="Not assessed in this response.",
            characterSpacing="Not assessed in this response.",
            meaningImpact="No handwriting sample was provided.",
            suggestions=[
                "Upload one page of student writing to receive handwriting-specific feedback."
            ],
        )

    if has_pdf:
        return HandwritingFeedback(
            legibility="Readable in most sections.",
            lineConsistency="Mostly aligned with occasional baseline shifts.",
            characterSpacing="Spacing is generally clear between words.",
            meaningImpact="The current handwriting quality should not block meaning.",
            suggestions=[
                "Keep letter heights consistent in multi-line answers.",
                "Leave a little more space between dense equations and annotations.",
            ],
        )

    return HandwritingFeedback(
        legibility="Moderate clarity with a few ambiguous characters.",
        lineConsistency="Lines vary in tilt across the page.",
        characterSpacing="Word spacing is inconsistent in several areas.",
        meaningImpact="Some symbols may be interpreted incorrectly due to spacing and tilt.",
        suggestions=[
            "Use a slower first pass to stabilize letter and symbol shapes.",
            "Keep one finger-width between words and between math steps.",
            "Rewrite final answers on a fresh line to improve readability.",
        ],
    )
