# PROJ-24: Mobile UX Fixes & Bug-Korrekturen

## Status: In Progress
**Created:** 2026-04-23
**Last Updated:** 2026-04-23

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
_To be added by /qa_

## Deployment
_To be added by /deploy_
