# PROJ-12: Nutzerprofil Erweiterung (Profilbild + Rezept-Autor)

## Status: Deployed
**Created:** 2026-04-01
**Last Updated:** 2026-04-23

## Dependencies
- Authentifizierung (deployed)
- PROJ-1: Gesundheitsprofil (Deployed)
- Rezeptverwaltung (deployed)

## Beschreibung
Zwei zusammengehörige Erweiterungen rund um das Nutzerprofil:
1. **Profilbild:** Nutzer können ein Foto hochladen, das als Avatar in der Sidebar und auf der Profilseite angezeigt wird.
2. **Rezept-Autor:** Bei jedem Rezept wird angezeigt, welcher Nutzer es hinzugefügt hat — inklusive Avatar aus dem Profilbild.

---

## Teil 1: Profilbild hochladen

### User Stories
- Als Nutzer möchte ich ein Profilbild hochladen, damit ich die App persönlicher gestalten kann.
- Als Nutzer möchte ich mein Profilbild jederzeit ändern oder löschen können.
- Als Nutzer möchte ich, dass mein Profilbild im Menü/Avatar-Bereich angezeigt wird.

### Acceptance Criteria
- [ ] Auf der Profil-Seite gibt es einen Upload-Bereich für das Profilbild
- [ ] Unterstützte Formate: JPG, PNG, WebP (max. 5 MB)
- [ ] Das Bild wird nach dem Upload auf einheitliche Größe skaliert (z.B. 200x200px)
- [ ] Das Profilbild wird in der Sidebar/Navigation als Avatar angezeigt
- [ ] Ohne Profilbild wird ein Fallback-Avatar (Initialen oder Platzhalter-Icon) angezeigt
- [ ] Bild kann gelöscht werden → Fallback-Avatar wird wieder angezeigt
- [ ] Bild wird in Supabase Storage gespeichert

### Edge Cases
- Datei > 5 MB → Fehlermeldung vor dem Upload
- Nicht unterstütztes Format → klare Fehlermeldung
- Schlechte Verbindung während Upload → Fehler anzeigen, Retry möglich

---

## Teil 2: Rezept-Autor anzeigen

### User Stories
- Als Nutzer möchte ich bei jedem Rezept sehen, wer es hinzugefügt hat.
- Als Nutzer möchte ich meine eigenen Rezepte von denen anderer Nutzer unterscheiden können.
- Als Nutzer möchte ich die Rezeptliste nach "Meine Rezepte" filtern können.

### Acceptance Criteria
- [ ] Jedes Rezept zeigt den Namen des Erstellers an (Karte + Detailansicht)
- [ ] Profilbild des Autors (aus Teil 1) wird neben dem Namen angezeigt, wenn vorhanden
- [ ] Neue Rezepte werden beim Erstellen automatisch dem eingeloggten Nutzer zugeordnet
- [ ] Bestehende Rezepte ohne Autor-Zuordnung zeigen "Unbekannt"
- [ ] Rezeptliste ist nach "Meine Rezepte" / "Alle Rezepte" filterbar

### Edge Cases
- Rezepte vor Einführung der Funktion → `created_by` = NULL → "Unbekannt"
- Nutzer löscht seinen Account → Rezepte bleiben, Autor zeigt "Gelöschter Nutzer"
- Importierte Rezepte → Autor = Nutzer, der importiert hat

---

## Technical Requirements
- Supabase Storage für Bildspeicherung (Profilbilder)
- Bild-Komprimierung auf Client-Seite vor Upload
- `created_by` (user_id FK) Feld in Rezepte-Tabelle (DB-Migration)
- JOIN auf Profil-Tabelle für Anzeigename + Avatar-URL

---

## Tech Design (Solution Architect)
Siehe Architecture-Session 2026-04-02.

**Backend implementiert:**
- Supabase Storage Bucket `avatars` (public, 5MB, JPG/PNG/WebP) mit RLS
- `POST /api/profile/avatar` — Upload mit upsert, speichert URL mit Cache-Buster in `profiles.avatar_url`
- `DELETE /api/profile/avatar` — Löscht Datei + setzt `avatar_url = null`
- Rezept-Queries um `profiles(username, avatar_url)` JOIN erweitert
- Autor-Anzeige (Avatar + @username) in RecipeCard und Detailseite
- "Meine Rezepte" Filter in RecipeFilters (nur für eingeloggte Nutzer sichtbar)
- Keine DB-Migration nötig: `avatar_url` und `user_id` FK existierten bereits

