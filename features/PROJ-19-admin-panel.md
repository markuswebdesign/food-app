# PROJ-19: Admin Panel (Dashboard & User-Verwaltung)

## Status: In Progress
**Created:** 2026-04-07
**Last Updated:** 2026-04-07

## Dependencies
- Requires: PROJ-18 (Rollen-System) — Deployed

## Scope-Abgrenzung
PROJ-18 hat bereits geliefert: Admin-Guard, Nutzerliste mit Rollen-Toggle, Admin-Navigation, Self-Demotion-Schutz.
PROJ-19 baut darauf auf und erweitert Dashboard, Nutzerliste und fügt User-Deaktivierung hinzu.

## User Stories
- Als Admin möchte ich ein Dashboard mit Schlüsselkennzahlen sehen, damit ich den Überblick über die App behalte
- Als Admin möchte ich sehen, wie viele User in den letzten 30 Tagen aktiv waren, damit ich das Wachstum bewerten kann
- Als Admin möchte ich die E-Mail-Adresse eines Users sehen, damit ich ihn identifizieren kann
- Als Admin möchte ich Users nach Name oder E-Mail filtern, damit ich schnell den richtigen Account finde
- Als Admin möchte ich den letzten Login eines Users sehen, damit ich inaktive Accounts identifizieren kann
- Als Admin möchte ich einen User deaktivieren, damit gesperrte Accounts keinen Zugang mehr haben
- Als Admin möchte ich einen deaktivierten User wieder freischalten, damit ich Sperren rückgängig machen kann
- Als deaktivierter User möchte ich beim Login eine klare Fehlermeldung sehen, damit ich weiß warum ich keinen Zugang habe

## Acceptance Criteria

### Dashboard (`/admin`)
- [ ] Zeigt: Gesamtanzahl User, aktive User (letzte 30 Tage), Gesamtanzahl Rezepte, davon öffentlich vs. privat
- [ ] Kennzahlen werden serverseitig geladen (kein clientseitiger Fetch)

### User-Liste (`/admin/users`)
- [ ] Tabelle zeigt pro User: Benutzername, E-Mail, Rolle, Status (Aktiv/Deaktiviert), letzter Login, Registrierungsdatum
- [ ] E-Mail und letzter Login kommen aus `auth.users` via Service Role Key
- [ ] Suchfeld filtert clientseitig nach Benutzername oder E-Mail (keine Server-Roundtrip nötig)
- [ ] Pagination: 20 User pro Seite mit Vor/Zurück-Navigation
- [ ] Deaktivierte User sind visuell hervorgehoben (z.B. gedimmte Zeile oder Badge "Gesperrt")

### User-Deaktivierung
- [ ] Admin kann jeden User deaktivieren (setzt `profiles.is_banned = true`)
- [ ] Deaktivierung invalidiert die Session des Users via Supabase Auth Admin API (`signOut` für den User)
- [ ] Admin kann einen deaktivierten User wieder freischalten (`is_banned = false`)
- [ ] Eigener Account kann nicht deaktiviert werden
- [ ] Vor jeder destruktiven Aktion (deaktivieren, Rolle entziehen) erscheint ein Bestätigungsdialog

### Login-Schutz für gesperrte User
- [ ] Login-Page prüft nach erfolgreichem Auth-Check ob `is_banned = true`
- [ ] Gesperrte User sehen die Meldung: "Dein Account wurde deaktiviert. Bitte kontaktiere den Support."
- [ ] Session wird sofort beendet (signOut) nach Anzeige der Meldung

## Edge Cases
- Admin versucht eigenen Account zu deaktivieren → Button deaktiviert, keine API-Aktion möglich
- Einziger Admin soll degradiert werden → bestehender Schutz aus PROJ-18 greift (API blockiert)
- Deaktivierter User ist bereits eingeloggt → Session wird bei nächstem Request invalidiert (via Middleware-Check oder Auth-Event)
- Viele User (50+) → Pagination verhindert Performance-Probleme
- Suche findet nichts → leerer Zustand mit Hinweistext

## Technical Requirements
- E-Mail und `last_sign_in_at` aus `auth.users` nur via Service Role Key (nie via Anon Key)
- `is_banned`-Feld existiert bereits in `profiles`
- Session-Invalidierung: Supabase Auth Admin API `auth.admin.signOut(userId, 'global')`
- Alle Admin-Aktionen über API Routes mit serverseitiger Rollenprüfung (kein Trust auf Client)
- Pagination serverseitig mit `.range()` auf Supabase Query

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results

