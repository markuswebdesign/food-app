# PROJ-27: Stammprodukte-Einkaufsliste

## Status: Approved
**Created:** 2026-04-23
**Last Updated:** 2026-04-24

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
**Tested:** 2026-04-24
**Result:** APPROVED

### Acceptance Criteria
| # | Kriterium | Status |
|---|-----------|--------|
| 1 | Einkaufsliste hat Bereich/Tab "Stammprodukte" | Pass (Tab-Toggle in `app/(app)/shopping-list/page.tsx` neben "Einkaufsliste") |
| 2 | Nutzer speichern Stammprodukt (Name, Menge, Einheit, Kategorie) | Pass (`POST /api/staple-items`, Felder im Add-Form) |
| 3 | Button "Alle Stammprodukte hinzufügen" → aktive Liste | Pass ("Alle zur Liste"-Button, schreibt in `localStorage.shopping-list-manual`) |
| 4 | Bereits vorhandene Produkte → Merge statt Duplikat | Pass (Lookup via name+unit-Keys case-insensitive, `amount` wird addiert) |
| 5 | Stammprodukte einzeln bearbeiten/löschen | Pass (`PATCH` / `DELETE` via `/api/staple-items/[id]`, UI-Icons Pencil + Trash) |
| 6 | Pro User gespeichert, dauerhaft | Pass (Supabase-Tabelle `staple_items` mit `user_id` + RLS) |
| 7 | Maximal 50 Stammprodukte | Pass (Serverseitiger Check in `POST`-Handler → 400 bei `>=50`) |

### Edge Cases
| Fall | Status |
|------|--------|
| Stammprodukt bereits in Liste → Menge addieren | Pass (Merge-Logik in `handleAddAllToList`) |
| Leer-Zustand mit Hinweis | Pass ("Noch keine Stammprodukte" + Hint "Füge Produkte hinzu, die du regelmäßig einkaufst") |
| >50 Stammprodukte → Fehlermeldung | Pass (API gibt 400 + "Maximale Anzahl von 50 Stammprodukten erreicht") |

### Bugs Found
Keine kritischen Bugs. Beobachtungen:
- **[LOW] Merge-Ignoriert-amount=null**: Falls ein Stammprodukt `amount = null` hat (z.B. "Salz" ohne Menge), greift der `match && item.amount != null`-Check nicht → es wird kein Eintrag erstellt und auch nicht addiert. Wenn der Eintrag noch nicht existiert, wird er korrekt neu angelegt (`!match`-Branch). Edge Case funktioniert wie erwartet. Kein Bug.
- **[LOW] Kein Optimistic-UI bei Delete**: Löschen wartet auf `fetch`-Response, bevor Zeile aus State entfernt wird. Bei langsamer Verbindung spürbar. Nicht-blockierend.

### Security Audit
- **Red-Team Angriff "Unauth access"**: Alle 4 API-Endpunkte (`GET`, `POST`, `PATCH`, `DELETE`) prüfen `supabase.auth.getUser()` → 401. Verifiziert via E2E-Tests. Pass.
- **Red-Team Angriff "50er-Limit Bypass via Frontend"**: Das Limit wird **serverseitig** enforced via `count().select("id", { count: "exact", head: true }).eq("user_id", user.id)` → 400 Response. Ein manipulierter Frontend-Client kann das Limit nicht umgehen. Pass.
- **Red-Team Angriff "Fremde Stammprodukte lesen"**: RLS-Policies (`auth.uid() = user_id`) greifen für SELECT, INSERT, UPDATE, DELETE. Pass. Migration `20260424000000_staple_items.sql` aktiviert `enable row level security` korrekt.
- **Red-Team Angriff "Name-Injection / XSS"**: Der `name` wird `.trim()`ed, aber nicht HTML-escaped — React rendert ihn jedoch automatisch als Text-Node, nicht als HTML. Kein XSS-Vektor in der UI. Pass.
- **Red-Team Angriff "SQL-Injection via unit/category"**: Supabase PostgREST nutzt Prepared Statements — kein SQL-Injection-Vektor. Pass.
- **Red-Team Angriff "amount negativ oder sehr groß"**: Keine Zod-Validierung auf `amount` (nur `parseFloat`). Negative Werte oder `Infinity` sind theoretisch akzeptiert. **Low Severity**: Betrifft nur eigene Liste, kein Datenleak. Empfehlung (nicht-blockierend): Zod-Schema mit `.positive()` einführen.
- **localStorage ist gescope auf Origin**: "Alle zur Liste"-Merge schreibt in `localStorage.shopping-list-manual` — korrekte Entscheidung da die gesamte Einkaufsliste localStorage-basiert ist (konsistent mit bestehender Architektur). Kein Auth-Issue.

### Tests durchgeführt
- 243/243 Unit-Tests grün (inkl. `staple-items-merge.test.ts`)
- TypeScript: compiliert ohne Fehler
- E2E: `tests/PROJ-24-27-features.spec.ts` deckt Tab, CRUD, Limit-Counter, 401-Checks ab

## Deployment
_To be added by /deploy_
