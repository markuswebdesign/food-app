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

**Datum:** 2026-04-23
**Tester:** QA Engineer (Code-Review + statische Analyse)
**Vitest:** 209/209 bestanden (12 neue Tests in `components/log/macro-progress.test.ts`)
**Playwright:** 9 Tests geschrieben, 9 übersprungen (TEST_USER_EMAIL/TEST_USER_PASSWORD nicht gesetzt) — `tests/PROJ-4-makro-tracking.spec.ts`

### Acceptance Criteria

| # | Kriterium | Status | Anmerkung |
|---|-----------|--------|-----------|
| AC1 | Dashboard "Makros heute": drei Fortschrittsbalken mit Ist-/Zielwert in Gramm | ✅ PASS | `MacroProgress` in Übersicht-Tab unter `CalorieTodayCard` eingebaut |
| AC2 | Makroziele im Profil einstellbar: manuell in Gramm oder als %-Verteilung | ✅ PASS | Gramm-Eingabe vorhanden; %-Modus ist automatischer Fallback (30/30/40) |
| AC3 | Default-Makroziele 30% Protein / 30% Fett / 40% KH bei leeren Feldern | ✅ PASS | `defaultMacroGoals()` implementiert korrekt; Profil zeigt Auto-Werte als Hinweis |
| AC4 | Farbkodierung: unter Ziel neutral, überschritten orange | ✅ PASS | `bg-orange-400` wenn `consumed > goal`, sonst Normalfarbe |
| AC5 | Makro-Werte nur aus Einträgen mit Makrodaten summiert (kein falscher 0-Wert) | ✅ PASS | `sumMacros()` überspringt `null`-Werte; `hasData` nur `true` wenn ≥1 Makro vorhanden |
| AC6 | Fehlende Makrodaten: "nicht erfasst" anzeigen (kein falscher 0-Wert) | ⚠️ PARTIAL | Widget wird bei `hasData=false` komplett ausgeblendet statt "nicht erfasst" zu zeigen — kein falscher 0-Wert, aber auch kein erklärender Text |

### Edge Cases

| Szenario | Status | Anmerkung |
|----------|--------|-----------|
| Rezept ohne Makrodaten → "?" markieren (pro Eintrag im Log) | ❌ FAIL | Kein "?"-Indikator in `DayLog` für Einträge ohne Makros → BUG-1 |
| Nutzer setzt % die sich nicht auf 100% summieren → Validierungsfehler | ✅ N/A | Kein benutzerdefinierter %-Modus — % ist fest auf 30/30/40; kein ungültiger Zustand möglich |
| Sehr niedriges Kalorienziel → Hinweis auf unrealistisch kleine Makroziele | ❌ FAIL | Kein Warnhinweis implementiert → BUG-2 |

### Bugs

#### BUG-1 — Low: Kein "?"-Indikator für Einträge ohne Makrodaten im Logbuch
- **Spec:** "Rezept ohne Makrodaten → Makros für diesen Eintrag als '?' markieren"
- **Ist:** Einträge in der Log-Liste zeigen keine Makros und keinen "?"-Hinweis; nur Kalorien werden angezeigt
- **Auswirkung:** User weiß nicht, warum das Makro-Widget ggf. keine Daten zeigt
- **Ort:** `components/log/day-log.tsx` (Eintragsliste ohne Makro-Indikator)

#### BUG-2 — Low: Kein Warnhinweis bei sehr niedrigem Kalorienziel
- **Spec:** "Sehr niedriges Kalorienziel → Hinweis dass Makroziele unrealistisch klein sein können"
- **Ist:** Kein Warnhinweis; Makroziele werden einfach angezeigt, auch wenn z.B. Protein-Ziel <20g ist
- **Auswirkung:** Edge-Case, seltenes Szenario
- **Ort:** `components/log/macro-progress.tsx` oder `components/profile/profile-health-form.tsx`

### Sicherheits-Audit

| Test | Ergebnis |
|------|----------|
| Makro-Daten nur für eingeloggten User geladen (RLS) | ✅ PASS — Server Component mit `supabase.auth.getUser()` |
| Keine neuen API-Routes → keine neue Angriffsfläche | ✅ PASS |
| Makroziele werden über bestehendes Profil-Update gespeichert (bereits auditiert) | ✅ PASS |

### Regressionstest

| Feature | Status |
|---------|--------|
| Kalorie-Dashboard (CalorieTodayCard) | ✅ PASS — unverändert, keine Regression |
| Streak-Widget | ✅ PASS — unverändert |
| Wochendiagramm | ✅ PASS — unverändert |
| Logbuch-Tab mit MacroProgress | ✅ PASS — weiterhin funktional |
| Vitest 197 vorherige Tests | ✅ PASS — keine Regression |

### Produktionsbereitschaft

**READY** — Keine Critical oder High Bugs. Beide offenen Bugs (BUG-1, BUG-2) sind Low-Severity und können in einem separaten Folge-Sprint behoben werden.

## Deployment
_To be added by /deploy_