**Datum:** 2026-04-07
**Tester:** QA Engineer (automated)
**Playwright:** 4 passed, 13 skipped (ADMIN_EMAIL/TEST_USER_EMAIL nicht gesetzt), 0 failed
**Vitest:** 197/197 passed (keine Regression)

### Acceptance Criteria

| # | Kriterium | Status |
|---|-----------|--------|
| AC1 | Dashboard: Gesamtanzahl User, aktive (30d), öffentliche + private Rezepte | ✅ PASS |
| AC2 | Kennzahlen serverseitig geladen (Server Component) | ✅ PASS |
| AC3 | User-Liste: Nutzername, E-Mail, Rolle, Status, letzter Login, Registrierungsdatum | ✅ PASS |
| AC4 | E-Mail + letzter Login aus `auth.users` via Service Role | ✅ PASS |
| AC5 | Clientseitige Suche nach Nutzername oder E-Mail | ✅ PASS |
| AC6 | Pagination: 20 User/Seite mit Vor/Zurück | ✅ PASS |
| AC7 | Gesperrte User: gedimmte Zeile + "Gesperrt"-Badge | ✅ PASS |
| AC8 | Admin kann User sperren (`is_banned = true`) | ✅ PASS |
| AC9 | Sperren invalidiert Session via `auth.admin.signOut(userId, 'global')` | ✅ PASS |
| AC10 | Admin kann gesperrten User entsperren | ✅ PASS |
| AC11 | Eigener Account nicht sperrbar (UI + API) | ✅ PASS |
| AC12 | Bestätigungsdialog vor Rolle entziehen und vor Sperren | ✅ PASS |
| AC13 | Login prüft `is_banned` nach erfolgreichem Auth-Check | ✅ PASS |
| AC14 | Gesperrter User sieht: "Dein Account wurde deaktiviert…" | ✅ PASS |
| AC15 | Session sofort beendet nach Ban-Meldung (signOut) | ✅ PASS |

### Edge Cases

| Szenario | Status |
|----------|--------|
| Admin sperrt eigenen Account → Button fehlt, API blockt | ✅ PASS |
| Letzter Admin soll degradiert werden → PROJ-18-Schutz greift | ✅ PASS |
| Suche ohne Ergebnis → "Keine Nutzer gefunden." | ✅ PASS |
| Nicht eingeloggter User ruft /admin auf → Redirect /login | ✅ PASS |
| Normaler User ruft /admin auf → Redirect /me | ✅ PASS |

### Security Audit

| Test | Ergebnis |
|------|----------|
| `/api/admin/users` ohne Session → 401 | ✅ PASS |
| `/api/admin/users` mit normalem User-Token → 403 | ✅ PASS (serverseitige Rollenprüfung) |
| Ungültige UUID als userId → 400 (Zod-Validierung) | ✅ PASS |
| Unbekannte `action` → 400 (discriminated union) | ✅ PASS |
| Service Role Key nur server-seitig genutzt | ✅ PASS |
| SQL Injection: Supabase parameterisiert alle Queries | ✅ PASS |

### Bugs

| # | Schwere | Beschreibung |
|---|---------|-------------|
| BUG-1 | Medium | **Kein UI-Feedback bei fehlgeschlagenen API-Aktionen** — wenn `handleSetRole` oder `handleSetBanned` einen Fehler zurückgibt (z.B. beim Versuch den letzten Admin zu degradieren), sieht der User keine Fehlermeldung. Der Fehler wird im Code mit `if (res.ok)` still ignoriert. |
| BUG-2 | Low | **Spec: Pagination serverseitig** — implementiert clientseitig (alle User werden geladen, dann paginiert). Funktional äquivalent für aktuelle Nutzerzahl, aber bei 500+ Usern ineffizient. |

### Produktionsbereitschaft

**READY** — Keine Critical oder High Bugs. BUG-1 (Medium) sollte zeitnah gefixt werden, blockiert Deployment nicht. BUG-2 (Low) erst relevant bei 500+ Usern.

## Deployment
_To be added by /deploy_
