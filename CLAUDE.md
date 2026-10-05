# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

YaID Ingressos — a proof-of-concept ticket sales site (TCC/thesis project) that gates checkout behind identity
verification via the external **YaID API**. It's a two-package monorepo with no shared tooling: `backend/`
(Node/Express) and `frontend/` (React/Vite), run and developed independently.

The functional spec (in Portuguese) lives at `especificacao-site-ingressos-yaid-v1.md` — requirement IDs like
`RF-BACK-02`, `RNF-01`, `RF-FRONT-03` referenced in code comments trace back to that document.

## Commands

Backend (from `backend/`):
```bash
cp .env.example .env   # first-time setup — see Environment variables below
npm run dev             # nodemon, auto-restart
npm start                # plain node
```

Frontend (from `frontend/`):
```bash
npm run dev       # Vite dev server on http://localhost:5173
npm run build
npm run preview
npm run lint      # oxlint
```

There is no test suite in either package. There is no root-level package.json — always `cd` into `backend/` or
`frontend/` first.

To receive YaID webhooks locally, the backend must be exposed publicly (e.g. `ngrok http 3001`), and that public
URL registered as the webhook URL in the YaID dashboard.

## Architecture

### End-to-end flow

1. User clicks the buy button on `frontend/src/pages/Home.jsx`.
2. Frontend `POST`s to `${VITE_API_URL}/api/checkout` (backend `routes/checkout.js`).
3. Backend creates a local order record (status `pending`), then calls the real YaID API
   (`POST {YAID_API_BASE_URL}/api/proof-requests`) to create a Proof Request, and stores the returned
   `proofRequestId`/`verificationUrl`.
4. Frontend redirects the browser to `verificationUrl` (YaID's hosted verification flow — not part of this repo).
5. User completes verification on YaID's side; YaID calls back `POST /webhooks/yaid` on this backend
   (`routes/webhook.js`), which verifies an Ed25519 signature over the **raw** request body and updates the
   order's status to `approved` or `rejected`.
6. Meanwhile `frontend/src/pages/Success.jsx` polls `GET /api/order/:id` (`routes/status.js`) every 3s (max 60
   tries / 3 min) until the status flips.

### Backend

- Plain Express app, ESM (`"type": "module"`), entry point `backend/server.js`. Routes are mounted per concern:
  `/api/checkout`, `/api/order`, `/webhooks/yaid`, plus `/health`.
- CORS is locked to `FRONTEND_URL` (plus localhost dev ports) and only allows `GET/POST/OPTIONS`.
- `express.json()` is configured with a `verify` callback that stashes the raw request bytes on `req.rawBody`
  — this exists specifically so the webhook handler can verify the Ed25519 signature against the exact bytes
  YaID signed. Do not remove/reorder this without preserving that behavior.
- Persistence (`backend/db.js`) uses **LokiJS** (JSON-file-backed, autosaved to `backend/orders.db.json`), not
  SQLite — an earlier `better-sqlite3` design was swapped out to avoid native build tooling requirements on
  Windows. The root `README.md`'s "Estrutura do Projeto" section still says SQLite/better-sqlite3; that's stale.
- `db.js` exports `stmts.<method>` as plain functions (e.g. `createOrder: ({...}) => {...}`) — call them directly
  (`stmts.createOrder({...})`), not with the old better-sqlite3 prepared-statement shape (`.run(...)`/`.get(...)`).
  Order records use camelCase fields (`createdAt`, `updatedAt`), not snake_case.
- Webhook signature verification: `@noble/ed25519`, public key from `YAID_PUBLIC_KEY` (base64), signature from
  the `x-yaid-signature` header (base64), verified against `req.rawBody`. The webhook always responds fast
  (200) and updates order state asynchronously/fire-and-forget, so it doesn't block YaID's webhook delivery.

### Frontend

- Vite + React 19, client-side routed with `react-router-dom` (`App.jsx` defines `/`, `/success`, `/failure`).
- No state management library or API client abstraction — each page does its own `fetch` against
  `import.meta.env.VITE_API_URL` (falls back to `http://localhost:3001`). Set `VITE_API_URL` in the frontend's
  own `.env` if the backend isn't on the default port/host.
- Styling is plain CSS with custom properties in `src/index.css` acting as the design system (colors, gradients,
  spacing tokens referenced as `var(--...)` throughout page components) — no CSS framework or CSS-in-JS library.
- Linting is via `oxlint` (see `.oxlintrc.json`), not ESLint.

## Environment variables

Backend `.env` (see `backend/.env.example`):
- `YAID_API_KEY` — sent as `x-api-key` header on calls to the YaID API.
- `YAID_PUBLIC_KEY` — Ed25519 public key (base64) used to verify inbound webhook signatures.
- `PORT` — backend port (default 3001).
- `FRONTEND_URL` — used for CORS allowlist and for building YaID `redirectUrl`/`cancelUrl`.
- `YAID_API_BASE_URL` — YaID API base (defaults to production `https://api.yaid.com.br`).
- `BACKEND_PUBLIC_URL` — the public (e.g. ngrok) URL of this backend, needed for YaID to reach the webhook.

Frontend: `VITE_API_URL` (optional, defaults to `http://localhost:3001`).
