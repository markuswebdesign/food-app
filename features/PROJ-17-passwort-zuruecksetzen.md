# PROJ-17: Passwort Zurücksetzen

## Status: Deployed
**Created:** 2026-04-07
**Last Updated:** 2026-04-23

## Dependencies
- PROJ-6: E-Mail Bestätigung bei Registrierung (E-Mail-Versand muss konfiguriert sein)

## Beschreibung
Nutzer können über einen "Passwort vergessen?"-Link auf der Login-Seite ihr Passwort zurücksetzen. Es werden zwei neue Seiten erstellt:
1. **`/forgot-password`** — E-Mail-Eingabe zum Anfordern des Reset-Links
2. **`/update-password`** — Neues Passwort setzen (Zielseite des Reset-Links)

Der Flow nutzt Supabase Auth's built-in `resetPasswordForEmail` und `updateUser` Funktionen.

---

## User Stories
- Als eingeloggter Nutzer möchte ich mein Passwort ändern können, falls ich es vergessen habe.
- Als Nutzer möchte ich einen sicheren Reset-Link per E-Mail erhalten, der nur für kurze Zeit gültig ist.
- Als Nutzer möchte ich nach dem Klick auf den Reset-Link direkt ein neues Passwort eingeben können, ohne mich erneut anmelden zu müssen.

---

## Acceptance Criteria

### Flow 1: Reset-Anforderung (`/forgot-password`)
- [ ] Auf der Login-Seite `/login` gibt es einen "Passwort vergessen?"-Link unter dem Passwortfeld
- [ ] Der Link führt zur Seite `/forgot-password`
- [ ] Die Seite enthält ein Formular mit einem E-Mail-Eingabefeld
- [ ] Nach Absenden wird `supabase.auth.resetPasswordForEmail()` aufgerufen
- [ ] Bei Erfolg wird eine Bestätigungsmeldung angezeigt ("E-Mail mit Reset-Link wurde gesendet")
- [ ] Bei ungültiger E-Mail wird eine verständliche Fehlermeldung angezeigt
- [ ] Ein "Zurück zum Login"-Link ist vorhanden

### Flow 2: Neues Passwort setzen (`/update-password`)
- [ ] Die Seite `/update-password` ist erreichbar über den Reset-Link aus der E-Mail
- [ ] Die Seite zeigt ein Formular mit zwei Feldern: "Neues Passwort" und "Passwort bestätigen"
- [ ] Passwort-Stärke-Anzeige (wie bei Registrierung) wird angezeigt
- [ ] Die Passwörter müssen übereinstimmen — sonst Fehlermeldung
- [ ] Nach erfolgreichem Update wird `supabase.auth.updateUser()` aufgerufen
- [ ] Bei Erfolg erscheint eine Erfolgsmeldung + automatischer Redirect zu `/recipes` nach 3 Sekunden
- [ ] Ein manueller "Weiter"-Button ist ebenfalls vorhanden
- [ ] Falls der Reset-Link abgelaufen oder ungültig ist, wird eine Fehlermeldung mit Link zurück zu `/forgot-password` angezeigt

### Allgemeine Anforderungen
- [ ] Passwort-Sichtbarkeits-Toggle (Eye/EyeOff-Icon) auf beiden Passwortfeldern
- [ ] Funktioniert auf Desktop und Mobile
- [ ] Seiten sind im bestehenden Auth-Layout (`app/(auth)/`) integriert

---

## Edge Cases
- **Nicht existierende E-Mail:** Reset-Anfrage wird trotzdem mit generischer Erfolgsmeldung beantwortet (Security Best Practice — kein Hinweis, ob E-Mail existiert)
- **Abgelaufener Reset-Link:** Supabase Reset-Links sind standardmäßig 1 Stunde gültig — abgelaufene Links führen zur `/update-password` mit Fehlermeldung
- **Mehrfache Reset-Anfragen:** Jeder neue Reset-Link invalidiert den vorherigen Link
- **Doppelte Passwort-Eingabe:** Passwörter stimmen nicht überein — klare Fehlermeldung vor dem Absenden
- **Schwaches Passwort:** Gleiche Validierungsregeln wie bei Registrierung (min. 6 Zeichen)
- **Nutzer bereits eingeloggt ruft `/forgot-password` auf:** Weiterleitung zum Dashboard, da kein Reset nötig

---

## Technical Requirements
- Supabase Auth `resetPasswordForEmail()` mit `redirectTo`-Parameter auf `/update-password`
- Supabase Auth `updateUser()` zum Setzen des neuen Passworts
- Supabase konfiguriert in Email-Templates den Redirect-URL auf Produktionsdomain
- Keine neue Datenbanktabelle oder Edge Function nötig — rein client-seitig

---

## Tech Design (Solution Architect)

**Ansatz:** Rein client-seitig mit Supabase Auth — kein Backend nötig.

