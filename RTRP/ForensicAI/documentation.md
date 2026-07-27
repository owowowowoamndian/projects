# ForensicAI — Digital Forensics Intelligence Platform
*RTRP-2026-G1023*
## Documentation for Milestone Review

---

## Table of Contents

1. [Objective / Purpose](#1-objective--purpose)
2. [Technology Stack](#2-technology-stack)
3. [Architecture](#3-architecture)
4. [Coding — Design, Algorithms & Data Protection](#4-coding--design-algorithms--data-protection)
5. [Deployment](#5-deployment)
6. [Code Explanation](#6-code-explanation)
7. [Demo — Feature Showcase](#7-demo--feature-showcase)

---

## 1. Objective / Purpose

### 1.1 Problem Statement

Digital forensic investigations produce massive volumes of log files, network captures, and system artifacts. Investigators currently rely on **manual analysis** — reading through thousands of log lines, manually tracking event timelines, and writing reports from scratch. This is:

- **Time-consuming**: A single case can take days of manual log analysis.
- **Error-prone**: Human reviewers may miss critical events buried in data.
- **Inconsistent**: Report quality varies depending on the investigator's experience.
- **Lacks traceability**: Evidence integrity and chain-of-custody tracking are often ad-hoc.

### 1.2 Project Objective

**ForensicAI** is a full-stack web application that automates and streamlines the digital forensics workflow:

| Capability | Description |
|---|---|
| **Evidence Management** | Upload, hash (SHA-256), parse, and verify digital evidence files |
| **Automated Parsing** | Extract timestamped events, anomalies, and metadata from log files |
| **AI-Powered Report Generation** | Use configured LLMs to auto-generate forensic report sections |
| **Timeline Reconstruction** | Automatically build chronological event timelines from parsed evidence |
| **Case Management** | Track investigations with statuses, priorities, tags, and assignments |
| **Evidence Integrity** | SHA-256 hashing with re-verification and full audit trail |
| **Authentication & 2FA** | Secure login with JWT + WebAuthn passkey-based two-factor authentication |
| **Threat Intelligence** | Corroborate IPs and file hashes with AbuseIPDB and VirusTotal threat feeds |
| **MITRE ATT&CK Mapping** | Correlate log events directly with adversary Tactics and Techniques |
| **Case Chat RAG Copilot** | Natural language case assistant leveraging context-ranked logs and LLMs |

### 1.3 Domain

**Cybersecurity / Digital Forensics / Law Enforcement IT**

### 1.4 End Beneficiaries

- **Digital Forensic Investigators** — faster evidence analysis and report generation
- **Cybersecurity Analysts** — automated timeline reconstruction for incident response
- **Law Enforcement** — consistent, court-admissible forensic reports with chain-of-custody
- **Corporate IT Security Teams** — internal investigation management

---

## 2. Technology Stack

### 2.1 Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.3 | Component-based UI framework |
| **Vite** | 6.0 | Fast build tool and dev server (HMR) |
| **React Router** | 6.28 | Client-side routing and navigation |
| **Axios** | 1.7 | HTTP client for API communication |
| **Framer Motion** | 11.12 | Smooth animations and page transitions |
| **Recharts** | 2.14 | Interactive charts (case activity, evidence distribution) |
| **Lucide React** | 0.460 | Premium SVG icon library |
| **React Dropzone** | 14.3 | Drag-and-drop file upload interface |
| **SimpleWebAuthn Browser** | 13.2 | WebAuthn/passkey client-side API |
| **Vanilla CSS** | — | Custom design system with CSS variables, no frameworks |

### 2.2 Backend

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 18+ | JavaScript runtime |
| **Express** | 4.21 | RESTful API framework |
| **MongoDB** | 7.x | NoSQL document database |
| **Mongoose** | 8.8 | ODM for MongoDB with schema validation |
| **JWT (jsonwebtoken)** | 9.0 | Stateless authentication tokens |
| **bcryptjs** | 2.4 | Password hashing (12 salt rounds) |
| **SimpleWebAuthn Server** | 13.2 | WebAuthn passkey registration and verification |
| **Multer** | 1.4 | Multipart file upload handling |
| **PDFKit** | 0.15 | Server-side PDF report generation |
| **Helmet** | 8.0 | HTTP security headers |
| **express-rate-limit** | 7.4 | API rate limiting (200 req/15 min) |
| **express-validator** | 7.2 | Input validation and sanitization |
| **Morgan** | 1.10 | HTTP request logging |
| **dotenv** | 16.4 | Environment variable management |

### 2.3 AI & Threat Intelligence Engines

| Technology | Purpose |
|---|---|
| **Mistral / OpenAI / Gemini** | Configurable LLMs for report generation and Case Chat RAG |
| **AbuseIPDB API** | Live checks of IP addresses to determine risk and abuse confidence scores |
| **VirusTotal API** | Sandbox analysis checking file hashes against multiple antivirus engines |
| **Local Threat Intel Cache** | Static known signatures for offline and demo threat simulation |

### 2.4 Why This Stack?

| Choice | Rationale | Alternative Considered |
|---|---|---|
| **React + Vite** | Fast HMR, component reusability, large ecosystem | Next.js (unnecessary SSR for this tool) |
| **Express** | Lightweight, flexible, mature middleware ecosystem | Fastify (less community support) |
| **MongoDB** | Flexible schema for forensic data (events, metadata, enriched threat feeds) | PostgreSQL (rigid schema less suitable for variable structures) |
| **JWT Auth** | Stateless, scalable, no session store needed | Session cookies (requires server-side state) |
| **bcryptjs** | Industry-standard password hashing, pure JavaScript | Argon2 (requires native bindings) |
| **WebAuthn Passkeys** | Hardware-backed 2FA, phishing-resistant | TOTP (less secure, user must manage codes) |
| **Mistral / OpenAI / Gemini** | Multi-LLM provider support tailored to client cost/performance needs | Local Ollama (requires local high-end GPU) |
| **AbuseIPDB & VirusTotal** | Industry-standard threat feeds providing real-time indicator reputations | Manual reputation searches (greatly slows down investigators) |

---

## 3. Architecture

### 3.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT (React + Vite)                      │
│                          Port: 5173                                 │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Pages                                                        │  │
│  │  ┌──────────┐ ┌───────┐ ┌────────────┐ ┌──────────────────┐  │  │
│  │  │ Login    │ │ Dash- │ │ Cases /    │ │ Evidence Upload  │  │  │
│  │  │ (Auth)   │ │ board │ │ CaseDetail │ │ (Drag & Drop)    │  │  │
│  │  └──────────┘ └───────┘ └────────────┘ └──────────────────┘  │  │
│  │  ┌──────────┐ ┌─────────────────────┐ ┌──────────────────┐  │  │
│  │  │ Timeline │ │ Reports / Detail    │ │ Settings         │  │  │
│  │  │          │ │ (Edit + Export PDF) │ │ (Profile/2FA/AI) │  │  │
│  │  └──────────┘ └─────────────────────┘ └──────────────────┘  │  │
│  │  ┌──────────┐ ┌─────────────────────┐ ┌──────────────────┐  │  │
│  │  │ Threat   │ │ MITRE ATT&CK Matrix │ │ Case Chat Copilot│  │  │
│  │  │ IOCs     │ │ (Adversary Tactics) │ │ (RAG Chatbot)    │  │  │
│  │  └──────────┘ └─────────────────────┘ └──────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  ┌──────────────┐  ┌─────────────────┐  ┌─────────────────────┐   │
│  │ AuthContext   │  │ api.js (Axios)  │  │ Components          │   │
│  │ (JWT + Timer) │  │ Bearer Token    │  │ Header / Sidebar    │   │
│  └──────────────┘  └────────┬────────┘  └─────────────────────┘   │
└──────────────────────────────┼──────────────────────────────────────┘
                               │ HTTP REST (JSON)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       SERVER (Express + Node.js)                    │
│                       Port: 5000                                    │
│  ┌──────────────────── Middleware Layer ─────────────────────────┐  │
│  │  Helmet │ CORS │ Rate Limiter │ Morgan │ JWT Auth │ Audit    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────── Route Layer ───────────────────────────┐  │
│  │  /api/auth       → Register, Login, Passkey (WebAuthn)      │  │
│  │  /api/cases      → CRUD: create, read, update, delete       │  │
│  │  /api/evidence   → Upload, hash, parse, verify, export      │  │
│  │  /api/reports    → Generate, edit, review, approve, PDF     │  │
│  │  /api/ai         → Summarize, findings, section generation  │  │
│  │  /api/timeline   → Build event timeline from evidence       │  │
│  │  /api/settings   → Profile, security, AI config, notifs     │  │
│  │  /api/dashboard  → Stats, activity feed                     │  │
│  │  /api/audit      → Audit log retrieval                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌────────── Utils ──────────┐  ┌────────── Services ──────────┐  │
│  │  hash.js    (SHA-256)     │  │  aiService.js (Mistral API) │  │
│  │  parser.js  (Log Parsing) │  │                              │  │
│  └───────────────────────────┘  └──────────────────────────────┘  │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │ Mongoose ODM
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DATABASE (MongoDB)                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ ┌───────────┐ │
│  │  Users   │ │  Cases   │ │ Evidence │ │Reports │ │ AuditLogs │ │
│  │ + Passkeys│ │ + Tags   │ │ + Events │ │+Sections│ │ + IP/UA   │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                               │
│  ┌──────────────────────────┐  ┌────────────────────────────────┐  │
│  │  LLM Provider APIs        │  │  Threat Intel APIs             │  │
│  │  (Mistral/OpenAI/Gemini)  │  │  (AbuseIPDB & VirusTotal)      │  │
│  └──────────────────────────┘  └────────────────────────────────┘  │
│  ┌──────────────────────────┐                                      │
│  │  File System (uploads/)  │                                      │
│  │  (Evidence Storage)      │                                      │
│  └──────────────────────────┘                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Data Flow

```
Evidence File (.log)        User Login
      │                        │
      ▼                        ▼
  Multer Upload          JWT Authentication
      │                        │
      ▼                        ▼
  SHA-256 Hashing       2FA Check (passkeys?)
      │                    │          │
      ▼                   No         Yes
  Log Parser              │          │
  (Timestamp +            ▼          ▼
   Event Extraction)   Full JWT   WebAuthn Challenge
      │                            │
      ▼                            ▼
  MongoDB                     Passkey Verify
  (Evidence.parsedData)            │
      │                            ▼
      ▼                        Full JWT
  Timeline Builder
      │
      ▼
  AI Report Generation
  (Mistral API)
      │
      ▼
  PDF Export (PDFKit)
```

### 3.3 Database Schema (ER Diagram)

```
┌────────────────┐       ┌───────────────────┐       ┌──────────────────┐
│     User       │       │      Case         │       │    Evidence      │
├────────────────┤       ├───────────────────┤       ├──────────────────┤
│ _id            │       │ _id               │       │ _id              │
│ name           │  1:N  │ caseNumber (auto) │  1:N  │ filename         │
│ email (unique) │◄──────│ title             │◄──────│ originalName     │
│ passwordHash   │       │ description       │       │ sha256Hash       │
│ role           │       │ status            │       │ filePath         │
│ organization   │       │ priority          │       │ caseId (FK)      │
│ settings{}     │       │ assignee (FK)     │       │ status           │
│ passkeys[]     │       │ evidence[] (FK)   │       │ metadata{}       │
│ createdAt      │       │ reports[] (FK)    │       │ parsedData{}     │
└────────────────┘       │ tags[]            │       │  ├─ events[]     │
                         │ notes             │       │  │  ├─ timestamp │
                         └───────────────────┘       │  │  ├─ detail    │
                                │                    │  │  ├─ mitreAttack
                                │                    │  │  └─ threatIntel
                                │                    │  ├─ summary      │
                                │                    │  └─ anomalies[]  │
                                │                    │ uploadedBy (FK)  │
                                │                    └──────────────────┘
                                │ 1:N
                                ▼
                         ┌───────────────────┐       ┌──────────────────┐
                         │     Report        │       │   AuditLog       │
                         ├───────────────────┤       ├──────────────────┤
                         │ _id               │       │ action (enum)    │
                         │ reportNumber      │       │ userId (FK)      │
                         │ caseId (FK)       │       │ userName         │
                         │ title             │       │ entityType       │
                         │ sections[]        │       │ entityId         │
                         │  └─ title         │       │ details          │
                         │  └─ content       │       │ ipAddress        │
                         │  └─ aiGenerated   │       │ userAgent        │
                         │  └─ confidence    │       │ createdAt        │
                         │  └─ status        │       └──────────────────┘
                         │  └─ editHistory[] │
                         │ status            │
                         │ overallConfidence  │
                         │ metadata{}        │
                         └───────────────────┘
```

### 3.4 Component Architecture (Frontend)

```
App.jsx
├── AuthProvider (context)
│   ├── Login.jsx ─────────── (unauthenticated route)
│   │   ├── Sign In form
│   │   ├── Sign Up form
│   │   └── 2FA Passkey verification
│   │
│   └── Protected Routes ──── (authenticated)
│       ├── Sidebar.jsx ────── Navigation + Logout
│       ├── Header.jsx ─────── Search + Profile dropdown
│       │
│       ├── Dashboard.jsx ──── Stats + Charts (Recharts) + AI Assistant Button
│       ├── Cases.jsx ──────── Case list + CRUD
│       │   └── CaseDetail.jsx ── Evidence, timeline, notes
│       ├── EvidenceUpload.jsx ── Drag-drop + file parsing
│       ├── Timeline.jsx ────── Chronological event view
│       ├── Reports.jsx ─────── Report list + generation
│       │   └── ReportDetail.jsx ── Edit sections + PDF export
│       ├── ThreatIocs.jsx ──── Global Threat Indicators (IOCs)
│       ├── MitreAttack.jsx ─── MITRE ATT&CK Matrix Mapping
│       ├── CaseChat.jsx ────── Case Chat Copilot (RAG)
│       └── Settings.jsx ────── Profile / Security / AI / Notifications
│           └── 2FA Passkey management (WebAuthn)
```

---

## 4. Coding — Design, Algorithms & Data Protection

### 4.1 Key Algorithms

#### Evidence Integrity — SHA-256 Hashing

```javascript
// server/utils/hash.js
export function computeFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256')
    const stream = fs.createReadStream(filePath) // Stream-based for large files
    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('hex')))
  })
}
```

- **Algorithm**: SHA-256 (256-bit cryptographic hash)
- **Why**: Industry standard for digital forensics; any file modification changes the hash
- **Stream-based**: Handles large evidence files (GBs) without loading into memory

#### Log Parsing — Multi-Pattern Timestamp Extraction

```javascript
// server/utils/parser.js — Supports multiple log formats:
const patterns = [
  // Forensic: "2026-02-18 09:12:03 INFO  User login successful"
  { regex: /^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+(INFO|WARN|ERROR|...)\s+(.*)/ },
  // Syslog: "Feb 19 03:42:11 hostname service[pid]: message"
  { regex: /^(\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+(.+)/ },
  // ISO: "2026-02-19T03:42:11Z message"
  { regex: /^(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}[.\d]*Z?)\s*(.*)/ },
]
```

- **Pattern matching**: Tries multiple regex patterns per line to support diverse log formats
- **Event extraction**: Timestamp, severity level, source, and event detail separation
- **Anomaly detection**: Flags ERROR/CRITICAL/FATAL entries automatically

#### AI Report Generation — Prompt Engineering

```javascript
// server/services/aiService.js
// Uses configured LLM API (Mistral/OpenAI/Gemini) with forensic-specific prompts:
// - "You are a digital forensics expert..."
// - Context includes: parsed events, timeline data, anomalies
// - Output: structured report sections (Executive Summary, Findings, etc.)
```

#### MITRE ATT&CK Mapping Rule Engine

```javascript
// server/utils/attackMapper.js
// Maps log pattern regexes to standard MITRE ATT&CK techniques:
// - T1110 (Brute Force) on "failed password/logon failure"
// - T1078 (Valid Accounts) on "accepted password/successful logon"
// - T1548.001 (Sudo/Su Abuse) on "sudo/su/elevated privilege"
// - T1033/T1046 (System/Network Discovery) on tools (whoami, nmap, netstat)
// - T1105 (Ingress Tool Transfer) on tools (wget, curl)
// - T1041 (Exfiltration) on exfiltration commands
```

#### Threat Intelligence reputation lookup

```javascript
// server/services/threatIntelService.js
// Checks threat reputation for extracted public IPs and file hashes:
// - AbuseIPDB: Query ipAddress to check abuse Confidence Score
// - VirusTotal: Query file sha256/md5 to check malicious engine votes
// - Fallback: Simulated reputation based on IP metrics if API keys not set
```

#### Case Chat RAG Log Retrieval

```javascript
// server/routes/cases.js (POST /cases/:id/chat)
// 1. Gather all parsed events for the case
// 2. Perform a local search using tokenized keyword matching
// 3. Score matching events based on keyword locations and severity
// 4. Retrieve top 25 highest-scoring logs as context
// 5. Send prompt, chat history, and context logs to LLM for response
```

### 4.2 Data Structures

| Structure | Type | Usage |
|---|---|---|
| `Evidence.parsedData.events[]` | Array of Objects | Timestamped events extracted from logs |
| `Report.sections[]` | Array of Subdocuments | Ordered report sections with edit history |
| `User.passkeys[]` | Array of Objects | WebAuthn credentials (public key, counter) |
| `Case.evidence[]` / `Case.reports[]` | ObjectId References | Many-to-one relationships |
| `challengeStore` (in-memory Map) | Map<string, string> | Temporary WebAuthn challenges (120s TTL) |

### 4.3 Data Protection & Security

| Layer | Implementation |
|---|---|
| **Password Storage** | bcryptjs with 12 salt rounds (hash, never plaintext) |
| **Authentication** | JWT tokens (24h expiry), auto-attached via Bearer header |
| **Two-Factor Auth** | WebAuthn passkeys (fingerprint/Face ID/security key) |
| **2FA Login Flow** | Password → temporary 5-min token → passkey verification → full JWT |
| **Evidence Integrity** | SHA-256 hashing on upload, re-verification with audit trail |
| **API Security** | Helmet (security headers), CORS whitelist, rate limiting (200/15min) |
| **Input Validation** | express-validator on all auth routes (email, password constraints) |
| **Auto-Logout** | Client-side inactivity timer (configurable: 15/30/60/240 min) |
| **Session Timeout** | User-configurable in Settings → Security → Session Timeout |
| **File Upload Safety** | Multer with file type validation, file size limits |
| **Error Handling** | Different error responses for development vs. production mode |
| **Audit Logging** | Every action logged with userId, IP address, user agent, timestamp |

### 4.4 Design Patterns Used

| Pattern | Where Used |
|---|---|
| **MVC (Model-View-Controller)** | Models (Mongoose) → Routes (Controllers) → React (Views) |
| **Context Pattern** | `AuthContext.jsx` — global auth state management |
| **Middleware Chain** | Express middleware: Helmet → CORS → Rate Limit → Auth → Audit |
| **Repository Pattern** | Mongoose models abstract database operations |
| **Observer Pattern** | React `useEffect` hooks for data fetching on tab changes |
| **Strategy Pattern** | Multiple log parser patterns tried sequentially |

---

## 5. Deployment

### 5.1 Prerequisites

| Requirement | Version | Purpose |
|---|---|---|
| **Node.js** | ≥ 18.0 | JavaScript runtime |
| **npm** | ≥ 9.0 | Package manager |
| **MongoDB** | ≥ 6.0 | Database (local or cloud) |
| **Git** | Latest | Version control |

### 5.2 Environment Configuration

Create a `.env` file in the `server/` directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/forensicai

# Authentication
JWT_SECRET=your-secure-random-secret-key-here

# AI Engine
AI_PROVIDER=openai # openai, gemini, or mistral
AI_API_KEY=your-ai-provider-api-key
AI_MODEL=gpt-4o # or gemini-1.5-pro, mistral-large

# Threat Intelligence
ABUSEIPDB_API_KEY=your_abuseipdb_api_key
VIRUSTOTAL_API_KEY=your_virustotal_api_key

# Server
PORT=5000
NODE_ENV=development
UPLOAD_DIR=./uploads
```

### 5.3 Local Deployment Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd Forensics-Summarizer

# 2. Install server dependencies
cd server
npm install

# 3. Install client dependencies
cd ../client
npm install

# 4. Configure environment
cd ../server
cp .env.example .env
# Edit .env with your MongoDB URI, JWT_SECRET, and MISTRAL_API_KEY

# 5. Start MongoDB (if local)
mongod --dbpath /data/db

# 6. Start the server (Terminal 1)
cd server
node server.js
# Output: 🚀 ForensicAI Server running on port 5000

# 7. Start the client (Terminal 2)
cd client
npm run dev
# Output: Local: http://localhost:5173
```

### 5.4 Production Build

```bash
# Build optimized client bundle
cd client
npm run build    # Output: dist/ folder with static assets

# Serve with production settings
cd ../server
NODE_ENV=production node server.js
```

### 5.5 Deployment Type

| Approach | Details |
|---|---|
| **Current** | Local development (two terminals: server + client) |
| **Recommended Production** | Docker containers or cloud deployment (Render, Railway, AWS EC2) |
| **Database** | MongoDB Atlas (cloud) or self-hosted MongoDB |
| **Static Files** | Client `dist/` can be served via Nginx or built into Express |

---

## 6. Code Explanation

### 6.1 Authentication Flow

```
User enters email + password
         │
         ▼
POST /api/auth/login
         │
         ├── Validate input (express-validator)
         ├── Find user by email (MongoDB)
         ├── Compare password hash (bcryptjs)
         │
         ├── 2FA disabled? ──► Issue JWT (24h) ──► Dashboard
         │
         └── 2FA enabled + passkeys registered?
                  │
                  ▼
             Return { requires2FA: true, loginToken (5min) }
                  │
                  ▼
          Client shows "Verify with Passkey" screen
                  │
                  ▼
          POST /api/auth/passkey/auth-options
             → generateAuthenticationOptions (WebAuthn)
             → Store challenge in memory (120s TTL)
                  │
                  ▼
          Browser prompts fingerprint/Face ID/security key
                  │
                  ▼
          POST /api/auth/passkey/authenticate
             → verifyAuthenticationResponse (WebAuthn)
             → Issue full JWT (24h)
             → Redirect to Dashboard
```

### 6.2 Evidence Processing Pipeline

```
1. FILE UPLOAD        → Multer receives files (up to 10 at once)
2. HASHING            → SHA-256 computed via crypto stream
3. DATABASE RECORD    → Evidence document created (status: 'verified')
4. PARSING            → parseLogFile() extracts events from .log/.csv/.txt
   └── Tries 3 regex patterns per line (forensic, syslog, ISO)
   └── Extracts: timestamp, severity, source, detail
   └── Detects anomalies (ERROR/CRITICAL entries)
5. STORAGE            → parsedData saved to Evidence document (status: 'parsed')
6. TIMELINE           → buildTimeline() aggregates events across all case evidence
7. AI ANALYSIS        → Mistral AI generates summaries and findings
8. REPORT             → Report sections generated with AI confidence scores
9. PDF EXPORT         → PDFKit generates printable forensic report
```

### 6.3 Key Route Summary

| Route | Method | Key Logic |
|---|---|---|
| `POST /api/auth/register` | Creates user with bcrypt-hashed password |
| `POST /api/auth/login` | Validates credentials, checks 2FA, issues JWT |
| `POST /api/evidence/upload` | Multer → SHA-256 → Parse → Store |
| `GET /api/timeline/:caseId` | Aggregates all evidence events chronologically |
| `POST /api/ai/summarize` | Sends evidence data to AI for summary |
| `POST /api/reports/:id/generate` | AI generates all report sections |
| `PUT /api/reports/:id/sections/:idx` | Edit specific report section (with history) |
| `GET /api/reports/:id/export/pdf` | PDFKit renders formatted forensic PDF |
| `GET /api/evidence/:id/verify` | Re-computes SHA-256 and compares to stored hash |
| `PUT /api/settings/security` | Updates 2FA settings and session timeout |
| `GET /api/dashboard/iocs` | Aggregates and returns threat intelligence indicators across cases |
| `POST /api/cases/:id/chat` | RAG chatbot querying case-specific logs with context retrieval |
| `GET /api/health` | Health status and dynamic key configuration detection |

---

## 7. Demo — Feature Showcase

### 7.1 Login & Authentication

| Feature | Description |
|---|---|
| **Premium Login Page** | Glassmorphic card with animated RGB gradient border (15s active, 5s sleep cycle) |
| **Sign In / Sign Up Toggle** | Smooth animated transition between login and registration forms |
| **Two-Factor Authentication** | When 2FA enabled → fingerprint/Face ID/security key verification screen |
| **Auto-Logout** | Configurable inactivity timer (15 / 30 / 60 / 240 minutes) |
| **Profile Dropdown** | Click avatar → shows name, email, role + Sign Out button |

### 7.2 Dashboard

| Feature | Description |
|---|---|
| **Investigation Stats** | Active cases, evidence files, threat indicators, critical threat flags, reports generated, integrity alerts |
| **Case Activity Chart** | Line chart showing case + report creation over time |
| **Evidence Distribution** | Donut chart of evidence file types |
| **Quick Access** | Recent cases with status badges |

### 7.3 Case Management

| Feature | Description |
|---|---|
| **CRUD Operations** | Create, view, edit, delete cases |
| **Status Workflow** | Draft → Active → Review → Closed → Archived |
| **Priority Levels** | Low, Medium, High, Critical (with color coding) |
| **Auto-Numbering** | `FR-2026-0001` format, auto-generated |
| **Linked Evidence** | View all evidence files associated with a case |
| **View Report** | Quick access button to the case's generated report |

### 7.4 Evidence Upload & Integrity

| Feature | Description |
|---|---|
| **Drag-and-Drop Upload** | React Dropzone with visual feedback |
| **File Type Validation** | Accepts: .log, .txt, .csv, .json, .xml, .pcap, .evtx, .img, .dd, .zip |
| **SHA-256 Hashing** | Automatic integrity hash computed on upload |
| **Hash Re-Verification** | Click "Verify" to re-compute and compare hashes |
| **Auto Parsing** | Log files are automatically parsed for timestamped events |
| **Status Tracking** | Uploading → Hashing → Verified → Parsing → Parsed |

### 7.5 Timeline Reconstruction

| Feature | Description |
|---|---|
| **Automated Timeline** | Events extracted from all case evidence, sorted chronologically |
| **Severity Color Coding** | Info (blue), Warning (amber), Danger (red), Critical (purple) |
| **Source Grouping** | Events grouped by source system |
| **Anomaly Highlighting** | Suspicious events flagged visually |

### 7.6 AI-Powered Reports

| Feature | Description |
|---|---|
| **Auto Generation** | Click "Generate" → Mistral AI creates all report sections |
| **Section Types** | Executive Summary, Key Findings, Timeline, Technical Analysis, Recommendations |
| **Confidence Scores** | Each AI section shows % confidence rating |
| **Rich Text Editing** | Markdown formatting toolbar for manual edits |
| **Edit History** | Every edit tracked with previous content and timestamp |
| **Section Workflow** | Empty → Draft → Reviewed → Approved |
| **PDF Export** | Professional PDF report with headers, footers, and formatting |

### 7.7 Settings & Security

| Feature | Description |
|---|---|
| **Profile Tab** | Name, email, role, organization — editable |
| **Security Tab** | Password change, 2FA toggle, session timeout, passkey management |
| **AI Engine Tab** | Provider, model, API key, temperature, max tokens, tone configuration, AbuseIPDB and VirusTotal API keys, threat severity threshold, and RAG context limit |
| **Notifications Tab** | Toggle alerts for cases, evidence, AI reports, security, maintenance |
| **Passkey Management** | Add/remove WebAuthn passkeys with registration date display |

### 7.8 Audit Trail

| Feature | Description |
|---|---|
| **Comprehensive Logging** | Every action logged: uploads, logins, edits, verifications |
| **Metadata Captured** | User ID, IP address, user agent, timestamp |
| **21 Action Types** | From `case_created` to `user_login_2fa` to `report_exported` |

### 7.9 Threat Indicators (IOCs) Dashboard

| Feature | Description |
|---|---|
| **Consolidated Board** | Centralized table of all identified IPs and file hashes across cases |
| **Severity Badges** | Critical (score 90+), High (70-89), Medium (40-69), Low (<40) tags |
| **Integrity Health Check** | Status indicators reflecting live external API keys vs. local simulators |
| **Search & Filtering** | Instant client-side filters for text search, threat type, and severity |
| **Citations and Links** | One-click copy for IOCs and direct linkages to originating cases |

### 7.10 MITRE ATT&CK Matrix

| Feature | Description |
|---|---|
| **Case Correlation** | Direct mapping of a case's log entries to standardized cyber threat tactics |
| **Interactive Grid** | Columns for Execution, Privilege Escalation, Discovery, Lateral Movement, etc. |
| **Highlight Active Techniques** | Cards glow and show total match counts when techniques are detected |

### 7.11 Case Chat Assistant (RAG)

| Feature | Description |
|---|---|
| **Natural Language Queries** | Speak directly with case data (e.g. "Any brute force attacks?") |
| **Retrieval Augmented** | Locally searches and scores the most relevant 25 events to feed context to LLM |
| **Citations Feed** | Lists all source logs used to generate answers, with detailed popup views |

---

## Project Structure

```
Forensics Summarizer/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx           # Search, notifications, profile dropdown
│   │   │   └── Sidebar.jsx          # Navigation + logout
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # JWT auth + auto-logout timer
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Login/signup + 2FA verification
│   │   │   ├── Dashboard.jsx        # Stats + charts
│   │   │   ├── Cases.jsx            # Case list + CRUD
│   │   │   ├── CaseDetail.jsx       # Case details + evidence
│   │   │   ├── EvidenceUpload.jsx   # Drag-drop file upload
│   │   │   ├── Timeline.jsx         # Event timeline view
│   │   │   ├── Reports.jsx          # Report list + generation
│   │   │   ├── ReportDetail.jsx     # Edit sections + PDF export
│   │   │   ├── Settings.jsx         # Profile/Security/AI/Notifications
│   │   │   ├── ThreatIocs.jsx       # Aggregated IOCs dashboard
│   │   │   ├── MitreAttack.jsx      # MITRE ATT&CK visual matrix
│   │   │   └── CaseChat.jsx         # Case RAG Chat chatbot
│   │   ├── api.js                   # Axios HTTP client + auth headers
│   │   ├── App.jsx                  # Router + AuthProvider + route protection
│   │   └── index.css                # Complete design system (CSS variables)
│   ├── package.json
│   └── vite.config.js
│
│── server/                          # Express Backend
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification middleware
│   │   └── audit.js                 # Audit logging middleware
│   ├── models/
│   │   ├── User.js                  # User schema + passkeys + settings
│   │   ├── Case.js                  # Case schema + auto-numbering
│   │   ├── Evidence.js              # Evidence schema + parsed events
│   │   ├── Report.js                # Report schema + sections + confidence
│   │   └── AuditLog.js             # Audit log schema (21 action types)
│   ├── routes/
│   │   ├── auth.js                  # Register, login, WebAuthn passkeys
│   │   ├── cases.js                 # Case CRUD operations
│   │   ├── evidence.js              # Upload, parse, verify, export
│   │   ├── reports.js               # Generate, edit, approve, PDF export
│   │   ├── ai.js                    # AI summarize, findings, sections
│   │   ├── timeline.js              # Timeline construction
│   │   ├── settings.js              # User settings management
│   │   ├── dashboard.js             # Dashboard stats + activity
│   │   └── audit.js                 # Audit log retrieval
│   ├── services/
│   │   ├── aiService.js             # AI provider abstraction layer
│   │   └── threatIntelService.js    # Threat Intelligence Integration (AbuseIPDB/VT)
│   ├── utils/
│   │   ├── hash.js                  # SHA-256 file hashing
│   │   ├── parser.js                # Multi-format log parser
│   │   └── attackMapper.js          # MITRE ATT&CK pattern mapper
│   ├── server.js                    # Express app entry point
│   ├── package.json
│   └── .env                         # Environment variables
│
└── documentation.md                 # This file
```

---

*ForensicAI v1.0.2 — Built with React, Express, MongoDB, and Mistral AI*

