# Eduvane Academic Feedback Intelligence Engine

Release: `V0.1.0`

Repository binding:

- Eduvane AI - Bound to Product Definition v1.2
- Architectural Policy Compliant
- Detova Labs Implementation

## Architecture

- Frontend (React + TypeScript): `apps/web`
- Backend Gateway (Node + TypeScript): `apps/gateway`
- AI Engine (Python): `apps/ai-engine`
- Shared contracts: `packages/contracts`

The frontend never performs intent orchestration. All intelligence routing is handled by the Python AI engine through the Node gateway.

## Legacy Note

Existing root-level prototype files are preserved for reference. New development should target `apps/web`, `apps/gateway`, and `apps/ai-engine`.
If you still run the root prototype, use `services/.env.example` as its environment template.

## Quick Start

Prerequisites:

- Node.js `20+` (recommended: use `.nvmrc`)
- npm `10+`
- Python `3.12+` with `venv`

1. Copy environment templates:
   - `apps/web/.env.example` -> `apps/web/.env`
   - `apps/gateway/.env.example` -> `apps/gateway/.env`
   - `apps/ai-engine/.env.example` -> `apps/ai-engine/.env`
2. Install dependencies:
   - `npm install`
   - `npm --prefix apps/web install`
   - `npm --prefix apps/gateway install`
   - `npm --prefix packages/contracts install`
3. Install Python dependencies:
   - `python3 -m venv apps/ai-engine/.venv`
   - `source apps/ai-engine/.venv/bin/activate`
   - `pip install -r apps/ai-engine/requirements.txt`
4. Run services in separate terminals:
   - Web: `npm --prefix apps/web run dev`
   - Gateway: `npm --prefix apps/gateway run dev`
   - AI Engine: `apps/ai-engine/.venv/bin/uvicorn app.main:app --app-dir apps/ai-engine --reload --port 8090`

## Service Responsibilities

- `apps/web`:
  - Chat-first workspace UI
  - Bottom-anchored composer with integrated upload control
  - Sidebar for conversation history
- `apps/gateway`:
  - Supabase session validation
  - Input validation and request shaping
  - Security middleware and AI engine forwarding
- `apps/ai-engine`:
  - Intent detection and orchestration
  - Role-aware response synthesis
  - Handwriting quality feedback hooks
  - Session memory per chat session
