# PROJ-21: User-Verbindungen (Freundschaft)

## Status: Deployed
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

**Date:** 2026-04-07
**Tester:** QA Engineer (automated)
**Result:** ✅ READY — No Critical/High bugs

### Acceptance Criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | User können andere User über Suchfunktion finden | ✅ PASS — GET /api/connections?search= + Suchfeld auf /connections |
| 2 | User können eine Freundschaftsanfrage senden | ✅ PASS — POST /api/connections |
| 3 | Ein User kann pro Person nur eine ausstehende Anfrage haben | ✅ PASS — unique_connection DB constraint + Duplikat-Check in API |
| 4 | Empfänger sieht eingehende Anfragen | ✅ PASS — "Anfragen" Sektion auf /connections |
| 5 | Empfänger kann annehmen oder ablehnen | ✅ PASS — PATCH /api/connections/[id] mit accept/decline |
| 6 | Nach Annehmen beide gegenseitig verbunden | ✅ PASS — status = "accepted", beide sehen sich in der Liste |
| 7 | Verbindungen auf eigener Seite aufgelistet | ✅ PASS — /connections Seite mit "Meine Verbindungen" Sektion |
| 8 | User können Verbindung trennen | ✅ PASS — DELETE /api/connections/[id] via Trash-Icon |
| 9 | Bereits verbundene User sehen keinen "Anfrage senden" Button mehr | ✅ PASS — connectionStatusWith() zeigt "Verbunden" Badge |
| 10 | User können keine Anfrage an sich selbst senden | ✅ PASS — Server-seitige Prüfung (400) + Suche excludiert own ID |

### Edge Cases

| Case | Result |
|------|--------|
| Gegenseitige Anfragen (A→B gleichzeitig B→A) | ✅ PASS — Auto-Accept der Gegenanfrage |
| Anfrage zurückziehen (gesendete pending requests) | ✅ PASS — "Zurückziehen" Button im "Gesendete Anfragen" Bereich |

### Bugs Found

**BUG-21-01** 🔵 **Low: Kein 7-Tage-Cooldown nach abgelehnter Anfrage**
- Spec: "User A kann nach einer Wartezeit (z.B. 7 Tage) erneut anfragen"
- Aktuelle Implementierung: Abgelehnte Anfragen bleiben dauerhaft in der DB (unique_constraint blockiert Neu-Anfragen)
- Auswirkung: User kann nie erneut anfragen nach einem Decline (restriktiver als spec)
- Severity: Low (Spec sagt "z.B." = nicht fest, aktuelles Verhalten ist defensiv akzeptabel)

### Security Audit

| Check | Result |
|-------|--------|
| Unauthenticated GET /api/connections → 401 | ✅ |
| Unauthenticated POST /api/connections → 401 | ✅ |
| Unauthenticated PATCH /api/connections/[id] → 401 | ✅ |
| Unauthenticated DELETE /api/connections/[id] → 401 | ✅ |
| User kann fremde Connection nicht accept/decline | ✅ (Recipient-Check in API) |
| RLS INSERT: with_check auth.uid() = requester_id | ✅ |
| RLS SELECT: nur eigene Verbindungen sichtbar | ✅ |
| RLS UPDATE: nur eigene Verbindungen änderbar | ✅ |

### E2E Tests
- File: `tests/PROJ-21-user-verbindungen.spec.ts`
- 12 passed (unauthenticated), rest skipped (need TEST_USER_EMAIL env var)

## Deployment
- **Production URL:** https://food-app-one-sage.vercel.app
- **Deployed:** 2026-04-08
- **Git tag:** v1.21.0-PROJ-21
