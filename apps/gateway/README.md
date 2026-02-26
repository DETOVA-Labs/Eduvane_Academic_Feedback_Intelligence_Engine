# Eduvane Gateway

Node/TypeScript gateway responsibilities:

- Validate Supabase sessions.
- Resolve and persist role context.
- Validate and shape frontend requests.
- Forward orchestration requests to Python AI engine.
- Persist workspace history for authenticated users.

## Endpoints

- `GET /health`
- `GET /api/v1/session/me`
- `POST /api/v1/session/role`
- `GET /api/v1/chat/history`
- `GET /api/v1/chat/history/:sessionId`
- `POST /api/v1/chat/intent`
- `POST /api/v1/chat/respond`

## Run

1. Copy `.env.example` to `.env`.
2. `npm install`
3. `npm run dev`
