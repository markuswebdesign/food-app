# PROJ-3: Kalorie-Defizit Dashboard

## Status: Planned
**Created:** 2026-04-01
**Last Updated:** 2026-04-01

## Dependencies
- Requires: PROJ-1 (Gesundheitsprofil + TDEE) — für das Kalorienziel
- Requires: PROJ-2 (Mahlzeiten-Logbuch) — für die tatsächliche Kalorienzufuhr

## User Stories
- Als Nutzer möchte ich auf einen Blick sehen, wie viele Kalorien ich heute bereits gegessen habe und wie viel mir bis zu meinem Tagesziel noch bleibt.
- Als Nutzer möchte ich sofort erkennen, ob ich heute im Defizit oder Überschuss bin (farbliche Kennzeichnung).
- Als Nutzer möchte ich eine Wochenübersicht sehen, die zeigt an welchen Tagen ich im Defizit war.
- Als Nutzer möchte ich das Dashboard als Startseite der App sehen, damit ich direkt nach dem Einloggen meinen Status kenne.
- Als Nutzer möchte ich sehen, wie viel Defizit ich diese Woche insgesamt angesammelt habe.

## Acceptance Criteria
- [ ] Dashboard-Widget auf der Startseite (/) zeigt: Kalorienziel, gegessen, verbleibend, Status (Defizit / Überschuss / Ausgeglichen)
- [ ] Farbkodierung: Defizit = grün, Ausgeglichen = grau, Überschuss = rot/orange
- [ ] Fortschrittsbalken: gegessen / Ziel (visueller Füllstand)
- [ ] Wochenübersicht: 7 Balken (Mo–So), jeder Balken zeigt Ist vs. Ziel, Defizit-Tage grün hervorgehoben
- [ ] Wochensumme: "Diese Woche X kcal Defizit / Überschuss" 
- [ ] Wenn kein Profil ausgefüllt: CTA "Profil vervollständigen" statt Dashboard
- [ ] Wenn keine Logeinträge heute: "Noch nichts geloggt" mit Link zum Logbuch
- [ ] Dashboard lädt in unter 500ms (gecachte Abfragen bevorzugt)

## Edge Cases
- Nutzer hat Ziel "Gewicht halten" → kein "Defizit" anzeigen, stattdessen "Ausgeglichen" wenn ±100 kcal vom Ziel
- Kalorienziel nicht gesetzt → Hinweis anzeigen, kein Absturz
- Keine Logeinträge für vergangene Wochentage → leere Balken, nicht als 0 kcal zählen
- Tagesgrenze: Mitternacht UTC oder lokale Zeit? → lokale Zeit des Browsers

## Technical Requirements
- Daten werden serverseitig für SSR berechnet (Next.js Server Component)
- Wochenabfrage: `food_log_entries` für aktuelle Woche (Mo–So) aggregiert
- Security: Authentifizierung erforderlich, RLS-geschützte Abfragen

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
