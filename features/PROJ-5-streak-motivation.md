# PROJ-5: Streak & Motivation

## Status: Planned
**Created:** 2026-04-01
**Last Updated:** 2026-04-01

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
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
