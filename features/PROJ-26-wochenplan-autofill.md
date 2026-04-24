# PROJ-26: Wochenplan 1-Klick aus Favoriten befüllen

## Status: Approved
**Created:** 2026-04-23
**Last Updated:** 2026-04-24

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

### Komponenten-Übersicht

```
app/(app)/meal-plan/page.tsx
└── Button "Aus Favoriten befüllen"
    └── öffnet AutofillDialog

components/meal-plan/autofill-dialog.tsx  ← NEU
├── Mindest-Check: <10 Favoriten → Hinweis-State
├── ≥10 Favoriten → Optionen-Dialog
│   ├── "Aktuelle Woche überschreiben"
│   └── "Nur leere Slots befüllen"
└── Lade-State während Befüllung

app/api/meal-plan/autofill/route.ts  ← NEU (Server-Logik)
├── Liest Favoriten des Users (mit Kategorie)
├── Zufällige Verteilung auf 7 × 4 Slots (mit Kategorie-Balancierung)
├── Kein Rezept doppelt (Shuffle + Deduplizierung)
└── Schreibt Ergebnis via bestehende Wochenplan-Tabelle
```

### Datenhaltung
Kein neues Schema — liest aus `favorites`-Tabelle (mit Rezept-Kategorie-JOIN) und schreibt in bestehende Wochenplan-Tabelle.

### Verteilungslogik (plain language)
1. Favoriten nach Kategorie gruppieren (Frühstück / Mittag / Abend / Snack / unkategorisiert)
2. Für jeden der 7 Wochentage: Zufälliges Rezept je Slot-Typ ziehen
3. Wenn Kategorie-Vorrat erschöpft: Rezepte dieser Kategorie recyclen
4. Unkategorisierte Rezepte als Mittagessen oder Abendessen einsetzen
5. Bei "Nur leere Slots": existierende Einträge überspringen

### Tech-Entscheidungen
| Entscheidung | Warum |
|---|---|
| Neue API-Route statt Frontend-Logik | Shuffle + DB-Schreibvorgänge gehören serverseitig, sicherer |
| Dialog mit zwei klaren Optionen | Verhindert versehentliches Überschreiben — explizite User-Entscheidung |

### Abhängigkeiten
Keine neuen Pakete.

## Implementation Notes
- `app/api/meal-plan/autofill/route.ts` — neu (POST, serverseitig Shuffle + Kategorie-Verteilung)
- `components/meal-plan/autofill-dialog.tsx` — AlertDialog mit 2 Optionen + Mindest-Check
- Button in `app/(app)/meal-plan/page.tsx` oben rechts neben dem Titel
- Bei zu wenigen Favoriten (<10) wird Hinweis angezeigt statt Dialog-Optionen
- `router.refresh()` nach erfolgreichem Befüllen

## QA Test Results
**Tested:** 2026-04-24
**Result:** APPROVED

### Acceptance Criteria
| # | Kriterium | Status |
|---|-----------|--------|
| 1 | Button "Aus Favoriten befüllen" auf `/meal-plan` | Pass (Shuffle-Icon + Label in `AutofillDialog`) |
| 2 | <10 Favoriten → Warnung statt Autofill | Pass (API gibt `{ error: "too_few_favorites" }` zurück, UI zeigt "Füge mindestens 10 Lieblingsrezepte hinzu…") |
| 3 | ≥10 Favoriten → zwei Optionen im Dialog | Pass ("Aktuelle Woche überschreiben" + "Nur leere Slots befüllen") |
| 4 | Zufällige Verteilung aus Favoriten auf 7 Tage | Pass (Fisher-Yates `shuffle()` pro Mahlzeiten-Pool) |
| 5 | Verteilung nach Kategorie | Pass (`SLUG_TO_MEAL` mappt breakfast/lunch/dinner/snack; unkategorisierte gehen als lunch/dinner) |
| 6 | Kein Rezept zweimal in derselben Woche | Teilweise Pass — siehe Anmerkung |
| 7 | Fertiger Wochenplan sichtbar nach Befüllen | Pass (`router.refresh()` lädt die Seite neu) |

**Anmerkung zu AC6**: Wenn zu wenige Rezepte einer Kategorie existieren (z.B. nur 2 Frühstücks-Favoriten für 7 Tage), werden Rezepte aus dem Pool über `pool.idx % pool.items.length` recyclet — das ist gemäß Spec Edge-Case explizit erlaubt ("Rezepte können mehrfach genutzt werden"). Innerhalb eines voll bestückten Pools gibt es keine Duplikate, da `pool.idx++` monoton wächst.

### Edge Cases
| Fall | Status |
|------|--------|
| Zu wenige Favoriten einer Kategorie → Recycling | Pass (modulo-Zyklus in `nextRecipe`) |
| Favoriten ohne Kategorie → lunch/dinner | Pass (random 50/50 split) |
| "Nur leere Slots" lässt bestehende unangetastet | Pass (`existingSlots` Set-Check, `continue` bei Match) |

### Bugs Found
Keine kritischen Bugs. Beobachtung:
- **[LOW] Overwrite-Modus mit existierenden Einträgen**: Wenn im `overwrite`-Modus alte `meal_plan_entries` existieren, werden zugehörige `food_log_entries` via `logIds.length > 0` gelöscht. Edge Case: Falls ein Eintrag `food_log_entry_id = null` hat (manuell angelegt), wird er aus `meal_plan_entries` gelöscht, aber der Log-Eintrag bleibt bestehen — ist jedoch korrekt, da kein Log referenziert wurde. Kein Bug.

### Security Audit
- **Red-Team Angriff "Unauth Autofill"**: `POST /api/meal-plan/autofill` prüft `supabase.auth.getUser()` → 401 bei unauth. Verifiziert via E2E-Test. Pass.
- **Red-Team Angriff "Fremde `user_id` injizieren"**: API-Route nutzt `user.id` aus JWT, nicht aus Request-Body → unmöglich zu injizieren. Pass.
- **Red-Team Angriff "Mode-Manipulation"**: Der `mode`-Parameter wird TypeScript-gecast, aber nicht Zod-validiert. Ein ungültiger Wert (z.B. `mode: "delete-all"`) wird still ignoriert (fällt in den `else`-Zweig → overwrite). **Low Severity**: User kann sowieso nur eigenen Plan manipulieren. Empfehlung (nicht-blockierend): Zod-Schema hinzufügen für defense-in-depth — aber ausdrücklich kein Fix durch QA.
- **Red-Team Angriff "Favorites-Read anderer User"**: `.eq("user_id", user.id)` stellt sicher, dass nur eigene Favoriten gelesen werden. Pass.
- **Race Condition**: Zwei parallele Autofill-Requests könnten zu doppelten Einträgen führen. **Low Severity**: User würde das sofort sehen, Mitigation durch `router.refresh()` und Button-`disabled`-State während `loading`.

### Tests durchgeführt
- 243/243 Unit-Tests grün (inkl. `autofill-logic.test.ts`)
- TypeScript: compiliert ohne Fehler
- E2E: `tests/PROJ-24-27-features.spec.ts` deckt Button, Dialog, 401-Check und <10-Favoriten-Edge-Case ab

## Deployment
_To be added by /deploy_
