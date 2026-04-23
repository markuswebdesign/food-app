# PROJ-28: Logbuch-Produktsuche & Barcode-Scanner

## Status: Planned
**Created:** 2026-04-23
**Last Updated:** 2026-04-23

## Dependencies
- PROJ-2 Mahlzeiten-Logbuch (deployed)
- PROJ-11 Nährwert-Berechnung (deployed)

## Beschreibung
Erweiterung des Logbuchs um zwei neue Erfassungsmethoden: Suche nach einzelnen Produkten (z.B. "Haferflocken mit Blaubeeren") mit automatischer Nährwert-Übernahme, sowie Barcode-Scanner über die Gerätekamera.

---

## Teil 1: Produktsuche nach Name

### User Stories
- Als Nutzer möchte ich im Logbuch ein Produkt per Name suchen (z.B. "Haferflocken") und es direkt mit Nährwerten erfassen.
- Als Nutzer möchte ich Suchergebnisse mit Nährwertvorschau sehen, bevor ich einen Eintrag hinzufüge.
- Als Nutzer möchte ich die Menge anpassen und die Nährwerte werden automatisch umgerechnet.

### Acceptance Criteria
- [ ] Im Logbuch gibt es ein Suchfeld "Produkt suchen"
- [ ] Suche fragt Open Food Facts API an (kostenlos, keine Registrierung nötig)
- [ ] Ergebnisse zeigen: Produktname, Marke, Kalorien pro 100g
- [ ] Nutzer wählt ein Produkt, gibt Menge in Gramm ein
- [ ] Nährwerte (kcal, Protein, Fett, KH) werden automatisch berechnet und als Log-Eintrag gespeichert
- [ ] Ladeindikator während der Suche

---

## Teil 2: Barcode-Scanner

### User Stories
- Als Nutzer möchte ich ein Produkt durch Scannen des Barcodes mit meiner Kamera erfassen.
- Als Nutzer möchte ich nach dem Scan sofort die Nährwerte sehen und die Menge eingeben.

### Acceptance Criteria
- [ ] Im Logbuch gibt es einen "Barcode scannen"-Button
- [ ] Klick öffnet die Gerätekamera (Browser-API)
- [ ] Barcode wird erkannt und an Open Food Facts API geschickt
- [ ] Bei Treffer: Produktname + Nährwerte werden angezeigt, Nutzer gibt Menge ein
- [ ] Bei keinem Treffer: Hinweis "Produkt nicht gefunden — bitte manuell eingeben"
- [ ] Scanner funktioniert auf iOS Safari und Android Chrome

## Edge Cases
- Kamera-Zugriff verweigert → Fehlermeldung mit Hinweis auf manuelle Suche
- Produkt in OFF-Datenbank ohne vollständige Nährwerte → nur vorhandene Werte übernehmen, fehlende als null
- Sehr ähnliche Produkte in Suchergebnissen → User wählt aus Liste
- Offline → Fehlermeldung, kein Absturz

## Technical Requirements
- Open Food Facts API: `https://world.openfoodfacts.org/api/v2/search` (Suche) und `https://world.openfoodfacts.org/api/v2/product/{barcode}` (Barcode)
- Barcode-Scanner: `@zxing/browser` oder `html5-qrcode` (clientseitig, kein Server nötig)
- Neue API-Route `/api/nutrition/product-search` als Proxy (vermeidet CORS)
- Kein neues DB-Schema nötig — Ergebnis wird als normaler Log-Eintrag gespeichert

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