## QA Test Results

**QA Date:** 2026-04-02
**Tester:** Claude (automated code review + static analysis)
**Unit Tests:** 98/98 passing (no regressions)
**E2E Tests:** Written in `tests/PROJ-12-nutzerprofil.spec.ts` (cannot run on macOS 11.x due to Playwright/Chromium incompatibility)

---

### Teil 1: Profilbild hochladen -- Acceptance Criteria

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | Upload-Bereich auf Profil-Seite | PASS | `ProfileAvatar` rendered in `/me?tab=profil` with camera button, "Bild aendern" button, and format hint text |
| 2 | Unterstuetzte Formate: JPG, PNG, WebP (max 5 MB) | PASS | Server validates `ALLOWED_TYPES` and `MAX_SIZE`; client `accept` attribute matches |
| 3 | Bild wird auf einheitliche Groesse skaliert (200x200px) | FAIL | No server-side or client-side image resizing/compression. Raw buffer uploaded as-is with `contentType: "image/webp"` but no actual conversion happens. See BUG-01 |
| 4 | Profilbild in Sidebar/Navigation als Avatar | PASS | `NavBar` receives `avatar_url` from profile, displays via `AvatarImage` |
| 5 | Fallback-Avatar (Initialen) ohne Profilbild | PASS | `AvatarFallback` shows first 2 chars of username, uppercased |
| 6 | Bild loeschbar, Fallback kehrt zurueck | PASS | DELETE endpoint sets `avatar_url = null`; UI conditionally shows delete button and resets state |
| 7 | Bild in Supabase Storage gespeichert | PASS | Uploaded to `avatars` bucket as `{user_id}.webp` with upsert |

### Teil 1: Edge Cases

| # | Edge Case | Status | Notes |
|---|-----------|--------|-------|
| 1 | Datei > 5 MB -> Fehlermeldung | PARTIAL | Server returns 400 error. No client-side pre-validation (file selected and sent before checking size). See BUG-02 |
| 2 | Nicht unterstuetztes Format -> Fehlermeldung | PASS | Server returns 400 with "Ungueltiges Format" message; client `accept` restricts file picker |
| 3 | Schlechte Verbindung / Upload-Fehler -> Retry | PASS | Error displayed; user can click "Bild aendern" again to retry |

---

### Teil 2: Rezept-Autor anzeigen -- Acceptance Criteria

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | Jedes Rezept zeigt Ersteller-Name (Karte + Detail) | PASS | `RecipeCard` and detail page both show `@{username}` when `profiles.username` exists |
| 2 | Profilbild des Autors neben dem Namen | PASS | Mini `Avatar` with `AvatarImage` + `AvatarFallback` in both card and detail views |
| 3 | Neue Rezepte automatisch dem Nutzer zugeordnet | PASS | `user_id` FK already exists; recipe queries JOIN on `profiles!recipes_user_id_fkey` |
| 4 | Bestehende Rezepte ohne Autor -> "Unbekannt" | FAIL | No "Unbekannt" fallback. If `profiles` is null, the author section is simply hidden (`recipe.profiles?.username &&`). See BUG-03 |
| 5 | Rezeptliste filterbar nach "Meine Rezepte" / "Alle" | PASS | `RecipeFilters` shows "Meine Rezepte" badge when `showMineFilter` is true; filters by `user_id` match |

### Teil 2: Edge Cases

| # | Edge Case | Status | Notes |
|---|-----------|--------|-------|
| 1 | `created_by` = NULL -> "Unbekannt" | FAIL | Same as AC #4 above. No fallback text rendered. See BUG-03 |
| 2 | Geloeschter Nutzer -> "Geloeschter Nutzer" | FAIL | No handling for deleted users. If profile row is deleted, `profiles` join returns null and author is hidden. See BUG-04 |
| 3 | Importierte Rezepte -> Autor = Importeur | PASS | Import endpoint uses authenticated user's session; `user_id` is set accordingly |

---

### Bugs Found

