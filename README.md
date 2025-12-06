# Procuro – AI-Powered RFP Management System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D%2018.0.0-green)
![React](https://img.shields.io/badge/react-18.2.0-blue)
![PostgreSQL](https://img.shields.io/badge/postgresql-15-blue)

**Procuro** is an intelligent Request for Proposal (RFP) management system designed to streamline the procurement process. By leveraging Generative AI (Groq/Llama-3), Procuro automates the extraction of structured data from unstructured RFP documents and vendor proposals, enabling automated comparison and analysis.

---

## 📋 Project Overview

Procuro solves the manual overhead of managing procurement cycles. It allows organizations to create RFPs, automatically ingest vendor proposals via email, parse them into structured formats using AI, and generate side-by-side comparisons to identify the best bids.

### Key Features

*   **🤖 AI-Driven Parsing:** Automatically converts unstructured text descriptions into structured RFP requirements using Large Language Models (Groq).
*   **📧 Email Integration:** Monitors a dedicated email inbox for vendor proposals and automatically links them to the corresponding RFP.
*   **📊 Automated Comparison:** Intelligently compares vendor proposals against RFP requirements, highlighting discrepancies in budget, timeline, and specs.
*   **📝 RFP Management:** Create, view, and manage RFPs with detailed itemized lists and terms.
*   **👥 Vendor Management:** Maintain a registry of vendors and track their submissions.

---

## 🏗️ High Level Architecture (HLD)

The system follows a modern client-server architecture. The React frontend communicates with a Node.js/Express backend. The backend orchestrates data flow between the PostgreSQL database, the Groq AI inference engine, and the Email servers (IMAP/SMTP).

```mermaid
graph TD
    Client[React Frontend] <-->|REST API| Server[Node.js Backend]
    
    subgraph Backend Services
        Server <-->|SQL| DB[(PostgreSQL)]
        Server <-->|Inference| AI[Groq AI API]
        Server <-->|IMAP/SMTP| Email[Email Server]
    end
```

---

## 🔧 Low Level Design (LLD) & Module Breakdown

The backend is structured using a modular service-oriented pattern to ensure separation of concerns.

### Core Modules

1.  **RFP Module** (`src/api/rfp`)
    *   **Controller:** Handles HTTP requests for creating and retrieving RFPs.
    *   **Service:** Business logic for RFP validation and storage.
    *   **Model:** Database interactions for the `rfp` table.

2.  **Proposal Module** (`src/api/proposal`)
    *   **Service:** Handles the logic of linking a proposal to an RFP.
    *   **Parser:** Uses AI to extract budget, timeline, and line items from raw proposal text.

3.  **AI Module** (`src/api/ai`)
    *   **Groq Client:** Wrapper around the Groq SDK.
    *   **Prompt Engineering:** Specialized prompts for parsing RFPs, parsing proposals, and generating comparisons.

4.  **Email Module** (`src/api/email`)
    *   **IMAP Listener:** Background job that polls for new emails.
    *   **SMTP Service:** Handles sending acknowledgments or notifications to vendors.

---

## 🗄️ Database Schema

The database is normalized to support the relationship between RFPs, Vendors, and Proposals.

```mermaid
erDiagram
    RFP ||--o{ PROPOSAL : receives
    VENDOR ||--o{ PROPOSAL : submits
    
    RFP {
        int id PK
        string title
        text description_raw
        jsonb description_structured
        jsonb items
        string budget
        string delivery_timeline
        timestamp created_at
    }

    VENDOR {
        int id PK
        string name
        string email
    }

    PROPOSAL {
        int id PK
        int rfp_id FK
        int vendor_id FK
        text raw_email
        jsonb parsed
        timestamp created_at
    }
```

---

## 🔄 System Data Flow

### 1. RFP Creation Flow
```mermaid
sequenceDiagram
    User->>Frontend: Enters RFP Details (Text)
    Frontend->>Backend: POST /rfp/from-text
    Backend->>AI Service: Parse Requirements
    AI Service-->>Backend: Structured JSON
    Backend->>Database: Save RFP
    Backend-->>Frontend: Return Created RFP
```

### 2. Proposal Ingestion Flow
```mermaid
sequenceDiagram
    Vendor->>Email Server: Sends Proposal Email
    Backend->>Email Server: IMAP Poll (Check New Mail)
    Email Server-->>Backend: New Email Content
    Backend->>AI Service: Parse Proposal vs RFP
    AI Service-->>Backend: Structured Proposal Data
    Backend->>Database: Save Proposal (Linked to RFP)
```

---

## 📂 Folder Structure

```bash
procuro/
├── backend/
│   ├── src/
│   │   ├── api/            # Route controllers and services
│   │   │   ├── ai/         # AI logic (Groq integration)
│   │   │   ├── email/      # Email handling (IMAP/SMTP)
│   │   │   ├── proposal/   # Proposal logic
│   │   │   ├── rfp/        # RFP logic
│   │   │   └── vendor/     # Vendor logic
│   │   ├── config/         # Environment config
│   │   ├── db/             # Database connection & models
│   │   ├── utils/          # Helper functions
│   │   ├── app.js          # Express app setup
│   │   └── server.js       # Entry point
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios client
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   └── App.jsx         # Root component
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend
*   **Framework:** React (Vite)
*   **Styling:** CSS / Tailwind (if applicable)
*   **Icons:** Lucide React
*   **HTTP Client:** Axios
*   **Routing:** React Router DOM

### Backend
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** PostgreSQL (`pg`)
*   **AI/LLM:** Groq SDK (`llama-3.3-70b-versatile`)
*   **Email:** Nodemailer (SMTP), ImapFlow (IMAP)
*   **Documentation:** Swagger UI

---

## 📖 API Documentation

### RFP Routes
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/rfp` | Create a new RFP manually |
| `GET` | `/rfp` | List all RFPs |
| `GET` | `/rfp/:id` | Get details of a specific RFP |
| `POST` | `/rfp/from-text` | Generate an RFP structure from raw text using AI |
| `GET` | `/rfp/:id/compare` | Compare all proposals for a specific RFP |

### Vendor Routes
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/vendors` | Register a new vendor |
| `GET` | `/vendors` | List all registered vendors |

### Proposal Routes
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/proposals` | Manually submit a proposal |
| `POST` | `/proposals/parse` | Parse a raw proposal text using AI |
| `GET` | `/proposals/rfp/:rfpId` | Get all proposals for a specific RFP |
| `GET` | `/proposals/:id` | Get details of a specific proposal |

### Email Routes
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/email/send` | Send an email (e.g., to a vendor) |

---

## 🚀 How to Run the Project Locally

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL
*   Groq API Key

### 1. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables (see below).
4.  Initialize the database:
    *   Create a PostgreSQL database.
    *   Run the SQL scripts in `src/db/models.sql`.
5.  Start the server:
    ```bash
    npm run dev
    ```

### 2. Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

### 3. Environment Variables

Create a `.env` file in the root (or `backend/`) with the following:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/procuro_db

# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_password
IMAP_HOST=imap.example.com
IMAP_PORT=993
IMAP_USER=your_email@example.com
IMAP_PASS=your_password

# AI Configuration
LLM_API_KEY=gsk_your_groq_api_key
```

---

## ☁️ Deployment Guide

### Backend (Render)
1.  Create a new **Web Service** on Render.
2.  Connect your repository.
3.  Set the **Root Directory** to `backend`.
4.  Set the **Build Command** to `npm install`.
5.  Set the **Start Command** to `node src/server.js`.
6.  Add all environment variables in the Render dashboard.

### Frontend (Netlify/Vercel)
1.  Create a new site on Netlify or Vercel.
2.  Connect your repository.
3.  Set the **Base Directory** to `frontend`.
4.  Set the **Build Command** to `npm run build`.
5.  Set the **Publish Directory** to `dist`.

---

## 📸 Screenshots

*(Placeholder for application screenshots)*

*   **Dashboard View:** Overview of active RFPs.
*   **RFP Creation:** AI-assisted form for generating requirements.
*   **Comparison Matrix:** Side-by-side view of vendor proposals.

---

## 🔮 Future Enhancements

*   **Authentication:** Add JWT-based user authentication and role-based access control (RBAC).
*   **Document Upload:** Support parsing of PDF/Word documents for RFPs and Proposals.
*   **Real-time Notifications:** WebSockets for instant updates when a new proposal arrives.
*   **Analytics Dashboard:** Visual insights into spending and vendor performance.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
