# Software Requirements Specification

## for

# ForensicAI — Digital Forensics Intelligence Platform

**Focus: AI-Powered Evidence Analysis and Forensic Report Generation using Mistral AI**

**Version 1.0 — Approved**

Prepared by:
- RTRP-2026-G1023

---

## Table of Contents

| Section | Title | Page |
|---------|-------|------|
| | Revision History | ii |
| 1 | Introduction | 1 |
| 1.1 | Purpose | 1 |
| 1.2 | Document Conventions | 1 |
| 1.3 | Intended Audience and Reading Suggestions | 1 |
| 1.4 | Product Scope | 1 |
| 1.5 | References | 2 |
| 2 | Overall Description | 2 |
| 2.1 | Product Perspective | 2 |
| 2.2 | Product Functions | 2 |
| 2.3 | User Classes and Characteristics | 3 |
| 2.4 | Operating Environment | 3 |
| 2.5 | Design and Implementation Constraints | 4 |
| 2.6 | User Documentation | 4 |
| 2.7 | Assumptions and Dependencies | 4 |
| 3 | External Interface Requirements | 4 |
| 3.1 | User Interfaces | 4 |
| 3.2 | Hardware Interfaces | 5 |
| 3.3 | Software Interfaces | 5 |
| 3.4 | Communications Interfaces | 5 |
| 4 | System Features | 5 |
| 4.1 | Evidence Upload and Integrity Verification | 5 |
| 4.2 | Automated Log Parsing and Event Extraction | 6 |
| 4.3 | AI-Powered Forensic Report Generation | 6 |
| 4.4 | Case Management and Lifecycle Tracking | 7 |
| 4.5 | Timeline Reconstruction | 7 |
| 4.6 | Authentication and Two-Factor Security | 8 |
| 4.7 | Dashboard and Analytics | 8 |
| 5 | Other Nonfunctional Requirements | 9 |
| 5.1 | Performance Requirements | 9 |
| 5.2 | Safety Requirements | 9 |
| 5.3 | Security Requirements | 9 |
| 5.4 | Software Quality Attributes | 9 |
| 5.5 | Business Rules | 10 |
| 5.6 | Other Requirements | 10 |
| A | Appendix A: Glossary | 10 |
| B | Appendix B: Analysis Models | 11 |
| C | Appendix C: To Be Determined List | 14 |

---

## Revision History

| Name | Date | Reason For Changes | Version |
|------|------|--------------------|---------|
| G1023 | 03-04-2026 | Initial SRS creation | 1.0 |
| | | | |
| | | | |

---

## 1. Introduction

### 1.1 Purpose

The purpose of this document is to define the software requirements for **ForensicAI — Digital Forensics Intelligence Platform**, a system that automates the analysis of digital evidence, reconstruction of event timelines, and generation of forensic investigation reports using artificial intelligence. This platform is designed to assist forensic investigators, cybersecurity analysts, and law enforcement personnel by replacing manual, error-prone evidence review processes with an intelligent, auditable, and reproducible workflow. It processes log files, network captures, and system artifacts — extracting structured events, detecting anomalies, and producing court-admissible forensic reports with AI-generated insights.

### 1.2 Document Conventions

This document follows IEEE 830 SRS formatting standards. Key terms are capitalized where they hold domain-specific meaning (e.g., Evidence, Case, Report, Timeline). Requirements are labeled using structured identifiers (e.g., REQ-1.1, REQ-2.3). Priority levels for features are classified as **High**, **Medium**, or **Low**. Severity levels for anomalies detected by the system include **Critical**, **High**, **Medium**, and **Low**. Tools, frameworks, and APIs are referred to by their common industry names (e.g., Mistral AI, MongoDB, WebAuthn).

### 1.3 Intended Audience and Reading Suggestions

This document is intended for:

- **Digital Forensic Investigators** who will use the platform for case analysis and report generation,

- **Cybersecurity Analysts** who will utilize timeline reconstruction and anomaly detection capabilities,

- **Development Team Members** who will build, maintain, and extend the system,

- **Project Reviewers / Evaluators** who will assess the system's architecture, scope, and completeness,

- **Law Enforcement IT Administrators** who may deploy the platform within institutional infrastructure.

Start with **Section 1** for project context, then review **Section 2** for an overview of capabilities and user classes. **Section 3** defines external interfaces, **Section 4** outlines functional requirements by feature, and **Section 5** discusses performance, security, and quality expectations.

### 1.4 Product Scope

