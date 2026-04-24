# PROJ-25: Rezept direkt zum Wochenplan hinzufügen

## Status: In Progress
**Created:** 2026-04-23
**Last Updated:** 2026-04-23

## Dependencies
- Wochenplan (deployed)
- Rezeptverwaltung (deployed)

## User Stories
- Als Nutzer möchte ich auf einer Rezeptkarte per Klick auf ein Kalender-Icon das Rezept direkt zum Wochenplan hinzufügen, ohne erst zur Wochenplan-Seite navigieren zu müssen.
- Als Nutzer möchte ich beim Hinzufügen den Wochentag und die Mahlzeit wählen können.
- Als Nutzer möchte ich, dass die Rezeptkategorie automatisch als Mahlzeitzeit vorausgewählt wird.

## Acceptance Criteria
- [ ] Auf jeder Rezeptkarte erscheint rechts neben dem Herz-Icon ein Kalender-Icon
- [ ] Klick auf das Kalender-Icon öffnet einen kleinen Dialog (kein Seitenwechsel)
- [ ] Der Dialog zeigt: Wochentag wählen (Mo–So) + Mahlzeit wählen (Frühstück/Mittagessen/Abendessen/Snack)
- [ ] Die Mahlzeit ist basierend auf der Rezeptkategorie vorausgewählt (z.B. Kategorie "dinner" → Abendessen)
- [ ] Nach Bestätigung wird das Rezept zum Wochenplan hinzugefügt
- [ ] Eine kurze Erfolgsmeldung ("Zum Wochenplan hinzugefügt") wird angezeigt
- [ ] Das Icon ist auch auf der Rezept-Detailseite vorhanden

## Edge Cases
- Rezept hat keine Kategorie → keine Vorauswahl, User wählt manuell
- Gewählter Slot ist bereits belegt → Rezept wird trotzdem hinzugefügt (mehrere Rezepte pro Slot erlaubt, wie im Wochenplan)
- Nutzer ist nicht eingeloggt → kein Kalender-Icon sichtbar

## Technical Requirements
- Neuer Mini-Dialog (Popover oder Modal) zum Wochentag/Mahlzeit-Auswahl
- API-Call an bestehende Wochenplan-Logik
- Kategorie→Mahlzeit-Mapping: breakfast→Frühstück, lunch→Mittagessen, dinner→Abendessen, snack→Snack

---

## Tech Design (Solution Architect)

### Komponenten-Übersicht

```
components/recipes/recipe-card.tsx
└── Kalender-Icon neben Herz-Icon
    └── öffnet AddToMealPlanPopover

components/recipes/add-to-meal-plan-popover.tsx  ← NEU
├── Wochentag-Auswahl (Mo – So, 7 Buttons)
├── Mahlzeit-Auswahl (Frühstück / Mittagessen / Abendessen / Snack)
│   └── Vorauswahl via Kategorie-Mapping
├── "Hinzufügen"-Button
└── Erfolgsmeldung (Toast)

app/(app)/recipes/[id]/page.tsx
└── Gleiches Kalender-Icon + Popover auf Detailseite
```

### Datenhaltung
Kein neues Schema nötig — schreibt in die **bestehende Wochenplan-Tabelle** via vorhandene API.

### Kategorie → Mahlzeit-Mapping
```
breakfast  → Frühstück
lunch      → Mittagessen
dinner     → Abendessen
snack      → Snack
(leer)     → keine Vorauswahl
```

### Tech-Entscheidungen
| Entscheidung | Warum |
|---|---|
| Popover statt Modal | Leichtgewichtiger, kein Seitenwechsel, passt zur Karten-UX |
| Bestehende Wochenplan-API | Keine neue Backend-Logik nötig, kein Duplikat-Risiko |
| Mapping als Konstante im Frontend | Einfach änderbar, kein DB-Overhead |

### Abhängigkeiten
Keine neuen Pakete (shadcn Popover bereits verfügbar).

## Implementation Notes
- `components/recipes/add-to-meal-plan-popover.tsx` — neu erstellt (base-ui Popover)
- Kalender-Icon in `recipe-card.tsx` neben dem Herz-Icon
- Kalender-Icon auch in `app/(app)/recipes/[id]/page.tsx` für eingeloggte User
- Kategorie→Mahlzeit-Mapping als Konstante im Frontend
- Schreibt meal_plan_entry + food_log_entry via Supabase client (analog zum WeekPlan)

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
