# PROJ-23: RezeptFit Landingpage

## Status: Deployed
**Created:** 2026-04-08
**Last Updated:** 2026-04-08

## Dependencies
- None (eigenständige statische HTML-Datei)

---

## Beschreibung
Eine marketing-orientierte Landingpage für die App **RezeptFit**, die gleichzeitig als externes Marketing-Instrument für neue Nutzer und als Onboarding-Übersicht für neu registrierte Nutzer dient. Die Seite basiert auf dem Bootstrap 5 / Greenive-Stil (`example/bootstrap/index.html`) und wird als eigenständige statische HTML-Datei geliefert.

---

## User Stories

- Als **potenzieller Nutzer** möchte ich auf einen Blick verstehen, was RezeptFit kann, damit ich entscheide ob ich mich registriere.
- Als **neuer Nutzer** möchte ich alle wichtigen Features erklärt bekommen, damit ich weiß, womit ich starten soll.
- Als **Besucher** möchte ich den Preisunterschied zwischen Free und Pro sehen, damit ich das richtige Abo wähle.
- Als **Besucher** möchte ich zwischen monatlicher und jährlicher Abrechnung wechseln können, damit ich die günstigere Option erkenne.
- Als **Mobile-Nutzer** möchte ich die Seite auf meinem Smartphone vollständig nutzen können.

---

## Acceptance Criteria

### Hero
- [ ] Headline "RezeptFit" sichtbar mit klarem Tagline (zweisprachig DE/EN)
- [ ] Primärer CTA-Button "Kostenlos registrieren" → `/register`
- [ ] Sekundärer CTA "Mehr erfahren" → scrollt zu Features-Sektion
- [ ] Bewertungs-Badge (z.B. "4.8/5.0") sichtbar

### Features-Sektion
- [ ] Alle 5 Kernfeatures präsentiert:
  - Rezeptverwaltung (erstellen, importieren, Nährwerte)
  - Wochenplanung
  - Kalorie-Tracking & Dashboard
  - Einkaufsliste
  - Community & Rezepte teilen
- [ ] Jedes Feature mit Icon, Titel und Kurzbeschreibung (DE)

### App-Vorschau
- [ ] Screenshot-Platzhalter oder Mockup-Visual der App-Oberfläche
- [ ] Visuell ansprechend als Browser/Phone-Frame

### Statistiken / Social Proof
- [ ] Mind. 3 Kennzahlen (z.B. Anzahl Rezepte, aktive Nutzer, Bewertung)
- [ ] Animierte Counter beim Einblenden (IntersectionObserver)

### Pricing
- [ ] Toggle-Button "Monatlich / Jährlich" (default: Jährlich)
- [ ] Free-Plan: 0 € / kostenlos — mit Feature-Liste
- [ ] Pro-Plan: 5 €/Monat ODER 12 €/Jahr (je nach Toggle)
- [ ] Jährliches Abo zeigt Einsparung (z.B. "Spare 48%")
- [ ] CTA je Plan: "Kostenlos starten" / "Pro holen"

### FAQ
- [ ] Mind. 5 Fragen/Antworten (auf Deutsch)
- [ ] Bootstrap Accordion

### Navigation
- [ ] Fixed Navbar mit Logo "RezeptFit" + Menüpunkten + CTA-Button
- [ ] Smooth Scroll zu allen Sektionen
- [ ] Mobile Hamburger-Menü funktioniert

### Footer
- [ ] App-Name, Tagline, Kontakt-Platzhalter
- [ ] Links zu den Sektionen