ForensicAI provides an end-to-end digital forensics workflow — from evidence ingestion to final PDF report export. The platform focuses on automating the most time-intensive aspects of forensic investigation: log parsing, event correlation, timeline construction, and report writing. It leverages **Mistral AI** as its large language model backbone for generating forensic-grade report sections (Executive Summary, Key Findings, Technical Analysis, Recommendations) with per-section confidence scoring. The system enforces evidence integrity through **SHA-256 cryptographic hashing** with re-verification, maintains a complete **audit trail** of all user actions, and supports **WebAuthn passkey-based two-factor authentication** for secure access in sensitive environments.

### 1.5 References

- NIST SP 800-86: Guide to Integrating Forensic Techniques into Incident Response
- RFC 3227: Guidelines for Evidence Collection and Archiving
- ISO/IEC 27037:2012 — Guidelines for Digital Evidence Identification and Collection
- WebAuthn Level 2: W3C Web Authentication API — https://www.w3.org/TR/webauthn-2/
- Mistral AI API Documentation: https://docs.mistral.ai/
- MongoDB Documentation: https://www.mongodb.com/docs/
- Express.js Documentation: https://expressjs.com/

---

## 2. Overall Description

### 2.1 Product Perspective

ForensicAI is a standalone, full-stack web application that complements traditional forensic toolkits (EnCase, FTK, Autopsy) by providing an AI-assisted analysis and reporting layer. While existing tools focus on disk imaging and artifact extraction, ForensicAI bridges the gap between raw evidence and actionable intelligence. It combines structured log parsing with semantic AI analysis, enabling investigators to move from evidence to report in minutes rather than days. The system uses a **React + Vite** frontend, **Express.js + Node.js** backend, and **MongoDB** database, with **Mistral AI API** for intelligent content generation.

### 2.2 Product Functions

The ForensicAI platform must perform the following major functions:

**Evidence Management Functions**
- Accept digital evidence files from investigators via drag-and-drop upload
- Support multiple evidence formats (.log, .txt, .csv, .json, .xml, .pcap, .evtx, .img, .dd, .zip)
- Compute SHA-256 cryptographic hashes on upload for tamper detection
- Enable hash re-verification at any point with full audit logging
- Store and manage evidence files with metadata and parsed content

**Automated Analysis Functions**
- Parse log files using multi-pattern regex extraction (forensic, syslog, ISO timestamp formats)
- Extract timestamped events with severity level, source, and detail separation
- Detect anomalies by flagging ERROR, CRITICAL, and FATAL entries automatically
- Reconstruct chronological event timelines across all evidence in a case

**AI-Powered Reporting Functions**
- Generate forensic report sections using Mistral AI (Executive Summary, Key Findings, Timeline Analysis, Technical Analysis, Recommendations)
- Provide per-section AI confidence scores for transparency
- Support rich-text editing with markdown formatting for manual refinements
- Track edit history with previous content and timestamps for every section change
- Export finalized reports as professional PDF documents with headers, footers, and formatting

**Case Management Functions**
- Create, read, update, and delete investigation cases
- Assign case priority levels (Low, Medium, High, Critical) with visual color coding
- Track case lifecycle through status workflow (Draft → Active → Review → Closed → Archived)
- Auto-generate unique case numbers in `FR-YYYY-NNNN` format
- Link evidence files and reports to their parent case

**Security and Authentication Functions**
- Authenticate users via JWT tokens with 24-hour expiry
- Support WebAuthn passkey-based two-factor authentication (fingerprint, Face ID, security key)
- Enforce configurable auto-logout inactivity timers (15 / 30 / 60 / 240 minutes)
- Log every system action in a comprehensive audit trail with user ID, IP address, and user agent

### 2.3 User Classes and Characteristics

ForensicAI is designed to serve distinct user groups within the digital forensics and cybersecurity domain. Each user class has specific roles, expertise levels, and expectations from the system.

**Digital Forensic Investigators**

- Characteristics: Specialized training in evidence handling, chain-of-custody protocols, and forensic methodologies. Varying levels of technical depth in log analysis.
- Usage Frequency: Daily
- Needs:
  - Rapid evidence upload with automatic integrity verification
  - Automated parsing that handles diverse log formats without manual configuration
  - AI-generated report drafts that follow accepted forensic report structure
  - PDF export for court submissions and case documentation
- Benefits: Reduces investigation turnaround from days to hours while maintaining evidence integrity.

**Cybersecurity Analysts / Incident Responders**

- Characteristics: Strong technical background in network security, system administration, and threat detection. Familiar with log analysis and SIEM tools.
- Usage Frequency: Regular (during active incident investigations)
- Needs:
  - Timeline reconstruction with severity-based color coding
  - Anomaly highlighting for rapid threat identification
  - Multi-format evidence support (network logs, system logs, application logs)
  - Quick access to filtered and correlated events
- Benefits: Accelerates incident response by automating event correlation and timeline analysis.

**Law Enforcement IT Personnel**

