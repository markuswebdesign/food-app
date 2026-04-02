# PROJ-15: Styling-Überarbeitung

## Status: Planned
**Created:** 2026-04-01
**Last Updated:** 2026-04-01

## Dependencies
- Alle bisher deployed Features (PROJ-1 bis PROJ-5, Landingpage PROJ-14 empfohlen)

## Beschreibung
Überarbeitung des visuellen Designs der gesamten App. Ziel ist ein konsistentes, modernes und ansprechendes Erscheinungsbild über alle Seiten hinweg.

## User Stories
- Als Nutzer möchte ich eine App, die gut aussieht und Freude beim Benutzen macht.
- Als Nutzer möchte ich ein konsistentes visuelles Erlebnis auf allen Seiten.
- Als Nutzer auf Mobile möchte ich eine App, die sich wie eine native App anfühlt.

## Acceptance Criteria
- [ ] Einheitliches Farbschema definiert und über alle Seiten konsistent angewendet
- [ ] Typografie: Einheitliche Schriftgrößen-Hierarchie (H1, H2, H3, Body, Caption)
- [ ] Alle Buttons, Inputs und Cards haben ein konsistentes Design
- [ ] Ausreichend Weißraum / Padding auf allen Seiten (kein "zusammengedrängtes" Layout)
- [ ] Hover- und Active-States für alle interaktiven Elemente
- [ ] Mobile: Mindestens 44x44px Touch-Targets für alle klickbaren Elemente
- [ ] Dark Mode: Falls bereits vorhanden, konsistent über alle neuen Seiten
- [ ] Ladeanimationen / Skeleton-Screens statt leerer weißer Flächen

## Scope (welche Seiten werden überarbeitet)
- Login / Registrierung
- Dashboard
- Rezeptliste & Rezeptdetail
- Wochenplan
- Einkaufsliste
- Profil-Seite
- Landingpage (falls PROJ-14 deployed)

## Edge Cases
- Bestehende Funktionalität darf durch Styling-Änderungen nicht beeinträchtigt werden
- Accessibility: Kontrastverhältnis WCAG AA (4.5:1 für Text)
- Keine Breaking Changes an bestehenden Komponenten-APIs

## Technical Requirements
- Tailwind CSS Konfiguration (tailwind.config.ts) für einheitliche Designtokens
- Änderungen können inkrementell pro Seite ausgerollt werden

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
