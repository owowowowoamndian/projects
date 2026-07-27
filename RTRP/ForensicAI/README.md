# 🔬 ForensicAI — Digital Forensics Investigation Platform

<div align="center">

**AI-Powered Digital Forensics Reporting & Evidence Analysis Suite**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## 📖 About

**ForensicAI** is a full-stack digital forensics investigation platform that combines the power of artificial intelligence with rigorous forensic methodologies. Built for cybersecurity professionals, incident responders, and digital forensics examiners, it streamlines the entire investigation lifecycle — from evidence collection and parsing to timeline reconstruction and AI-powered report generation.

The platform upholds the **Human-in-the-Loop** principle: AI assists with analysis and drafting, but all conclusions, findings, and recommendations must be reviewed and approved by qualified human investigators before finalization.

---

## ✨ Features

### Core Investigation
- **Case Management** — Create, track, and manage forensic investigations with status tracking, priority levels, and audit trails
- **Evidence Upload & Parsing** — Drag-and-drop upload supporting LOG, CSV, JSON, TXT, XML, PCAP, EVTX formats with automatic format detection
- **SHA-256 Integrity Hashing** — Every uploaded file is immediately hashed for chain-of-custody verification
- **Timeline Reconstruction** — Unified, filterable event timelines across multiple evidence sources with severity classification and date grouping
- **Threat Indicators (IOCs) Dashboard** — Global aggregated board displaying all parsed IP reputation and malware hash threats across cases with filters, origin case linkage, and copy helpers

### Access Control & Collaboration
- **Case Ownership** — Each case tracks its creator (`createdBy`) and is only visible to the owner, admins, and explicitly shared users
- **Case Sharing** — Share cases with other users by email; shared users gain read access to case details, evidence, reports, and timelines
- **Revoke Access** — Case owners and admins can revoke shared access at any time via the Share Modal
- **Viewer Role Restrictions** — Viewers can browse and chat but cannot create, edit, delete, upload, or generate content
- **Admin Override** — Admins retain full visibility and management access across all cases
- **User-Scoped Notifications** — Notification bell and activity feed show only the logged-in user's own actions
- **Ownership Migration** — Admin-only tool to backfill ownership on legacy cases based on assignee data

### AI & Threat Intelligence Integration
- **Automated Report Generation** — AI generates draft forensic reports with executive summaries, key findings, timelines, and recommendations
- **Case Chat RAG Copilot** — Interactive assistant to ask natural language questions about logs within a specific case, retrieving top-scored relevant logs as prompt context
- **MITRE ATT&CK Rule Mapper** — Automatically correlates parsed log events to standard attacker Tactics & Techniques, showing them in an interactive visual matrix
- **Multi-API Reputation Feeds** — Dynamic queries to AbuseIPDB (for IP risk) and VirusTotal (for malware hashes) with credential health monitoring status badges
- **Multi-Provider Support** — Choose between OpenAI (GPT-4), Google Gemini, or Mistral AI for report generation
- **Editable Sections** — Each report section has an inline markdown toolbar for editing with Bold, Italic, Underline, Lists
- **Human Review Required** — AI-generated content is clearly labeled and requires human validation

### Security & Authentication
- **JWT Authentication** — Secure token-based sessions
- **Two-Stage Registration with Email Verification** — New signups receive a 6-digit OTP verification code via email and must verify it before account activation
- **In-App Email Verification Overlay** — Logged-in unverified users are blocked by a premium, glassmorphic overlay until their email is verified
- **Secure SMTP Mail Delivery** — Backend email notifications and OTP codes are delivered securely using Gmail SMTP server
- **Two-Factor Authentication (TOTP)** — Optional 2FA with authenticator app support
- **WebAuthn Passkeys** — Modern passwordless authentication
- **Role-Based Access Control** — Admin, Analyst, Viewer, and Investigator roles

