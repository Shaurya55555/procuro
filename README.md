# Procuro Backend

AI-assisted Request for Proposal (RFP) management backend built with Node.js, Express, PostgreSQL, and Google Gemini for language understanding. The service ingests vendor emails over IMAP, stores RFP and proposal records, and exposes REST endpoints documented via OpenAPI/Swagger.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Prerequisites](#prerequisites)
3. [Environment Variables](#environment-variables)
4. [Setup & Local Development](#setup--local-development)
5. [Database Schema](#database-schema)
6. [IMAP Email Ingestion](#imap-email-ingestion)
7. [AI Modules](#ai-modules)
8. [API Overview](#api-overview)
9. [Endpoint Reference](#endpoint-reference)
10. [Error Handling](#error-handling)
11. [Swagger Documentation](#swagger-documentation)
12. [Testing with Postman](#testing-with-postman)

---

## Architecture

- **Runtime:** Node.js + Express application (`src/app.js`, `src/server.js`)
- **Database:** PostgreSQL accessed via `pg` connection pool (`src/db/index.js`)
- **Email:** IMAP listener based on ImapFlow (`src/api/email/email.imap.js`) and SMTP delivery through Nodemailer (`src/config/mail.js`)
- **AI Integration:** Google Gemini API (JSON extraction via HTTP) and Groq-hosted LLaMA 3 for proposal parsing helpers (`src/utils/llm/*`)
- **Routing pattern:** Feature folders under `src/api/<domain>` containing `*.routes.js`, `*.controller.js`, and `*.service.js`
- **Configuration:** `.env` file loaded through `src/config/env.js`
- **Observability:** Minimal structured logging via `src/utils/logger.js`

Directory layout:

```
backend/
    src/
        api/
            rfp/
            vendor/
            proposal/
            email/
            email.imap.js
        utils/
            llm/
        db/
        config/
        app.js
        server.js
        swagger.yml
    package.json
    README.md
    .env (not committed)
```

---

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js     | >= 18   | Required for native fetch, top-level await compatibility |
| npm         | >= 9    | Used for dependency management |
| PostgreSQL  | 14+     | Stores RFP, vendor, and proposal data |
| Google Gemini API key | – | Used for structured RFP generation and comparisons |
| IMAP mailbox | – | Must support IDLE and allow programmatic access |

---

## Environment Variables

Create `.env` in the project root. All variables are mandatory unless noted.

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (e.g. `postgres://user:pass@localhost:5432/procuro`) |
| `SMTP_HOST` | Outgoing SMTP host for vendor notifications |
| `SMTP_PORT` | SMTP port (465 for implicit TLS) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `IMAP_HOST` | IMAP server hostname |
| `IMAP_PORT` | IMAP port (993 recommended for TLS) |
| `IMAP_USER` | IMAP login username |
| `IMAP_PASS` | IMAP login password |
| `LLM_API_KEY` | API key shared by Gemini and Groq clients |
| `PORT` | HTTP port for the Express server (defaults to `3000` if unset) |

> `src/config/env.js` validates these variables at startup; missing keys stop the process with a descriptive error.

---

## Setup & Local Development

```bash
# install dependencies
npm install

# copy environment template (edit with real values)
cp .env.example .env

# create database objects
psql "$DATABASE_URL" -f src/db/models.sql

# start the server
npm run dev   # uses nodemon
# or
npm start     # plain node

# API will be available at http://localhost:5000 (default .env sample)
# Interactive docs: http://localhost:5000/docs
```

The server boots immediately, then launches the IMAP listener. Listener failures are logged and retried without terminating the process.

---

## Database Schema

The schema lives in `src/db/models.sql`.

```sql
CREATE TABLE rfp (
    id SERIAL PRIMARY KEY,
    title TEXT,
    description_raw TEXT,
    description_structured JSONB,
    budget NUMERIC,
    delivery_timeline TEXT,
    payment_terms TEXT,
    warranty TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vendor (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT
);

CREATE TABLE proposal (
    id SERIAL PRIMARY KEY,
    rfp_id INTEGER REFERENCES rfp(id),
    vendor_id INTEGER REFERENCES vendor(id),
    raw_email TEXT,
    parsed JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

`rfp.service.js` validates that `title` and `items` are provided before insertion. Proposal records store the raw vendor email plus AI-parsed JSON.

---

## IMAP Email Ingestion

`src/api/email/email.imap.js` wraps ImapFlow to poll unseen messages:

- Establishes a TLS IMAP session using the configured credentials.
- Locks the `INBOX`, fetches unseen messages every 60 seconds, and marks them as `\Seen` after processing.
- Emits each message to a caller-supplied callback. In `src/server.js`, the default handler simply logs the subject; extend this callback to persist parsed proposals.
- Handles idle/timeout/close events with automatic reconnect (5-second backoff) so socket failures never crash Node.js.

To attach proposal parsing, implement in `server.js`:

```js
const { parseVendorProposal } = require('./utils/llm/parseVendorProposal');
const proposalService = require('./api/proposal/proposal.service');

startImapListener(async ({ body }) => {
    const parsed = await parseVendorProposal(body);
    await proposalService.createProposal({
        rfp_id: /* map email -> RFP */,
        vendor_id: /* resolve vendor */,
        raw_email: body,
        parsed
    });
});
```

---

## AI Modules

Located under `src/utils/llm/`:

| Module | Provider | Purpose |
|--------|----------|---------|
| `generateRfp.js` | Google Gemini 1.5 Flash | Extracts structured RFP JSON from freeform text (`POST /rfp/from-text`). |
| `compare.js` | Google Gemini 1.5 Flash | Scores stored proposals against an RFP (`GET /rfp/:id/compare`). |
| `parseVendorProposal.js` | Google Gemini 1.5 Flash | Converts vendor email text into normalized proposal fields (used in IMAP pipeline). |

All helpers remove Markdown code fences and `JSON.parse` the model response. Ensure the upstream model is instructed to return JSON-only output; malformed responses throw and surface as `400` errors.

---

## API Overview

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/rfp` | Create an RFP record. |
| `GET` | `/rfp` | List all RFPs (descending ID). |
| `GET` | `/rfp/:id` | Fetch a single RFP by ID. |
| `POST` | `/rfp/from-text` | AI-assisted structured RFP generation from raw text. |
| `GET` | `/rfp/:id/compare` | AI comparison of proposals linked to the RFP. |
| `POST` | `/vendors` | Register a vendor. |
| `GET` | `/vendors` | List vendors. |
| `POST` | `/proposals` | Persist a vendor proposal. |
| `GET` | `/proposals/:id` | Fetch proposal by ID. |
| `GET` | `/proposals/rfp/:rfpId` | List proposals for an RFP. |
| `POST` | `/email/send` | Broadcast RFP details to selected vendors via SMTP. |

> There is currently **no** public HTTP endpoint for AI proposal parsing; integrate `parseVendorProposal` inside the IMAP callback or a custom route if needed.

---

## Endpoint Reference

Sample payloads assume `PORT=5000`.

### Create RFP — `POST /rfp`

**Request**

```http
POST /rfp HTTP/1.1
Content-Type: application/json

{
    "title": "Cloud Infrastructure Upgrade",
    "description_raw": "We need redundant Kubernetes clusters...",
    "description_structured": {
        "items": ["Kubernetes cluster", "Monitoring stack"],
        "budget": "85000"
    },
    "budget": 85000,
    "items": ["Kubernetes cluster", "Monitoring stack"],
    "delivery_timeline": "Q2 2025",
    "payment_terms": "Net 30",
    "warranty": "12 months"
}
```

**Success (201)**

```json
{
    "id": 1,
    "title": "Cloud Infrastructure Upgrade",
    "description_raw": "We need redundant Kubernetes clusters...",
    "description_structured": {
        "items": ["Kubernetes cluster", "Monitoring stack"],
        "budget": "85000"
    },
    "budget": "85000",
    "items": [
        "Kubernetes cluster",
        "Monitoring stack"
    ],
    "delivery_timeline": "Q2 2025",
    "payment_terms": "Net 30",
    "warranty": "12 months",
    "created_at": "2025-12-04T10:15:30.123Z"
}
```

### List RFPs — `GET /rfp`

Returns JSON array sorted by descending `id`.

### Get RFP — `GET /rfp/:id`

- `404` when the ID is missing.
- `400 {"error":"..."}` on database failures.

### Generate RFP From Text — `POST /rfp/from-text`

**Request**

```http
POST /rfp/from-text
Content-Type: application/json

{
    "text": "We seek a vendor to supply 100 rugged tablets, include 3 year support..."
}
```

**Success (200)**

```json
{
    "title": "Rugged Tablet Procurement",
    "budget": "120000",
    "items": [
        "100 rugged tablets",
        "Protective cases",
        "3 year maintenance"
    ],
    "delivery_timeline": "8 weeks",
    "payment_terms": "Net 45",
    "warranty": "36 months"
}
```

### Compare Proposals — `GET /rfp/:id/compare`

**Response (200)**

```json
{
    "ranking": ["3", "1", "2"],
    "scores": {
        "3": 92,
        "1": 78,
        "2": 65
    },
    "recommendation": "Vendor 3 best aligns with delivery timeline and budget constraints."
}
```

> Requires existing records in `proposal` for the supplied `rfp_id`. An error is returned if no proposals are available.

### Create Vendor — `POST /vendors`

```json
{
    "name": "Acme Supplies",
    "email": "sales@acme.example"
}
```

### List Vendors — `GET /vendors`

Returns an array ordered by `id ASC`.

### Create Proposal — `POST /proposals`

```json
{
    "rfp_id": 1,
    "vendor_id": 2,
    "raw_email": "Dear team, our proposal...",
    "parsed": {
        "item_prices": [
            { "item": "Tablets", "price": "95000" },
            { "item": "Support", "price": "15000" }
        ],
        "total_cost": "110000",
        "delivery_time": "6 weeks",
        "terms": "Net 30",
        "conditions": "Includes onsite training"
    }
}
```

### Get Proposal — `GET /proposals/:id`

`404` when missing, `200` with proposal JSON when found.

### List Proposals For RFP — `GET /proposals/rfp/:rfpId`

Sorted by `created_at DESC`.

### Send RFP Email — `POST /email/send`

```json
{
    "rfpId": 1,
    "vendorIds": [2, 3]
}
```

**Success (200)**

```json
{ "success": true, "sentTo": 2 }
```

Messages are rendered in plain text using the stored structured RFP document and delivered via the configured SMTP transporter.

---

## Error Handling

- Controllers catch service-level errors and respond with `400` and `{ "error": "message" }`.
- Missing entities return `404` with the same JSON envelope.
- Database connectivity issues bubble up as `400` responses unless they cause process-level failure during startup (see `src/db/index.js`).
- IMAP listener logs all failures through `src/utils/logger.js` and auto-reconnects without throwing.

Always inspect the JSON `error` field; no additional wrapping (e.g., `success` flags) is sent on failure paths.

---

## Swagger Documentation

- Source file: `src/swagger.yml`
- UI endpoint: `GET /docs`

Load `http://localhost:5000/docs` after starting the server to browse operations and execute test calls against the running instance.

---

## Testing With Postman

1. Set collection-level variable `baseUrl = http://localhost:5000`.
2. Import the following sample requests:

| Name | Method & URL | Body |
|------|--------------|------|
| `Create RFP` | `POST {{baseUrl}}/rfp` | JSON matching [Create RFP](#create-rfp--post-rfp) |
| `List RFPs` | `GET {{baseUrl}}/rfp` | – |
| `Generate RFP From Text` | `POST {{baseUrl}}/rfp/from-text` | `{ "text": "..." }` |
| `Compare Proposals` | `GET {{baseUrl}}/rfp/1/compare` | – |
| `Create Vendor` | `POST {{baseUrl}}/vendors` | `{ "name": "...", "email": "..." }` |
| `Create Proposal` | `POST {{baseUrl}}/proposals` | See [Create Proposal](#create-proposal--post-proposals) |
| `Send RFP Email` | `POST {{baseUrl}}/email/send` | `{ "rfpId": 1, "vendorIds": [2,3] }` |

3. Inspect responses; successful calls return `200`/`201`, failures return `400`/`404` with `{ "error": "..." }`.

---

## Notes & Limitations

- The AI comparison helper currently queries `proposals` (plural) while the schema defines `proposal`; adjust the table name before relying on the endpoint.
- Proposal parsing is surfaced as a utility, not as an HTTP route. Integrate it through the IMAP listener or by adding an authenticated endpoint.
- Ensure Gemini API responses remain valid JSON; wrap calls in try/catch to handle provider-side formatting regressions.

---

## License

Internal engineering assignment. No public license applied.

