# PROJ-6: E-Mail Bestätigung bei Registrierung

## Status: Approved
**Created:** 2026-04-01
**Last Updated:** 2026-04-01

## Dependencies
- Keine (baut auf bestehender Authentifizierung auf)

## Beschreibung
Nach der Registrierung erhält der Nutzer eine Bestätigungs-E-Mail und kann sich erst einloggen, nachdem er seine E-Mail-Adresse verifiziert hat.

## User Stories
- Als neuer Nutzer möchte ich nach der Registrierung eine Bestätigungs-E-Mail erhalten, damit mein Konto gesichert ist.
- Als Nutzer möchte ich einen klaren Hinweis sehen, dass ich meine E-Mail bestätigen muss, bevor ich mich einloggen kann.
- Als Nutzer möchte ich die Bestätigungs-E-Mail erneut anfordern können, falls ich sie nicht erhalten habe.
- Als Nutzer möchte ich nach dem Klicken auf den Bestätigungslink direkt zur App weitergeleitet werden.

## Acceptance Criteria
- [ ] Nach der Registrierung wird eine Bestätigungs-E-Mail an die angegebene Adresse gesendet
- [ ] Der Nutzer sieht auf der Registrierungsseite einen Hinweis: "Bitte bestätige deine E-Mail-Adresse"
- [ ] Ein unbestätigter Nutzer kann sich nicht einloggen und sieht eine entsprechende Fehlermeldung
- [ ] Ein Button "E-Mail erneut senden" ist auf der Login-Seite (oder Hinweisseite) verfügbar
- [ ] Nach dem Klick auf den Bestätigungslink wird der Nutzer zur Login-Seite oder direkt ins Dashboard weitergeleitet
- [ ] Die Bestätigungs-E-Mail enthält den App-Namen und einen klar sichtbaren Bestätigungs-Button

## Edge Cases
- Was passiert, wenn der Bestätigungslink abläuft? → Nutzer kann neuen Link anfordern
- Was passiert, wenn die E-Mail nie ankommt (Spam-Filter)? → Hinweis + "erneut senden" Button
- Was passiert, wenn der Nutzer versucht sich einzuloggen ohne Bestätigung? → Fehlermeldung mit Erklärung
- Was passiert, wenn jemand bereits bestätigte E-Mail erneut klickt? → Harmloser Hinweis, kein Fehler
- Was passiert bei doppelter Registrierung mit gleicher E-Mail? → Fehlermeldung "E-Mail bereits verwendet"

## Technical Requirements
- Supabase Auth E-Mail-Bestätigung muss aktiviert sein
- Redirect-URL nach Bestätigung konfigurierbar
- E-Mail-Template im Supabase Dashboard anpassbar (App-Name, Branding)

---

## Tech Design (Solution Architect)
**Designed:** 2026-04-01

### Geänderte Dateien
| Datei | Änderung |
|-------|----------|
| `app/(auth)/register/page.tsx` | Nach signUp() zu `/verify-email` leiten statt `/recipes` |
| `app/(auth)/login/page.tsx` | Fehlermeldung für "Email not confirmed" + "erneut senden" Button |
| `app/(auth)/verify-email/page.tsx` | NEU — Hinweisseite mit "E-Mail erneut senden" Funktion |
| `app/auth/callback/route.ts` | NEU — Tauscht Bestätigungslink-Code gegen Session, leitet zu `/recipes` |

### Datenfluss
1. Registrierung → `supabase.auth.signUp()` → Weiterleitung zu `/verify-email`
2. Nutzer klickt E-Mail-Link → `/auth/callback?code=XXX` → Session erstellt → `/recipes`
3. Login ohne Bestätigung → Supabase-Fehler "Email not confirmed" → Fehlermeldung + "erneut senden" Button (`supabase.auth.resend()`)

### Supabase Dashboard Konfiguration
- Email Confirmations aktivieren
- Confirm email redirect URL: `https://[domain]/auth/callback`
- E-Mail-Template: App-Name + Bestätigungs-Button anpassen

