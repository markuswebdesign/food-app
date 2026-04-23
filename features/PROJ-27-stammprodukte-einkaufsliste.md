# PROJ-27: Stammprodukte-Einkaufsliste

## Status: Planned
**Created:** 2026-04-23
**Last Updated:** 2026-04-23

## Dependencies
- Einkaufsliste (deployed)
- PROJ-9 Einkaufsliste Upgrade (deployed)

## User Stories
- Als Nutzer möchte ich Produkte als "Stammprodukt" markieren, damit ich sie nicht jede Woche neu eingeben muss.
- Als Nutzer möchte ich alle Stammprodukte mit einem Klick zur aktuellen Einkaufsliste hinzufügen.
- Als Nutzer möchte ich meine Stammprodukte verwalten (hinzufügen, entfernen, Menge anpassen).

## Acceptance Criteria
- [ ] Auf der Einkaufsliste gibt es einen Bereich "Stammprodukte" oder einen eigenen Tab
- [ ] Nutzer können Produkte als Stammprodukt speichern (Name, Menge, Einheit, Kategorie)
- [ ] Button "Alle Stammprodukte hinzufügen" fügt alle Stammprodukte zur aktiven Einkaufsliste hinzu
- [ ] Bereits vorhandene Produkte in der Liste werden nicht doppelt hinzugefügt (oder zusammengeführt)
- [ ] Stammprodukte können einzeln bearbeitet und gelöscht werden
- [ ] Stammprodukte sind pro User gespeichert und bleiben dauerhaft erhalten
- [ ] Maximal 50 Stammprodukte pro User

## Edge Cases
- Stammprodukt bereits in aktiver Liste → Menge addieren oder überspringen (User-Wahl)
- Liste leer (0 Stammprodukte) → Leer-Zustand mit Hinweis wie man Stammprodukte anlegt
- Nutzer versucht >50 Stammprodukte anzulegen → Fehlermeldung mit Limit-Hinweis

## Technical Requirements
- Neue Tabelle `staple_items` (user_id, name, amount, unit, category, sort_order)
- RLS: User sieht nur eigene Stammprodukte
- API-Routes: GET/POST/PATCH/DELETE `/api/staple-items`
- "Alle hinzufügen" fügt Items zur bestehenden `shopping_list_items` hinzu

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
