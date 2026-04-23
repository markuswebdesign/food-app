# PROJ-4: Makro-Tracking

## Status: Architected
**Created:** 2026-04-01
**Last Updated:** 2026-04-23

## Dependencies
- Requires: PROJ-1 (Gesundheitsprofil) — für Makroziele
- Requires: PROJ-2 (Mahlzeiten-Logbuch) — für tatsächliche Makrowerte
- Requires: PROJ-3 (Dashboard) — Makros werden als Erweiterung im Dashboard angezeigt

## User Stories
- Als Nutzer möchte ich täglich sehen, wie viel Protein, Fett und Kohlenhydrate ich gegessen habe.
- Als Nutzer möchte ich Makroziele (Protein, Fett, Kohlenhydrate) als Zielwert in Gramm oder als Prozent der Kalorien einstellen.
- Als Nutzer möchte ich im Dashboard eine kompakte Makro-Übersicht sehen (drei Fortschrittsbalken).

## Acceptance Criteria
- [ ] Dashboard-Sektion "Makros heute": drei Fortschrittsbalken (Protein / Fett / Kohlenhydrate) mit Ist-/Zielwert in Gramm
- [ ] Makroziele im Profil einstellbar: manuell in Gramm oder als %-Verteilung der Kalorien
- [ ] Default-Makroziele wenn nicht gesetzt: 30% Protein, 30% Fett, 40% Kohlenhydrate (von Kalorienziel)
- [ ] Farbkodierung: unter Ziel = neutral, überschritten = orange
- [ ] Makro-Werte aus Logeinträgen summiert (nur Einträge mit Makrodaten, nicht nur Kalorien)
- [ ] Fehlende Makrodaten in Logeinträgen werden als "nicht erfasst" angezeigt (kein falscher 0-Wert)

## Edge Cases
- Rezept ohne Makrodaten (nur Kalorien) → Makros für diesen Eintrag als "?" markieren
- Nutzer setzt Makros in % die sich nicht auf 100% summieren → Validierungsfehler
- Nutzer hat sehr niedriges Kalorienziel → Makroziele können in Gramm unrealistisch klein wirken → Hinweis anzeigen

## Technical Requirements
- Makroziele in `profiles` speichern (protein_goal_g, fat_goal_g, carbs_goal_g nullable)
- Berechnung client- oder serverseitig aus vorhandenen `food_log_entries`-Makrofeldern

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

**Analysedatum:** 2026-04-23

### Befund: Fast alles bereits implementiert

Bei der Codeanalyse wurde festgestellt, dass der Großteil von PROJ-4 bereits in früheren Sprints umgesetzt wurde:

| Bereich | Status | Datei |
|---------|--------|-------|
| MacroProgress-Komponente (3 Fortschrittsbalken, Farbkodierung) | ✅ Fertig | `components/log/macro-progress.tsx` |
| Hilfsfunktionen: sumMacros, defaultMacroGoals, effectiveMacroGoals | ✅ Fertig | `components/log/macro-progress.tsx` |
| DB-Spalten `protein_goal_g`, `fat_goal_g`, `carbs_goal_g` in `profiles` | ✅ Vorhanden | Supabase |
| Makroziele im Profil einstellbar (Formular mit Auto-Berechnung) | ✅ Fertig | `components/profile/profile-health-form.tsx` |
| Makro-Widget im Logbuch-Tab | ✅ Fertig | `components/log/day-log.tsx` |

### Fehlende Komponente

**Einzige noch fehlende Sache:** Das `MacroProgress`-Widget fehlt im **Übersicht-Tab** (Dashboard).

Im Übersicht-Tab (`app/(app)/me/page.tsx`) werden heutige Log-Einträge nur mit `calories` abgefragt. Die Makro-Spalten (`protein_g`, `fat_g`, `carbs_g`) fehlen in dieser Query, und das `MacroProgress`-Widget wird nicht gerendert.

### Lösungsplan (Frontend-only, ~15 Zeilen)

```
app/(app)/me/page.tsx — Übersicht-Tab-Block anpassen:
  1. todayEntries-Query: calories → calories, protein_g, fat_g, carbs_g
  2. macroTotals berechnen mit sumMacros() (bereits importiert)
  3. effectiveGoals mit effectiveMacroGoals() (bereits importiert)
  4. <MacroProgress> unter <CalorieTodayCard> im JSX einbauen
```

### Keine neuen Abhängigkeiten
- Keine DB-Migration nötig
- Keine neue API-Route nötig
- Keine neuen Packages nötig
- Alle benötigten Hilfsfunktionen und Komponenten existieren bereits

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