- Characteristics: Institutional users managing forensic infrastructure. May have limited forensic expertise but oversee platform deployment and access control.
- Usage Frequency: Periodic (case oversight, audit review, system administration)
- Needs:
  - Comprehensive audit trails for legal compliance
  - Role-based access and secure authentication (2FA)
  - Tamper-proof evidence integrity verification
  - Exportable audit logs for legal proceedings
- Benefits: Ensures forensic processes meet legal admissibility requirements and chain-of-custody standards.

**Corporate IT Security Teams**

- Characteristics: Internal security staff investigating policy violations, data breaches, or insider threats within the organization.
- Usage Frequency: Periodic (during internal investigations)
- Needs:
  - Private case management with priority tracking
  - AI-assisted report generation for internal stakeholders
  - Secure authentication to protect sensitive investigation data
  - Dashboard metrics for investigation portfolio overview
- Benefits: Provides structured investigation management and consistent report quality for internal audits.

### 2.4 Operating Environment

- **Operating Systems**: Windows 10+, macOS 12+, Linux (Ubuntu 20.04+)
- **Browsers**: Chrome 90+, Firefox 90+, Edge 90+, Safari 15+ (WebAuthn support required for 2FA)
- **Runtime**: Node.js 18+ with npm 9+
- **Database**: MongoDB 6.0+ (local installation or MongoDB Atlas cloud)
- **Hosting**: Local development server or cloud deployment (Render, Railway, AWS EC2, Docker)
- **External APIs**: Mistral AI API (requires valid API key)

### 2.5 Design and Implementation Constraints

- Must use **React 18** with **Vite** build tooling for the frontend
- Must use **Express.js 4.x** on **Node.js 18+** for the backend
- Must use **MongoDB** with **Mongoose ODM** for the database layer
- Must use **Mistral AI API** as the primary AI engine for report generation
- Must follow **RESTful API** design principles for all server endpoints
- Must implement **JWT-based** stateless authentication
- Must use **bcryptjs** with 12 salt rounds for password hashing
- Must comply with evidence integrity best practices (SHA-256 hashing, audit trails)
- Must implement **WebAuthn Level 2** specification for passkey-based 2FA
- File uploads handled via **Multer** with file type validation and size limits

### 2.6 User Documentation

- Web application interface with intuitive navigation (sidebar + header)
- In-app tooltips and status indicators for evidence processing stages
- Settings page with four configuration tabs (Profile, Security, AI Engine, Notifications)
- API route documentation for backend integration
- Environment configuration guide (.env setup)

### 2.7 Assumptions and Dependencies

- Investigators have access to digital evidence files in supported formats (.log, .txt, .csv, .json, .xml, .pcap, .evtx, .img, .dd, .zip).
- The Mistral AI API will be available, responsive, and within usage limits during report generation.
- MongoDB is properly configured and accessible (locally or via cloud connection string).
- Users have modern browsers with WebAuthn support for passkey-based two-factor authentication.
- The server operates in a trusted network environment; HTTPS termination is handled at the infrastructure level for production deployments.
- Evidence files do not exceed reasonable size limits for web upload (configurable via Multer).
- Users have basic familiarity with forensic investigation workflows and terminology.

---

## 3. External Interface Requirements

### 3.1 User Interfaces

- **Login / Registration Page**: Glassmorphic authentication card with animated RGB gradient border (15-second active, 5-second sleep animation cycle). Smooth toggle between Sign In and Sign Up forms. Passkey verification screen displayed when 2FA is enabled.

- **Dashboard**: Four stat cards displaying active cases, evidence files, reports generated, and integrity alerts. Line chart for case and report creation activity over time. Donut chart for evidence file type distribution. Quick-access panel showing recent cases with status badges.

- **Case Management**: Tabular case listing with status badges (Draft, Active, Review, Closed, Archived), priority indicators, and action buttons. Case detail view with linked evidence, timeline access, notes, and report navigation.

- **Evidence Upload**: React Dropzone drag-and-drop interface with visual upload feedback and status tracking (Uploading → Hashing → Verified → Parsing → Parsed). File type validation and SHA-256 hash display.

- **Timeline View**: Vertical chronological event timeline with severity-based color coding (Info: blue, Warning: amber, Danger: red, Critical: purple). Source grouping and anomaly highlighting.

- **Report Editor**: Section-based editor with AI generation trigger, per-section confidence scores, markdown formatting toolbar, section status workflow (Empty → Draft → Reviewed → Approved), edit history viewer, and PDF export button.

- **Settings**: Four-tab settings page — Profile (name, email, organization), Security (password change, 2FA toggle, session timeout, passkey management), AI Engine (provider, model, API key, temperature, max tokens, tone), Notifications (toggle alerts for cases, evidence, AI reports, security, maintenance).

