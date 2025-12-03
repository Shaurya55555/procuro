# Procuro – Backend Documentation

AI-powered Request for Proposal (RFP) management backend that transforms natural language purchase requests into structured RFPs, emails vendors, ingests replies over IMAP, and compares proposals using Groq's llama3-8b-8192 model. This README consolidates the full assignment deliverable with architecture diagrams, setup steps, and endpoint references. The React frontend scaffold in `frontend/` is optional and incomplete; evaluating the backend alone satisfies the submission.

---

## Table of Contents

1. [Repository Layout](#repository-layout)
2. [Architecture](#architecture)
     - [High-Level Diagram](#high-level-diagram)
     - [Data Flow](#data-flow)
     - [Low-Level Design](#low-level-design)
3. [Tech Stack](#tech-stack)
4. [Assumptions & Key Decisions](#assumptions--key-decisions)
5. [Environment Variables](#environment-variables)
6. [Project Setup](#project-setup)
     - [Backend](#backend)
     - [Frontend (Optional Shell)](#frontend-optional-shell)
     - [Email Configuration](#email-configuration)
     - [Seed Data](#seed-data)
7. [Database Schema](#database-schema)
8. [AI Modules](#ai-modules)
9. [IMAP Email Ingestion](#imap-email-ingestion)
10. [API Documentation](#api-documentation)
11. [Error Handling](#error-handling)
12. [Swagger Documentation](#swagger-documentation)
13. [AI Tools Usage During Development](#ai-tools-usage-during-development)
14. [Demo Video](#demo-video)
15. [Known Limitations & Next Steps](#known-limitations--next-steps)

---

## Repository Layout

```
procuro/
    backend/
        src/
            api/
                rfp/
                vendor/
                proposal/
                email/
            utils/
                llm/
            db/
            config/
            app.js
            server.js
            swagger.yml
        package.json
        README.md (backend focused)
    frontend/
        src/
            api/
            components/
            pages/
        package.json
    README.md (this file)
```

---

## Architecture

### High-Level Diagram

```mermaid
graph LR
    Browser[User Browser] -- REST --> API[Express Backend]
    API -- SQL --> PG[(PostgreSQL)]
    API -- SMTP --> SMTP[SMTP Server]
    API -- IMAP IDLE --> IMAP[IMAP Mailbox]
    API -- HTTPS --> GroqLLM[Groq LPU Cloud]
```

### Data Flow

```mermaid
sequenceDiagram
    participant User as Procurement Manager
    participant API as Express API
    participant DB as PostgreSQL
    participant SMTP as SMTP Server
    participant IMAP as IMAP Mailbox
    participant LLM as Groq LLM

    User->>API: POST /rfp (natural-language payload)
    API->>LLM: Generate structured RFP
    LLM-->>API: Structured JSON
    API->>DB: Insert RFP
    User->>API: POST /email/send (rfpId + vendorIds)
    API->>DB: Fetch vendors & RFP
    API->>SMTP: Send email per vendor
    Vendor->>IMAP: Reply with proposal email
    API->>IMAP: Poll unseen mail (startImapListener)
    IMAP-->>API: New message
    API->>LLM: Parse vendor proposal
    LLM-->>API: Structured proposal JSON
    API->>DB: Insert proposal record
    User->>API: GET /rfp/:id/compare
    API->>DB: Load RFP + proposals
    API->>LLM: Compare proposals
    LLM-->>API: Ranking, scores, recommendation
    API-->>User: AI-assisted comparison
```

### Low-Level Design

```mermaid
classDiagram
    class App {
        +express.json()
        +cors()
        +/docs (Swagger)
        +/rfp, /vendors, /proposals, /email routes
    }
    class RfpController {
        +createRfp(req,res)
        +getAllRfps(req,res)
        +getRfpById(req,res)
        +generateRfpFromText(req,res)
        +compareProposals(req,res)
    }
    class RfpService {
        +createRfp(data)
        +getRfpById(id)
        +getAllRfps()
    }
    class VendorService {
        +createVendor(data)
        +getAllVendors()
    }
    class ProposalService {
        +createProposal(data)
        +getProposalById(id)
        +getProposalsByRfpId(rfpId)
    }
    class EmailController {
        +sendRfpEmail(req,res)
    }
    class ImapListener {
        +startImapListener(callback)
    }
    class LlmHelpers {
        +generateStructuredRfp(rawText)
        +compareProposalsAi(rfpId)
        +parseVendorProposal(emailBody)
    }
    RfpController --> RfpService
    RfpController --> LlmHelpers
    ProposalService --> LlmHelpers
    EmailController --> RfpService
    EmailController --> VendorService
    ImapListener --> LlmHelpers
    RfpService --> DB[(pg Pool)]
    VendorService --> DB
    ProposalService --> DB
```

---

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Backend | Node.js 18+, Express 4 | REST API, routing, middleware |
| Database | PostgreSQL + `pg` | Connection pool with basic health logging |
| Email Sending | Nodemailer | Authenticated SMTP (TLS on port 465 assumed) |
| Email Ingestion | ImapFlow | Robust IMAP client with idle reconnect logic |
| AI Provider | Groq llama3-8b-8192 | JSON extraction for RFP creation, proposal parsing, comparison |
| API Docs | Swagger UI | Served from `/docs`, spec in `backend/src/swagger.yml` |
| Frontend (scaffold) | React + Vite | Present but minimal; not required for backend evaluation |

---

## Assumptions & Key Decisions

- **Single user workflow**: No authentication or multi-tenant logic required by the brief.
- **Structured storage**: Persist Groq responses in JSONB alongside human-readable fields for analytics.
- **Proposal intake**: IMAP callback currently logs new emails; storage integration example provided for extensibility.
- **Strict JSON contracts**: AI helpers enforce JSON-only responses to avoid brittle parsing.
- **Comparison guardrails**: Comparison endpoint fails fast when no proposals exist, preventing misleading output.
- **Frontend optionality**: Backend can be evaluated and demoed without completing the React client.

---

## Environment Variables

Create `backend/.env` from `backend/.env.example`.

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (e.g. `postgres://user:pass@localhost:5432/procuro`) |
| `SMTP_HOST` | SMTP hostname for outgoing mail |
| `SMTP_PORT` | SMTP port (465 recommended for implicit TLS) |
| `SMTP_USER` / `SMTP_PASS` | SMTP credentials |
| `IMAP_HOST` / `IMAP_PORT` | IMAP hostname & port (993 recommended) |
| `IMAP_USER` / `IMAP_PASS` | IMAP credentials |
| `LLM_API_KEY` | Groq API key consumed by all AI helpers |
| `PORT` | Express listen port (defaults to `3000`) |

`src/config/env.js` validates presence and parses integer fields before exporting configuration.

---

## Project Setup

### Backend

```bash
cd backend

# install dependencies
npm install

# configure environment
cp .env.example .env
# edit .env with database, SMTP, IMAP, and Groq credentials

# provision schema
psql "$DATABASE_URL" -f src/db/models.sql

# run server
npm run dev   # nodemon
# or
npm start     # node src/server.js

# API base URL (default): http://localhost:5000
# Swagger UI: http://localhost:5000/docs
```

Server boot triggers IMAP listener startup; failures are logged and retried with five-second backoff.

### Frontend (Optional Shell)

```bash
cd frontend
npm install
npm run dev
```

The React app provides skeleton pages (`RfpCreate`, `Proposals`, `Vendors`) and Axios client; wiring to the backend is a future enhancement.

### Email Configuration

- Use the same mailbox for SMTP sender and IMAP listener to simplify threading.
- Ensure the account permits programmatic IMAP access and exposes the `INBOX` folder.
- TLS is assumed for both SMTP (465) and IMAP (993); adjust env vars if plaintext is required.

### Seed Data

Use `src/db/models.sql` to create tables. Seed RFPs/vendors via API calls or direct SQL inserts. Example SQL snippet:

```sql
INSERT INTO vendor (name, email)
VALUES ('Acme Supplies', 'sales@acme.example');

INSERT INTO rfp (title, description_raw, description_structured, items)
VALUES (
    'Office Network Refresh',
    'Upgrade switching, add redundant firewall, PoE for cameras.',
    '{"items":["Core switches","Firewall failover"],"budget":"45000"}',
    '{"items":["Core switches","Firewall failover"]}'
);
```

---

## Database Schema

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

- `rfp.service.js` ensures `title` and `items` (array) are present.
- Proposals store raw email plus AI-parsed summary for auditability.

---

## AI Modules

| File | Responsibility | Invoked By |
|------|----------------|------------|
| `src/utils/llm/generateRfp.js` | Convert natural language into structured RFP JSON | `POST /rfp/from-text` |
| `src/utils/llm/compare.js` | Rank proposals and return justification | `GET /rfp/:id/compare` |
| `src/utils/llm/parseVendorProposal.js` | Normalize vendor email content | IMAP callback (example provided) |

All helpers trim Markdown fences and parse Groq JSON responses; malformed payloads bubble as `400 {"error": "..."}`.

---

## IMAP Email Ingestion

`src/api/email/email.imap.js` encapsulates ImapFlow lifecycle management:

- Single connection with guarded reconnects to avoid flapping.
- Mailbox lock ensures exclusive access while fetching unseen mail.
- Deduplication via `fetchInFlight` prevents overlapping fetch cycles.
- Consumer callback receives `{ subject, body }`. Extend to parse and persist proposals.

Integration sketch:

```js
const { parseVendorProposal } = require('../utils/llm/parseVendorProposal');
const proposalService = require('../api/proposal/proposal.service');

startImapListener(async ({ body }) => {
    const parsed = await parseVendorProposal(body);
    await proposalService.createProposal({
        rfp_id: resolveRfpId(body),
        vendor_id: resolveVendorId(body),
        raw_email: body,
        parsed
    });
});
```

Mapping helper functions (`resolveRfpId`, `resolveVendorId`) depend on your email formatting strategy.

---

## API Documentation

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/rfp` | Create a structured RFP record |
| `GET` | `/rfp` | List all RFPs (descending `id`) |
| `GET` | `/rfp/{id}` | Retrieve RFP by ID |
| `POST` | `/rfp/from-text` | Generate structured RFP from raw text |
| `GET` | `/rfp/{id}/compare` | AI comparison of stored proposals |
| `POST` | `/vendors` | Create vendor entry |
| `GET` | `/vendors` | List vendors |
| `POST` | `/proposals` | Persist proposal (raw + parsed) |
| `GET` | `/proposals/{id}` | Retrieve proposal |
| `GET` | `/proposals/rfp/{rfpId}` | List proposals for an RFP |
| `POST` | `/email/send` | Broadcast RFP to selected vendors via SMTP |

### Sample Payloads

#### Create RFP — `POST /rfp`

```http
POST /rfp
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

```json
HTTP 201
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

#### Generate RFP from Text — `POST /rfp/from-text`

```json
{
    "text": "Need 20 laptops (16GB RAM) and 15 monitors 27-inch. Budget 50000. Delivery 30 days. Net 30. Warranty 1 year."
}
```

```json
HTTP 200
{
    "title": "Laptop and Monitor Procurement",
    "budget": "50000",
    "items": [
        "20 laptops with 16GB RAM",
        "15 27-inch monitors"
    ],
    "delivery_timeline": "30 days",
    "payment_terms": "Net 30",
    "warranty": "12 months"
}
```

#### Compare Proposals — `GET /rfp/{id}/compare`

```json
HTTP 200
{
    "ranking": ["3", "1", "2"],
    "scores": { "3": 92, "1": 78, "2": 65 },
    "recommendation": "Vendor 3 best aligns with delivery timeline and budget constraints."
}
```

#### Send RFP Email — `POST /email/send`

```json
{
    "rfpId": 1,
    "vendorIds": [2, 3]
}
```

```json
HTTP 200
{ "success": true, "sentTo": 2 }
```

Complete request/response schemas are documented in Swagger.

---

## Error Handling

- Controllers return `400 {"error": "..."}` for validation issues and `404` when entities are missing.
- Service-layer errors bubble up with descriptive messages; no generic `500` masking.
- IMAP listener logs issues via `src/utils/logger.js` and schedules reconnects instead of crashing the process.
- Startup aborts if env validation or initial database connectivity fails, ensuring misconfiguration is visible.

---

## Swagger Documentation

- Specification lives at `backend/src/swagger.yml`.
- Swagger UI hosted at `http://localhost:5000/docs`.
- Supports Try-It-Out calls against the running development server.

---

## AI Tools Usage During Development

| Tool | Usage |
|------|-------|
| GitHub Copilot (GPT-5-Codex) | Refined imports, generated Swagger spec, hardened IMAP listener, drafted documentation |
| Groq API | Runtime feature for RFP generation, proposal parsing, and comparisons |

Prompts emphasize deterministic JSON output and explicit scoring rationale for proposals.

---

## Demo Video

- **Placeholder:** Add a Loom/Drive link demonstrating RFP creation, vendor emailing, IMAP ingestion, and proposal comparison.

---

## Known Limitations & Next Steps

- `compareProposalsAi` queries table `proposals`; adjust to `proposal` to match schema before enabling in production.
- IMAP callback currently logs emails only; integrate `parseVendorProposal` and ID resolution to store proposals.
- Frontend shell needs API integration to deliver a full UX.
- Attachments and HTML-only emails are ignored; extend `email.imap.js` to handle multipart content.

---

## License

Internal engineering assignment; no public license supplied.

