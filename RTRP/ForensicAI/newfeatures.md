# ForensicAI — New Features Briefing (v1.1.0)
*Internal Team Documentation & Architecture Reference*

---

## Executive Summary
This document provides a detailed breakdown of the new features introduced in **ForensicAI v1.0.2 → v1.1.0**. The v1.0.2 release transitioned the platform from a simple log parser to a **comprehensive Threat Intelligence and AI-Assisted DFIR platform**. The v1.1.0 release adds **multi-user case isolation, collaboration, and access control** to make the platform production-ready for team environments.

---

## 1. MITRE ATT&CK Matrix Mapping

### Use & Description
The MITRE ATT&CK Mapping feature automatically correlates parsed log events directly to standardized adversary Tactics and Techniques. On the frontend, investigators are presented with an interactive, animated grid displaying active threat columns (such as Execution, Privilege Escalation, Credential Access, Defense Evasion, Discovery, Command & Control, and Exfiltration) which highlight and glow when matching activities are detected in log files.

### Purpose & Why We Added It
- **Framework Alignment**: Security operations teams and incident responders map attacks to the MITRE ATT&CK framework to standardize reports and analyze attacker coverage.
- **Immediate Triage**: Instead of manually reading line-by-line to identify what stage an attacker is in, the matrix visually maps out the attack progression immediately upon log upload.

### Tools & Platforms Used
- **Backend Rule Mapper (`server/utils/attackMapper.js`)**: A rule-based pattern matching engine that matches regexes to standard techniques.
- **Frontend Matrix View (`client/src/pages/MitreAttack.jsx`)**: Responsive CSS-grid based matrix with dynamic glow states and interactive technique details.

---

## 2. Threat Intelligence Integration (AbuseIPDB & VirusTotal)

### Use & Description
ForensicAI dynamically connects to AbuseIPDB and VirusTotal to check the reputation of IP addresses and file hashes extracted during log parsing.

### Tools & Platforms Used
- **AbuseIPDB API**: Live IP reputation scores.
- **VirusTotal API**: Antivirus reputation analysis.
- **Fallback Simulation Engine (`server/services/threatIntelService.js`)**: Generates deterministic risk scores when API keys are not supplied.

---

## 3. Threat Indicators (IOCs) Dashboard

Centralized, repository-wide board displaying all identified malicious threat indicators (IPs and file hashes) across all uploaded cases with text search, severity filters, origin case linkage, and copy helpers.

---

## 4. Case Chat RAG Copilot

Interactive chatbot allowing investigators to converse directly with their case evidence files in natural language with traceable citation cards.

---

## 5. Technical Stack & Environment Configurations

```ini
AI_PROVIDER=openai
AI_API_KEY=your_api_key_here
AI_MODEL=gpt-4o
ABUSEIPDB_API_KEY=your_abuseipdb_key
VIRUSTOTAL_API_KEY=your_virustotal_key
```

---

## 6. Configurable AI & Threat Intel Settings

API Key Management, Threat Severity Threshold slider, and RAG Context Limit configuration — all from the Settings UI.

---

## 7. Real-Time Dashboard Statistics

Threat Indicators count and Critical Threat Flags integrated into the main dashboard stats grid.

---

## 8. Compacted Legal Policies

Privacy, Terms, and Cookies policies updated with data integration transparency disclosures.

---

## 9. Case Ownership & Access Control (v1.1.0)

### Use & Description
Each case now tracks its creator (`createdBy`) and an explicit list of collaborators (`sharedWith`). Non-admin users only see cases they own or have been shared with. All backend routes enforce these access controls consistently.

### Purpose & Why We Added It
- **Multi-User Isolation**: In team environments, investigators should only see their own cases. This prevents accidental cross-contamination of evidence and maintains confidentiality.
- **Role-Based Enforcement**: Viewers can browse and chat but cannot create, edit, delete, upload, or generate any content.
- **Admin Override**: Administrators retain full visibility for oversight and compliance purposes.

### Technical Implementation
- **Case Model**: Added `createdBy` (ObjectId ref to User) and `sharedWith` (ObjectId[] ref to User) fields.
- **Access Helpers**: `buildAccessFilter()`, `canAccessCase()`, `getAccessibleCaseIds()`, and `isOwnerOrAdmin()` — used across all 6 route files (cases, evidence, reports, timeline, dashboard, audit).
- **ObjectId Type Safety**: A `toId()` helper extracts string IDs from populated Mongoose documents, raw ObjectIds, or strings uniformly. MongoDB queries convert string user IDs to ObjectIds for reliable `$or` matching.

---

## 10. Case Sharing & Collaboration (v1.1.0)

### Use & Description
Case owners and admins can share a case with any registered user by email. Shared users gain read access to the case detail, evidence, reports, timeline, MITRE matrix, and IOCs. Access can be revoked at any time.

### Purpose & Why We Added It
- **Controlled Collaboration**: Investigators often need to share findings with colleagues, legal teams, or management without giving them blanket access.
- **Revocable Access**: Access can be granted and revoked per-user, maintaining the principle of least privilege.

### Technical Implementation
- **API Endpoints**: `POST /cases/:id/share` (by email) and `DELETE /cases/:id/share/:userId` (revoke, with ObjectId conversion for `$pull`).
- **Share Case Modal** (`CaseDetail.jsx`): Animated modal with email invite form, shared user list with role badges, and per-user revoke buttons.
- **Audit Trail**: `case_shared` and `case_share_revoked` actions are logged.

---

## 11. Ownership Migration Tool (v1.1.0)

### Use & Description
An admin-only migration tool that backfills `createdBy` from the `assignee` field on legacy cases and fixes shortened assignee names (e.g., "Vinay T." → "Vinay Tirukoti") to full user names.

### Technical Implementation
- **Endpoint**: `POST /cases/migrate-ownership` — processes ALL cases, resolves users by ObjectId or fuzzy name matching.
- **Settings UI**: Admin-only "Migrate Case Ownership" button in Settings → Profile tab.

---

## 12. User-Scoped Notifications & Activity Feed (v1.1.0)

### Use & Description
The notification bell and dashboard activity feed now only display the logged-in user's own actions. Previously, all users saw a global feed of everyone's activities.

### Technical Implementation
- **Activity Feed** (`GET /dashboard/activity`): Filters AuditLog by `userId = reqUser.id` with ObjectId conversion.
- **Notifications** (`GET /dashboard/notifications`): Same userId filter applied to notification-worthy audit actions.

---

*ForensicAI v1.1.0 — Internal Release Briefing Document*