### Platform Features
- **Interactive Dashboard** — Case activity charts, evidence type distribution, real-time activity feed (scoped to current user)
- **Global Search** — Live search across all cases, reports, and evidence files with categorized results
- **Real-Time Notifications** — Bell icon with unread count, read persistence, and chime sound alerts (scoped to current user)
- **Dark/Light Theme** — Full theme support with smooth transitions
- **Audit Logging** — Every action is recorded in an immutable audit trail
- **Legal Pages** — About, Privacy Policy, Terms of Use, Cookies Policy

---

## 🛠 Tech Stack

### Frontend (Client)
| Technology | Purpose |
|---|---|
| **React 18** | UI framework with hooks and functional components |
| **Vite 6** | Build tool and dev server with HMR |
| **React Router 6** | Client-side routing and navigation |
| **Framer Motion** | Smooth page transitions and micro-animations |
| **Recharts** | Interactive data visualization (charts, pie graphs) |
| **Lucide React** | Modern, consistent icon library |
| **React Dropzone** | Drag-and-drop file upload |
| **@simplewebauthn/browser** | WebAuthn passkey support |

### Backend (Server)
| Technology | Purpose |
|---|---|
| **Node.js 18+** | JavaScript runtime |
| **Express.js 4** | REST API framework |
| **MongoDB + Mongoose 8** | NoSQL database with ODM |
| **JSON Web Tokens** | Authentication and session management |
| **bcryptjs** | Password hashing |
| **Multer** | File upload middleware |
| **Helmet** | HTTP security headers |
| **express-rate-limit** | API rate limiting |
| **PDFKit** | PDF report generation |
| **@simplewebauthn/server** | WebAuthn server-side verification |