### 3.2 Hardware Interfaces

The system is web-based and does not require specialized hardware beyond standard computing and server environments.

Recommended specifications:
- **Minimum**: 2-core CPU, 4 GB RAM, 10 GB storage
- **Recommended**: 4-core CPU, 8 GB RAM, SSD storage, 50 GB+ for evidence files
- **2FA Hardware**: FIDO2-compliant security key, or device with fingerprint/Face ID sensor (for WebAuthn passkeys)

### 3.3 Software Interfaces

- **Database**: MongoDB 6.0+ via Mongoose ODM — stores Users, Cases, Evidence (with parsed events), Reports (with sections and edit history), and AuditLogs.

- **AI Engine**: Mistral AI REST API — accepts evidence context (parsed events, timeline data, anomalies) and returns structured forensic report sections with confidence scores.

- **Authentication**: JSON Web Tokens (jsonwebtoken library) for stateless auth; SimpleWebAuthn server/browser libraries for WebAuthn passkey registration and verification.

- **File Processing**: Multer for multipart upload handling; Node.js crypto module for SHA-256 hashing; custom parser utility for multi-format log extraction.

- **PDF Generation**: PDFKit library for server-side PDF rendering with formatted headers, footers, sections, and metadata.

- **Security Middleware**: Helmet for HTTP security headers; express-rate-limit for API throttling; express-validator for input sanitization.

### 3.4 Communications Interfaces

- **Protocol**: HTTPS-based REST API communication between React frontend (port 5173) and Express backend (port 5000).
- **Authentication**: All authenticated API calls include `Authorization: Bearer <JWT>` header. Tokens expire after 24 hours.
- **CORS**: Whitelist-based Cross-Origin Resource Sharing configured for frontend origin.
- **Rate Limiting**: 200 requests per 15-minute window per IP address to prevent abuse.
- **Request Logging**: Morgan middleware logs all HTTP requests with method, URL, status code, and response time.
- **File Transfer**: Multipart form-data encoding for evidence file uploads via Axios HTTP client.

---

## 4. System Features

### 4.1 Evidence Upload and Integrity Verification

**Description and Priority**

Description: This feature allows investigators to upload digital evidence files through a drag-and-drop interface. The system computes a SHA-256 cryptographic hash for each file on upload and stores it alongside the evidence record. Investigators can re-verify evidence integrity at any time by triggering a hash re-computation and comparison.

Priority: **High**

**Stimulus/Response Sequences**

- User Action: Investigator drags evidence files onto the upload zone.
- System Response: Files are uploaded via Multer, SHA-256 hash is computed, and evidence record is created in MongoDB with status "verified."

- User Action: Investigator clicks the "Verify" button on an existing evidence item.
- System Response: System re-computes the SHA-256 hash from the stored file and compares it to the original hash. Match/mismatch result is displayed and logged in the audit trail.

- User Action: Investigator uploads an unsupported file type.
- System Response: System rejects the upload and displays a validation error message.

**Functional Requirements**

- REQ-1.1: The system shall accept evidence file uploads via a drag-and-drop interface (React Dropzone).
- REQ-1.2: The system shall validate uploaded files against supported formats (.log, .txt, .csv, .json, .xml, .pcap, .evtx, .img, .dd, .zip).
- REQ-1.3: The system shall compute a SHA-256 cryptographic hash for each uploaded file using stream-based processing.
- REQ-1.4: The system shall store the computed hash alongside the evidence record in the database.
- REQ-1.5: The system shall allow re-verification of evidence integrity by re-computing and comparing SHA-256 hashes.
- REQ-1.6: The system shall log all upload and verification actions in the audit trail with user ID, IP address, and timestamp.
- REQ-1.7: The system shall display evidence processing status progression (Uploading → Hashing → Verified → Parsing → Parsed).

### 4.2 Automated Log Parsing and Event Extraction

**Description and Priority**

Description: Upon evidence upload, the system automatically parses log files to extract structured events. The parser supports multiple timestamp and log formats through a multi-pattern regex strategy, extracting timestamp, severity level, source, and event detail from each line. Anomalous entries (ERROR, CRITICAL, FATAL) are automatically flagged.

Priority: **High**

**Stimulus/Response Sequences**

- User Action: Investigator uploads a .log or .txt evidence file.
- System Response: File is parsed line-by-line. Extracted events are stored in the Evidence document's parsedData field. Evidence status changes to "parsed."

- User Action: Log file contains mixed timestamp formats (e.g., syslog and ISO).
- System Response: Parser tries three regex patterns per line (forensic, syslog, ISO) and uses the first match.

**Functional Requirements**

