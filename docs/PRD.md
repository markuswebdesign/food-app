# Product Requirements Document — Food App

## Vision
Eine persönliche Ernährungs-App, die Nutzern hilft, gesünder zu essen, indem sie Rezepte verwalten, Wochenpläne erstellen und Kalorien- sowie Nährstoffziele im Blick behalten.

## Target Users
Gesundheitsbewusste Menschen, die ihr Gewicht reduzieren oder halten möchten und dafür ihren Wochenplan und Kalorienhaushalt im Blick haben wollen.

## Core Features (Roadmap)

| Priorität | Feature | Status |
|-----------|---------|--------|
| P0 | Rezeptverwaltung (inkl. Import & Nährwerte) | Deployed |
| P0 | Wochenplan | Deployed |
| P0 | Einkaufsliste | Deployed |
| P0 | Authentifizierung | Deployed |
| P1 | PROJ-1: Gesundheitsprofil + TDEE-Rechner | Planned |
| P1 | PROJ-2: Mahlzeiten-Logbuch | Planned |
| P1 | PROJ-3: Kalorie-Defizit Dashboard | Planned |
| P2 | PROJ-4: Makro-Tracking | Planned |
| P2 | PROJ-5: Streak & Motivation | Planned |

## Success Metrics
- Nutzer sehen täglich ihr Kaloriendefizit auf einen Blick
- Nutzer loggen Mahlzeiten mindestens 5x pro Woche
- Streak-Feature erhöht Retention (Ziel: 7-Tage-Streak bei 40% der aktiven Nutzer)

## Constraints
- Next.js + Supabase Stack (bestehendes Projekt)
- Keine nativen Mobile Apps — Web-first, responsive

## Non-Goals
- Keine Barcode-Scanner-Integration (vorerst)
- Kein sozialer Feed / Community-Features
- Kein Fitness-/Sport-Tracking
