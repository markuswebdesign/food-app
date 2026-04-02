# PROJ-14: Landingpage

## Status: In Progress
**Created:** 2026-04-01
**Last Updated:** 2026-04-01

## Dependencies
- Authentifizierung (deployed) — Login/Register-Links auf der Landingpage

## Beschreibung
Eine öffentlich zugängliche Landingpage, die die App und ihre Funktionen vorstellt, damit neue Nutzer verstehen was die App kann und sich registrieren möchten.

## User Stories
- Als Besucher möchte ich auf der Startseite verstehen, was die App kann, damit ich entscheiden kann, ob sie für mich relevant ist.
- Als Besucher möchte ich direkt von der Landingpage aus mit der Registrierung beginnen können.
- Als bereits registrierter Nutzer möchte ich von der Landingpage aus direkt zum Login gelangen.
- Als Besucher möchte ich die wichtigsten Funktionen der App auf einen Blick sehen.

## Acceptance Criteria
- [ ] Die Route `/` zeigt eine Landingpage für nicht eingeloggte Nutzer (eingeloggte werden zum Dashboard weitergeleitet)
- [ ] Hero-Section: App-Name, kurze Beschreibung (1-2 Sätze), CTA-Button "Kostenlos starten"
- [ ] Feature-Section: Mindestens 4 Kernfunktionen mit Icon + kurzer Beschreibung
  - Rezeptverwaltung & Import
  - Wochenplanung
  - Einkaufsliste
  - Kalorientracking & Nährwerte
- [ ] Navigation: Logo, Login-Button, Register-Button
- [ ] Footer: Minimalfooter (z.B. Jahr, App-Name)
- [ ] Responsive: Funktioniert auf Mobile und Desktop
- [ ] Ladezeit < 2 Sekunden (statisch gerendert)

## Edge Cases
- Was passiert, wenn ein eingeloggter Nutzer die Route `/` besucht? → Redirect zum Dashboard
- Was passiert auf sehr kleinen Mobilgeräten (320px)? → Layout bricht nicht

## Technical Requirements
- Statisch gerenderte Seite (Next.js SSG oder RSC ohne Auth)
- Kein Login erforderlich für Zugriff
- SEO-freundlich: Meta-Tags, Title, Description

---

## Tech Design (Solution Architect)

### Komponentenstruktur
- `app/page.tsx` — RSC mit Server-side Auth-Check: Redirect zu `/me` für eingeloggte Nutzer, sonst Landingpage
- `components/landing/landing-nav.tsx` — Logo + Login/Register-Buttons
- `components/landing/hero-section.tsx` — Headline + Subtext + CTA-Button
- `components/landing/features-section.tsx` — 4 Feature-Cards mit lucide-react Icons
- `components/landing/landing-footer.tsx` — Minimaler Footer mit Jahreszahl

### Entscheidungen
- React Server Component für SSG-Rendering und SEO
- Supabase Server Client für Auth-Check (keine neue Abhängigkeit)
- Kein neues Backend nötig

## Implementation Notes (Frontend)

**Implementiert am 2026-04-02**

Neue Dateien:
- `app/page.tsx` — ersetzt bisherigen redirect("/me"), prüft Auth serverseitig
- `components/landing/landing-nav.tsx`
- `components/landing/hero-section.tsx`
- `components/landing/features-section.tsx`
- `components/landing/landing-footer.tsx`

SEO-Meta (title + description) direkt in `app/page.tsx` via Next.js Metadata API.
Build erfolgreich (`npm run build` ✓).

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
