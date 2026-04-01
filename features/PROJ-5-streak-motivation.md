# PROJ-5: Streak & Motivation

## Status: In Progress
**Created:** 2026-04-01
**Last Updated:** 2026-04-01

## Implementation Notes
### Frontend (done)
- `lib/utils/streak.ts` — Streak-Berechnung aus `food_log_entries` (letzte 90 Tage), inkl. längster Streak + Badge-Ableitung
- `components/dashboard/streak-widget.tsx` — Streak-Zahl, Flame-Icon, Motivationstext, Rekord
- `components/profile/badges-section.tsx` — 3 Badges (7/14/30 Tage), earned vs. gesperrt
- `app/(app)/me/page.tsx` — Streak-Fetch immer aktiv, StreakWidget im Übersicht-Tab, BadgesSection im Profil-Tab

### Backend (done)
- Migration `20260401000004_add_streak_badges.sql` — `profiles.longest_streak_days`, neue Tabelle `profile_badges` mit RLS
- `me/page.tsx` — fetcht `profile_badges` + persistiert neuen Rekord + neue Badges bei jedem Load
- BadgesSection zeigt Badges aus DB (kombiniert mit frisch berechneten)

## Dependencies
- Requires: PROJ-3 (Kalorie-Defizit Dashboard) — Streak basiert auf Defizit-Tagen

## User Stories
- Als Nutzer möchte ich sehen, wie viele Tage ich mein Kalorienziel in Folge eingehalten habe, damit ich motiviert bleibe.
- Als Nutzer möchte ich beim Erreichen von Meilensteinen (7, 14, 30 Tage) eine Belohnung/Badge erhalten.
- Als Nutzer möchte ich sehen, wie mein längster bisheriger Streak war.
- Als Nutzer möchte ich eine kurze motivierende Nachricht sehen, die sich je nach Status ändert (auf Kurs / knapp daneben / Streak in Gefahr).

## Acceptance Criteria
- [ ] Streak-Widget im Dashboard: aktuelle Streak-Länge, Flammen-Icon bei aktivem Streak
- [ ] Streak zählt: Tage an denen tatsächliche Kalorien ≤ Kalorienziel (oder ±100 kcal Toleranz bei Ziel "Halten")
- [ ] Streak bricht ab: Wenn heute keine Einträge geloggt wurden UND der Tag bereits vorbei ist (= gestern)
- [ ] Badges: 7 Tage, 14 Tage, 30 Tage — sichtbar im Profil
- [ ] Längster Streak wird dauerhaft gespeichert und im Profil angezeigt
- [ ] Motivationstext wechselt je nach Status:
  - Auf Kurs (Defizit heute): "Super, weiter so!"
  - Noch Zeit (Tag noch nicht vorbei, noch im Ziel): "Du bist auf Kurs"
  - Überschuss heute: "Morgen ist ein neuer Tag"
  - Streak in Gefahr (heute noch kein Log): "Vergiss nicht zu loggen"

## Edge Cases
- Nutzer loggt für gestern nach (rückwirkend) → Streak wird rückwirkend neu berechnet
- Nutzer hat kein Kalorienziel gesetzt → kein Streak berechnen, Hinweis anzeigen
- Streak-Berechnung bei Zeitzonenwechsel → immer Browserzeit als Referenz
- Nutzer loggt gar nicht → Streak = 0, kein Absturz

## Technical Requirements
- Streak wird bei jedem Dashboard-Load aus `food_log_entries` frisch berechnet (kein gecachter Streak-Counter der veraltet)
- Badges werden einmalig in `profile_badges` gespeichert (user_id, badge_type, earned_at)
- Längster Streak in `profiles` (longest_streak_days) aktualisiert wenn neuer Rekord

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Platzierung im UI

```
/me (Tabs)
├── Übersicht-Tab
│   ├── StreakWidget (NEU) ← oben, direkt unter den Tabs
│   ├── CalorieTodayCard (bestehend)
│   ├── WeekChart (bestehend)
│   └── WeekSummary (bestehend)
│
└── Profil-Tab
    ├── BadgesSection (NEU) ← unterhalb des Gesundheitsprofils
    │   ├── Badge: 7 Tage
    │   ├── Badge: 14 Tage
    │   └── Badge: 30 Tage
    └── ProfileHealthForm (bestehend)
```

### Neue Komponenten

- `components/dashboard/streak-widget.tsx` — Streak-Zahl, Flammen-Icon, Motivationstext, Rekord
- `components/profile/badges-section.tsx` — Verdiente Badges im Profil-Tab

### StreakWidget-Inhalt

