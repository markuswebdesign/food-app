# PROJ-18: Rollen-System (Admin/User)

## Status: Deployed
**Created:** 2026-04-07
**Last Updated:** 2026-04-07

## Dependencies
- None (Fundament für PROJ-19, PROJ-20, PROJ-21, PROJ-22)

## User Stories
- Als Admin möchte ich einem User die Admin-Rolle zuweisen können, damit ich das System verwalten kann
- Als Admin möchte ich einem Admin die Rolle entziehen können, damit ich Berechtigungen kontrollieren kann
- Als normaler User möchte ich keinen Zugriff auf Admin-Bereiche haben, damit die App sicher ist
- Als System möchte ich Admin-Routen schützen, damit unautorisierte User keinen Zugriff erhalten

## Acceptance Criteria
- [x] Das `profiles`-Profil hat ein Feld `role` mit den Werten `admin` | `user` (Standard: `user`)
- [x] Neue User erhalten automatisch die Rolle `user` bei der Registrierung
- [x] Admin-Routen (z.B. `/admin/*`) sind serverseitig geschützt — nicht-Admins werden zu `/me` weitergeleitet
- [x] Ein eingeloggter Admin kann im Admin-Bereich einem anderen User die Rolle `admin` geben oder entziehen
- [x] Ein Admin kann sich nicht selbst die Admin-Rolle entziehen
- [x] Die eigene Rolle wird in der Session/Context verfügbar gemacht, damit UI-Elemente bedingt angezeigt werden können
- [x] Admins sehen im Sidebar/Header einen sichtbaren Hinweis/Link zum Admin-Bereich

## Edge Cases
- Was passiert, wenn der letzte Admin sich selbst degradiert? → Nicht erlaubt, API gibt Fehlermeldung zurück
- Was passiert, wenn jemand direkt `/admin` aufruft ohne eingeloggt zu sein? → Redirect zu `/login`
- Was passiert, wenn ein User die Rolle `admin` in der URL manipuliert? → Serverseitige Prüfung in Middleware + Admin-Layout

## Technical Requirements
- Rollen-Prüfung immer serverseitig (Server Components / API Route Handler)
- Kein clientseitiges Trust-Modell für Rollen
- Middleware-Level Guard für `/admin/*`

---

## Implementation Notes

### DB
- `profiles.role` existierte bereits mit `CHECK(role IN ('admin', 'user'))` und `DEFAULT 'user'`
- Trigger `on_auth_user_created` setzt automatisch `role = 'user'` für neue User (via Default)
- Neue RLS-Policies: Admins können alle Profile lesen und updaten
- Helper-Funktion `public.is_admin()` mit `SECURITY DEFINER` für RLS-Policies

### Middleware (`lib/supabase/middleware.ts`)
- Für `/admin/*`: Profil-Abfrage → redirect zu `/me` wenn nicht Admin
- Zweiter Guard im Admin-Layout als Defense-in-Depth

### Neue Dateien
- `app/admin/layout.tsx` — Admin-Layout mit Guard + Admin-Navigation
- `app/admin/page.tsx` — Dashboard mit Nutzer- und Rezept-Zähler
- `app/admin/users/page.tsx` — Nutzerliste (Server Component)
- `app/admin/users/user-role-toggle.tsx` — Client Component für Rollen-Toggle
- `app/api/admin/users/route.ts` — PATCH (Rolle ändern) + GET (Nutzerliste)

### API Route (`/api/admin/users`)
- `PATCH`: Validierung via Zod, Admin-Check, Self-Demotion-Schutz, Service-Role für DB-Update
- Nutzt `SUPABASE_SERVICE_ROLE_KEY` (bereits in `.env.local.example` dokumentiert)

### NavBar
- Admin-Link bereits vorhanden für Desktop (war schon implementiert)
- Admin-Link jetzt auch im Mobile-Menü ergänzt

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
