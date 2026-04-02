# PROJ-9: Einkaufsliste Upgrade (Kategorien + Wochenplan-Import)

## Status: In Progress
**Created:** 2026-04-01
**Last Updated:** 2026-04-02

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

### Kernentscheidung: Kein Datenbank-Feld für Kategorien

Der Nutzer möchte **keine manuelle Kategorieauswahl** — nur automatische Gruppierung in der Listenansicht. Daher: Kategorien werden **zur Laufzeit berechnet** (aus dem Zutatennamen) und **nicht gespeichert**. Keine DB-Migration notwendig.

### Wie Kategorisierung funktioniert

Gleiche Technik wie der bestehende Nährwert-Lookup (PROJ-11):

```
lookupCategory("Karotte")  → "Gemüse & Obst"
lookupCategory("Hackfleisch") → "Fleisch & Fisch"
lookupCategory("Quinoa")   → "Sonstiges"
```

Wort-Grenz-Matching auf den Zutatennamen → Kategorie. Kein API-Call, kein Datenbank-Zugriff.

### Vordefinierte Kategorien (Supermarkt-Reihenfolge)

| Reihenfolge | Kategorie | Beispiele |
|---|---|---|
| 1 | Gemüse & Obst | Karotte, Zwiebel, Tomate, Apfel, Zitrone |
| 2 | Fleisch & Fisch | Hackfleisch, Hähnchen, Lachs, Wurst |
| 3 | Milchprodukte & Eier | Milch, Butter, Käse, Joghurt, Ei |
| 4 | Brot & Backwaren | Brot, Brötchen, Mehl, Toast |
| 5 | Tiefkühl | Tiefkühlgemüse, Tiefkühlpizza |
| 6 | Gewürze & Öle | Salz, Pfeffer, Öl, Senf, Essig |
| 7 | Konserven & Trockenware | Nudeln, Reis, Linsen, Dosentomaten |
| 8 | Getränke | Wasser, Milch (Tetrapack), Saft |
| 9 | Sonstiges | Alles ohne Match |

### Betroffene Dateien

```
lib/nutrition/local-ingredients.ts    (erweitern)
└── + Kategorie-Feld pro Zutat
└── + lookupCategory(name): string

app/(app)/shopping-list/page.tsx      (erweitern)
└── Items gruppiert nach Kategorie anzeigen
└── Statt "Aus dem Wochenplan" (flach) → Kategorien mit Überschrift
└── Manuelle Items ebenfalls auto-kategorisiert
```

### Was sich NICHT ändert

- Kein Kategorie-Dropdown beim Hinzufügen (manuelle Items)
- Kein Kategorie-Feld in der Datenbank
- Keine DB-Migration
- Keine neue API-Route

### Bereits implementiert (kein neuer Aufwand)

Die Einkaufsliste lädt Wochenplan-Zutaten **bereits automatisch** und aggregiert Mengen. Teil 2 des ursprünglichen Specs (Wochenplan-Import) ist damit bereits erfüllt. Neu hinzu kommt nur die **Anzeige** als Kategorien-Gruppen.

Optional: Link "Zur Einkaufsliste →" im Wochenplan als Navigations-Shortcut.

### Keine neuen npm-Pakete

Rein client-seitige Logik — kein neues Paket notwendig.

## Implementation Notes (Frontend)

**Implementiert am 2026-04-02**

- `lib/nutrition/local-ingredients.ts` — `lookupCategory(name)` + `CATEGORY_ORDER` + `IngredientCategory` Typ hinzugefügt. 9 Kategorien mit ~100 deutschen Keyword-Einträgen. Gleiche Wort-Grenz-Matching-Strategie wie PROJ-11.
- `app/(app)/shopping-list/page.tsx` — Items werden nach Kategorie gruppiert angezeigt. `AggregatedItem` hat jetzt `category`-Feld. Manuelle Items werden ebenfalls auto-kategorisiert. Rezept-Items und manuelle Items werden zusammen in Kategorien-Gruppen (in Supermarkt-Reihenfolge) angezeigt. Erledigte Items gesammelt am Ende.
- Keine DB-Migration, keine neuen API-Routes, kein neues npm-Paket.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
