# Eduvane Architecture Baseline

This repository is now structured around the required Eduvane platform split:

- Frontend: `apps/web` (React + TypeScript)
- Backend Gateway: `apps/gateway` (Node + TypeScript)
- AI Engine: `apps/ai-engine` (Python)
- Shared contracts: `packages/contracts`

## Architectural Guardrails

- The frontend only calls the backend gateway.
- The backend gateway handles auth/session validation and request shaping.
- The Python AI engine is the authoritative orchestration layer.
- Frontend components do not run intent routing, OCR orchestration, or pedagogical synthesis logic.
- No pipeline debug logs are returned to the frontend; user-facing responses are final outputs only.

## Product Binding

- Eduvane AI - Bound to Product Definition v1.2
- Architectural Policy Compliant
- Detova Labs Implementation
