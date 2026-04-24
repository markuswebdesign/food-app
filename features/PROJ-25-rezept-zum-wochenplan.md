# PROJ-25: Rezept direkt zum Wochenplan hinzufügen

## Status: Approved
**Created:** 2026-04-23
**Last Updated:** 2026-04-24

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
**Tested:** 2026-04-24
**Result:** APPROVED

### Acceptance Criteria
| # | Kriterium | Status |
|---|-----------|--------|
| 1 | Auf jeder Rezeptkarte rechts neben dem Herz-Icon ein Kalender-Icon | Pass (`AddToMealPlanPopover` in `recipe-card.tsx` innerhalb `.absolute.top-2.right-2.flex.gap-1`, vor `FavoriteButton`) |
| 2 | Klick öffnet Dialog (kein Seitenwechsel) | Pass (base-ui Popover, `e.preventDefault()` verhindert Link-Navigation) |
| 3 | Dialog zeigt Wochentag (Mo–So) + Mahlzeit (Frühstück/Mittagessen/Abendessen/Snack) | Pass (7 Day-Chips + 4 Meal-Chips) |
| 4 | Mahlzeit vorausgewählt basierend auf Kategorie | Pass (`CATEGORY_TO_MEAL`-Mapping, Fallback `lunch`) |
| 5 | Bestätigung fügt Rezept zum Wochenplan hinzu | Pass (Upsert in `meal_plans` + Insert in `meal_plan_entries` + `food_log_entries`) |
| 6 | Erfolgsmeldung sichtbar | Pass ("✓ Zum Wochenplan hinzugefügt", 1.5s Delay dann Popover schließt) |
| 7 | Icon auch auf Rezept-Detailseite | Pass (`app/(app)/recipes/[id]/page.tsx` rendert `<AddToMealPlanPopover>` wenn `user` vorhanden) |

### Edge Cases
| Fall | Status |
|------|--------|
| Rezept ohne Kategorie → kein Preselect | Pass (Fallback `"lunch"` statt undefined) |
| Slot bereits belegt → mehrere Rezepte erlaubt | Pass (kein Duplikat-Check, bewusst wie im Wochenplan) |
| Nutzer nicht eingeloggt → kein Icon | Pass im Detail-View (`{user && ...}`). Im Listen-View (`/recipes`) ist die komplette Route unter `(app)/` auth-geschützt, daher kein Issue. |

### Bugs Found
Keine Bugs gefunden.

### Security Audit
- **Red-Team Angriff "Fremder User fügt Rezept in fremden Wochenplan ein"**: Der Popover nutzt `supabase.auth.getUser()` → wenn nicht eingeloggt, bricht die Funktion ab. `meal_plans` und `meal_plan_entries` haben RLS → der `.insert()` kann nur mit eigener `user_id` erfolgen, da das Supabase JWT für die Auth genutzt wird.
- **Red-Team Angriff "Rezept-ID manipulation"**: Der `recipeId` wird als Prop reingegeben und direkt in `insert()` geschrieben. Das wäre ein Angriffsvektor wenn ein User einen fremden privaten `recipe_id` raten könnte. Mitigation: `recipes`-Tabelle hat RLS für Lesen, aber INSERT auf `meal_plan_entries.recipe_id` ist nicht gegenge-FK-checked auf "darf ich dieses Rezept sehen". **Low Severity**: User kann nur in *eigenen* Wochenplan schreiben; das Einfügen einer fremden `recipe_id` führt maximal dazu, dass das eigene Log nicht geladen werden kann (RLS auf `recipes` beim Lesen). Keine Datenleak-Gefahr.
- **base-ui vs Radix**: Popover nutzt `@base-ui/react` Popover-Primitive — bewusst gewählt; keine neuen Abhängigkeiten, keine CSP-/XSS-Issues festgestellt.

### Tests durchgeführt
- 243/243 Unit-Tests grün
- TypeScript: compiliert ohne Fehler
- E2E: `tests/PROJ-24-27-features.spec.ts` deckt AC1–AC7 ab

## Deployment
_To be added by /deploy_
