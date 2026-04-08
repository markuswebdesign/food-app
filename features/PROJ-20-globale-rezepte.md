# PROJ-20: Globale Rezepte

## Status: In Review
**Created:** 2026-04-07
**Last Updated:** 2026-04-07

## Dependencies
- Requires: PROJ-18 (Rollen-System)

## User Stories
- Als Admin möchte ich globale Rezepte erstellen, die alle User der App sehen können
- Als Admin möchte ich globale Rezepte bearbeiten und löschen können
- Als normaler User möchte ich globale Rezepte in meiner Rezeptliste sehen, damit ich sie als Inspiration nutzen kann
- Als normaler User möchte ich globale Rezepte nicht selbst erstellen können, damit Inhalte kuratiert bleiben
- Als User möchte ich globale Rezepte in meinen Einstellungen ausblenden können, wenn ich sie nicht sehen möchte
- Als User möchte ich ein globales Rezept zu meinem Wochenplan oder Logbuch hinzufügen können

## Acceptance Criteria
- [ ] Rezepte haben ein Feld `is_global` (Boolean, Standard: `false`)
- [ ] Nur Admins können `is_global: true` setzen — das Formular für normale User enthält diese Option nicht
- [ ] Normale User sehen in der Rezept-Erstellen-Maske keine Option für "öffentlich/global"
- [ ] Globale Rezepte sind in der Rezeptliste aller User sichtbar (sofern nicht ausgeblendet)
- [ ] Globale Rezepte sind als solche gekennzeichnet (z.B. Badge "Global" oder Admin-Icon)
- [ ] User können in ihren Einstellungen globale Rezepte ein-/ausblenden (Toggle)
- [ ] Die Einstellung wird pro User gespeichert und bleibt nach Logout erhalten
- [ ] Admins haben in der Rezeptverwaltung eine gefilterte Ansicht nur für globale Rezepte
- [ ] Globale Rezepte können von normalen Usern nicht bearbeitet oder gelöscht werden
- [ ] Normale User können ein globales Rezept "kopieren" um eine eigene bearbeitbare Version zu erstellen

## Edge Cases
- Was passiert, wenn ein Admin ein globales Rezept löscht, das User bereits im Wochenplan haben? → Rezept wird aus Wochenplan entfernt, User wird informiert (oder Eintrag bleibt als "gelöschtes Rezept" erhalten)
- Was passiert, wenn ein User globale Rezepte ausblendet und dann ein Admin ihn direkt teilt? → Geteilte Rezepte erscheinen trotzdem (Ausblenden betrifft nur den globalen Pool)
- Was passiert, wenn ein normaler User die API direkt aufruft und `is_global: true` sendet? → Serverseitige Prüfung blockiert die Anfrage

## Technical Requirements
- `is_global` Feld in der `recipes` Tabelle
- `hide_global_recipes` Feld in der `profiles` Tabelle (Boolean, Standard: `false`)
- RLS-Policies: Nur Admins können `is_global` schreiben
- Globale Rezepte erscheinen in Queries aller User (außer wenn `hide_global_recipes = true`)

---

## Implementation Notes
- DB: `is_global` on `recipes`, `hide_global_recipes` on `profiles` (migration already applied)
- RLS: only admins can set `is_global` via Supabase policy; non-admins blocked server-side and via separate admin API route
- Toggle API: `POST /api/profile/hide-global` — flips `hide_global_recipes` and redirects to `/recipes`
- Admin recipes page: `/admin/recipes` with filterable table and per-row global toggle via `PATCH /api/admin/recipes/[id]/global`
- Recipe detail: Global badge shown; "Kopieren" button (`CopyRecipeButton`) visible for non-owners via `POST /api/recipes/[id]/copy`
- Recipe list: inline toggle link to show/hide global recipes
- RecipeCard: "Global" badge with Globe icon

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results

**Date:** 2026-04-08 (re-run after bug fix)
**Tester:** QA Engineer (automated)
**Result:** ✅ READY — High bug fixed, 1 pre-existing Medium bug remaining

