# PROJ-3: Kalorie-Defizit Dashboard

## Status: Architected
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

### Route & Komponenten-Struktur

```
app/page.tsx → redirect /dashboard

/dashboard
└── app/(app)/dashboard/page.tsx  [Server Component]
    ├── CalorieTodayCard   — gegessen / Ziel / Rest, Fortschrittsbalken, Statusbadge
    ├── WeekChart          — 7 Balken Mo–So: Ist vs. Ziel, Defizit-Tage grün
    ├── WeekSummary        — Gesamt-Defizit/-Überschuss der Woche
    └── ProfileCTA         — nur wenn kein Profil vorhanden
```

### Datenquellen (keine DB-Änderungen nötig)

| Tabelle | Zweck |
|---|---|
| `profiles` | Kalorienziel, goal_type, TDEE-Felder |
| `food_log_entries` (heute) | Summe gegessener Kalorien |
| `food_log_entries` (Mo–So) | Tageswerte für Wochenbalken |

3 parallele Abfragen beim Seitenaufruf.

### Neue Dateien

```
app/(app)/dashboard/page.tsx          — Server Component, Datenaggregation
components/dashboard/calorie-today-card.tsx
components/dashboard/week-chart.tsx
components/dashboard/week-summary.tsx
components/dashboard/profile-cta.tsx
lib/utils/dashboard.ts               — Wochenberechnungs-Hilfsfunktionen
```

### Tech-Entscheidungen

- **SSR via Server Component**: fertig gerendert, kein Flackern, <500ms
- **Keine neuen Pakete**: shadcn/ui Card, Badge, Progress bereits vorhanden
- **Keine API-Route**: direkte Supabase-Server-Abfragen
- **Wiederverwendung**: `calcTdee`, `calcCalorieGoal`, `calorieBalanceLabel` aus PROJ-1/PROJ-2

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
