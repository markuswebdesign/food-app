# PROJ-26: Wochenplan 1-Klick aus Favoriten befüllen

## Status: In Progress
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
_To be added by /qa_

## Deployment
_To be added by /deploy_
