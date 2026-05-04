# Product Requirements Document (PRD)

**Produkt:** Stellar Codex  
**Version:** 1.1 (Stand Codebasis)  
**Letzte Aktualisierung:** 2026-05-04  
**Verwandte Artefakte:** [instructions.md](./instructions.md), [README.md](./README.md), [docs/DEPLOY.md](./docs/DEPLOY.md), [.notes/meeting_notes.md](./.notes/meeting_notes.md)

---

## 1. Executive Summary

Stellar Codex ist eine **lokal-first PWA** (React 19, Vite 6) für **Hard-Science-Fiction-Worldbuilding**: Nutzer pflegen eine **Konzeptdatenbank**, optional einen **Konzept-Graph** und **World-Bibles**, nutzen eine orbitale Demo-Ansicht und kuratierte Science-/Literary-Inhalte. Persistenz: **IndexedDB** (`idb`); UI- und KI-**Metadaten** (Theme, Sprache, Routing-Präferenzen, Ollama-URL) per **redux-persist** — **ohne** Klartext-API-Keys. **BYOK:** Cloud-Schlüssel (z. B. Gemini, OpenAI) werden mit Nutzer-Passphrase **verschlüsselt** gespeichert (`aiKeyVault`, Web Crypto). Optionale KI: **Mock**, **Ollama (LAN)**, **Gemini/OpenAI** über modulare Adapter; Sci-Fi-Prompts und Konsistenz-Checks. **CI:** GitHub Actions (`typecheck`, optional Lint/Vitest, `build`).

---

## 2. Vision & Problemstellung

| Aspekt | Beschreibung |
|--------|----------------|
| **Vision** | Ein immersives, datenschutzorientiertes Arbeitsbuch für Hard-SF-Konzepte mit lokaler Kontrolle und optional KI-gestützter Plausibilität. |
| **Problem** | Fragmentierte Notizen ohne Struktur; Bedarf an Relationen zwischen Konzepten und nachvollziehbarer Speicherung. |
| **Zielnutzen** | Strukturierte Datenbank, Graph-Links, zweisprachige Oberfläche (EN/DE), offline-freundliche Basis (PWA/SW). |

---

## 3. Ziele & Nicht-Ziele

### 3.1 Geschäfts-/Produktziele

1. Zuverlässige **CRUD-Verwaltung** von Konzepten ohne Backend-Pflicht.
2. **BYOK-KI** ohne Secrets im Repository oder im Build-Bundle.
3. **Erweiterbarkeit** neuer Provider über `src/services/ai/adapters/`.

### 3.2 Explizite Nicht-Ziele (aktueller Stand)

- Multi-User-Sync, Accounts oder serverseitige Autorisierung (außer optional separatem Proxy).
- Vollständige physikalische Simulation im Orbital Explorer (demonstrativ/statisch).
- „Immer offline“ als harte Garantie ohne Deployment-spezifische SW-Politik.

---

## 4. Zielgruppen & Personas

| Persona | Bedarf | Kernflows |
|---------|--------|-----------|
| **Worldbuilder** | Ideen und Relationen festhalten | Datenbank, Graph, Bibel |
| **Leser/Researcher** | Kontext und Inspiration | Science Tracker, Hilfe |
| **Power-User** | KI & Vault, Theme, Datenreset | Einstellungen |

---

## 5. User Stories (priorisiert)

### P0 — Muss

- Konzept-CRUD wie gehabt (Felder *Konzept*, *wissenschaftliche Basis*, *Plausibilität*, *Details*).
- Ansichten wechseln (Orbital, Datenbank, Tracker, Einstellungen, Hilfe).
- Theme & Sprache persistiert.

### P1 — Soll

- Toasts; Datenbank leeren mit Bestätigung.
- KI-Einstellungen: Primary Provider, Routing, Ollama-URL; verschlüsselter Vault für Cloud-Keys.

### P2 — Kann / Backlog

- Export/Import Konzepte (JSON).
- Weitere Provider (Anthropic, OpenRouter, WebLLM/ONNX) mit gleicher `IAIProvider`-Form.
- E2E (Playwright) in CI bei vorhandener Config.

---

## 6. Funktionale Anforderungen

### 6.1 Navigation & Shell

| ID | Anforderung | Umsetzung (Ist) |
|----|-------------|-----------------|
| NAV-01 | Sticky Header mit Navigation | `Header.tsx`, `setView` |
| NAV-02 | View-Transitions (~300 ms) | `MainContent.tsx` |
| NAV-03 | Aktive View (`aria-current`) | Header |

### 6.2 Konzeptdatenbank & Graph

