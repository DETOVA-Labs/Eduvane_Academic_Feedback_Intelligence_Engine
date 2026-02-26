# Eduvane AI Engine

Python orchestration layer for Eduvane. This service is the authoritative intelligence layer.

## Responsibilities

- Intent detection (`ANALYSIS`, `QUESTION_GENERATION`, `CONVERSATIONAL`)
- Role-aware response synthesis (Student second-person, Teacher third-person)
- Handwriting quality analysis hooks
- Session memory and role clarification flow

## Run

1. Copy `.env.example` to `.env`.
2. `pip install -r requirements.txt`
3. `uvicorn app.main:app --reload --port 8090`
