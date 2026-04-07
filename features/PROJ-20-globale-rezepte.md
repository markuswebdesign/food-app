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
_To be added by /qa_

## Deployment
_To be added by /deploy_
