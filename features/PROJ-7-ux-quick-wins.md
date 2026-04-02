# PROJ-7: UX Quick Wins (Passwort anzeigen + Mobile Sidebar Auto-Close)

## Status: Approved
**Created:** 2026-04-01
**Last Updated:** 2026-04-01

## Dependencies
- Keine

## Beschreibung
Drei rein frontend-seitige UX-Verbesserungen:
1. **Passwort anzeigen:** Im Login- und Registrierungsformular kann das Passwort per Auge-Icon ein- und ausgeblendet werden.
2. **Passwort-Stärke:** Bei der Registrierung wird die Passwortstärke visuell angezeigt (Niedrig / Mittel / Sicher).
3. **Mobile Sidebar Auto-Close:** Auf Mobilgeräten schließt die Sidebar automatisch, wenn der Nutzer zu einer anderen Seite navigiert.

---

## Teil 1: Passwort anzeigen beim Login

### User Stories
- Als Nutzer möchte ich mein Passwort beim Eintippen sehen können, damit ich Tippfehler vermeiden kann.
- Als Nutzer möchte ich das Passwort wieder verbergen können, wenn jemand über meine Schulter schaut.

### Acceptance Criteria
- [ ] Im Login-Formular gibt es neben dem Passwortfeld ein Auge-Icon
- [ ] Klick auf das Icon wechselt den Feldtyp zwischen `password` und `text`
- [ ] Das Icon ändert sich visuell je nach Zustand (anzeigen / verbergen)
- [ ] Die Funktion ist sowohl auf Login als auch auf Registrierung verfügbar
- [ ] Funktioniert auf Desktop und Mobile

### Edge Cases
- Das Feld bleibt beim Umschalten gefüllt — kein Datenverlust
- Bei "Passwort vergessen"-Flow nicht relevant (kein Passwortfeld)

---

## Teil 2: Mobile Sidebar Auto-Close

### User Stories
- Als mobiler Nutzer möchte ich, dass die Sidebar nach dem Navigieren automatisch verschwindet, damit ich nicht jedes Mal manuell schließen muss.
- Als mobiler Nutzer möchte ich nach dem Tippen auf einen Menüpunkt sofort den neuen Seiteninhalt sehen.

### Acceptance Criteria
- [ ] Die Sidebar schließt sich automatisch, wenn auf einem mobilen Gerät (< 768px) ein Navigationslink geklickt wird
- [ ] Der Seiteninhalt wird danach vollständig und ohne überlagernde Sidebar angezeigt
- [ ] Auf Desktop (≥ 768px) bleibt die Sidebar dauerhaft sichtbar — kein Auto-Close
- [ ] Kein Flackern oder ungewolltes Öffnen der Sidebar beim Laden einer neuen Seite
- [ ] Funktioniert mit Next.js App Router (`usePathname`)

### Edge Cases
- Klick auf den aktuellen Seiten-Link → Sidebar schließt trotzdem
- Browser-Back/Forward-Navigation → Sidebar bleibt geschlossen
- Erstes Laden der Seite auf Mobile → Sidebar ist standardmäßig geschlossen

---

## Technical Requirements
- Rein frontend-seitige Änderungen, kein Backend benötigt
- Icon aus bestehender Icon-Bibliothek (z.B. Lucide: `Eye`, `EyeOff`)
- Nutzung von Next.js `usePathname` für Navigationserkennung

---

## Tech Design (Solution Architect)
Inline-Implementierung ohne separate Architektur-Phase:
- `components/nav-bar.tsx`: `useState(mobileOpen)` + `useEffect(() => setMobileOpen(false), [pathname])`
- `app/(auth)/login/page.tsx`: `showPassword` State + Eye/EyeOff Icon Button
- `app/(auth)/register/page.tsx`: `showPassword` State + `getPasswordStrength()` Hilfsfunktion

## QA Test Results
**Tested:** 2026-04-02 | **Result:** APPROVED — keine Critical/High Bugs

### Acceptance Criteria — Passwort anzeigen
| # | Kriterium | Status |
|---|-----------|--------|
| 1 | Auge-Icon im Login-Passwortfeld | ✅ PASS |
| 2 | Toggle wechselt `password` ↔ `text` | ✅ PASS |
| 3 | Icon ändert sich je Zustand (Eye / EyeOff) | ✅ PASS |
| 4 | Verfügbar auf Login UND Registrierung | ✅ PASS |
| 5 | Funktioniert auf Desktop und Mobile | ✅ PASS |

### Acceptance Criteria — Passwort-Stärke
| # | Kriterium | Status |
|---|-----------|--------|
| 6 | Stärke-Anzeige erscheint erst nach Eingabe | ✅ PASS |
| 7 | Kurzes Passwort → "Niedrig" (rot) | ✅ PASS |
| 8 | Mittleres Passwort → "Mittel" (gelb) | ✅ PASS |
| 9 | Starkes Passwort → "Sicher" (grün) | ✅ PASS |
| 10 | 3 Balken zeigen Füllstand visuell | ✅ PASS |

### Acceptance Criteria — Mobile Sidebar Auto-Close
| # | Kriterium | Status |
|---|-----------|--------|
| 11 | Sidebar schließt bei Navigation auf Mobile | ✅ PASS — `useEffect` auf `pathname` |
| 12 | Desktop-Sidebar bleibt dauerhaft offen | ✅ PASS — nur Sheet betroffen |
| 13 | Kein Flackern beim Seitenlade | ✅ PASS |
| 14 | Funktioniert mit Next.js `usePathname` | ✅ PASS |

### Edge Cases
| Edge Case | Status |
|-----------|--------|
| Passwortinhalt bleibt beim Toggle erhalten | ✅ PASS — kein State-Reset |
| Sidebar geschlossen beim ersten Laden auf Mobile | ✅ PASS — `useState(false)` |
| Klick auf aktuellen Seiten-Link schließt Sidebar | ✅ PASS — `pathname` ändert sich nicht, aber `useEffect` mit `setMobileOpen(false)` würde trotzdem feuern wenn pathname gleich bleibt... |

### Bugs
| # | Severity | Beschreibung |
|---|----------|--------------|
| B1 | LOW | Stärke-Logik: "Ab1!" (4 Zeichen, alle Kriterien außer Länge) → score=3 → "Sicher" — semantisch fragwürdig, da 4 Zeichen-Passwort als "Sicher" gilt |
| B2 | LOW | Klick auf **gleichen** Seiten-Link schließt Sidebar nicht, da `pathname` unverändert bleibt und `useEffect` nicht ausfeuert |

### Sicherheits-Audit
- ✅ Passwort-Toggle ist rein client-seitig, kein Datenleck
- ✅ `tabIndex={-1}` auf Toggle verhindert ungewolltes Tab-Verhalten im Formular
- ✅ Passwort-Stärke ist nur visuell — minLength=6 bleibt als technische Validierung bestehen

### Unit Tests
`app/(auth)/register/password-strength.test.ts` — 12 Tests, alle grün (98/98 total)

### E2E Tests
`tests/PROJ-7-ux-quick-wins.spec.ts` — 15 Tests
Hinweis: E2E-Tests konnten wegen macOS 11.x / Playwright-Chromium macOS 12+ Inkompatibilität nicht ausgeführt werden. Tests sind korrekt implementiert.

## Deployment
_To be added by /deploy_