- REQ-2.1: The system shall automatically parse uploaded evidence files with extensions .log, .txt, and .csv.
- REQ-2.2: The system shall support three timestamp formats: forensic (`YYYY-MM-DD HH:MM:SS`), syslog (`Mon DD HH:MM:SS`), and ISO 8601 (`YYYY-MM-DDTHH:MM:SSZ`).
- REQ-2.3: The system shall extract the following fields from each log line: timestamp, severity level, source identifier, and event detail.
- REQ-2.4: The system shall flag entries with severity levels ERROR, CRITICAL, or FATAL as anomalies.
- REQ-2.5: The system shall store all extracted events in the `Evidence.parsedData.events[]` array.
- REQ-2.6: The system shall generate a summary of parsed content including total event count, anomaly count, and time range.
- REQ-2.7: The system shall handle unparseable lines gracefully without terminating the parsing process.

### 4.3 AI-Powered Forensic Report Generation

**Description and Priority**

Description: This feature sends parsed evidence data (events, anomalies, timeline information) to the Mistral AI API, which generates structured forensic report sections. Each section includes an AI confidence score. Investigators can edit generated content, and all changes are tracked with full edit history.

Priority: **High**

**Stimulus/Response Sequences**

- User Action: Investigator clicks "Generate Report" on a case.
- System Response: System collects all parsed evidence and timeline data, sends it to Mistral AI with forensic-specific prompts, and populates report sections (Executive Summary, Key Findings, Timeline Analysis, Technical Analysis, Recommendations).

- User Action: Investigator edits an AI-generated section.
- System Response: Edit is saved with previous content preserved in edit history. Section status updates accordingly.

- User Action: Investigator clicks "Export PDF."
- System Response: PDFKit generates a formatted PDF with all report sections, metadata, headers, and footers.

**Functional Requirements**

- REQ-3.1: The system shall generate report sections by sending evidence context to the Mistral AI API.
- REQ-3.2: The system shall use domain-specific prompt engineering (e.g., "You are a digital forensics expert...") for contextually appropriate output.
- REQ-3.3: The system shall display an AI confidence score (percentage) for each generated section.
- REQ-3.4: The system shall support five report section types: Executive Summary, Key Findings, Timeline Analysis, Technical Analysis, and Recommendations.
- REQ-3.5: The system shall allow investigators to edit generated sections with a markdown formatting toolbar.
- REQ-3.6: The system shall maintain a complete edit history for each section (previous content, editor, timestamp).
- REQ-3.7: The system shall support section status workflow: Empty → Draft → Reviewed → Approved.
- REQ-3.8: The system shall export finalized reports as PDF documents with professional formatting.
- REQ-3.9: The system shall handle Mistral AI API errors gracefully and display appropriate error messages.

### 4.4 Case Management and Lifecycle Tracking

**Description and Priority**

Description: Investigators can create and manage forensic cases with metadata such as title, description, priority, assigned investigator, and tags. Each case follows a lifecycle from creation to archival and serves as the organizational unit linking evidence, timelines, and reports.

Priority: **High**

**Stimulus/Response Sequences**

- User Action: Investigator creates a new case with title, description, and priority.
- System Response: Case is created with auto-generated case number (e.g., `FR-2026-0001`) and default status "Draft."

- User Action: Investigator updates case status from "Active" to "Review."
- System Response: Status is updated, and change is recorded in the audit log.

**Functional Requirements**

- REQ-4.1: The system shall provide CRUD operations for investigation cases (create, read, update, delete).
- REQ-4.2: The system shall auto-generate unique case numbers in the format `FR-YYYY-NNNN`.
- REQ-4.3: The system shall support case status workflow: Draft → Active → Review → Closed → Archived.
- REQ-4.4: The system shall support four priority levels: Low, Medium, High, Critical — with visual color coding.
- REQ-4.5: The system shall allow linking evidence files and reports to cases via foreign key references.
- REQ-4.6: The system shall support free-text tags and investigator notes per case.
- REQ-4.7: The system shall log all case operations in the audit trail.

### 4.5 Timeline Reconstruction

**Description and Priority**

Description: The system aggregates parsed events from all evidence files associated with a case and constructs a unified chronological timeline. Events are sorted by timestamp, color-coded by severity, grouped by source, and anomalies are visually highlighted.

Priority: **Medium**

**Stimulus/Response Sequences**

- User Action: Investigator navigates to the Timeline view for a specific case.
- System Response: System queries all evidence linked to the case, aggregates their parsed events, sorts by timestamp, and renders a vertical timeline with severity color coding.

**Functional Requirements**

- REQ-5.1: The system shall aggregate events from all evidence files linked to a given case.
- REQ-5.2: The system shall sort events in ascending chronological order by timestamp.
- REQ-5.3: The system shall color-code timeline entries by severity (Info: blue, Warning: amber, Danger: red, Critical: purple).
- REQ-5.4: The system shall group timeline events by source system or file origin.
- REQ-5.5: The system shall visually highlight entries flagged as anomalies.

