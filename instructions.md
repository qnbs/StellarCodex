# Stellar Codex — Projektanweisungen

Operative Referenz für Menschen und KI-Agenten. Architektur- und Produktfragen: **[PRD.md](./PRD.md)**, **[README.md](./README.md)**, **[docs/DEPLOY.md](./docs/DEPLOY.md)**. Session-Notizen: **[.notes/meeting_notes.md](./.notes/meeting_notes.md)**.

---

## 1. Zweck des Repositories

Lokal-first **React 19 / Vite 6**-PWA: **Konzeptdatenbank** (IndexedDB), **Konzept-Graph** und **World-Bible-Generator** (optional KI), **Orbital-Demo**, **Science-Tracker**, **Einstellungen** (inkl. **KI & BYOK-Vault**), **Hilfe**. UI-Metadaten (Theme, Sprache, KI-Präferenzen) per **redux-persist**; **keine** Cloud-API-Keys im Build — Nutzer hinterlegen Keys **verschlüsselt** in der App (Web Crypto + IndexedDB).

---

## 2. Schnellstart

```bash
cd /path/to/StellarCodex
npm install
npm run dev
```

- App: typisch **http://localhost:3000** (siehe `vite.config.ts`).
- **Kein** `GEMINI_API_KEY` in `.env` für den Client-Build nötig. Optional: [`.env.example`](.env.example) lesen.
- API-Keys: **Einstellungen → KI** (Tresor anlegen/entsperren, dann Anbieter wählen).

Weitere Skripte: [README.md](./README.md#run-locally).

---

## 3. Verzeichnisstruktur (kanonisch)

| Pfad | Rolle |
|------|--------|
| `src/index.tsx` | Einstieg: Redux, `PersistGate`, `App` |
| `src/services/database.ts` | IndexedDB: Konzepte, Vault-Meta, Graph-Kanten, World Bibles |
| `src/services/security/` | `aiKeyVault`, `cryptoHelpers` (BYOK) |
| `src/services/ai/` | Provider, `aiService`, Prompts, Konsistenz |
| `src/services/worldbuilding/` | z. B. Bible-Generator |
| `src/components/ai/` | KI-Einstellungen, lokale Modelle, Sci-Fi-Vorlagen-Liste |
| `src/store/**` | Slices: `concepts`, `ui`, `aiPreferences`, `localModels`, `aiUsage` |
| `src/lib/constants.ts` | `DB_NAME`, `DB_VERSION`, Store-Namen |
| `vite.config.ts` | Build, Alias `@` — **ohne** Secret-`define` |
| `.github/workflows/ci.yml` | GitHub Actions CI |
| `eslint.config.js` / `vitest.config.ts` | Qualitätssicherung |

**Hinweis:** Der frühere monolithische **`index.tsx` im Repo-Root** wurde entfernt; kanonischer Code liegt unter **`src/`**.

---

## 4. Architekturüberblick

```
Nutzer → Views → Redux → databaseService (idb)
              ↘ aiService → Adapter (Gemini/OpenAI/Ollama/Mock) ← Vault (encrypted keys)
persistiert (Auszug): ui.themeName, ui.language; aiPreferences.* — nie Klartext-Keys
```

---

## 5. Daten & Migrationen

1. Schema nur über **`src/lib/constants.ts`** (`DB_VERSION`, Store-Namen).
2. **`src/services/database.ts`**: `upgrade` bei Versions-Bump idempotent halten.
3. Typen in **`src/types/index.ts`** mit Stores und Formularen synchron halten.

---

## 6. Internationalisierung

Neue UI-Strings in **`src/lib/i18n.ts`** für **en** und **de**.

---

## 7. Styling & UX

Tailwind (CDN in `index.html`), Themes über `body`-Klassen; siehe `.cursor/rules/310-ui-components.mdc`.

---

## 8. Cursor / KI-Agenten

- Regeln: **`.cursor/rules/*.mdc`** — Security (`001`), Vite/BYOK (`102`), **KI-Schicht (`103`)**, IDB (`105`), Architektur (`200`), UI (`310`), Tests (`800`), CI (`810`).
- Nach relevanten Codeänderungen: **`graphify update .`** (Projektregel).

---

## 9. Tests & Lint

- **Vitest:** `npm run test` — Specs `*.test.ts(x)` neben dem Code.
- **ESLint:** `npm run lint` — Konfiguration `eslint.config.js`.
- Details: `.cursor/rules/800-testing-standards.mdc`, **CI** in `docs/DEVELOPMENT.md`.

---

## 10. Build & Deployment

- `npm run build` → **`dist/`**
- Deployment: **[docs/DEPLOY.md](./docs/DEPLOY.md)**
- PWA: `manifest.json`, `sw.js`, Registrierung in `index.html`

---

## 11. Qualitätscheckliste vor PR / Merge

- [ ] PRD/README bei Nutzer sichtbaren Änderungen aktualisiert
- [ ] Keine Secrets im Diff; Vault/Keys nicht in Klartext-Redux
- [ ] i18n en/de
- [ ] `DB_VERSION` bei IDB-Schemaänderung
- [ ] `npm run ci` oder CI grün (Push zu GitHub)

---

## 12. Referenzen

| Dokument | Nutzen |
|----------|--------|
| [README.md](./README.md) | Schnellstart, Skripte, Features |
| [PRD.md](./PRD.md) | Anforderungen, Datenmodell |
| [docs/DEPLOY.md](./docs/DEPLOY.md) | Hosting, Branch-Protection |
| [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) | CI vs. lokal |

---

## 13. Änderungsprotokoll (Dokument)

| Datum | Notiz |
|-------|--------|
| 2026-05-04 | BYOK-Vault, KI-Schicht, CI/Lint/Vitest, IDB v3, Graph/Bibel; Root-`index.tsx` entfernt; Dev Container Port 3000 |
| 2026-05-02 | Erste vollständige Ausgabe |