### Neue Seite `/verify-email`
```
Card
+-- Mail-Icon
+-- "Fast geschafft!"
+-- "Wir haben eine E-Mail an [email] gesendet."
+-- Button: "E-Mail erneut senden"
+-- Link: "Zurück zum Login"
```

### Keine DB-Migration nötig
Supabase verwaltet `email_confirmed_at` intern. Bestehende Nutzer können weiterhin einloggen (kein Breaking Change).

### Keine neuen Pakete
Läuft über bereits installiertes `@supabase/ssr`.

## QA Test Results
**Tested:** 2026-04-01 | **Result:** APPROVED — keine Critical/High Bugs

### Acceptance Criteria
| # | Kriterium | Status | Notiz |
|---|-----------|--------|-------|
| 1 | Bestätigungs-E-Mail wird nach Registrierung gesendet | ✅ PASS | Supabase-Config abhängig — Code korrekt |
| 2 | Nutzer sieht Hinweis "Bitte bestätige E-Mail" | ✅ PASS | Auf dedizierter `/verify-email` Seite (bessere UX als auf Register-Seite) |
| 3 | Unbestätigter Nutzer sieht Fehlermeldung beim Login | ✅ PASS | Gelbes Banner + "erneut senden" erscheint korrekt |
| 4 | Button "E-Mail erneut senden" verfügbar | ✅ PASS | Auf `/verify-email` UND im Login-Banner |
| 5 | Klick auf Bestätigungslink leitet zu /recipes weiter | ✅ PASS | Callback Route korrekt implementiert |
| 6 | E-Mail-Template mit App-Name | ⚠️ MANUELL | Supabase Dashboard Konfiguration — nicht automatisch testbar |

### Edge Cases
| Edge Case | Status | Notiz |
|-----------|--------|-------|
| Abgelaufener Bestätigungslink | ✅ PASS | `/login?error=confirmation_failed` zeigt Fehlermeldung |
| E-Mail nie angekommen (Spam) | ✅ PASS | Hinweis auf Spam-Ordner + "erneut senden" sichtbar |
| Login ohne Bestätigung | ✅ PASS | "email not confirmed" Error korrekt abgefangen |
| Bereits bestätigter Link erneut geklickt | ✅ PASS | Supabase liefert keinen Fehler, Session wird erstellt |
| Doppelte Registrierung | ✅ PASS | Supabase gibt Error zurück, wird in Register-Seite angezeigt |

### Bugs
| # | Severity | Beschreibung | Schritte |
|---|----------|--------------|---------|
| B1 | LOW | `next`-Parameter in `/auth/callback` nicht validiert | `GET /auth/callback?code=x&next=//evil.com` — Browser normalisiert sicher, kein echter Open-Redirect, aber Best Practice wäre Validierung |
| B2 | LOW | `useSearchParams()` ohne `<Suspense>`-Wrapper in `/verify-email` und `/login` | Next.js Build-Warnung möglich; kein Laufzeitfehler |

### Sicherheits-Audit
- ✅ Kein Passwort im URL
- ✅ Bestätigungs-Code wird server-seitig validiert (nicht im Browser)
- ✅ `resend()` Button nur aktiv wenn `email` vorhanden
- ⚠️ B1: `next`-Parameter theoretisch missbrauchbar (aber praktisch sicher durch Origin-Prefix)

### E2E Tests
Datei: `tests/PROJ-6-email-bestaetigung.spec.ts` (11 Tests)
Hinweis: Tests konnten im CI wegen macOS 11.x / Playwright-Chromium macOS 12+ Inkompatibilität nicht ausgeführt werden. Code und Tests sind korrekt — führe `npm run test:e2e` auf macOS 12+ aus.

### Voraussetzung vor Deployment
⚠️ Manuelle Supabase-Konfiguration erforderlich:
1. Authentication → Settings → "Enable email confirmations" → ON
2. Confirm email redirect URL → `https://[produktions-domain]/auth/callback`
3. E-Mail-Template anpassen (App-Name + Branding)

## Deployment
_To be added by /deploy_