### 4.6 Authentication and Two-Factor Security

**Description and Priority**

Description: The system provides secure user authentication using JWT tokens and optional WebAuthn passkey-based two-factor authentication. Users register with email and password (hashed with bcryptjs), and can enable 2FA using hardware security keys or biometric authenticators (fingerprint, Face ID).

Priority: **High**

**Stimulus/Response Sequences**

- User Action: User logs in with email and password (2FA disabled).
- System Response: Credentials validated, full JWT issued with 24-hour expiry.

- User Action: User logs in with email and password (2FA enabled).
- System Response: Credentials validated, temporary 5-minute login token issued. User is prompted for passkey verification.

- User Action: User completes passkey verification (fingerprint/Face ID/security key).
- System Response: WebAuthn response verified, full JWT issued, user redirected to Dashboard.

**Functional Requirements**

- REQ-6.1: The system shall hash passwords using bcryptjs with 12 salt rounds before storage.
- REQ-6.2: The system shall issue JWT tokens with 24-hour expiry upon successful authentication.
- REQ-6.3: The system shall support optional WebAuthn passkey-based two-factor authentication.
- REQ-6.4: The system shall implement a two-step 2FA flow: password verification → temporary token → passkey challenge → full JWT.
- REQ-6.5: The system shall store WebAuthn challenges in memory with a 120-second TTL.
- REQ-6.6: The system shall allow users to register and manage multiple passkeys from the Settings page.
- REQ-6.7: The system shall support configurable auto-logout inactivity timers (15, 30, 60, 240 minutes).
- REQ-6.8: The system shall validate all authentication inputs using express-validator.

### 4.7 Dashboard and Analytics

**Description and Priority**

Description: A visual dashboard presents investigation portfolio statistics including active case counts, evidence volumes, report generation metrics, and integrity alert summaries. Interactive charts display trends over time and evidence type distributions.

Priority: **Medium**

**Stimulus/Response Sequences**

- User Action: Investigator opens the Dashboard.
- System Response: System displays stat cards, activity line chart, evidence distribution donut chart, and recent cases list with status badges.

**Functional Requirements**

- REQ-7.1: The system shall display four summary statistics: active cases, evidence files, reports generated, and integrity alerts.
- REQ-7.2: The system shall render a line chart of case and report creation activity over time (Recharts).
- REQ-7.3: The system shall render a donut chart showing evidence file type distribution.
- REQ-7.4: The system shall display a quick-access panel of recent cases with status badges and priority indicators.
- REQ-7.5: The system shall fetch all dashboard data from dedicated API endpoints.

---

## 5. Other Nonfunctional Requirements

### 5.1 Performance Requirements

- Average evidence file hash computation: < 5 seconds per file (for files up to 100 MB).
- Log parsing throughput: Capable of processing 10,000+ log lines per file.
- AI report generation turnaround: < 60 seconds per full report (dependent on Mistral AI API latency).
- API response time: < 500ms for CRUD operations under normal load.
- Frontend page load time: < 2 seconds with Vite-optimized bundle.
- Supports concurrent evidence uploads (up to 10 files simultaneously via Multer).

### 5.2 Safety Requirements

- The system must never modify original evidence files; all operations are performed on copies or database records.
- In case of AI API failure, the system must display a clear error message and allow manual report creation.
- All user actions must be logged in the audit trail for post-incident review and chain-of-custody documentation.
- Evidence hash verification failures must generate prominent alerts to the investigator.
- System must prevent deletion of evidence linked to active cases without explicit confirmation.

### 5.3 Security Requirements

- JWT-based stateless authentication with 24-hour token expiry and Bearer header transport.
- Passwords hashed with bcryptjs (12 salt rounds); plaintext passwords are never stored or logged.
- WebAuthn passkey-based 2FA using FIDO2-compliant authenticators (phishing-resistant).
- HTTP security headers enforced via Helmet middleware (CSP, X-Frame-Options, HSTS, etc.).
- API rate limiting: 200 requests per 15-minute window per IP address.
- Input validation and sanitization on all public-facing endpoints via express-validator.
- CORS restricted to whitelisted frontend origins.
- Environment variables (.env) used for all secrets (JWT_SECRET, MISTRAL_API_KEY, MONGODB_URI).
- Audit logging captures user ID, IP address, user agent, and timestamp for every action (21 distinct action types).

### 5.4 Software Quality Attributes