### AI Providers (configurable)
| Provider | Models |
|---|---|
| **OpenAI** | GPT-4, GPT-4o, GPT-3.5-turbo |
| **Google Gemini** | gemini-1.5-pro, gemini-1.5-flash |
| **Mistral** | mistral-large, mistral-medium |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or higher — [Download](https://nodejs.org)
- **MongoDB** v6 or higher — [Download](https://mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Git** — [Download](https://git-scm.com)
- **AI API Key** — From [OpenAI](https://platform.openai.com/api-keys), [Google AI Studio](https://aistudio.google.com/app/apikey), or [Mistral](https://console.mistral.ai/api-keys/)

### 1. Clone the Repository

```bash
git clone https://github.com/cybersecurity26/ForensicAI.git
cd ForensicAI
```

### 2. Set Up the Server

```bash
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `server/.env` with your configuration:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/forensicai
JWT_SECRET=your_secret_key_here_change_in_production
AI_PROVIDER=openai
AI_API_KEY=sk-your-api-key-here
AI_MODEL=gpt-4
AI_TEMPERATURE=0.3
AI_MAX_TOKENS=2048
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5368709120

# Threat Intelligence (Optional - for live reputations)
ABUSEIPDB_API_KEY=your_abuseipdb_api_key_here
VIRUSTOTAL_API_KEY=your_virustotal_api_key_here
```

Start the server:

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### 3. Set Up the Client

```bash
cd ../client

# Install dependencies
npm install

# Start development server
npm run dev
```

The client runs at **http://localhost:5173** and proxies API requests to the server at port 5000.

### 4. Create Your First Account

1. Open **http://localhost:5173** in your browser
2. Click **Register** on the login page
3. Fill in your name, email, and password
4. Log in and start creating cases!

---

## 📁 Project Structure

```
ForensicAI/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Reusable components (Header, Sidebar)
│   │   ├── context/            # React context (AuthContext)
│   │   ├── pages/              # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Cases.jsx
│   │   │   ├── CaseDetail.jsx
│   │   │   ├── EvidenceUpload.jsx
│   │   │   ├── Timeline.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── ReportDetail.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── ThreatIocs.jsx     # Aggregated IOCs dashboard
│   │   │   ├── MitreAttack.jsx    # MITRE ATT&CK visual matrix
│   │   │   ├── CaseChat.jsx       # Case RAG Chat chatbot
│   │   │   ├── Legal.jsx
│   │   │   └── Login.jsx
│   │   ├── api.js              # Centralized API calls
│   │   ├── index.css           # Global styles + design system
│   │   └── main.jsx            # App entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Express backend
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication middleware
│   │   └── audit.js            # Audit logging helper
│   ├── models/                 # Mongoose schemas
│   │   ├── Case.js
│   │   ├── Evidence.js
│   │   ├── Report.js
│   │   ├── User.js
│   │   └── AuditLog.js
│   ├── routes/                 # API route handlers
│   │   ├── auth.js             # Login, register, 2FA, passkeys
│   │   ├── cases.js            # Case CRUD operations + RAG Chat
│   │   ├── evidence.js         # File upload, parsing
│   │   ├── reports.js          # Report generation, editing
│   │   ├── timeline.js         # Timeline reconstruction
│   │   ├── dashboard.js        # Stats, activity, IOCs aggregator
│   │   ├── settings.js         # Profile, security, AI config
│   │   ├── audit.js            # Audit log retrieval
│   │   └── ai.js               # AI provider management
│   ├── services/
│   │   ├── aiService.js        # AI provider abstraction layer
│   │   └── threatIntelService.js # Threat Intelligence Integration (AbuseIPDB/VT)
│   ├── utils/
│   │   ├── parser.js           # Evidence file parser + timeline builder
│   │   ├── hash.js             # SHA-256 file hashing
│   │   └── attackMapper.js      # MITRE ATT&CK pattern mapper
│   ├── uploads/                # Uploaded evidence files (gitignored)
│   ├── server.js               # Express app entry point
│   ├── .env.example            # Environment variable template
│   └── package.json
│
├── documentation.md            # Platform documentation
├── ForensicAI_SRS.md           # Software Requirements Specification
├── .gitignore
└── README.md
```

---

## 🎨 Code Style

### JavaScript/JSX
- **ES Modules** (`import`/`export`) — both client and server use `"type": "module"`
- **Functional Components** with React Hooks (`useState`, `useEffect`, `useRef`, `useContext`)
- **Async/Await** for all asynchronous operations
- **Template Literals** for string interpolation
- **Destructuring** for props, state, and imports
- **Consistent Naming**:
  - Components: `PascalCase` (e.g., `CaseDetail.jsx`)
  - Functions/Variables: `camelCase` (e.g., `handleSearchSelect`)
  - Constants: `UPPER_SNAKE_CASE` for environment vars, `camelCase` for component-level
  - CSS Variables: `--kebab-case` (e.g., `--accent-primary`)

### CSS
- **CSS Variables** for theming (`--bg-primary`, `--text-primary`, `--accent-primary`)
- **Dark-first design** — dark mode is default, light mode via `[data-theme="light"]`
- **No CSS frameworks** — vanilla CSS with custom design system
- **BEM-inspired class naming** (e.g., `.sidebar-link`, `.header-icon-btn`)

### API Design
- **RESTful** routes — `GET /api/cases`, `POST /api/cases`, `PUT /api/cases/:id`
- **JSON responses** — all endpoints return `{ data }` or `{ error }`
- **Centralized error handling** — Express error middleware
- **Auth middleware** — `requireAuth` (mandatory) and `optionalAuth` (graceful)

---

## 🔀 Git Workflow

### Branch Strategy
```
main          ← production-ready code
```

### Commit Convention
Use conventional commit messages:

```
feat: add timeline reconstruction with date grouping
fix: resolve Mongoose subdoc spread bug in timeline
style: update tooltip colors for light theme
refactor: move search from static array to API endpoint
docs: add README and deployment guide
chore: add .gitignore for node_modules and uploads
```

### Making Changes

```bash
# 1. Pull latest changes
git pull origin main

# 2. Make your changes
# ... edit files ...

# 3. Stage changes
git add -A

# 4. Commit with descriptive message
git commit -m "feat: description of your change"

# 5. Push to remote
git push origin main
```

### What NOT to Commit
The `.gitignore` excludes:
- `node_modules/` — install via `npm install`
- `.env` — contains secrets (use `.env.example` as template)
- `server/uploads/` — user-uploaded evidence files
- `client/dist/` — build output (generated via `npm run build`)
- Large binary files (`.pptx`, `.docx`, `.pdf`)

---

## 🧪 Testing (Manual Testing)

### Authentication
| Test | Steps | Expected |
|---|---|---|
| Register | Go to `/login` → Register tab → fill form → submit | Account created, redirected to dashboard |
| Login | Enter email + password → submit | JWT issued, dashboard loads |
| 2FA Setup | Settings → Security → Enable 2FA → scan QR | 2FA enabled, required on next login |
| Logout | Click user avatar → Sign Out | Token cleared, redirected to login |

### Case Management
| Test | Steps | Expected |
|---|---|---|
| Create Case | Cases page → New Case → fill form → submit | Case created with auto-generated case number |
| View Case | Click on a case row | Case detail page with tabs (Overview, Evidence, Timeline, Notes) |
| Update Status | Case detail → change status dropdown | Status updated, audit log entry created |

### Evidence
| Test | Steps | Expected |
|---|---|---|
| Upload File | Evidence page → select case → drag & drop files | Files uploaded with SHA-256 hash |
| Parse Evidence | Click "Parse" or "Re-Parse All" | Events extracted, status changes to "parsed" |
| Verify Hash | Click verify icon on evidence item | Hash recalculated and compared |

### Reports
| Test | Steps | Expected |
|---|---|---|
| Generate Report | Reports page → Generate Report → select case | AI generates draft sections (executive summary, findings, timeline) |
| Edit Section | Click Edit on any section → modify text → Save | Changes persisted, toolbar appears inline |
| Export PDF | Click "Export PDF" button | PDF opens in new tab |

### Timeline
| Test | Steps | Expected |
|---|---|---|
| View Timeline | Timeline page → select case | Date-grouped events with severity badges |
| Filter Events | Use severity/source filter dropdowns | Events filtered, counts updated |
| Case Detail Tab | Case detail → Timeline tab | Same timeline view inline |

### Search & Notifications
| Test | Steps | Expected |
|---|---|---|
| Global Search | Type in header search bar (min 2 chars) | Categorized results (Page/Case/Report/Evidence) |
| Notifications | Click bell icon | Only shows YOUR actions, not other users' |
| Mark Read | Click notification or "Mark all read" | Persists across page reloads |

### Access Control & Sharing
| Test | Steps | Expected |
|---|---|---|
| Case Isolation | Log in as User A, create a case. Log in as User B | User B cannot see User A's case |
| Share Case | User A → Case Detail → Share → enter User B's email | User B can now see the case |
| Revoke Access | User A → Share Modal → Revoke User B | Case disappears from User B's list |
| Viewer Restrictions | Log in as viewer role | Cannot see New Case, Edit, Delete, Upload, Generate buttons |
| Admin Override | Log in as admin | Can see all cases from all users |
| Ownership Migration | Admin → Settings → Run Migration | Legacy cases get assigned to their respective users |

### Theme
| Test | Steps | Expected |
|---|---|---|
| Toggle Theme | Click sun/moon icon in header | Smooth switch between dark/light, persists in localStorage |
| Tooltip Visibility | Hover on charts in both themes | Tooltips readable in both dark and light mode |

---

## 📄 License

This project is built for educational and professional forensics use. See [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ for the cybersecurity community**

[Report Bug](https://github.com/cybersecurity26/ForensicAI/issues) · [Request Feature](https://github.com/cybersecurity26/ForensicAI/issues)

</div>