#### BUG-01: No image resizing/compression (Medium Severity)
- **Acceptance Criterion:** "Das Bild wird nach dem Upload auf einheitliche Groesse skaliert (z.B. 200x200px)"
- **Actual:** The uploaded file's raw `ArrayBuffer` is stored directly to Supabase Storage. The `contentType` is set to `"image/webp"` but no actual image conversion or resizing takes place. A 5 MB, 4000x3000 JPEG is stored at full resolution.
- **Impact:** Wasted storage space, slow avatar loading for users on poor connections, inconsistent avatar display sizes rely entirely on CSS.
- **Priority:** Medium -- functional but violates spec requirement
- **Location:** `app/api/profile/avatar/route.ts` lines 25-33

#### BUG-02: No client-side file size validation before upload (Low Severity)
- **Acceptance Criterion:** "Datei > 5 MB -> Fehlermeldung vor dem Upload"
- **Actual:** The spec says "Fehlermeldung vor dem Upload" (error message before the upload). Currently the file is uploaded first, and the server rejects it with a 400. On slow connections this wastes time and bandwidth.
- **Impact:** Poor UX on slow connections; spec says validation should happen before upload
- **Priority:** Low -- server-side validation still works correctly
- **Location:** `components/profile/profile-avatar.tsx` `handleFileChange` function

#### BUG-03: Missing "Unbekannt" fallback for recipes without author (Medium Severity)
- **Acceptance Criterion:** "Bestehende Rezepte ohne Autor-Zuordnung zeigen 'Unbekannt'"
- **Actual:** When `recipe.profiles` is null (no user_id FK or deleted profile), the entire author section is hidden via conditional rendering (`recipe.profiles?.username && ...`). No "Unbekannt" text is shown.
- **Steps to reproduce:** View a recipe that has no `user_id` or where the FK join returns null.
- **Impact:** Users cannot distinguish between "recipe has no author" vs. a display bug. Violates acceptance criterion.
- **Priority:** Medium
- **Location:** `components/recipes/recipe-card.tsx` line 65; `app/(app)/recipes/[id]/page.tsx` line 105

#### BUG-04: Missing "Geloeschter Nutzer" fallback for deleted accounts (Low Severity)
- **Edge Case Requirement:** "Nutzer loescht seinen Account -> Rezepte bleiben, Autor zeigt 'Geloeschter Nutzer'"
- **Actual:** Same conditional rendering issue as BUG-03. If a user deletes their account, their recipes show no author at all.
- **Priority:** Low -- edge case, less likely in current app state
- **Location:** Same as BUG-03

#### BUG-05: Uploaded file stored with wrong content type (Medium Severity)
- **Description:** The API stores every upload with `contentType: "image/webp"` regardless of the actual file format. A JPEG file uploaded as `image/jpeg` is stored with `contentType: "image/webp"` metadata but remains a JPEG binary. This is a metadata lie.
- **Impact:** Some browsers/CDNs may try to decode the file as WebP and fail, causing broken avatar images. The file extension is also `.webp` regardless of actual format.
- **Priority:** Medium -- can cause display issues depending on browser/CDN behavior
- **Location:** `app/api/profile/avatar/route.ts` line 31

---

