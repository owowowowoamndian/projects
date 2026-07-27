# Security Policy

## 🔒 ForensicAI Security

ForensicAI is a **digital forensics investigation platform** that handles sensitive evidence data and investigation records. Security is a core priority. This document outlines our security practices, supported versions, and how to report vulnerabilities.

---

## Supported Versions

| Version | Supported |
|---|---|
| 1.1.x (current) | ✅ Active support |
| 1.0.x | ✅ Security fixes only |
| < 1.0 | ❌ No longer supported |

---

## 🛡️ Security Features

ForensicAI implements the following security measures:

### Authentication & Authorization
- **JWT-based authentication** with configurable token expiration
- **Two-Factor Authentication (TOTP)** via authenticator apps (Google Authenticator, Authy)
- **WebAuthn/FIDO2 Passkeys** for passwordless authentication
- **bcryptjs** password hashing with salt rounds
- **Role-Based Access Control (RBAC)** — Admin, Analyst, Investigator, Viewer
- **Case-Level Access Control** — Users only see cases they created or were explicitly shared with; ObjectId type-safe access checks across all 6 backend routes
- **User-Scoped Notifications** — Activity feeds and notifications are strictly scoped to the authenticated user

### Data Protection
- **SHA-256 integrity hashing** for all uploaded evidence files
- **Chain of custody** — immutable audit logs for every action
- **Input validation** via `express-validator` on all API endpoints
- **CORS** configured to allow only trusted origins

### Infrastructure Security
- **Helmet.js** — HTTP security headers (CSP, X-Frame-Options, HSTS, etc.)
- **Rate limiting** via `express-rate-limit` to prevent brute-force attacks
- **Environment variables** for all secrets (never hardcoded)
- **No sensitive data in version control** — `.env` files are gitignored

### Evidence Security
- Evidence files stored server-side with UUID-based filenames (original names preserved in DB only)
- File type validation on upload
- Maximum file size enforcement (configurable via `MAX_FILE_SIZE`)
- Hash verification available at any time to detect tampering

---

## 🚨 Reporting a Vulnerability

**⚠️ Do NOT open a public GitHub issue for security vulnerabilities.**

If you discover a security vulnerability in ForensicAI, please report it responsibly:

### 1. Contact

📧 Report via **GitHub Private Security Advisory**:
- Go to [ForensicAI Security Advisories](https://github.com/cybersecurity26/ForensicAI/security/advisories)
- Click **"New draft security advisory"**
- Fill in the details and submit

**Or** contact the maintainer directly via GitHub:
- [@cybersecurity26](https://github.com/cybersecurity26)

### 2. What to Include

Please provide as much detail as possible:

| Field | Description |
|---|---|
| **Type** | Authentication bypass, XSS, SQL Injection, IDOR, etc. |
| **Location** | Affected file, route, or component |
| **Steps to Reproduce** | Detailed, numbered steps |
| **Impact** | What an attacker could achieve |
| **Severity** | Critical / High / Medium / Low |
| **Proof of Concept** | Code, screenshots, or video (if possible) |
| **Suggested Fix** | Your recommendation (optional) |

### 3. Response Timeline

| Action | Timeline |
|---|---|
| Acknowledgment | Within **48 hours** |
| Initial assessment | Within **5 business days** |
| Fix development | Within **14 days** (critical), **30 days** (others) |
| Public disclosure | After fix is deployed |

### 4. What to Expect

- You will receive a confirmation that your report was received
- We will investigate and validate the vulnerability
- We will work on a fix and coordinate disclosure with you
- You will be credited in the security advisory (unless you prefer anonymity)

---

## 🔐 Security Best Practices for Deployment

If you're deploying ForensicAI, follow these guidelines:

### Environment Variables
```env
# Use a strong, unique JWT secret (32+ characters)
JWT_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">

# Use a secure MongoDB connection with authentication
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/forensicai

# Keep AI API keys secure
AI_API_KEY=<your-api-key>
```

### Production Checklist

- [ ] **Change all default secrets** — JWT_SECRET, database credentials
- [ ] **Enable HTTPS** — Vercel provides this automatically
- [ ] **Restrict CORS origins** — Only allow your frontend domain
- [ ] **Set NODE_ENV=production** — Disables verbose error messages
- [ ] **Enable MongoDB authentication** — Use dedicated database users
- [ ] **Restrict network access** — Limit MongoDB Atlas IP whitelist if possible
- [ ] **Monitor audit logs** — Review regularly for suspicious activity
- [ ] **Keep dependencies updated** — Run `npm audit` periodically
- [ ] **Back up the database** — Enable MongoDB Atlas automated backups
- [ ] **Rotate API keys** — Periodically rotate AI provider API keys

### Dependency Auditing

Regularly check for known vulnerabilities:

```bash
# Check server dependencies
cd server && npm audit

# Check client dependencies
cd client && npm audit

# Fix automatically where possible
npm audit fix
```

---

## 📋 Known Security Considerations

| Area | Status | Notes |
|---|---|---|
| Password hashing | ✅ Secure | bcryptjs with auto-salt |
| JWT tokens | ✅ Secure | Configurable expiry, stored client-side |
| File uploads | ✅ Validated | UUID filenames, size limits, type checks |
| Evidence integrity | ✅ SHA-256 | Hash-on-upload with re-verification |
| API rate limiting | ✅ Enabled | Configurable per-endpoint |
| Case access control | ✅ Enforced | Owner/shared/admin checks on all routes |
| Notification scoping | ✅ Enforced | User-scoped activity feed and notifications |
| CSRF protection | ⚠️ Partial | JWT-based (no cookies), consider adding CSRF tokens for enhanced protection |
| Input sanitization | ✅ Enabled | express-validator on all routes |
| SQL Injection | ✅ N/A | MongoDB with Mongoose ODM (NoSQL) |
| XSS | ✅ Mitigated | React auto-escapes, Helmet CSP headers |

---

## 🏆 Acknowledgments

We appreciate security researchers who help keep ForensicAI safe. Contributors who responsibly disclose vulnerabilities will be acknowledged here:

| Researcher | Vulnerability | Date |
|---|---|---|
| — | — | — |

---

<div align="center">

**Security is everyone's responsibility. Thank you for helping keep ForensicAI secure. 🔬🔒**

</div>