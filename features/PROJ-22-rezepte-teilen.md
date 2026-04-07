# PROJ-22: Rezepte teilen (mit Connections)

## Status: Planned
**Created:** 2026-04-07
**Last Updated:** 2026-04-07

## Dependencies
- Requires: PROJ-21 (User-Verbindungen)

## User Stories
- Als User möchte ich ein eigenes Rezept mit einer oder mehreren meiner Verbindungen teilen, damit sie es sehen können
- Als User möchte ich geteilte Rezepte von meinen Connections sehen können
- Als User möchte ich ein geteiltes Rezept in meine eigene Rezeptsammlung kopieren können
- Als User möchte ich sehen, wer mir ein Rezept geteilt hat

## Acceptance Criteria
- [ ] Auf der Rezeptdetailseite gibt es eine "Teilen"-Aktion (nur für eigene Rezepte)
- [ ] Beim Teilen kann der User eine oder mehrere seiner Verbindungen auswählen
- [ ] Der Empfänger sieht geteilte Rezepte in einem eigenen Bereich ("Von Connections geteilt") oder via Benachrichtigung
- [ ] Geteilte Rezepte zeigen den Absender an ("Geteilt von [Name]")
- [ ] Der Empfänger kann ein geteiltes Rezept mit einem Klick in seine eigene Sammlung kopieren
- [ ] Der Empfänger kann ein geteiltes Rezept ablehnen/ausblenden
- [ ] Ein Rezept kann mehrfach an dieselbe Person geteilt werden (z.B. nach Aktualisierung), aber doppelte Einträge werden zusammengeführt
- [ ] User können nur eigene (nicht globale, nicht fremde) Rezepte teilen

## Edge Cases
- Was passiert, wenn die Verbindung nach dem Teilen getrennt wird? → Bereits geteilte Rezepte bleiben sichtbar, neue Shares sind nicht mehr möglich
- Was passiert, wenn der Sender das geteilte Rezept löscht? → Das geteilte Rezept verschwindet beim Empfänger (oder bleibt als Kopie, falls bereits kopiert)
- Was passiert, wenn ein User ein Rezept an 50 Connections gleichzeitig teilt? → Erlaubt, aber UI limitiert Auswahl auf alle verfügbaren Connections
- Was passiert, wenn der Empfänger kein Interesse hat? → Ablehnen/Ausblenden-Option ohne Benachrichtigung an den Sender

## Technical Requirements
- Neue Tabelle `shared_recipes` mit: `id`, `recipe_id`, `sender_id`, `recipient_id`, `status` (`pending`|`accepted`|`dismissed`), `created_at`
- RLS: User sieht nur Shares, an denen er beteiligt ist
- Beim "Kopieren" wird ein neuer Rezept-Eintrag mit `user_id` des Empfängers erstellt

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