- **Reliability**: System must handle failed Mistral AI API responses gracefully with fallback error states. MongoDB connection failures must trigger automatic reconnection attempts.
- **Maintainability**: Modular MVC architecture (Models → Routes/Controllers → React Views) with clean separation of concerns. Middleware chain pattern for cross-cutting concerns.
- **Extensibility**: New evidence parsers (e.g., for .pcap deep inspection) can be added as parser modules. New AI providers can be swapped by modifying the AI service layer.
- **Usability**: Investigator-first design with drag-and-drop uploads, one-click report generation, and visual status progression. Premium glassmorphic UI with smooth Framer Motion animations.
- **Scalability**: Stateless JWT auth eliminates server-side session storage. MongoDB's flexible schema accommodates varying evidence structures without migrations.

### 5.5 Business Rules

- **Evidence Integrity**: Every evidence file must have a SHA-256 hash computed and stored at upload time. Re-verification must be available at any point in the investigation lifecycle.
- **Audit Compliance**: All 21 action types (from `case_created` to `user_login_2fa` to `report_exported`) must be logged with full metadata for legal admissibility.
- **Report Provenance**: AI-generated sections must be clearly marked with confidence scores. Edit history must preserve the complete chain of modifications for transparency.
- **Case Lifecycle**: Cases cannot be deleted while in "Active" or "Review" status without explicit override.

### 5.6 Other Requirements

- Auto-generated case numbering with year-based sequencing (`FR-YYYY-NNNN`).
- PDF export must include report metadata (case number, date, investigator, status) in headers/footers.
- Settings page must support AI engine configuration (model selection, temperature, max tokens, response tone).
- Notification preferences configurable per user for case updates, evidence events, AI completions, security alerts, and maintenance notices.
- Session timeout configurable per user (15 / 30 / 60 / 240 minutes) from the Security settings tab.

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| SHA-256 | Secure Hash Algorithm producing a 256-bit cryptographic digest for file integrity verification |
| JWT | JSON Web Token — a compact, URL-safe token format for stateless authentication |
| WebAuthn | W3C Web Authentication API for passwordless and multi-factor authentication using hardware authenticators |
| FIDO2 | Fast Identity Online 2 — authentication standard supporting WebAuthn and CTAP protocols |
| 2FA | Two-Factor Authentication — requiring two forms of identity verification for access |
| bcrypt | Password hashing function using adaptive salt rounds to resist brute-force attacks |
| Mongoose ODM | Object-Document Mapper for MongoDB in Node.js providing schema validation and data modeling |
| Mistral AI | Large Language Model provider used for generating forensic report sections |
| LLM | Large Language Model — AI model trained on large text corpora for natural language generation |
| CORS | Cross-Origin Resource Sharing — HTTP mechanism allowing controlled cross-domain requests |
| REST API | Representational State Transfer — architectural style for web service communication |
| Multer | Express middleware for handling multipart/form-data file uploads |
| PDFKit | Node.js library for programmatic PDF document generation |
| AST | Abstract Syntax Tree — structural representation of parsed source code |
| Chain of Custody | Documented chronological history of evidence handling for legal admissibility |

---

## Appendix B: Analysis Models

### Database Diagram (ER Schema)

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
└────────────────┘       │ tags[]            │       │  └─ events[]     │
                         │ notes             │       │  └─ summary      │
                         └───────────────────┘       │  └─ anomalies[]  │
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

### Use Case Diagram

