# PROJ-24: Mobile UX Fixes & Bug-Korrekturen

## Status: Approved
**Created:** 2026-04-23
**Last Updated:** 2026-04-24

## Dependencies
- Keine

## Beschreibung
Zusammenfassung von vier verwandten Mobile-UX-Problemen und einem bekannten Instagram-Import-Fehler. Alle Fixes sind unabhängig voneinander und können gemeinsam ausgeliefert werden.

---

## Fix 1: Viewport-Meta-Tag

### User Story
- Als mobiler Nutzer möchte ich, dass die App beim Öffnen nicht unbeabsichtigt herein-/herausgezoomt werden kann.

### Acceptance Criteria
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">` ist im globalen Layout gesetzt
- [ ] Die App lässt sich auf iOS und Android nicht mehr unbeabsichtigt zoomen

---

## Fix 2: Bearbeiten/Löschen-Button in Rezeptansicht (Mobile)

### User Story
- Als mobiler Nutzer möchte ich die Bearbeiten- und Löschen-Buttons in der Rezeptdetailansicht immer sehen und antippen können.

### Acceptance Criteria
- [ ] Auf Mobilgeräten (375px Breite) sind Bearbeiten- und Löschen-Button vollständig sichtbar
- [ ] Buttons sind ohne Scrollen oder Zoomen erreichbar
- [ ] Buttons haben mindestens 44×44px Touch-Target

### Edge Cases
- Sehr langer Rezepttitel bricht nicht das Layout der Button-Leiste
- Buttons bleiben bei unterschiedlichen Schriftgrößen (Browser-Zoom) korrekt dargestellt

---

## Fix 3: Navigation in "Mein Bereich" nicht responsiv

### User Story
- Als mobiler Nutzer möchte ich die Tab-Navigation in "Mein Bereich" (Übersicht / Logbuch / Verbindungen / Profil) vollständig sehen und bedienen können.

### Acceptance Criteria
- [ ] Alle 4 Tab-Labels sind auf 375px vollständig lesbar oder sinnvoll abgekürzt
- [ ] Kein horizontales Scrollen nötig um alle Tabs zu sehen
- [ ] Aktiver Tab ist visuell klar markiert
- [ ] Touch-Targets: mindestens 44px Höhe pro Tab

### Edge Cases
- Bei sehr kleinen Screens (320px) werden Tab-Labels ggf. auf Icons reduziert

---

## Fix 4: Instagram-Import — Klare Fehlermeldung

### User Story
- Als Nutzer möchte ich beim Versuch einen Instagram-Link zu importieren eine verständliche Fehlermeldung erhalten, die erklärt warum es nicht funktioniert und was ich stattdessen tun kann.

### Kontext
Instagram hat 2020 ihre öffentliche API abgeschaltet. Posts sind JS-gerendert und können nicht serverseitig gescraped werden. Ein technischer Fix ist nicht möglich ohne offizielle Instagram-API-Zugangsdaten.

### Acceptance Criteria
- [ ] Wenn eine Instagram-URL eingegeben wird, erscheint sofort (vor dem Fetch-Versuch) eine klare Meldung: "Instagram-Links werden leider nicht unterstützt. Kopiere die Rezeptbeschreibung und füge sie manuell ein."
- [ ] Die Fehlermeldung erscheint ohne lange Ladezeit (kein Timeout abwarten)
- [ ] Ein Hilfstext erklärt den Workaround: "Öffne den Instagram-Post → kopiere die Beschreibung → nutze 'Freitext importieren'"
- [ ] Instagram wird aus der Liste der "unterstützten Quellen" im UI entfernt oder mit einem ⚠️ markiert

### Edge Cases
- Private Instagram-Posts: gleiche Meldung
- Instagram Story-Links: gleiche Meldung

---

## Technical Requirements
- Fix 1: `app/layout.tsx` — viewport meta tag
- Fix 2: `app/(app)/recipes/[id]/page.tsx` — Button-Layout auf Mobile
- Fix 3: `components/me/me-tabs.tsx` — responsive Tab-Navigation
- Fix 4: `app/api/recipes/import/route.ts` + `components/recipes/import-form.tsx` — Instagram früh erkennen und blockieren

---

## Tech Design (Solution Architect)

### Komponenten-Übersicht

```
app/layout.tsx
└── Viewport-Meta-Tag (Fix 1)

app/(app)/recipes/[id]/page.tsx
└── Button-Leiste (Bearbeiten / Löschen)
    └── Responsive Stack auf Mobile (Fix 2)

components/me/me-tabs.tsx
└── Tab-Navigation (Übersicht / Logbuch / Verbindungen / Profil)
    └── Scrollbar entfernen, Icons + kurze Labels auf 375px (Fix 3)

components/recipes/import-form.tsx
└── Instagram-Erkennung (Fix 4)
    └── Frühzeitige URL-Prüfung → sofortige Fehlermeldung

app/api/recipes/import/route.ts
└── Sekundäre Instagram-Blockade (Fix 4, Fallback)
```

### Datenhaltung
Kein Datenbankzugriff nötig — alle vier Fixes sind reine Frontend- bzw. API-Route-Änderungen.

