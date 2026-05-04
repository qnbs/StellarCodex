# Deployment & Betrieb

## Statische SPA

Stellar Codex ist eine **Vite-**Single-Page-Anwendung. Build-Ausgabe: Verzeichnis **`dist/`**.

1. **Build (lokal oder CI):** `npm ci && npm run typecheck && npm run build`  
   Oder: Verlassen auf [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) (Job `verify`).
2. **Hosting:** `dist/` auf **Vercel**, **Netlify**, **Cloudflare Pages**, S3+CDN o. ä. veröffentlichen.
3. **Keine API-Keys im Client-Bundle.** Nutzer konfigurieren Cloud-Anbieter unter **Einstellungen → KI** (verschlüsselter **BYOK-Vault** im Browser).

## Optional: API-Proxy (Teams / geteilte Keys)

Wenn Keys nicht pro Nutzer im Browser liegen sollen:

- Kleinen **Server** oder **Cloudflare Worker** betreiben.
- Provider-Keys nur als **Server-Umgebungsvariablen** (GitHub Secrets / Dashboard).
- Die SPA kennt nur eine **öffentliche Basis-URL** des Proxys (kein Secret).

## GitHub: Branch Protection

Unter **Repository → Settings → Branches**:

- Branch **`main`** schützen.
- **Require status checks:** Workflow **CI** / Job `verify` muss grün sein, bevor gemergt wird.

## PWA

- `manifest.json` und `sw.js` sind im Repo. Prüfen, ob der Host **HTTPS** und korrekte **Cache-Header** liefert.

## Siehe auch

- [DEVELOPMENT.md](./DEVELOPMENT.md) — lokaler Workflow vs. CI (Cloud-First).
- [README.md](../README.md) — Skripte und Stack.

---

## English (short)

- Build with `npm run build`, deploy `dist/`.
- No client-injected API keys; users use **Settings → AI** (encrypted vault) or a **server-side proxy** for team keys.
- Enable **branch protection** and require the **CI** workflow to pass.
