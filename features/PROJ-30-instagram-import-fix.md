# PROJ-30: Instagram Import Fix

## Status: Planned
**Created:** 2026-04-24
**Last Updated:** 2026-04-24

## Dependencies
- None (bestehende Import-Infrastruktur unter `/api/recipes/import`)

## Hintergrund
Der aktuelle Instagram-Import schlägt fehl, weil Instagram Server-seitige HTTP-Anfragen blockiert (Login-Wall, JS-Rendering). Das `instagram-media-scraper` npm-Paket von ahmedrangel extrahiert Daten aus öffentlichen Posts ohne API-Key und war 2025 noch funktionstüchtig.

## User Stories
- Als Nutzer möchte ich eine öffentliche Instagram-Post-URL einfügen, damit das Rezept automatisch importiert wird
- Als Nutzer möchte ich eine klare Fehlermeldung sehen wenn der Post privat ist oder der Import fehlschlägt, damit ich weiß was zu tun ist
- Als Nutzer möchte ich beim Fehlschlag die Rezeptbeschreibung manuell einfügen können, damit ich nicht alles von Hand tippen muss

## Acceptance Criteria
- [ ] Instagram-URLs (`instagram.com/p/...`, `instagram.com/reel/...`) werden erkannt
- [ ] Für öffentliche Posts: Titel, Beschreibung/Caption und Bild-URL werden via `instagram-media-scraper` extrahiert
- [ ] Die extrahierten Daten werden wie bei anderen Quellen an Claude übergeben zum Rezept-Parsen
- [ ] Bei privatem Post oder Scraping-Fehler: Nutzer sieht eine klare Meldung mit Anleitung zum manuellen Einfügen
- [ ] Fallback-UI: Textfeld erscheint in dem der Nutzer die Caption/Beschreibung manuell einfügen kann (Post öffnen → Bio kopieren)
- [ ] Der manuelle Fallback wird danach normal via Claude geparst

## Edge Cases
- Post ist privat → Fehlermeldung + manueller Fallback
- Instagram blockiert die Server-IP → gleiche Behandlung wie privater Post
- Post enthält kein Rezept (z.B. nur Lifestyle-Bild) → Claude gibt Fehler zurück, Nutzer wird informiert
- Reel-URL vs. Post-URL → beide Formate müssen erkannt werden (`/p/` und `/reel/`)
- URL mit Tracking-Parametern (`?igsh=...`) → müssen vor der Anfrage bereinigt werden

## Technical Requirements
- npm-Paket: `instagram-media-scraper` (ahmedrangel, MIT-Lizenz, kein API-Key)
- Timeout: max 20 Sekunden (Vercel `maxDuration = 60` bereits gesetzt)
- Fallback muss ohne externe Abhängigkeiten funktionieren (nur Claude + eingegebener Text)
- Kein Instagram-Login, keine gespeicherten Credentials

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
