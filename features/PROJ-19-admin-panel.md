# PROJ-19: Admin Panel (Dashboard & User-Verwaltung)

## Status: Planned
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
_To be added by /qa_

## Deployment
_To be added by /deploy_
