# Stellar Codex

**Stellar Codex** is a privacy-first tool for exploring and documenting **hard science fiction** concepts. Your concept data lives in **IndexedDB** in your browser. Optional **AI** features use a **BYOK (bring your own key)** model: API keys are **encrypted at rest** with your passphrase (Web Crypto + IndexedDB), not baked into the build.

## Features

- **Concept database** — local CRUD for ideas, plausibility, and technical notes.
- **Concept graph** — link concepts with typed relations (stored locally).
- **World bible generator** — uses the unified AI layer with Sci‑Fi prompt templates.
- **Multi-provider AI** — mock (offline), **Ollama** (LAN), **Gemini**, **OpenAI**; routing modes (`local_first`, `cloud_first`, …) with simple circuit breaking.
- **Consistency checks** — heuristic + LLM-assisted hard-SF consistency passes.
- **PWA** — installable; service worker caches core assets (see `sw.js`).

## Requirements

- **Node.js** ≥ 20 (see `package.json` `engines`).

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown (default port **3000**). There is **no** required `.env` API key for the client. Add keys under **Settings → AI** after creating the encrypted vault.

### Scripts

| Script        | Purpose                                      |
|---------------|----------------------------------------------|
| `npm run dev` | Vite dev server                              |
| `npm run build` | Production build into `dist/`            |
| `npm run typecheck` | `tsc --noEmit`                       |
| `npm run test` | Vitest                                      |
| `npm run lint` | ESLint (flat config)                       |
| `npm run ci` | Typecheck + build (matches CI core job)     |
| `npm run ci:full` | Typecheck + test + lint + build        |

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs **install → typecheck → (lint if configured) → tests if Vitest config exists → build** on push/PR. Prefer fixing failures from CI logs on constrained hardware; see `docs/DEVELOPMENT.md`.

## Deploy

See [docs/DEPLOY.md](docs/DEPLOY.md).

## License

[MIT](LICENSE)
