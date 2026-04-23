# PROJ-25: Rezept direkt zum Wochenplan hinzufügen

## Status: Planned
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
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
