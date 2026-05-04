# Entwicklung & CI – Modus Operandi

## Ziel

Schwere, CPU-/RAM-intensive Schritte (**Production-Build**, **E2E mit Browser-Install**, große **Test-Suites**) sollen **nicht** auf schwacher lokaler Hardware zur Routine werden. Stattdessen gelten **GitHub Actions** nach `git push` als Quelle der Wahrheit; Fixes erfolgen **anhand der CI-Logs**, bis der Workflow grün ist.

## Was lokal (optional, leichtgewichtig)

| Aktion | Wann | Hinweis |
|--------|------|--------|
| `npm run dev` | tägliche Entwicklung | Hot Reload, kein Prod-Build |
| `npm run typecheck` | vor Commit, wenn möglich | Schnell, wenig RAM |
| `npm run test` | vor Push empfohlen | Aktiviert Vitest |
| `npm run lint` | wenn ESLint konfiguriert ist | Schneller Style-/TS-Check |
| `npm run ci:full` | optional auf stärkerer Maschine | `typecheck` + `test` + `lint` + `build` (lokales Gegenstück zu „alles“) |

**Nicht** als Dauerloop auf Low-End: `npm run build`, `npx playwright test`, große `vitest run`-Gesamtläufe.

## Was in der Cloud (CI)

Workflow: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)

| Job | Inhalt |
|-----|--------|
| **verify** | `npm ci` → `npm run typecheck` → optional **Lint** (wenn `eslint.config.*`) → optional **Vitest** (wenn `vitest.config.*`) → `npm run build` |
| **e2e** | nur aktiv, wenn `playwright.config.ts` (oder `.mts`) existiert |

Manueller Lauf: Tab **Actions** → Workflow **CI** → **Run workflow** (führt dieselben Jobs wie Push/PR aus).

## Workflow für Agent:innen & Menschen nach Codeänderungen

1. Änderungen committen.
2. Pushen (`main`/Feature-Branch) oder Pull Request öffnen.
3. In GitHub **Actions** den Lauf öffnen; bei Rot: Log-Zeile und Stacktrace analysieren.
4. Fix committen und erneut pushen — bis CI grün ist.

So bleibt die lokale Maschine entlastet; Build-Caches und schnelle Runner liegen bei GitHub.

## Reproduzierbarkeit

- `package-lock.json` ist eingecheckt (erforderlich für `npm ci` in CI).
- Node-Version CI: siehe `setup-node` in der Workflow-Datei (Anpassung bei Bedarf zentral dort).

## Erweiterung

- **ESLint:** `eslint.config.js` (oder `.mjs`) — der Job `verify` führt `npm run lint` aus, sobald die Datei existiert.
- **Vitest:** `vitest.config.ts` (oder `.mts`) — im Job `verify` wird `npx vitest run` ausgeführt, wenn die Config existiert.
- **Playwright:** `playwright.config.ts` + Tests — separater Job `e2e` nach erfolgreichem `verify` (nur wenn Config vorhanden).

## CI-Job `verify` (Reihenfolge)

1. `npm ci` (setzt `package-lock.json` voraus)  
2. `npm run typecheck`  
3. optional: `npm run lint` (wenn `eslint.config.*`)  
4. optional: `npx vitest run` (wenn `vitest.config.*`)  
5. `npm run build`