### Security Audit (Red-Team Perspective)

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1 | Authentication on POST /api/profile/avatar | PASS | Checks `supabase.auth.getUser()`, returns 401 if not authenticated |
| 2 | Authentication on DELETE /api/profile/avatar | PASS | Same auth check |
| 3 | File type validation (server-side) | PASS | Validates MIME type against allowlist before processing |
| 4 | File size validation (server-side) | PASS | Rejects files > 5 MB |
| 5 | Path traversal via filename | PASS | Filename is hardcoded as `{user_id}.webp`, not user-controlled |
| 6 | IDOR on avatar upload (overwrite other user's avatar) | PASS | Filename uses authenticated `user.id`, RLS restricts bucket access |
| 7 | IDOR on avatar deletion | PASS | Same -- only deletes `{user.id}.webp` |
| 8 | XSS via avatar URL | LOW RISK | `avatar_url` stored with cache-buster `?t=Date.now()` is rendered in `<img src>` via AvatarImage. No HTML injection risk in `src` attribute. |
| 9 | Rate limiting on upload endpoint | FAIL | No rate limiting. An authenticated attacker could repeatedly upload/delete to abuse storage quotas. See SEC-01 |
| 10 | File content validation (magic bytes) | FAIL | Only MIME type from `file.type` header is checked. An attacker could craft a file with a valid MIME type but malicious content (e.g., SVG with embedded JS renamed to .png). See SEC-02 |
| 11 | SSRF via avatar_url | N/A | URL is constructed server-side from Supabase public URL, not user-controlled |
| 12 | Storage of cache-buster timestamp in DB | LOW RISK | `avatar_url` contains `?t={timestamp}` which leaks approximate upload time. Minor privacy concern. |
| 13 | "Meine Rezepte" filter data leakage | PASS | Filter operates on client-side data already fetched; no additional data exposed |
| 14 | Input validation with Zod (security rules) | FAIL | No Zod validation on the avatar upload endpoint. Security rules mandate "Validate ALL user input on the server side with Zod". See SEC-03 |

#### SEC-01: No rate limiting on avatar upload/delete (Low Severity)
- **Description:** The POST and DELETE avatar endpoints have no rate limiting. An attacker with valid credentials could script rapid uploads to abuse Supabase Storage quotas or cause excessive bandwidth usage.
- **Priority:** Low -- requires authentication, Supabase has its own rate limits
- **Location:** `app/api/profile/avatar/route.ts`

#### SEC-02: No file content/magic byte validation (Medium Severity)
- **Description:** Only the MIME type from the `Content-Type` / `file.type` header is validated. This is trivially spoofable. An attacker could upload a non-image file (e.g., HTML, SVG with JS, or a polyglot file) by setting the correct MIME type header. Since the bucket is public, this file would be served from the Supabase Storage domain.
- **Mitigation:** The risk is limited because the file is only rendered in `<img>` tags (not `<iframe>` or `<object>`), and the Supabase Storage domain is different from the app domain, limiting XSS impact.
- **Priority:** Medium -- defense-in-depth concern
- **Location:** `app/api/profile/avatar/route.ts` lines 18-20

#### SEC-03: No Zod validation on upload endpoint (Low Severity)
- **Description:** The security rules state "Validate ALL user input on the server side with Zod". The avatar upload endpoint uses manual checks instead of a Zod schema.
- **Priority:** Low -- the manual validation is functionally correct, but inconsistent with project conventions

---

### Responsive / Cross-Browser Notes

| Viewport | Status | Notes |
|----------|--------|-------|
| 375px (Mobile) | LIKELY PASS | Avatar component uses flex layout with fixed sizes (h-20 w-20). Should render within bounds. Cannot verify at runtime. |
| 768px (Tablet) | LIKELY PASS | Same flex layout, no breakpoint-specific issues visible in code. |
| 1440px (Desktop) | LIKELY PASS | max-w-2xl constraint on profile page prevents over-stretching. |
| Chrome | LIKELY PASS | Standard Avatar/AvatarImage components used. |
| Firefox | LIKELY PASS | No browser-specific APIs used. |
| Safari | CAUTION | WebP support is fine in Safari 14+. Older Safari may not display `.webp` avatars if actual format is WebP. Given BUG-05, the file may actually be JPEG stored as .webp, which could have inconsistent behavior. |

**NOTE:** E2E tests were written but cannot be executed on this macOS 11.x environment due to Playwright/Chromium incompatibility. All findings above are from static code analysis.

---

### Regression Check

| Feature | Status | Notes |
|---------|--------|-------|
| Rezeptverwaltung | PASS | Recipe queries extended with JOIN but existing fields unchanged |
| Wochenplan | PASS | No changes to meal plan code |
| Einkaufsliste | PASS | No changes |
| Authentifizierung | PASS | Auth flow unchanged |
| PROJ-1 Gesundheitsprofil | PASS | Profile form unchanged, avatar component added alongside it |
| PROJ-2 Mahlzeiten-Logbuch | PASS | No changes |
| PROJ-3 Kalorie-Defizit Dashboard | PASS | No changes |
| PROJ-7 UX Quick Wins | PASS | No changes to password/sidebar features |
| Unit tests | PASS | All 98 unit tests pass |

---

### Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 0 |
| Medium | 3 (BUG-01, BUG-03, BUG-05) + 1 security (SEC-02) |
| Low | 2 (BUG-02, BUG-04) + 2 security (SEC-01, SEC-03) |

**Verdict:** No Critical or High bugs found. Feature can be marked **Approved** with the recommendation to address Medium-severity items (especially BUG-03 "Unbekannt" fallback and BUG-05 content type mismatch) before or shortly after deployment.

## Deployment
- **Production URL:** https://food-app-one-sage.vercel.app
- **Deployed:** 2026-04-23
- **Git tag:** v1.12.0-PROJ-12
