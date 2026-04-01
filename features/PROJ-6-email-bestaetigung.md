# PROJ-6: E-Mail Bestätigung bei Registrierung

## Status: In Progress
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
_To be added by /qa_

## Deployment
_To be added by /deploy_
