# PROJ-29: Zutaten-Icons statt Bulletpoints

## Status: Planned
**Created:** 2026-04-23
**Last Updated:** 2026-04-23

## Dependencies
- Rezeptverwaltung (deployed)

## Beschreibung
In der Zutatenliste eines Rezepts werden die Bulletpoints durch kleine Produktbilder ersetzt. Wird kein passendes Bild gefunden, wird kein Bulletpoint angezeigt (kein Fallback-Icon).

## User Stories
- Als Nutzer möchte ich bei den Zutaten kleine Bilder sehen, damit ich die Zutaten auf einen Blick erkenne.
- Als Nutzer möchte ich keine generischen Platzhalter-Icons sehen — wenn kein Bild vorhanden, soll die Zeile kein Icon haben.

## Acceptance Criteria
- [ ] In der Rezept-Detailansicht hat jede Zutat ein kleines Icon (ca. 24×24px) am Zeilenanfang, wenn ein Bild gefunden wurde
- [ ] Bildquelle: Open Food Facts Produktbilder (Suche nach Zutatennamen, z.B. "Haferflocken")
- [ ] Bilder werden gecacht (nicht bei jedem Seitenaufruf neu geladen)
- [ ] Kein passendes Bild gefunden → kein Icon, kein Bulletpoint, nur Text
- [ ] Icons sind rund oder quadratisch mit abgerundeten Ecken (16px border-radius)
- [ ] Bilder laden lazy (kein Blocking des Seitenaufbaus)

## Edge Cases
- Zutat mit sehr spezifischem Namen (z.B. "Bio-Dinkelmehl Type 630") → Suche findet kein Bild → kein Icon
- Sehr generische Zutaten (z.B. "Salz") → häufig kein Produktbild → kein Icon
- Bilder-API nicht erreichbar → kein Icon (kein Absturz, kein Placeholder)
- Lange Zutatenliste (>20 Zutaten) → Icons laden progressiv

## Technical Requirements
- Open Food Facts Image API: `https://world.openfoodfacts.org/api/v2/search?search_terms={name}&fields=image_small_url&page_size=1`
- Icon-Mapping clientseitig oder via `/api/nutrition/ingredient-icon?name=Haferflocken`
- Caching: Icons-URLs in `localStorage` oder `sessionStorage` (Key: Zutatname → URL)
- Alternativ: statische Mapping-Datei für häufige Zutaten (verhindert API-Calls für Standardzutaten)
- Keine DB-Änderung nötig

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