### Acceptance Criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Rezepte haben ein Feld `is_global` (Boolean, Standard: `false`) | ✅ PASS — DB column confirmed |
| 2 | Nur Admins können `is_global: true` setzen | ✅ PASS — Admin-only API + RLS with_check enforced |
| 3 | Normale User sehen keine Global-Option im Formular | ✅ PASS — no such field in recipe form |
| 4 | Globale Rezepte in der Rezeptliste aller User sichtbar | ✅ PASS — `.or("is_public.eq.true,is_global.eq.true")` |
| 5 | Globale Rezepte sind als solche gekennzeichnet (Badge) | ✅ PASS — "Global" Badge mit Globe-Icon auf Card + Detailseite |
| 6 | User können globale Rezepte ein-/ausblenden (Toggle) | ✅ PASS — POST /api/profile/hide-global, toggle link auf /recipes |
| 7 | Einstellung wird pro User gespeichert (bleibt nach Logout) | ✅ PASS — in profiles.hide_global_recipes |
| 8 | Admins haben gefilterte Ansicht nur für globale Rezepte | ✅ PASS — /admin/recipes mit Global-Filter-Button |
| 9 | Globale Rezepte können nicht von normalen Usern bearbeitet/gelöscht werden | ✅ PASS — keine Edit/Delete-Buttons für Nicht-Eigentümer |
| 10 | Normale User können globales Rezept "kopieren" | ✅ PASS — CopyRecipeButton via POST /api/recipes/[id]/copy |

### Edge Cases

| Case | Result |
|------|--------|
| User globale Rezepte ausblenden dann von Admin direkt geteilt | ✅ PASS — hide betrifft nur globalen Pool |
| Normaler User sendet `is_global: true` direkt an API | ✅ PASS — 403 Forbidden |
| `hide_global_recipes=true` zeigt nur eigene Rezepte | ✅ PASS — fix in commit `608edd7` |

### Bugs Found

**BUG-20-01** 🟡 **Medium: Eigene private Rezepte fehlen in der Rezeptliste (pre-existing)**
- `/recipes` zeigt nur `is_public=true` oder `is_global=true` Rezepte wenn `hide_global_recipes=false`
- Eigene private Rezepte (nicht-public, nicht-global) sind im Standardview nicht sichtbar
- "Meine Rezepte"-Filter (`?mine=1`) filtert nur aus bereits geladenen Rezepten (client-side)
- Workaround: `hide_global_recipes=true` aktivieren — dann werden alle eigenen Rezepte angezeigt
- Suggested fix: `.or(\`is_public.eq.true,is_global.eq.true,user_id.eq.${authUser.id}\`)` in `recipes/page.tsx`
- Severity: Medium (Pre-existing issue, auch vor PROJ-20 vorhanden — nicht durch PROJ-20 eingeführt)

~~**BUG-20-HIGH** 🔴 **High: `hide_global_recipes=true` zeigte falsche Rezepte**~~
- ~~Beim Ausblenden globaler Rezepte wurden trotzdem alle öffentlichen Rezepte angezeigt~~
- **FIXED** in commit `608edd7` — query wechselt nun korrekt zu `user_id.eq.${authUser.id}`

### Security Audit

| Check | Result |
|-------|--------|
| Unauthenticated POST /api/profile/hide-global → 401 | ✅ |
| Unauthenticated PATCH /api/admin/recipes/[id]/global → 401 | ✅ |
| Normal user PATCH /api/admin/recipes/[id]/global → 403 | ✅ |
| RLS prevents non-admins setting is_global directly | ✅ (admin policy on recipes) |
| RLS INSERT with_check on connections/shared_recipes | ✅ |

### Automated Tests
- **Unit tests:** 197/197 passed (`npm test`)
- **E2E tests:** 2/17 executed, 15 skipped (need TEST_USER_EMAIL/ADMIN_EMAIL env vars) — `tests/PROJ-20-globale-rezepte.spec.ts`

## Deployment
_To be added by /deploy_