**Neue Seiten:**
- `app/(auth)/forgot-password/page.tsx` — E-Mail-Eingabe, ruft `resetPasswordForEmail()` auf
- `app/(auth)/update-password/page.tsx` — Setzt neues Passwort via `updateUser()`

**Wiederverwendete Komponenten:**
- `AuthLayout` (`app/(auth)/layout.tsx`) — einheitliches Card-Layout
- Eye/EyeOff-Icons aus `lucide-react` — wie bei Login/Register
- Passwort-Stärke-Logik aus `app/(auth)/register/page.tsx` (`getPasswordStrength()`) für `/update-password`

**Komponentengliederung:**
```
/forgot-password → Card mit E-Mail-Feld + Reset-Button + Zurück-Link
/update-password → Card mit 2 Passwort-Feldern + Stärke-Anzeige + Eye-Toggle
```

**Supabase Dashboard:** Site URL muss auf Produktionsdomain zeigen, damit der E-Mail-Redirect korrekt funktioniert (einmalige Konfiguration).

**Keine neuen Packages nötig.**

## QA Test Results

**Datum:** 2026-04-07
**Playwright:** 10 passed, 3 skipped (Recovery-Session nötig), 0 failed
**Vitest:** 197/197 passed (keine Regression)

### Acceptance Criteria

| # | Kriterium | Status |
|---|-----------|--------|
| AC1 | "Passwort vergessen?"-Link auf Login-Seite vorhanden | ✅ PASS |
| AC2 | Link führt zu `/forgot-password` | ✅ PASS |
| AC3 | Seite enthält E-Mail-Eingabefeld | ✅ PASS |
| AC4 | `resetPasswordForEmail()` wird aufgerufen | ✅ PASS (Code-Review) |
| AC5 | Erfolgsmeldung nach Absenden | ✅ PASS |
| AC6 | Fehlermeldung bei API-Fehler | ✅ PASS |
| AC7 | "Zurück zum Login"-Link vorhanden | ✅ PASS |
| AC8 | `/update-password` über Reset-Link erreichbar | ✅ FIXED |
| AC9 | Zwei Passwortfelder: "Neues Passwort" + "Bestätigen" | ✅ PASS (Code-Review) |
| AC10 | Passwort-Stärke-Anzeige | ✅ PASS (Code-Review) |
| AC11 | Passwörter müssen übereinstimmen | ✅ PASS (Code-Review) |
| AC12 | `updateUser()` wird aufgerufen | ✅ PASS (Code-Review) |
| AC13 | Erfolgsmeldung + automatischer Redirect nach 3s | ✅ PASS (Code-Review) |
| AC14 | Manueller "Weiter"-Button | ✅ PASS |
| AC15 | Fehlermeldung bei abgelaufenem/ungültigem Link | ✅ PASS |
| AC16 | Eye/EyeOff Toggle auf beiden Feldern | ✅ PASS (Code-Review) |
| AC17 | Desktop + Mobile | ✅ PASS |
| AC18 | Im bestehenden Auth-Layout integriert | ✅ PASS |

### Edge Cases

| Szenario | Status |
|----------|--------|
| Nicht existierende E-Mail → trotzdem Erfolgsmeldung (Security Best Practice) | ✅ PASS |
| Abgelaufener Reset-Link → "Link abgelaufen"-State ohne Session | ✅ PASS |
| Passwörter stimmen nicht überein → Fehlermeldung | ✅ PASS (Code-Review) |
| Bereits eingeloggter User ruft `/forgot-password` auf → kein Redirect | ⚠️ BUG-2 (Low) |

### Security Audit

| Test | Ergebnis |
|------|----------|
| `/update-password` ohne Session zeigt KEIN Formular | ✅ PASS |
| Auth-Seiten öffentlich zugänglich | ✅ PASS |
| Nicht-existierende E-Mail gibt keine Fehlermeldung (kein User-Enumeration) | ✅ PASS |
| `redirectTo` nutzt `window.location.origin` (kein Hardcoding) | ✅ PASS |

### Bugs

| # | Schwere | Beschreibung |
|---|---------|-------------|
| BUG-1 | ~~**High**~~ | ~~`redirectTo` zeigt direkt auf `/update-password`~~ → **FIXED**: `redirectTo` zeigt jetzt auf `/auth/callback?next=/update-password`. Der bestehende Callback tauscht den Code aus und redirectet zu `/update-password` mit gültiger Session. |
| BUG-2 | **Low** | **Eingeloggter User kann `/forgot-password` aufrufen** — Edge Case aus Spec ("Weiterleitung zum Dashboard") ist nicht implementiert. Ist funktional unproblematisch, da der User trotzdem einen Reset-Link anfordern kann. |

### Produktionsbereitschaft

**READY** — BUG-1 (High) gefixt. Offener Low-Bug (BUG-2: kein Redirect für eingeloggte User auf /forgot-password) blockiert Deployment nicht.

## Deployment
- **Production URL:** https://food-app-one-sage.vercel.app
- **Deployed:** 2026-04-23
- **Git tag:** v1.17.0-PROJ-17
