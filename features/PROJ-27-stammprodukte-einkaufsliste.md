# PROJ-27: Stammprodukte-Einkaufsliste

## Status: In Progress
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

### Komponenten-Übersicht

```
app/(app)/shopping-list/page.tsx
└── Neuer Tab oder Bereich "Stammprodukte"
    └── StapleItemsPanel

components/shopping-list/staple-items-panel.tsx  ← NEU
├── Leer-Zustand (Hinweis wie man Stammprodukte anlegt)
├── Liste aller Stammprodukte (Name, Menge, Einheit, Kategorie)
│   ├── Bearbeiten-Icon pro Item
│   └── Löschen-Icon pro Item
├── "Stammprodukt hinzufügen"-Formular (inline oder Mini-Dialog)
└── Button "Alle zur Einkaufsliste hinzufügen"

app/api/staple-items/route.ts  ← NEU
└── GET (alle eigenen) / POST (neu anlegen, max 50-Check)

app/api/staple-items/[id]/route.ts  ← NEU
└── PATCH (bearbeiten) / DELETE (löschen)
```

### Datenhaltung — Neue Tabelle `staple_items`

| Feld | Typ | Beschreibung |
|---|---|---|
| id | UUID | Primärschlüssel |
| user_id | UUID | Verknüpfung mit dem User (RLS) |
| name | Text | Produktname |
| amount | Zahl | Menge |
| unit | Text | Einheit (g, ml, Stück …) |
| category | Text | Kategorie (Obst, Milch, Fleisch …) |
| sort_order | Zahl | Reihenfolge in der Liste |

**Row Level Security:** User sieht und bearbeitet nur eigene Stammprodukte.

**"Alle hinzufügen"-Logik:** Prüft ob Produkt bereits in aktiver Einkaufsliste → Menge addieren (kein Duplikat). Schreibt in bestehende `shopping_list_items`-Tabelle.

### Tech-Entscheidungen
| Entscheidung | Warum |
|---|---|
| Eigene Tabelle `staple_items` | Klar getrennt von Einkaufsliste, dauerhaft persistent |
| RLS auf DB-Ebene | User kann nie fremde Stammprodukte sehen/löschen |
| 50er-Limit serverseitig enforced | Verhindert Missbrauch, auch ohne Frontend-Bypass |
| Menge addieren statt Duplikat | Intuitivstes Verhalten — "100g Butter" + "100g Butter" = "200g Butter" |

### Abhängigkeiten
Keine neuen Pakete. Neue Supabase-Migration nötig für `staple_items`-Tabelle.

## Implementation Notes
- Supabase-Migration `20260424000000_staple_items.sql` — `staple_items` Tabelle mit RLS
- `app/api/staple-items/route.ts` — GET/POST (50er-Limit serverseitig)
- `app/api/staple-items/[id]/route.ts` — PATCH/DELETE
- `components/shopping-list/staple-items-panel.tsx` — vollständiges CRUD-Panel
- "Alle zur Liste hinzufügen" schreibt direkt in localStorage (`shopping-list-manual`) — kein extra DB-Call nötig, da Einkaufsliste localStorage-basiert ist
- Tab "Stammprodukte" in `app/(app)/shopping-list/page.tsx` neben "Einkaufsliste"

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