### Technisch
- [ ] Eigenständige Datei: `example/bootstrap/rezeptfit.html`
- [ ] Bootstrap 5.3 via CDN
- [ ] Fonts: Ovo (Headlines) + Manrope (Body) via Google Fonts
- [ ] Font Awesome 6 via CDN
- [ ] Farbschema: Grün (#4a7c59) als Primärfarbe
- [ ] Vollständig responsiv (mobile-first)
- [ ] Keine externen Bildabhängigkeiten (Emojis/CSS als Placeholder)

---

## Edge Cases

- Pricing-Toggle: Wenn "Monatlich" gewählt → Preis wechselt zu 5 €/Monat, kein Einspar-Badge
- Pricing-Toggle: Wenn "Jährlich" gewählt → Preis zeigt 12 €/Jahr + Einspar-Badge "Spare 48%"
- Smooth Scroll: Navbar-Höhe (ca. 70px) als Offset berücksichtigen
- Mobile: Hamburger-Menü schließt sich nach Klick auf Anchor-Link automatisch
- Alle Links zur App (`/register`, `/login`) sind als Platzhalter `href="#"` gesetzt, da statische Datei

---

## Seitenstruktur (Reihenfolge der Sektionen)

1. **Navbar** — Logo, Navigation, "Kostenlos registrieren" CTA
2. **Hero** — Headline, Subtext, zwei CTAs, Stats-Badge, Visual/Emoji
3. **Features** — 5 Feature-Kacheln mit Icons
4. **App-Vorschau** — Browser/Phone-Mockup Placeholder
5. **Statistiken** — 3–4 animierte Counter (grüner Hintergrund)
6. **Pricing** — Toggle + 2 Pläne (Free & Pro)
7. **FAQ** — 5 Fragen im Accordion
8. **Footer** — Links, Kontakt, Copyright

---

## Inhalte

### App-Name & Tagline
- **Name:** RezeptFit
- **Tagline DE:** "Deine Ernährung. Dein Plan. Dein Leben."
- **Tagline EN:** "Your food. Your plan. Your life."

### Features (DE)
| Feature | Icon | Beschreibung |
|---|---|---|
| Rezeptverwaltung | fa-book-open | Erstelle, importiere und verwalte deine Rezepte mit automatischer Nährwertberechnung. |
| Wochenplanung | fa-calendar-week | Plane deine Mahlzeiten für die ganze Woche auf einen Blick. |
| Kalorie-Tracking | fa-chart-line | Behalte dein Kaloriendefizit im Blick — mit TDEE-Rechner und täglich Dashboard. |
| Einkaufsliste | fa-cart-shopping | Generiere automatisch eine Einkaufsliste aus deinem Wochenplan. |
| Community | fa-users | Entdecke globale Rezepte und teile deine Lieblingsgerichte mit Freunden. |

### Pricing
| Plan | Monatlich | Jährlich | Features |
|---|---|---|---|
| Free | 0 € | 0 € | Rezepte (unbegrenzt), Wochenplan, Einkaufsliste |
| Pro | 5 €/Monat | 12 €/Jahr | + Kalorie-Tracking, Dashboard, Community, Prioritäts-Support |

### FAQ-Fragen
1. Ist RezeptFit kostenlos nutzbar?
2. Was ist im Pro-Plan enthalten?
3. Kann ich mein Abo jederzeit kündigen?
4. Wie werden meine Nährwerte berechnet?
5. Gibt es eine mobile App?

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results

**QA Date:** 2026-04-08
**Tester:** QA Engineer (automated code audit)
**Scope:** Statische HTML-Datei `example/bootstrap/rezeptfit.html`

---

### Acceptance Criteria — Ergebnisse

| Kriterium | Status |
|---|---|
| Hero: Headline + Tagline DE/EN | ✅ PASS |
| Hero: CTA "Kostenlos registrieren" vorhanden | ✅ PASS |
| Hero: Sekundär-CTA scrollt zu #features | ✅ PASS |
| Hero: Bewertungs-Badge (4.8/5.0) sichtbar | ✅ PASS |
| Features: Alle 5 Kernfeatures vorhanden (Icons, Titel, Text) | ✅ PASS |
| App-Vorschau: Browser-Frame-Mockup vorhanden | ✅ PASS |
| Stats: 4 animierte Counter (IntersectionObserver) | ✅ PASS |
| Pricing: Toggle Monatlich/Jährlich (default Jährlich) | ✅ PASS |
| Pricing: Free-Plan 0€ mit Feature-Liste | ✅ PASS |
| Pricing: Pro-Plan 5€/Mo oder 12€/Jahr je nach Toggle | ✅ PASS |
| Pricing: "Spare 48%" Badge bei Jährlich | ✅ PASS |
| Pricing: CTA "Kostenlos starten" / "Pro holen" | ✅ PASS |
| FAQ: 5 Fragen auf Deutsch, Bootstrap Accordion | ✅ PASS |
| Navbar: Fixed, Logo, Menü, CTA-Button | ✅ PASS |
| Navbar: Smooth Scroll (scroll-padding-top gesetzt) | ✅ PASS |
| Navbar: Mobile Hamburger-Menü + Auto-Close | ✅ PASS |
| Footer: App-Name, Tagline, Links, Kontakt | ✅ PASS |
| Datei: `example/bootstrap/rezeptfit.html` | ✅ PASS |
| Tech: Bootstrap 5.3 + Font Awesome 6 + Google Fonts CDN | ✅ PASS |
| Tech: Primärfarbe #4a7c59, Ovo + Manrope Fonts | ✅ PASS |
| Tech: Keine externen Bildabhängigkeiten | ✅ PASS |
| Responsiv: Bootstrap Grid + Media Queries | ✅ PASS |

**Ergebnis: 22/22 Kriterien bestanden**

---

### Edge Cases — Ergebnisse

| Edge Case | Status |
|---|---|
| Toggle → Monatlich: Preis 5€/Mo, kein Badge | ✅ PASS |
| Toggle → Jährlich: Preis 12€/Jahr + "Spare 48%" | ✅ PASS |
| Smooth Scroll mit Navbar-Offset (scroll-padding-top: 72px) | ✅ PASS |
| Mobile: Hamburger schließt nach Anchor-Klick | ✅ PASS |
| App-Links als href="#" Platzhalter | ✅ PASS |

---

### Bugs gefunden

| # | Schwere | Beschreibung | Zeile |
|---|---|---|---|
| 1 | Low | **Grammatikfehler DE:** "kein Kreditkarte nötig" → "keine Kreditkarte nötig" (Kreditkarte ist feminin) | 981 |
| 2 | Low | **Counter-Animation 4.8:** `data-target="4" data-decimal=".8"` zeigt während Animation falsche Zwischenwerte ("0.8/5", "1.8/5") statt eines sauberen Hochzählens bis "4.8/5" | 940 |
| 3 | Low | **Toter Code:** `const saveBadge = document.getElementById(...)` in `switchPeriod()` wird deklariert aber nie benutzt | 1294 |
| 4 | Low | **Totes CSS:** Klassen `.mockup-card`, `.mockup-card-icon`, `.mockup-bar`, `.mockup-bar.filled` definiert aber nirgendwo im HTML verwendet | 194–214 |
| 5 | Low | **Copyright-Jahr:** Footer zeigt "2025" statt "2026" | 1232 |

---

### Security Audit

Da es sich um eine rein statische HTML-Datei ohne Formulare, User-Input oder Server-Kommunikation handelt, gibt es keine relevanten Angriffsvektoren.

- Keine User-Inputs → kein XSS-Risiko
- Keine API-Calls → kein CSRF/Auth-Bypass-Risiko  
- CDN-Quellen: Bootstrap (jsDelivr), Font Awesome (Cloudflare), Google Fonts — alle vertrauenswürdig
- Keine sensiblen Daten im HTML

**Security: ✅ Keine Findings**

---

### Browser-Kompatibilität (Code-Analyse)

| Feature | Chrome | Firefox | Safari |
|---|---|---|---|
| CSS Custom Properties | ✅ | ✅ | ✅ |
| `clamp()` | ✅ | ✅ | ✅ |
| `backdrop-filter` | ✅ | ✅ | ✅ (prefix vorhanden) |
| IntersectionObserver | ✅ | ✅ | ✅ |
| Bootstrap 5.3 | ✅ | ✅ | ✅ |

**`-webkit-backdrop-filter` korrekt gesetzt** → Safari unterstützt.

---

### Produktionsreife

**Entscheidung: ✅ PRODUCTION-READY**

Keine Critical oder High Bugs. Alle 22 Acceptance Criteria bestanden. Die 5 gefundenen Low-Bugs sind kosmetischer Natur und blockieren die Auslieferung nicht.

## Deployment

**Deployed:** 2026-04-08
**Commit:** 4d48754
**Dateien:**
- `example/bootstrap/rezeptfit.html` — Hauptseite
- `example/bootstrap/impressum.html` — Impressum
**Build:** ✅ `npm run build` erfolgreich
**Lint:** ✅ Keine Errors (nur vorhandene Warnings)
