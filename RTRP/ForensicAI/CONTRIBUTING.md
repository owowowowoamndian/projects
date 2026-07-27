# Contributing to ForensicAI

Thank you for considering contributing to **ForensicAI**! This document outlines the guidelines for contributing to the project. By participating, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Commit Convention](#commit-convention)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)
- [Security Issues](#security-issues)

---

## 🚀 Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ForensicAI.git
   cd ForensicAI
   ```
3. **Add upstream** remote:
   ```bash
   git remote add upstream https://github.com/cybersecurity26/ForensicAI.git
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## 🛠 Development Setup

### Prerequisites
- Node.js v18+
- MongoDB v6+ (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- An AI API key (OpenAI, Gemini, or Mistral)

### Server Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Client Setup
```bash
cd client
npm install
npm run dev
```

The client runs at `http://localhost:5173` and proxies API requests to the server on port `5000`.

---

## 🤝 How to Contribute

### Types of Contributions Welcome

| Type | Description |
|---|---|
| 🐛 **Bug Fixes** | Fix existing issues or reported bugs |
| ✨ **Features** | Add new functionality to the platform |
| 📝 **Documentation** | Improve README, inline comments, JSDoc |
| 🎨 **UI/UX** | Improve design, accessibility, animations |
| ⚡ **Performance** | Optimize queries, reduce bundle size, caching |
| 🧪 **Testing** | Add unit tests, integration tests, E2E tests |
| 🔒 **Security** | Fix vulnerabilities, improve auth, add validations |

### Areas Open for Contribution

- **Evidence Parsers** — Add support for new file formats (PCAP deep parsing, EVTX, registry hives)
- **AI Providers** — Integrate additional AI providers (Anthropic Claude, Cohere, local LLMs)
- **Export Formats** — Add DOCX, CSV, or STIX/TAXII export for reports
- **Internationalization** — Add multi-language support
- **Accessibility** — Improve ARIA labels, keyboard navigation, screen reader support
- **Mobile UI** — Responsive improvements for tablet/mobile devices

---

## 📬 Pull Request Process

1. **Sync with upstream** before starting work:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Make your changes** in a dedicated branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Test your changes** locally:
   - Verify the server starts without errors
   - Verify the client builds successfully (`npm run build`)
   - Test your changes in both dark and light themes
   - Check that existing features still work

4. **Commit your changes** using the [commit convention](#commit-convention)

5. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request** against `cybersecurity26/ForensicAI:main`
   - Use a clear, descriptive title
   - Reference any related issues (e.g., `Fixes #12`)
   - Describe what you changed and why
   - Include screenshots for UI changes

### PR Review Criteria

- [ ] Code follows the project's [code style](#code-style)
- [ ] No console errors or warnings
- [ ] Works in both dark and light themes
- [ ] Does not break existing functionality
- [ ] Commit messages follow the convention
- [ ] Documentation updated if needed

---

## 🎨 Code Style

### JavaScript / JSX
- **ES Modules** — Use `import`/`export` (not `require`)
- **Functional Components** — React hooks only, no class components
- **Async/Await** — For all asynchronous operations (no raw `.then()` chains)
- **Destructuring** — Prefer destructured imports, props, and state
- **No `var`** — Use `const` by default, `let` only when reassignment is needed
- **Semicolons** — Optional (project currently omits them)

### Naming Conventions
| Type | Convention | Example |
|---|---|---|
| Components | PascalCase | `CaseDetail.jsx` |
| Functions | camelCase | `handleSearchSelect` |
| Variables | camelCase | `searchResults` |
| CSS Variables | --kebab-case | `--accent-primary` |
| Constants | camelCase or UPPER_SNAKE_CASE | `pageTitles`, `MAX_FILE_SIZE` |
| Files (pages) | PascalCase | `EvidenceUpload.jsx` |
| Files (utils) | camelCase | `parser.js` |

### CSS
- Use **CSS custom properties** (`var(--name)`) for theming
- Dark-first design; light theme via `[data-theme="light"]` selectors
- No CSS frameworks — vanilla CSS with the design system in `index.css`

### API Routes
- RESTful: `GET`, `POST`, `PUT`, `DELETE`
- All routes under `/api/` prefix
- JSON request/response bodies
- Use `requireAuth` middleware for protected routes

---

## 📝 Commit Convention

Use **Conventional Commits** format:

```
type: short description
```

### Types

| Type | When to Use |
|---|---|
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `docs` | Documentation only changes |
| `style` | CSS, formatting (no logic change) |
| `refactor` | Code restructuring (no feature/fix) |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build scripts, dependencies, config |
| `security` | Security-related changes |

### Examples
```bash
git commit -m "feat: add PCAP deep packet parser"
git commit -m "fix: resolve tooltip visibility in light theme"
git commit -m "docs: update API endpoint documentation"
git commit -m "style: improve mobile sidebar responsiveness"
git commit -m "security: add input sanitization for case descriptions"
```

---

## 🐛 Reporting Bugs

Open a [GitHub Issue](https://github.com/cybersecurity26/ForensicAI/issues/new) with:

1. **Title** — Clear, descriptive summary
2. **Environment** — Browser, OS, Node.js version
3. **Steps to Reproduce** — Numbered list
4. **Expected Behavior** — What should happen
5. **Actual Behavior** — What actually happened
6. **Screenshots** — If applicable (especially for UI bugs)
7. **Console Errors** — Any errors from browser DevTools / server logs

---

## 💡 Feature Requests

Open a [GitHub Issue](https://github.com/cybersecurity26/ForensicAI/issues/new) with:

1. **Title** — Prefix with `[Feature Request]`
2. **Problem** — What problem does this solve?
3. **Proposed Solution** — How should it work?
4. **Alternatives** — Any alternatives you considered
5. **Context** — Why is this important for digital forensics workflows?

---

## 🔒 Security Issues

**Do NOT open public issues for security vulnerabilities.**

See our [Security Policy](SECURITY.md) for instructions on responsible disclosure.

---

## 📄 License

By contributing to ForensicAI, you agree that your contributions will be licensed under the same license as the project.

---

<div align="center">

**Thank you for helping make ForensicAI better! 🔬**

</div>