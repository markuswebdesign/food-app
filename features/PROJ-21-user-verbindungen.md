# PROJ-21: User-Verbindungen (Freundschaft)

## Status: In Review
**Created:** 2026-04-07
**Last Updated:** 2026-04-07

## Dependencies
- Requires: PROJ-18 (Rollen-System)

## User Stories
- Als User möchte ich anderen Usern eine Freundschaftsanfrage schicken können, damit wir verbunden sind
- Als User möchte ich eingehende Freundschaftsanfragen sehen und annehmen oder ablehnen können
- Als User möchte ich meine bestehenden Verbindungen sehen, damit ich weiß, mit wem ich verbunden bin
- Als User möchte ich eine Verbindung trennen können, wenn ich das möchte
- Als User möchte ich User nach Name oder Username suchen können, um sie zu finden

## Acceptance Criteria
- [ ] User können andere User über eine Suchfunktion (Name/Username) finden
- [ ] User können eine Freundschaftsanfrage an einen anderen User senden
- [ ] Ein User kann pro Person nur eine ausstehende Anfrage haben
- [ ] Der Empfänger sieht eingehende Anfragen (z.B. im Profil oder via Benachrichtigungspunkt)
- [ ] Der Empfänger kann eine Anfrage annehmen oder ablehnen
- [ ] Nach dem Annehmen sind beide User gegenseitig verbunden
- [ ] Verbindungen werden auf einer eigenen Seite (`/connections` oder im Profil) aufgelistet
- [ ] User können eine bestehende Verbindung jederzeit trennen
- [ ] Bereits verbundene User sehen keinen "Anfrage senden" Button mehr
- [ ] User können keine Anfrage an sich selbst senden

## Edge Cases
- Was passiert, wenn User A eine Anfrage schickt und User B gleichzeitig auch eine an User A? → Erste eingehende Anfrage wird automatisch akzeptiert und Verbindung hergestellt
- Was passiert, wenn eine Anfrage abgelehnt wird? → Anfrage verschwindet; User A kann nach einer Wartezeit (z.B. 7 Tage) erneut anfragen
- Was passiert, wenn User A eine Verbindung trennt? → User B wird nicht explizit benachrichtigt; beide sehen den anderen nicht mehr in ihrer Verbindungsliste
- Was passiert, wenn ein Account deaktiviert wird? → Verbindungen zu diesem Account werden ausgeblendet

## Technical Requirements
- Neue Tabelle `connections` mit: `id`, `requester_id`, `recipient_id`, `status` (`pending`|`accepted`|`declined`), `created_at`
- RLS: User sieht nur Verbindungen, an denen er selbst beteiligt ist
- Unique-Constraint: keine Duplikat-Anfragen zwischen zwei Usern

---

## Implementation Notes
- DB: `connections` table with `requester_id`, `recipient_id`, `status` (pending|accepted|declined) — migration applied
- API: `GET /api/connections` (list + user search via `?search=`), `POST /api/connections` (send request, auto-accepts mutual requests), `PATCH /api/connections/[id]` (accept|decline), `DELETE /api/connections/[id]` (remove/withdraw)
- Page: `/connections` — user search, incoming requests with accept/decline, accepted connections list with remove, sent pending requests with withdraw
- NavBar: "Verbindungen" link added

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