- Aktuelle Streak-Länge mit Flammen-Icon (z.B. "🔥 5 Tage")
- Motivationstext je nach Status:
  - Heute geloggt & im Ziel → "Super, weiter so!"
  - Heute geloggt & überschritten → "Morgen ist ein neuer Tag"
  - Heute noch nichts geloggt → "Vergiss nicht zu loggen"
- Persönlicher Rekord klein darunter: "Rekord: 14 Tage"
- Nicht anzeigen wenn kein Kalorienziel gesetzt

### Datenbankänderungen

1. Neue Spalte `longest_streak_days INTEGER DEFAULT 0` in `profiles`
2. Neue Tabelle `profile_badges`: user_id, badge_type (streak_7 / streak_14 / streak_30), earned_at

### Streak-Berechnung

- Serverseitig in `me/page.tsx`, bei jedem Load live aus `food_log_entries` berechnet (kein gecachter Counter)
- Rückwärts von gestern zählen: Tage mit Kalorien ≤ Ziel werden gezählt, Stopp beim ersten Fehltag
- Heute separat prüfen für Motivationstext
- Wenn neuer Rekord: `longest_streak_days` in `profiles` aktualisieren + fehlende Badges vergeben

### Abhängigkeiten

- Keine neuen npm-Pakete — Flame-Icon aus lucide-react bereits installiert

## QA Test Results

**Datum:** 2026-04-01
**Tester:** QA Engineer (Claude)
**Unit Tests:** 79/79 bestanden (`npm test`)
**E2E Tests:** Infrastruktur-Problem (Playwright Browser-Crash — betrifft alle Tests im Projekt, kein PROJ-5-spezifisches Problem)

### Acceptance Criteria

| # | Kriterium | Status | Anmerkung |
|---|-----------|--------|-----------|
| 1 | Streak-Widget im Übersicht-Tab, Flammen-Icon, Streak-Zahl | ✅ PASS | |
| 2 | Streak zählt Tage ≤ Ziel (±100 kcal Toleranz bei "Halten") | ❌ FAIL | Toleranz für `goal_type=maintain` nicht implementiert — BUG-2 |
| 3 | Streak bricht ab wenn gestern kein Log | ✅ PASS | Status `no_log` korrekt gehandelt |
| 4 | Badges 7/14/30 Tage im Profil-Tab sichtbar | ✅ PASS | |
| 5 | Längster Streak dauerhaft gespeichert | ✅ PASS | DB-Persistenz funktioniert — aber Anzeige nur in Übersicht (BUG-3) |
| 6 | Motivationstext wechselt je nach Status | ⚠️ PARTIAL | 3 von 4 Spec-States impl.; "Du bist auf Kurs" fehlt — BUG-4 |

### Bugs

| ID | Schwere | Beschreibung | Schritte |
|----|---------|--------------|---------|
| BUG-1 | **High** | `longestStreak`-Berechnung prüft keine Datumskontinuität: historische Lücken (Tage ohne Log) werden ignoriert, alle vorhandenen Einträge werden als lückenlose Serie gezählt | Unit-Test `longestStreak erkennt längere historische Serie` dokumentiert das Fehlverhalten in streak.test.ts |
| BUG-2 | **Medium** | `calcStreak` ignoriert `±100 kcal Toleranz` wenn `goal_type === "maintain"` | Nutzer mit Ziel "Halten" überschreitet Ziel um 50 kcal → Streak bricht ab obwohl Spec Toleranz vorsieht |
| BUG-3 | **Low** | Längster Rekord nicht im Profil-Tab angezeigt | Spec: "im Profil angezeigt" — Rekord erscheint nur im StreakWidget (Übersicht-Tab) |
| BUG-4 | **Low** | Motivationstext "Du bist auf Kurs" fehlt | Spec listet 4 Zustände, implementiert sind 3; `on_track` zeigt immer "Super, weiter so!" |

### Security Audit

- ✅ RLS korrekt auf `profile_badges` (SELECT + INSERT nur für eigenen User)
- ✅ Keine UPDATE/DELETE RLS nötig — Badges sind immutable by design
- ✅ Streak-Berechnung serverseitig — kein Client-seitiger Manipulations-Vektor
- ✅ Badge-Insert nutzt authenticated Supabase-Server-Client
- ✅ UNIQUE-Constraint auf `(user_id, badge_type)` verhindert Duplikate

### Regression

- ✅ Übersicht-Tab: CalorieTodayCard, WeekChart, WeekSummary unverändert sichtbar
- ✅ Logbuch-Tab: keine Regression (separater Tab)
- ✅ Profil-Tab: ProfileHealthForm unverändert

### Produktion-Freigabe

**❌ NICHT BEREIT** — BUG-1 (High: falsche longestStreak-Berechnung) muss vor Deployment behoben werden.

## Deployment
_To be added by /deploy_