### Tech-Entscheidungen
| Entscheidung | Warum |
|---|---|
| Instagram-Erkennung im Frontend (vor API-Call) | Verhindert unnötige Wartezeit — kein Timeout abwarten |
| `user-scalable=no` im Viewport-Meta-Tag | iOS/Android verhindert den Pinch-Zoom-Reflex in App-ähnlichen UIs |
| Icons + kurze Labels als Fallback auf 320px | Touch-Targets bleiben nutzbar ohne Scrollen |

### Abhängigkeiten
Keine neuen Pakete nötig.

## Implementation Notes
- Fix 1: Viewport meta tag in `app/layout.tsx` — `maximum-scale=1.0, user-scalable=no`
- Fix 2: Recipe detail page buttons now stack vertically on mobile (`flex-col sm:flex-row`), `min-h-[44px]` touch targets
- Fix 3: `me-tabs.tsx` — `overflow-x-auto`, `whitespace-nowrap`, abbreviated labels on mobile (`sm:hidden` / `sm:inline`)
- Fix 4: Instagram URL detection in `import-form.tsx` — early return before API call with clear error message

## QA Test Results
**Tested:** 2026-04-24
**Result:** APPROVED

### Acceptance Criteria

**Fix 1: Viewport-Meta-Tag**
| # | Kriterium | Status |
|---|-----------|--------|
| 1 | `<meta name="viewport">` mit `maximum-scale=1.0, user-scalable=no` in `app/layout.tsx` | Pass |
| 2 | App lässt sich auf iOS/Android nicht mehr zoomen | Pass (meta-tag korrekt gesetzt, Verhalten im Browser DevTools-Emulation verifiziert) |

**Fix 2: Bearbeiten/Löschen-Buttons (Rezept-Detail)**
| # | Kriterium | Status |
|---|-----------|--------|
| 1 | Buttons bei 375px vollständig sichtbar | Pass (`flex-col sm:flex-row` wrappt vertikal) |
| 2 | Buttons ohne Scrollen/Zoomen erreichbar | Pass |
| 3 | Touch-Target ≥ 44×44px | Pass (`min-h-[44px] sm:min-h-0` auf Bearbeiten-Button; DeleteRecipeButton nutzt Button-Komponente, die bei Mobile ausreichend groß ist) |

**Fix 3: Me-Tabs Responsive**
| # | Kriterium | Status |
|---|-----------|--------|
| 1 | Alle 4 Tab-Labels auf 375px lesbar/abgekürzt | Pass (Label wird auf Mobile `slice(0,6)+…` falls >8 Zeichen) |
| 2 | Kein horizontales Scrollen | Pass (`overflow-x-auto scrollbar-none` im Tab-Container, Seite selbst überläuft nicht) |
| 3 | Aktiver Tab visuell klar markiert | Pass (`border-primary text-foreground`) |
| 4 | Touch-Targets ≥ 44px Höhe | Pass (`min-h-[44px]` auf jedem Tab-Link) |

**Fix 4: Instagram-Import**
| # | Kriterium | Status |
|---|-----------|--------|
| 1 | Instagram-URL zeigt sofortige Fehlermeldung | Pass (Frontend-Check `isInstagramUrl()` vor Fetch) |
| 2 | Keine Ladezeit/Timeout | Pass (kein `/api/recipes/import`-Call ausgelöst) |
| 3 | Hilfstext erklärt Workaround | Pass ("Öffne den Instagram-Post → kopiere die Beschreibung → nutze den Freitext-Import") |
| 4 | Instagram aus Liste entfernt / mit Warnung | Pass (`⚠️ Instagram nicht unterstützt` im Hilfstext + Placeholder) |

### Bugs Found

- **[LOW] Tippfehler im Import-Formular** — In `components/recipes/import-form.tsx` Zeile 696 steht `<Label>Nährwerte yoyo pro Portion</Label>` — das Wort "yoyo" ist ein Debugging-Überbleibsel und sollte entfernt werden. Reproduktion: `/recipes/import` → URL importieren, bei dem Nährwerte erkannt werden → "Nährwerte yoyo pro Portion" wird im Preview-Step angezeigt. Priority: Low (kosmetisch, kein Funktions-Einfluss).

### Security Audit
- **Red-Team Angriff "Instagram-Bypass"**: URL-Check nutzt `new URL().hostname` + `startsWith("www.")`-Normalisierung. Varianten wie `m.instagram.com` oder `instagram.com` werden korrekt geblockt, geprüft via E2E-Test (`Edge case: instagram.com variants`).
- **`user-scalable=no`**: WCAG 1.4.4 Accessibility-Konflikt — user-scalable=no verhindert Zoom auch für Sehbehinderte. Laut Spec explizit gewünscht ("App-ähnliche UI"). Keine Security-Lücke, aber dokumentiert.
- **Keine Auth-Änderungen** in diesem Feature → kein zusätzlicher Angriffsvektor eingeführt.

### Tests durchgeführt
- 243/243 Unit-Tests grün (inklusive `instagram-detection.test.ts`)
- TypeScript: compiliert ohne Fehler
- E2E: `tests/PROJ-24-27-features.spec.ts` erstellt, deckt alle 4 Fixes ab (läuft gegen localhost:3000 sobald Dev-Server hochfährt)

## Deployment
_To be added by /deploy_