```
                          ┌──────────────────────────────────┐
                          │         ForensicAI System         │
                          │                                    │
   ┌──────────┐           │  ┌─────────────────────────────┐  │
   │Forensic  │           │  │   Register / Login          │  │
   │Investiga-│──────────►│  │   (Email + Password + 2FA)  │  │
   │tor       │           │  └─────────────────────────────┘  │
   │          │           │  ┌─────────────────────────────┐  │
   │          │──────────►│  │   Manage Cases (CRUD)       │  │
   │          │           │  └─────────────────────────────┘  │
   │          │           │  ┌─────────────────────────────┐  │
   │          │──────────►│  │   Upload Evidence           │  │
   │          │           │  │   (Drag & Drop + Hashing)   │  │
   │          │           │  └─────────────────────────────┘  │
   │          │           │  ┌─────────────────────────────┐  │
   │          │──────────►│  │   View Timeline             │  │
   │          │           │  └─────────────────────────────┘  │
   │          │           │  ┌─────────────────────────────┐  │
   │          │──────────►│  │   Generate AI Report        │  │
   │          │           │  └─────────────────────────────┘  │
   │          │           │  ┌─────────────────────────────┐  │
   │          │──────────►│  │   Edit & Approve Sections   │  │
   │          │           │  └─────────────────────────────┘  │
   │          │           │  ┌─────────────────────────────┐  │
   │          │──────────►│  │   Export PDF Report         │  │
   │          │           │  └─────────────────────────────┘  │
   │          │           │  ┌─────────────────────────────┐  │
   │          │──────────►│  │   Verify Evidence Integrity │  │
   └──────────┘           │  └─────────────────────────────┘  │
                          │  ┌─────────────────────────────┐  │
   ┌──────────┐           │  │   View Dashboard & Stats    │  │
   │System    │──────────►│  └─────────────────────────────┘  │
   │Admin     │           │  ┌─────────────────────────────┐  │
   │          │──────────►│  │   Manage Settings / 2FA     │  │
   │          │           │  └─────────────────────────────┘  │
   │          │           │  ┌─────────────────────────────┐  │
   │          │──────────►│  │   Review Audit Logs         │  │
   └──────────┘           │  └─────────────────────────────┘  │
                          └──────────────────────────────────┘
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT (React + Vite)                      │
│                          Port: 5173                                 │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Pages                                                        │  │
│  │  ┌──────────┐ ┌───────┐ ┌────────────┐ ┌──────────────────┐  │  │
│  │  │ Login    │ │ Dash- │ │ Cases /    │ │ Evidence Upload │  │  │
│  │  │ (Auth)   │ │ board │ │ CaseDetail │ │ (Drag & Drop)  │  │  │
│  │  └──────────┘ └───────┘ └────────────┘ └──────────────────┘  │  │
│  │  ┌──────────┐ ┌─────────────────────┐ ┌──────────────────┐  │  │
│  │  │ Timeline │ │ Reports / Detail    │ │ Settings         │  │  │
│  │  │          │ │ (Edit + Export PDF) │ │ (Profile/2FA/AI) │  │  │
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
│  │ + Passkey│ │ + Tags   │ │ + Events │ │+Sections│ │ + IP/UA   │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                               │
│  ┌──────────────────────────┐  ┌────────────────────────────────┐  │
│  │  Mistral AI API          │  │  File System (uploads/)        │  │
│  │  (Report Generation)     │  │  (Evidence Storage)            │  │
│  └──────────────────────────┘  └────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Workflow / Data Flow — Evidence Processing Pipeline

```
Evidence File (.log/.txt/.csv)           User Login
       │                                    │
       ▼                                    ▼
  Multer Upload                      JWT Authentication
       │                                    │
       ▼                                    ▼
  SHA-256 Hashing                   2FA Check (passkeys?)
       │                               │          │
       ▼                              No          Yes
  Log Parser                          │           │
  (Multi-Pattern                      ▼           ▼
   Timestamp +                    Full JWT    WebAuthn Challenge
   Event Extraction)                              │
       │                                          ▼
       ▼                                    Passkey Verification
  MongoDB Storage                                 │
  (Evidence.parsedData)                           ▼
       │                                     Full JWT
       ▼
  Timeline Builder
  (Aggregate + Sort)
       │
       ▼
  AI Report Generation
  (Mistral AI API)
       │
       ▼
  PDF Export (PDFKit)
```

### Workflow / Data Flow — Investigator Report Workflow

```
  Investigator
       │
       ▼
  Create New Case ────────► Auto-assign case number (FR-YYYY-NNNN)
       │
       ▼
  Upload Evidence ────────► SHA-256 Hash ────► Store in MongoDB
       │
       ▼
  Auto-Parse Logs ────────► Extract Events + Flag Anomalies
       │
       ▼
  View Timeline ──────────► Chronological Events (color-coded)
       │
       ▼
  Generate AI Report ─────► Mistral AI ──► Sections + Confidence
       │
       ▼
  Review & Edit Sections ─► Markdown Editor + Edit History
       │
       ▼
  Approve Sections ────────► Status: Approved
       │
       ▼
  Export PDF Report ───────► PDFKit ──► Formatted Forensic Report
       │
       ▼
  Close / Archive Case ───► Audit Trail Complete
```

### Mock Up Screens

*(To be added)*

---

### Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/forensicai

# Authentication
JWT_SECRET=<your-secure-random-secret-key>

# AI Engine
MISTRAL_API_KEY=<your-mistral-api-key>

# Server
PORT=5000
NODE_ENV=development
UPLOAD_DIR=./uploads
```

---

## Appendix C: To Be Determined List

| Item | Description | Status |
|------|-------------|--------|
| TBD-1 | Cloud deployment configuration (Render/Railway/AWS) | Pending |
| TBD-2 | Deep PCAP file inspection parser module | Planned |
| TBD-3 | Multi-user role-based access control (RBAC) with admin panel | Under review |
| TBD-4 | Real-time collaborative case editing via WebSockets | Future scope |
| TBD-5 | Integration with external forensic tools (EnCase, FTK export) | Future scope |

---

*ForensicAI v1.0.0 — Digital Forensics Intelligence Platform*
*Built with React, Express, MongoDB, and Mistral AI*
