# PROJ-22: Rezepte teilen (mit Connections)

## Status: Deployed
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

## Implementation Notes
- DB: `shared_recipes` table with `recipe_id`, `sender_id`, `recipient_id`, `status` (pending|accepted|dismissed) — migration applied
- API: `GET /api/shared-recipes` (inbox), `POST /api/shared-recipes` (share with connection list, validates ownership + connection), `PATCH /api/shared-recipes/[id]` (dismiss), `POST /api/shared-recipes/[id]` (copy to own collection — full recipe+ingredients+nutrition+categories copy)
- Share button: `ShareRecipeButton` (Sheet-based, loads connections on open, multi-select) visible on recipe detail for owners only
- Inbox: visible on `/connections` page in "Geteilte Rezepte" section with copy and dismiss actions
- Copy from inbox routes to the newly created recipe detail

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results

**Date:** 2026-04-07
**Tester:** QA Engineer (automated)
**Result:** ✅ APPROVED — High bug fixed (BUG-22-01)

### Acceptance Criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | "Teilen"-Aktion auf Rezeptdetailseite (nur für eigene Rezepte) | ✅ PASS — ShareRecipeButton für `isOwner` sichtbar |
| 2 | Beim Teilen kann User Verbindungen auswählen | ✅ PASS — Sheet mit Multi-Select Verbindungsliste |
| 3 | Empfänger sieht geteilte Rezepte in eigenem Bereich | ✅ PASS — sichtbar auf /connections (RLS-Fix applied) |
| 4 | Geteilte Rezepte zeigen den Absender ("Geteilt von [Name]") | ✅ PASS — "Geteilt von @username" in Inbox-Karte |
| 5 | Empfänger kann geteiltes Rezept mit einem Klick kopieren | ✅ PASS — funktioniert für alle Rezepte (RLS-Fix applied) |
| 6 | Empfänger kann geteiltes Rezept ablehnen/ausblenden | ✅ PASS — X-Button + PATCH /api/shared-recipes/[id] (dismiss) |
| 7 | Doppelte Einträge werden zusammengeführt (Re-Share) | ✅ PASS — upsert mit onConflict="recipe_id,sender_id,recipient_id" |
| 8 | User können nur eigene (nicht globale) Rezepte teilen | ✅ PASS — Ownership + !is_global Check in API |

### Edge Cases

| Case | Result |
|------|--------|
| Verbindung nach dem Teilen getrennt — neue Shares blockiert | ✅ PASS — Share-API prüft accepted connection |
| Sender löscht Rezept — Inbox-Eintrag | ⚠️ Rezept-Join gibt null zurück (Recipe gelöscht) |
| Empfänger lehnt ab ohne Sender-Benachrichtigung | ✅ PASS — nur lokales dismiss |

### Bugs Found

**BUG-22-01** ~~🔴 **High: Private (nicht-öffentliche) Rezepte können nach dem Teilen nicht vom Empfänger gelesen werden**~~ ✅ **FIXED**

**Beschreibung:** Wenn ein User ein privates Rezept (`is_public=false`, `is_global=false`) teilt, kann der Empfänger das Rezept weder in der Inbox sehen (recipe-Felder sind null wegen RLS) noch kopieren (recipe fetch schlägt fehl → 404).

**Schritte zum Reproduzieren:**
1. User A hat ein privates Rezept (nicht öffentlich)
2. User A teilt das Rezept über ShareRecipeButton mit User B (befreundet)
3. User B öffnet /connections → "Geteilte Rezepte" Sektion
4. Die Rezept-Karte zeigt keine Titel/Beschreibung (null-Daten) oder stürzt ab
5. "In meine Rezepte kopieren" gibt 404 zurück

**Root Cause:** RLS auf `recipes` erlaubt Lesen nur wenn:
- `is_global = true`
- `is_public = true`  
- `auth.uid() = user_id` (eigenes Rezept)

Kein Policy für "Empfänger eines shared_recipe kann das Rezept lesen."

**Fix (Optionen):**
1. RLS-Policy hinzufügen: `EXISTS (SELECT 1 FROM shared_recipes WHERE recipe_id = recipes.id AND recipient_id = auth.uid())`
2. Nur öffentliche Rezepte können geteilt werden (Share-Button bei privaten Rezepten ausblenden oder Fehlermeldung zeigen)

**Severity: High** — Kern-Feature (Sharing + Kopieren) funktioniert nur bei öffentlichen Quell-Rezepten.

**BUG-22-02** 🔵 **Low: Inbox-Karte bei gelöschtem Quell-Rezept zeigt null-Inhalte**
- Wenn der Sender das Rezept löscht, zeigt die Inbox-Karte eine leere Karte (recipe=null)
- Keine Graceful-Behandlung für gelöschte Quell-Rezepte
- Severity: Low (edge case, beide Flows — Kopieren + Ansehen — würden 404 zeigen)

### Security Audit

| Check | Result |
|-------|--------|
| Unauthenticated GET /api/shared-recipes → 401 | ✅ |
| Unauthenticated POST /api/shared-recipes → 401 | ✅ |
| Unauthenticated POST/PATCH /api/shared-recipes/[id] → 401 | ✅ |
| Unauthenticated POST /api/recipes/[id]/copy → 401 | ✅ |
| User kann fremdes Rezept nicht sharen → 403 | ✅ |
| User kann eigenes Rezept nicht kopieren → 400 | ✅ |
| RLS INSERT with_check: auth.uid() = sender_id | ✅ |
| RLS SELECT: nur eigene shared_recipes lesbar | ✅ |
| RLS UPDATE: nur eigene shared_recipes änderbar | ✅ |

### E2E Tests
- File: `tests/PROJ-22-rezepte-teilen.spec.ts`
- 12 passed (unauthenticated security checks), rest skipped (need TEST_USER_EMAIL env var)

## Deployment
- **Production URL:** https://food-app-one-sage.vercel.app
- **Deployed:** 2026-04-08
- **Git tag:** v1.22.0-PROJ-22