| ID | Anforderung | Akzeptanz |
|----|-------------|-----------|
| DB-01 … DB-06 | CRUD, Leerzustand, Schema | wie zuvor |
| DB-07 | Konzept-Kanten speichern | Store `conceptEdges`, UI `ConceptGraphPanel` |
| DB-08 | World-Bible-Abschnitte speichern | Store `worldBibles`, Generator nutzt `aiService` |

### 6.3 Orbital Explorer

| ORB-01 … ORB-03 | unverändert demonstrativ |

### 6.4 Science Tracker

| SCI-01 … SCI-02 | unverändert |

### 6.5 Einstellungen & KI

| ID | Anforderung |
|----|-------------|
| SET-01 … SET-03 | Theme, Sprache, DB leeren |
| SET-04 | KI: Primary Provider, Routing-Modus, Ollama-Basis-URL (persistiert als Meta) |
| SET-05 | Vault: Init/Unlock/Lock; Keys nur verschlüsselt in IDB |
| SET-06 | Sci-Fi-Vorlagen-Übersicht; Konsistenzcheck über gespeicherte Konzepte |

### 6.6 Hilfe

| HLP-01 … HLP-02 | unverändert |

---

## 7. Datenmodell

### 7.1 Entitäten (Auszug)

- **Concept** — wie dokumentiert (Felder unverändert).
- **ConceptEdge** — `sourceConceptId`, `targetConceptId`, `relationType`.
- **WorldBible** — `id` (string), `title`, `bodyMarkdown`, Zeitstempel.

### 7.2 IndexedDB

- **Name:** `StellarCodexDB`
- **Version:** `3` — Stores u. a. `concepts`, `vaultSecrets`, `vaultMeta`, `conceptEdges`, `worldBibles` (siehe `src/lib/constants.ts`).
- Migrationen in `src/services/database.ts`.

### 7.3 Redux (Persistenz)

| Slice | Persistiert (whitelist) | Hinweis |
|-------|-------------------------|---------|
| `ui` | `themeName`, `language` | — |
| `aiPreferences` | `primaryProvider`, `routingMode`, `ollamaBaseUrl` | keine Secrets |
| `concepts` | nein | IDB |
| `localModels`, `aiUsage` | nein | flüchtig / Zähler |

---

## 8. Internationalisierung

- EN/DE in `src/lib/i18n.ts`.

---

## 9. Nicht-funktionale Anforderungen

| Kategorie | Anforderung |
|-----------|-------------|
| **Sicherheit** | Keine Secrets im Repo; keine Klartext-Keys in Redux/localStorage; Vault + optional Server-Proxy |
| **Performance** | IDB async; KI-Fallback-Kette mit Circuit Breaker |
| **Qualität** | Vitest, ESLint, GitHub Actions CI |
| **A11y** | `.cursor/rules/310-ui-components.mdc` |

---

## 10. Technische Constraints (Ist-Architektur)

- React 19, Vite 6, TypeScript, Redux Toolkit, redux-persist.
- **Build:** `vite.config.ts` — Alias `@`; **kein** Secret-`define`.
- Tailwind via CDN in `index.html`.
- **Node:** siehe `engines` in `package.json` (≥20).

---

## 11. Erfolgsmetriken (Vorschläge)

| Metrik | Messidee |
|--------|----------|
| CRUD & Vault | Keine unhandled Rejections; Vault-Unlock fehlgeschlagen zeigt klare Toast |
| CI | `verify`-Job grün auf `main` |

---

## 12. Roadmap (indikativ)

| Phase | Inhalt |
|-------|--------|
| **Kurz** | Strict TS, mehr Adapter-Tests, Playwright-Smoke |
| **Mittel** | Proxy-Doku/Referenz-Worker, Export/Import |
| **Lang** | WebLLM/Transformers-Pfad, Community-Sharing mit E2E-Verschlüsselung |

---

## 13. Risiken & Offene Punkte

| Risiko | Mitigation |
|--------|------------|
| Daten nur lokal | Export/Import (Backlog); Hinweise in Hilfe |
| CDN Tailwind | CSP/Offline für harte Deployments prüfen |
| Krypto-Passphrase vergessen | UX-Hinweis; keine Recovery ohne Passwort möglich |

---

## 14. Glossar

| Begriff | Bedeutung |
|---------|-----------|
| **BYOK** | Bring your own API key — Nutzer trägt Schlüssel selbst ein |
| **Vault** | Verschlüsselte Speicherung von Provider-Keys im Browser |
| **IDB** | IndexedDB via `idb` |

---

## 15. Änderungsprotokoll

| Datum | Version | Änderung |
|-------|---------|----------|
| 2026-05-04 | 1.1 | BYOK, KI-Schicht, IDB v3, Graph/Bibel, CI; Entfall Root-`index.tsx`; Vault statt Build-Env |
| 2026-05-02 | 1.0 | Initiales PRD |
