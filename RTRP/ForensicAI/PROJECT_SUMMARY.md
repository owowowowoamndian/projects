# ForensicAI — Digital Forensics Investigation Platform

> **AI-Powered Digital Forensics Reporting & Evidence Analysis Suite**  
> Presented at Project Expo 2026 · Built for Cybersecurity Professionals

---

## Executive Overview

**ForensicAI** is a production-ready, full-stack digital forensics investigation platform that combines the power of modern **Artificial Intelligence** with rigorous, legally defensible forensic methodology. It is designed to serve **cybersecurity analysts, incident responders, and digital forensics examiners** by providing a unified, intelligent environment to manage the complete forensic investigation lifecycle — from evidence collection and parsing, through automated threat correlation, to AI-assisted formal report generation.

The platform is deployed live at [forensicai.vercel.app](https://forensicai-app.vercel.app/) and maintained on GitHub at [cybersecurity26/ForensicAI](https://github.com/cybersecurity26/ForensicAI).

The platform is built on a **Human-in-the-Loop (HITL)** philosophy: AI handles the heavy lifting of analysis, threat correlation, and draft generation, but all conclusions and findings **require human review and approval** before finalization — ensuring legal defensibility and investigator accountability.

---

## Problem Statement

Traditional digital forensics workflows are fragmented, time-consuming, and tool-heavy. Investigators must:

- Manually parse raw log files across dozens of inconsistent formats
- Cross-reference indicators of compromise (IOCs) against external threat databases individually
- Write formal investigation reports from scratch, often hours of work per case
- Manage case access and chain-of-custody with spreadsheets or paper-based systems

**ForensicAI solves all of these with a single, integrated platform.**

---

## Core Architecture

```
┌───────────────────────────────────────────────────────┐
│                  CLIENT (React 18 + Vite)             │
│   Dashboard · Cases · Evidence · Timeline · Reports   │
│   MITRE Matrix · IOC Board · RAG Chat · Settings      │
└───────────────────────────┬───────────────────────────┘
                            │ HTTPS / REST API
┌───────────────────────────▼───────────────────────────┐
│                SERVER (Node.js + Express.js)           │
│   Auth · Cases · Evidence · Reports · Timeline        │
│   Dashboard · AI Service · Threat Intel Service       │
└───────────────┬───────────────────────┬───────────────┘
                │                       │
   ┌────────────▼─────┐     ┌───────────▼───────────┐
   │  MongoDB Atlas   │     │   External AI APIs    │
   │  (Cloud NoSQL DB)│     │  OpenAI / Gemini /    │
   │  Cases, Evidence │     │  Mistral AI           │
   │  Users, Reports  │     └───────────────────────┘
   │  Audit Logs      │     ┌───────────────────────┐
   └──────────────────┘     │  Threat Intel APIs    │
                            │  AbuseIPDB / VirusTotal│
                            └───────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite 6 | Fast SPA with HMR and modular component architecture |
| **Styling** | Vanilla CSS (Design System) | Custom dark/light theme with CSS variables, no framework overhead |
| **Animations** | Framer Motion | Smooth page transitions and micro-interaction animations |
| **Charts** | Recharts | Interactive dashboard data visualizations |
| **Backend** | Node.js 18 + Express.js 4 | RESTful API server with middleware layering |
| **Database** | MongoDB Atlas + Mongoose 8 | Cloud NoSQL database with schema validation |
| **Authentication** | JWT + bcryptjs | Secure token-based sessions with hashed credentials |
| **File Handling** | Multer | Multipart form evidence upload middleware |
| **Security** | Helmet + express-rate-limit | HTTP security headers and API rate limiting |
| **PDF Export** | PDFKit | Server-side PDF report generation |
| **Passkeys** | @simplewebauthn | WebAuthn standard passwordless authentication |
| **Deployment** | Render (Backend) + GitHub | Continuous deployment from main branch |

---

## Feature Modules

### 1. Secure Authentication System

The platform implements a multi-layer authentication architecture to protect investigation data.

- **JWT Sessions** — Industry-standard JSON Web Token authentication with 24-hour expiry and automatic client-side redirect on expiry.
- **Role-Based Access Control (RBAC)** — Four distinct roles with enforced permission boundaries:

| Role | Capabilities |
|---|---|
| **Administrator** | Full visibility across all cases, all users; system configuration; cannot be self-assigned |
| **Lead Analyst** | Create, edit, manage own cases; generate AI reports; upload evidence |
| **Senior Investigator** | Create and manage own cases; full case workflow |
| **Viewer** | Read-only access to shared cases; RAG Chat access; no creation or modification rights |

- **WebAuthn Passkeys** — Modern, passwordless biometric authentication fully compliant with the WebAuthn W3C standard. Users can register hardware keys or platform authenticators (fingerprint, Face ID).
- **Two-Factor Authentication (2FA)** — TOTP-based second factor using hardware security keys registered as passkeys. Once enabled, all logins require passkey verification after password entry.

---

### 2. Case Management

The case management module is the operational core of the platform. Every investigation is organized as a **Case** with structured metadata, lifecycle tracking, and access isolation.

**Case Lifecycle States:** `Draft → Active → Review → Closed → Archived`

**Key capabilities:**

- Auto-generated, unique sequential case numbers (`FR-2026-0001`, `FR-2026-0002`…) with collision-proof sequence detection
- Priority classification: `Low`, `Medium`, `High`, `Critical`
- Assignee and organization tracking
- Case-level notes with markdown support
- Full audit trail of every status change, view, share, and edit

**Case Isolation & Sharing:**

- Every case is strictly scoped to its creator by default — no cross-user data leakage
- Administrators have platform-wide visibility
- Case owners can **share cases with specific users by email**, granting read access to case details, evidence, timelines, and reports
- Access can be **revoked** at any time through the Share Modal
- The sharing system uses MongoDB `sharedWith` array with ObjectId matching, ensuring clean database-level isolation

---

### 3. Evidence Upload & Automated Parsing

This module handles the ingestion and intelligent parsing of digital evidence files.

**Supported File Formats:**

| Format | Description |
|---|---|
| `.log`, `.txt` | Syslog, auth.log, application logs, custom text logs |
| `.csv` | Structured CSV logs with auto-detected timestamp columns |
| `.json` | JSON-formatted log streams and API event exports |
| `.xml` | XML event logs |
| `.evtx` | Windows Event Log format |
| `.pcap` | Network packet capture files |
| `.img`, `.dd`, `.raw`, `.zip`, `.gz` | Disk image and forensic archive formats |

**Automated Processing Pipeline:**

1. **Upload** — Drag-and-drop with multi-file batch support (up to 10 files per upload)
2. **SHA-256 Integrity Hashing** — Every file is immediately hashed upon upload for chain-of-custody verification
3. **Format Detection** — Smart auto-detection distinguishes between Syslog, Apache/Nginx, ISO timestamp, Windows Event, CSV, JSON, and key-value block formats
4. **Event Extraction** — Regex-based parsers extract structured events with `timestamp`, `source`, `detail`, and `raw` fields
5. **Severity Classification** — Each event is automatically scored as `Info`, `Warning`, `Danger`, or `Critical` based on keyword analysis
6. **Event Type Tagging** — Events are categorized as: `authentication`, `network`, `file_access`, `privilege_escalation`, `data_transfer`, `malware`, or `system`
7. **MITRE ATT&CK Correlation** — Each event is pattern-matched against 8 ATT&CK technique rules (see next module)
8. **Threat Intelligence Enrichment** — IP addresses and file hashes extracted from events are queried against AbuseIPDB and VirusTotal in real time
9. **Re-Parse** — Evidence files can be re-parsed at any time to reflect updated rules or threat intel

---

### 4. MITRE ATT&CK Correlation Engine

ForensicAI includes a built-in rule mapper that automatically correlates forensic log events to the industry-standard **MITRE ATT&CK Framework** — without any manual tagging.

**Mapped Techniques:**

| Technique ID | Technique Name | Tactic | Trigger Patterns |
|---|---|---|---|
| **T1110** | Brute Force | Credential Access | `failed password`, `authentication failure`, `Event ID 4625` |
| **T1078** | Valid Accounts | Defense Evasion / Persistence | `accepted password`, `session opened`, `Event ID 4624` |
| **T1548.001** | Sudo/Su Elevation | Privilege Escalation | `sudo :`, `elevated privileges`, `root login` |
| **T1033** | System Owner/User Discovery | Discovery | `whoami`, `id`, `uname -a`, `hostname` |
| **T1046** | Network Service Discovery | Discovery | `nmap`, `netstat`, `port scan`, `masscan` |
| **T1105** | Ingress Tool Transfer | Command & Control | `wget`, `curl -O`, `scp`, `sftp` |
| **T1041** | Exfiltration Over C2 Channel | Exfiltration | `exfiltrat`, `tar -czf`, `transfer data` |
| **T1059** | Command & Scripting Interpreter | Execution | `/bin/bash`, `/bin/sh`, `powershell.exe`, `cmd.exe` |

The **MITRE ATT&CK Matrix** page renders a visual, interactive grid view of all techniques triggered across the entire case's evidence, grouped by tactic columns.

---

### 5. Timeline Reconstruction

The Timeline module aggregates and visualizes all parsed events across multiple evidence sources into a unified, chronological forensic timeline.

**Features:**

- **Multi-source aggregation** — Events from all uploaded evidence files merged into one stream
- **Chronological sorting** — Handles ISO, Syslog, Apache, Windows date formats uniformly
- **Date grouping** — Events are grouped by date for clear day-by-day investigation navigation
- **Severity filtering** — Filter events by `Critical`, `Danger`, `Warning`, `Info`
- **Source filtering** — Filter by specific evidence file or log source
- **MITRE tags** — Events with ATT&CK matches display `TechniqueID - TechniqueName` badges
- **Threat Intel badges** — Events with flagged IPs/hashes display threat score and details
- **Event count statistics** — Real-time counts by severity and type

---

### 6. Threat Indicators (IOCs) Dashboard

A global, cross-case Indicators of Compromise dashboard that aggregates all threat-positive events discovered during evidence parsing.

**Live External Feeds:**

- **AbuseIPDB** — Queries public IP reputation with confidence score, abuse category, ISP, and country
- **VirusTotal** — Queries file hash reputation with detection engine count and malicious/suspicious classification

**Dashboard Capabilities:**

- Aggregated view of all IOCs across all accessible cases
- Filterable by type: `IP`, `Hash`, `Domain`; by severity: `Critical`, `High`, `Medium`
- Each IOC links back to its originating case for drill-down investigation
- One-click copy of IP/hash values for use in external tools
- API credential health monitoring — live status badges showing if AbuseIPDB and VirusTotal keys are valid
- Threat severity threshold configuration — customizable cutoff score (0–100) for IOC classification

---

### 7. AI-Powered Report Generation

The report generation module leverages configurable LLM providers to produce professionally structured forensic investigation reports.

**Multi-Provider AI Support:**

| Provider | Supported Models |
|---|---|
| **OpenAI** | GPT-4, GPT-4o, GPT-3.5-turbo |
| **Google Gemini** | gemini-1.5-pro, gemini-1.5-flash |
| **Mistral AI** | mistral-large, mistral-medium, mistral-small |

**Generated Report Sections:**

1. **Executive Summary** — High-level narrative of the incident scope, timeline, and key observations in neutral, professional forensic language
2. **Key Findings** — Numbered, evidence-referenced findings distinguishing confirmed facts from inferences
3. **Timeline of Events** — Chronological event sequence extracted from parsed evidence
4. **Technical Analysis** — Detailed analysis of evidence artifacts with artifact references
5. **Indicators of Compromise** — Aggregated IOCs with threat intel scores and origins
6. **Recommendations** — Immediate remediation actions, long-term security improvements, policy updates, and additional investigation steps

**Human-in-the-Loop Enforcement:**

- All AI-generated content is clearly labeled with an `AI Generated` badge and the model used
- Reports cannot be exported or finalized without human review
- Each section has an inline markdown editor for investigators to revise AI drafts
- Editing toolbar supports Bold, Italic, Underline, Ordered/Unordered Lists, and Code blocks

**PDF Export:**

- Server-side PDF generation via PDFKit with consistent forensic formatting
- Exported as properly formatted, timestamped investigation documents

---

### 8. Case RAG Chat Copilot

An intelligent, Retrieval-Augmented Generation (RAG) chatbot embedded within each case for natural language investigation querying.

**How It Works:**

1. Investigator types a natural language question (e.g., *"Which IP addresses were involved in brute force attempts?"*)
2. The system tokenizes the query into keywords
3. All parsed events in the case are scored based on keyword relevance, severity, and MITRE ATT&CK matches
4. Top-ranked events (configurable limit: 5–100 events) are injected into the AI prompt as context
5. The LLM generates a precise, markdown-formatted response referencing specific timestamps, IPs, hashes, and MITRE techniques
6. Chat history is maintained for multi-turn investigation conversations

**Response Quality:**

- Responses use `code formatting` for IPs, hashes, and filenames
- **Bold** for MITRE technique IDs and critical findings
- Cites specific timestamps and event sources
- Declares when evidence context is insufficient and suggests what additional logs would help

---

### 9. Interactive Dashboard

The main landing page after login — a real-time operational overview scoped to the authenticated user's accessible cases.

**Dashboard Widgets:**

| Widget | Description |
|---|---|
| **Case Statistics** | Total, Active, Under Review, Closed, Draft — counted from user's accessible cases only |
| **Evidence & Reports Count** | Evidence files and reports within accessible cases |
| **Case Status Distribution** | Donut chart showing status proportions |
| **Evidence Type Distribution** | Pie chart of file format breakdown |
| **Timeline Activity Chart** | Bar chart of case activity over the past 30 days |
| **High Priority Cases** | Quick-access cards for Critical and High priority open cases |
| **Activity Feed** | Chronological audit log of recent actions, scoped to current user only |
| **IOC Alert Counter** | Flagged threat intelligence hits across accessible cases |

---

### 10. Security Architecture

The platform was designed with security-first principles throughout:

| Security Layer | Implementation |
|---|---|
| **Authentication** | JWT with 24h expiry; automatic logout on expiry; no silent fallback in production |
| **Case Isolation** | Database-level `createdBy` + `sharedWith` filtering on every query |
| **Token Rejection** | Invalid/expired tokens return `401 Unauthorized`; no silent pass-through |
| **Password Security** | bcrypt with cost factor 12 for all password hashing |
| **API Rate Limiting** | express-rate-limit on all API endpoints to prevent brute force |
| **HTTP Security Headers** | Helmet middleware adds CSP, HSTS, X-Frame-Options, etc. |
| **File Upload Validation** | Server-side extension whitelist enforced at upload time |
| **Role Enforcement** | Admin role cannot be self-assigned from UI or API |
| **Immutable Audit Trail** | Every create, read, update, delete, and share action is permanently logged |
| **Production Fallback Disabled** | Development-only admin fallback is disabled in production environment |

---

### 11. Settings & Personalization

A comprehensive, tabbed settings panel for user configuration:

| Tab | Settings Available |
|---|---|
| **Profile** | Name, Email, Role display (read-only for Admin), Organization |
| **Security** | Change Password, Enable/Disable 2FA, Registered Passkeys, Session Timeout |
| **AI & Threat Intel** | AI Provider selection, Model, Temperature, Max Tokens, Tone, Auto-Generate toggle, AbuseIPDB/VirusTotal API keys, Severity Threshold, RAG Context Limit |
| **Notifications** | Per-category notification preferences (Case Updates, Evidence Processing, AI Reports, Integrity Alerts, Security Events, Maintenance) |

---

### 12. Global Search & Notifications

**Global Search:**
- Live full-text search across Cases, Reports, and Evidence files from the header search bar
- Results are categorized and highlighted with jump-to links
- Minimum 2-character query threshold

**Notifications System:**
- Bell icon with unread count badge and chime sound
- Notifications are scoped strictly to the authenticated user's own actions
- Persists read state across sessions
- "Mark all read" bulk action

---

## Data Models

```
User
├── name, email, passwordHash, role, organization
├── settings: { theme, AI config, threat intel keys, notification prefs }
└── passkeys: [{ credentialId, publicKey, counter, transports }]

Case
├── caseNumber (auto-generated: FR-YYYY-NNNN), title, description
├── status, priority, assigneeName
├── createdBy (ObjectId → User), sharedWith [ObjectId → User]
├── evidence [], reports [], tags [], notes
└── closedAt, timestamps

Evidence
├── filename, originalName, mimeType, size, sha256Hash
├── filePath, caseId, status, uploadedBy
├── parsedData: { events [], lineCount, parsedCount, summary }
└── metadata: { fileType }

Report
├── caseId, title, type, status
├── sections: [{ type, title, content, aiGenerated, confidence }]
├── generatedBy, reviewedBy, approvedBy
└── exportedAt, pdfPath

AuditLog
├── action, entityType, entityId, details
├── userId, userName, ipAddress, userAgent
└── timestamp
```

---

## Deployment

The application is deployed on **Render** (cloud hosting) with the following setup:

| Component | Deployment |
|---|---|
| **Backend API** | Render Web Service — auto-deploys from `main` branch on GitHub push |
| **Frontend** | Built with Vite (`npm run build`), served via Render Static Site |
| **Database** | MongoDB Atlas (M0 Free Tier, cloud-hosted cluster) |
| **Live URL** | https://forensicai-app.vercel.app/ |

---

## Platform Metrics & Statistics

| Metric | Value |
|---|---|
| **Total Source Files** | 45+ files across client and server |
| **API Endpoints** | 40+ RESTful API routes |
| **Evidence Parsers** | 4 format parsers (Text/Syslog, CSV, JSON, Key-Value) |
| **MITRE ATT&CK Rules** | 8 technique rule mappings |
| **AI Prompt Templates** | 5 specialized forensic prompts |
| **Supported AI Providers** | 3 (OpenAI, Google Gemini, Mistral AI) |
| **Supported File Formats** | 12 evidence file types |
| **User Roles** | 4 (Administrator, Analyst, Investigator, Viewer) |
| **Frontend Bundle** | ~932 KB JS + 41 KB CSS (production build) |
| **Tech Stack** | MERN (MongoDB, Express, React, Node.js) |

---

## Design Philosophy

### 1. Human-in-the-Loop (HITL)
Every AI-generated output — summaries, findings, recommendations — is clearly labeled and requires human review before finalization. The AI is a powerful assistant, not a decision-maker.

### 2. Chain of Custody by Design
SHA-256 hashing of every evidence file, immutable audit logging of every action, and role-based access controls ensure that the platform supports legally defensible investigation processes.

### 3. Principle of Least Privilege
Users see only what they own or have been explicitly granted access to. The platform enforces this at the database query level, not just the UI level, preventing data leakage through API calls.

### 4. Security First
Authentication, isolation, rate limiting, input validation, and audit logging were built into the platform from day one — not added as an afterthought.

### 5. Investigator-Centric UX
The interface is designed for investigators working long hours under pressure. Dark-first design, keyboard-friendly navigation, toast notifications, and inline editing reduce cognitive load.

---

## Use Case Scenarios

### Scenario A: Ransomware Incident Response
1. Investigator creates a new `Critical` priority case for a ransomware attack
2. Uploads Windows Event Logs (`.evtx`), firewall logs (`.log`), and network captures
3. Platform auto-parses and identifies: **T1110 Brute Force** → **T1078 Valid Account Login** → **T1059 Script Execution** → **T1041 Exfiltration** chain
4. AbuseIPDB flags attacker IP with 98% malicious score
5. RAG Chat answers *"When was the first unauthorized access?"* with exact timestamp
6. AI generates a draft incident report with executive summary and IOC list
7. Investigator edits the draft, approves findings, and exports a PDF for management

### Scenario B: Insider Threat Investigation
1. HR requests a forensic investigation into a suspicious employee
2. Investigator creates a case, shares it with the legal team via email
3. Evidence is uploaded (audit logs, email exports, file access records)
4. Timeline reveals privilege escalation and unusual data transfer patterns
5. Threat Intel identifies downloaded files as malicious hashes
6. Report is generated, reviewed by legal team, and formally approved
7. All actions are captured in the immutable audit trail for legal proceedings

### Scenario C: Multi-Investigator Collaboration
1. Senior investigator creates a complex case and shares it with three team members
2. Each member uploads their assigned evidence files from different sources
3. Unified timeline aggregates all events chronologically across all sources
4. Team discusses findings using the Case RAG Chat for rapid evidence queries
5. Lead analyst generates and reviews the final AI-drafted report before export

---

## Team & Technology Credits

| Component | Technology | Version |
|---|---|---|
| React | Facebook/Meta | 18.3.1 |
| Vite | ViteJS Team | 6.4.1 |
| Express.js | TJ Holowaychuk | 4.21.1 |
| MongoDB | MongoDB Inc. | Atlas M0 |
| Mongoose | Automattic | 8.8.3 |
| Framer Motion | Framer | 11.12.0 |
| Recharts | Recharts Group | 2.14.1 |
| Lucide Icons | Lucide Contributors | 0.460.0 |
| PDFKit | DevonGovett | 0.15.1 |
| @simplewebauthn | SimpleWebAuthn | 13.2.x |

---

## Links & Resources

| Resource | URL |
|---|---|
| **Live Application** | https://forensicai-app.vercel.app/ |
| **GitHub Repository** | https://github.com/cybersecurity26/ForensicAI |
| **API Documentation** | `/API.md` in repository |
| **SRS Document** | `/ForensicAI_SRS.md` in repository |
| **Platform Documentation** | `/documentation.md` in repository |

---

*ForensicAI — Built with ❤️ for the cybersecurity community. © 2026 ForensicAI. MIT License.*
