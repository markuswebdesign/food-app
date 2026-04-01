# PROJ-2: Mahlzeiten-Logbuch

## Status: Planned
**Created:** 2026-04-01
**Last Updated:** 2026-04-01

## Dependencies
- Requires: PROJ-1 (Gesundheitsprofil) — für das tägliche Kalorienziel

## User Stories
- Als Nutzer möchte ich täglich meine tatsächlich gegessenen Mahlzeiten erfassen (unabhängig vom Wochenplan), damit ich meine reale Kalorienzufuhr tracken kann.
- Als Nutzer möchte ich ein Rezept aus meiner Rezeptliste als Mahlzeiteintrag hinzufügen (inkl. Portionsanzahl), damit Kalorien automatisch übernommen werden.
- Als Nutzer möchte ich einen Logeintrag per Freitext hinzufügen (mit manueller Kalorien-/Makroangabe), wenn ein Gericht kein Rezept in der App hat.
- Als Nutzer möchte ich meine Logeinträge für einen Tag überblicken und löschen können.
- Als Nutzer möchte ich einen Logeintrag aus dem Wochenplan mit einem Klick ins Logbuch übernehmen ("Als gegessen markieren").

## Acceptance Criteria
- [ ] Neue Seite oder Drawer: /log (Tagesansicht mit Datum-Navigation)
- [ ] Einträge können als Rezept (aus Datenbank) oder Freitext angelegt werden
- [ ] Rezept-Einträge übernehmen Kalorien und Makros automatisch aus `recipe_nutrition` (skaliert nach Portionsanzahl)
- [ ] Freitext-Einträge haben Pflichtfeld Kalorien + optionale Makros (Protein, Fett, Kohlenhydrate)
- [ ] Datum-Navigation: vor/zurück einen Tag, Sprung auf "heute"
- [ ] Tagesübersicht zeigt Summe: Gesamtkalorien des Tages
- [ ] Eintrag löschen mit Bestätigung
- [ ] "Als gegessen markieren"-Button im Wochenplan übernimmt Eintrag ins Logbuch für den jeweiligen Tag
- [ ] Logeinträge werden in neuer Tabelle `food_log_entries` gespeichert (RLS: nur eigene Einträge)

## Edge Cases
- Nutzer hat kein Rezept mit Nährwerten → Freitext-Eingabe als Fallback
- Nutzer loggt dasselbe Rezept mehrfach am Tag → mehrere Einträge erlaubt
- Nutzer navigiert weit in die Vergangenheit → Einträge werden korrekt geladen (kein Limit)
- Portionsanzahl = 0 oder negativ → Validierungsfehler
- Kalorien-Freitext = 0 → erlaubt (Wasser, kalorienfreie Getränke)

## Technical Requirements
- Neue DB-Tabelle: `food_log_entries` (user_id, date, recipe_id nullable, name, calories, protein_g, fat_g, carbs_g, servings, meal_time, created_at)
- RLS: Nur eigene Einträge sichtbar/bearbeitbar
- Performance: Tagesabfrage mit Index auf (user_id, date)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
