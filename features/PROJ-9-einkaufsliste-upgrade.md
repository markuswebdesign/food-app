# PROJ-9: Einkaufsliste Upgrade (Kategorien + Wochenplan-Import)

## Status: Planned
**Created:** 2026-04-01
**Last Updated:** 2026-04-01

## Dependencies
- Einkaufsliste (deployed)
- Wochenplan (deployed)

## Beschreibung
Zwei zusammengehörige Erweiterungen der Einkaufsliste:
1. **Kategorien:** Zutaten werden nach Supermarkt-Kategorien gruppiert angezeigt.
2. **Wochenplan-Import:** Alle Zutaten des Wochenplans können mit einem Klick zur Einkaufsliste hinzugefügt werden — ohne Duplikate, mit Mengen-Addition.

---

## Teil 1: Einkaufsliste nach Kategorien

### User Stories
- Als Nutzer möchte ich meine Einkaufsliste nach Kategorien geordnet sehen, damit ich im Supermarkt nicht mehrfach durch verschiedene Abteilungen laufen muss.
- Als Nutzer möchte ich beim Hinzufügen einer Zutat eine Kategorie auswählen können.
- Als Nutzer möchte ich die Kategorie einer bestehenden Zutat ändern können.

### Acceptance Criteria
- [ ] Zutaten in der Einkaufsliste werden nach Kategorien gruppiert angezeigt
- [ ] Jede Kategorie hat eine Überschrift und ist visuell klar abgegrenzt
- [ ] Beim Hinzufügen einer Zutat kann eine Kategorie ausgewählt werden (Dropdown)
- [ ] Vordefinierte Kategorien: Gemüse & Obst, Fleisch & Fisch, Milchprodukte & Eier, Brot & Backwaren, Tiefkühl, Gewürze & Öle, Konserven & Trockenware, Getränke, Sonstiges
- [ ] Zutaten ohne Kategorie werden unter "Sonstiges" eingeordnet
- [ ] Kategorie kann nachträglich geändert werden

### Edge Cases
- Bereits bestehende Zutaten ohne Kategorie → automatisch "Sonstiges"
- Alle Zutaten einer Kategorie abgehakt → Kategorie kann kollabiert oder ausgegraut werden

---

## Teil 2: Zutaten aus Wochenplan zur Einkaufsliste

### User Stories
- Als Nutzer möchte ich alle Zutaten meines Wochenplans mit einem Klick zur Einkaufsliste hinzufügen, damit ich nicht jedes Rezept einzeln durchgehen muss.
- Als Nutzer möchte ich, dass gleiche Zutaten zusammengeführt werden (z.B. 200g + 300g Mehl = 500g Mehl).
- Als Nutzer möchte ich eine Vorschau sehen, bevor Zutaten zur Liste hinzugefügt werden.

### Acceptance Criteria
- [ ] Im Wochenplan gibt es einen Button "Zur Einkaufsliste hinzufügen"
- [ ] Zutaten aller Rezepte der ausgewählten Woche werden gesammelt
- [ ] Gleiche Zutaten (gleicher Name + gleiche Einheit) werden zusammengeführt, Mengen addiert
- [ ] Bereits in der Einkaufsliste vorhandene Zutaten werden zusammengeführt, nicht doppelt angelegt
- [ ] Eine Vorschau zeigt, welche Zutaten hinzugefügt werden
- [ ] Nach dem Hinzufügen wird der Nutzer zur Einkaufsliste weitergeleitet oder eine Erfolgsmeldung angezeigt
- [ ] Beim Import werden Kategorien automatisch zugewiesen (passend zu Teil 1)
- [ ] Zutaten ohne Mengenangabe werden mit "nach Bedarf" markiert

### Edge Cases
- Unterschiedliche Einheiten gleicher Zutat (200g + 1 Stück Karotte) → getrennt aufgeführt, keine fehlerhafte Addition
- Wochenplan leer → Button deaktiviert oder Hinweis
- Nutzer klickt mehrfach → keine Duplikate (Deduplication)

---

## Technical Requirements
- DB-Migration: `category`-Feld in Einkaufsliste-Tabelle (Enum oder String-Set)
- Zutaten-Matching nach Name (case-insensitive) und Einheit beim Import
- Mengen-Addition nur bei gleicher Einheit

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
