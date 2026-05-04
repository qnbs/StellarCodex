# Meeting Notes & Consciousness Stream

**Zweck:** Kurzlebige und langfristige **Projekterinnerungen** für Menschen und KI-Agenten: Beschlüsse, Kontext aus Sessions, offene Fragen, Links zu PRD-Abschnitten. Kein Ersatz für Git-History oder Issue-Tracker — ein **Kompass**, nicht ein Logbuch jeder Zeile.

**Konventionen**

- Neue Einträge **oben** unter der aktuellen Sektion einfügen (neueste zuerst innerhalb eines Tages).
- Format pro Eintrag: **Datum (ISO)**, **Typ** (`Entscheidung` | `Frage` | `Kontext` | `Follow-up`), **Kurztext**, optional **Links**.
- Keine Secrets, keine API-Keys, keine personenbezogenen Daten.
- Wenn ein Punkt im PRD oder in `instructions.md` fest verankert ist, hier nur noch **verweisen**, nicht duplizieren.

---

## Aktiver Stream

### 2026-05-04 — Kontext & Entscheidung

- **Typ:** Kontext / Entscheidung  
- **Inhalt:** Produkt- und Doku-Stand vereinheitlicht: **BYOK-Vault** (`aiKeyVault`), modulare **KI-Schicht** unter `src/services/ai/`, **IDB v3** (Konzepte, Vault, Graph-Kanten, World Bibles), **CI** mit Typecheck/Lint/Vitest/Build (`verify`), **ESLint** + **Vitest**. Cursor-Regeln **001/102/103/105/810** und **docs/** (DEVELOPMENT, DEPLOY), **PRD 1.1**, **instructions** aktualisiert. Root-`index.tsx` entfernt; Devcontainer auf **Port 3000** / Node **22** ausgerichtet.  
- **Links:** [PRD.md §15](../PRD.md), [instructions.md](../instructions.md), [.github/workflows/ci.yml](../.github/workflows/ci.yml)

### 2026-05-02 — Kontext

- **Typ:** Kontext  
- **Inhalt:** Repository als **Stellar Codex** identifiziert: Vite 6 + React 19 + TypeScript, Redux Toolkit, redux-persist (UI), IndexedDB via `idb`, zweisprachig EN/DE, Themes Cyan/Amber. Gemini-Key über `GEMINI_API_KEY` / `vite.config.ts` `define`.  
- **Links:** [PRD.md §10 Technische Constraints](../PRD.md), [instructions.md §3](../instructions.md)

### 2026-05-02 — Entscheidung (Dokumentation)

- **Typ:** Entscheidung  
- **Inhalt:** Kanonische Produkt- und Arbeitsgrundlage: **PRD.md** (Was/Warum), **instructions.md** (Wie im Repo arbeiten), **diese Datei** (iterative Session-Notizen). Root-`index.tsx` als technische Schuld markiert — neue Features unter `src/`.  
- **Links:** [PRD.md §3 Nicht-Ziele](../PRD.md), [instructions.md §3](../instructions.md)

---

## Offene Fragen (Backlog)

| ID | Frage | Status |
|----|--------|--------|
| Q-001 | Soll der Service Worker (`sw.js`) offiziell produktiv sein (Offline, Cache-Versioning)? | offen |
| Q-002 | Gemini: konkrete Features und UX (Rate Limits, Fehler, Kostenhinweis)? | offen |
| Q-003 | TypeScript `strict` aktivieren — Zeitfenster und Scope? | offen |
| Q-004 | Root-`index.tsx` entfernen oder mit `src/` zusammenführen? | offen |

*Erledigte Fragen nach unten unter „Archiv“ verschieben oder mit Datum schließen.*

---

## Entscheidungslog (kompakt)

| Datum | Thema | Kurzentscheid |
|-------|--------|----------------|
| 2026-05-02 | Dokumentation | PRD + instructions + notes als Standard-Artefakte eingeführt |

---

## Archiv / Erledigt

<!-- Beispiel:
### 2026-MM-DD — Entscheidung
- **Thema:** …
- **Ergebnis:** …
-->

*(Noch leer.)*

---

## Schnellreferenz für Agenten

1. Architekturänderung geplant → **PRD.md** prüfen, dann diese Datei mit **Entscheidung** oder **Frage** ergänzen.  
2. Nur kleiner Fix → optional **Kontext**-Zeile bei nicht-trivialen Annahmen.  
3. Nach Merge wichtiger Features: PRD **§15** und instructions **§13** aktualisieren (Versionsdatum).

---

*Letzte Pflege der Vorlage: 2026-05-02*
