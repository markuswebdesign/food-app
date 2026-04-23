# PROJ-26: Wochenplan 1-Klick aus Favoriten befüllen

## Status: Planned
**Created:** 2026-04-23
**Last Updated:** 2026-04-23

## Dependencies
- Wochenplan (deployed)
- Rezeptverwaltung / Favoriten (deployed)

## User Stories
- Als Nutzer möchte ich den Wochenplan mit einem Klick automatisch aus meinen Lieblingsrezepten befüllen, damit ich keine Zeit mit manueller Planung verbringe.
- Als Nutzer möchte ich eine Warnung sehen, wenn ich noch zu wenige Favoriten habe (min. 10 nötig).
- Als Nutzer möchte ich, dass die Rezepte sinnvoll nach Kategorie auf Mahlzeiten verteilt werden.

## Acceptance Criteria
- [ ] Auf der Wochenplan-Seite gibt es einen Button "Aus Favoriten befüllen"
- [ ] Klick prüft Anzahl der Favoriten — weniger als 10: Hinweis "Füge mindestens 10 Lieblingsrezepte hinzu, um diese Funktion zu nutzen"
- [ ] Bei ≥10 Favoriten: Dialog mit Optionen — "Aktuelle Woche überschreiben" oder "Leere Slots befüllen"
- [ ] Die Funktion verteilt Rezepte zufällig aus Favoriten auf die 7 Wochentage
- [ ] Verteilung nach Kategorie: Frühstück-Rezepte → Frühstück-Slot, Abendessen → Abendessen-Slot etc.
- [ ] Kein Rezept erscheint zweimal in derselben Woche
- [ ] Nach dem Befüllen sieht der User den fertigen Wochenplan

## Edge Cases
- Zu wenige Favoriten einer Kategorie (z.B. nur 2 Frühstücks-Favoriten für 7 Tage) → Rezepte können mehrfach genutzt werden
- Favoriten ohne Kategorie → werden zufällig als Mittagessen oder Abendessen eingeplant
- Nutzer hat bereits teilweise befüllten Wochenplan → "Nur leere Slots" Option lässt bestehende Einträge unangetastet

## Technical Requirements
- Leseaufruf auf `favorites`-Tabelle mit JOIN auf `recipe_categories`
- Zufällige Auswahl mit Kategorie-Balancierung
- Bestehende Wochenplan-Schreib-API nutzen

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
