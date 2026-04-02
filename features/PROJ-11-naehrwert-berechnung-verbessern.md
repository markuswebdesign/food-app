# PROJ-11: Genaue Nährwert-Berechnung

## Status: In Progress
**Created:** 2026-04-01
**Last Updated:** 2026-04-02

## Dependencies
- Rezeptverwaltung (deployed)

## Beschreibung
Die aktuelle Nährwert-Berechnung über die Claude API ist ungenau und weicht stark von realen Rezeptwerten ab. Es wird eine zuverlässigere Lösung benötigt — entweder über eine dedizierte Nährwertdatenbank-API oder über eine strukturierte Zutat-zu-Nährwert-Berechnung.

## Problem
Beim Rezept "Senf-Eier-Ragout" (Beispiel: https://www.chefkoch.de/rezepte/3228181480263577/Senf-Eier-Ragout.html) weicht die Claude-basierte Berechnung stark vom tatsächlichen Nährwert ab. Claude schätzt frei — ohne Zugriff auf eine echte Nährwertdatenbank.

## User Stories
- Als Nutzer möchte ich genaue Nährwerte für meine Rezepte, damit ich meinen Kalorienhaushalt realistisch tracken kann.
- Als Nutzer möchte ich Nährwerte pro Portion sehen, nicht nur gesamt.
- Als Nutzer möchte ich Nährwerte manuell korrigieren können, wenn die automatische Berechnung abweicht.
- Als Nutzer möchte ich beim Rezept-Import sehen, ob Nährwerte automatisch berechnet oder manuell eingetragen wurden.

## Acceptance Criteria
- [ ] Nährwerte werden über eine strukturierte Datenbank-API berechnet (z.B. OpenFoodFacts, USDA FoodData Central, Edamam, oder Nutritionix)
- [ ] Die Berechnung erfolgt zutat-basiert: jede Zutat wird einzeln gesucht und deren Nährwert per Menge berechnet
- [ ] Kalorien, Proteine, Kohlenhydrate und Fette werden korrekt summiert
- [ ] Abweichung von Referenzwerten (z.B. chefkoch.de) beträgt max. ±10%
- [ ] Nutzer kann Nährwerte manuell überschreiben
- [ ] Anzeige ob Werte "berechnet" oder "manuell" sind
- [ ] Bei unbekannten Zutaten wird ein Hinweis angezeigt und diese werden von der Berechnung ausgenommen

## Edge Cases
- Was passiert, wenn eine Zutat nicht in der Datenbank gefunden wird? → Hinweis, Zutat wird mit 0 oder manuell eingetragen
- Was passiert bei generischen Zutatsnamen (z.B. "Öl")? → Fuzzy-Matching oder Auswahlliste
- Was passiert bei Zutaten ohne Mengenangabe (z.B. "Salz nach Geschmack")? → Standardmenge 1g oder ignoriert
- Was passiert, wenn die Nährwert-API nicht verfügbar ist? → Fallback auf manuelle Eingabe
- Was passiert bei importierten Rezepten, die bereits Nährwerte enthalten? → Diese werden bevorzugt und nicht überschrieben

## Technical Requirements
- Integration einer Lebensmittel-Nährwertdatenbank (bevorzugt: OpenFoodFacts kostenlos, alternativ Edamam/Nutritionix)
- API-Calls pro Zutat mit Caching um API-Limits zu schonen
- Fallback-Logik bei nicht gefundenen Zutaten

---

## Tech Design (Solution Architect)

### Ansatz: 3-Schichten-Lookup

Jede Zutat wird nacheinander in drei Ebenen gesucht:

1. **Lokale Tabelle** (`lib/nutrition/local-ingredients.ts`) — ~50 häufige deutsche Grundzutaten (Mehl, Butter, Eier, Milch, Sahne, Zucker, Öl, Zwiebel, ...) mit geprüften USDA-Werten pro 100g. Kein API-Call, sofort, 100% zuverlässig.
2. **OpenFoodFacts API** — kostenlos, kein API-Key, gute deutsche Lebensmitteldatenbank. Fallback für alles außerhalb der lokalen Tabelle.
3. **Manuelle Eingabe** — wenn weder Tabelle noch API einen Match liefern, kann der Nutzer Werte selbst eingeben.

### Komponenten

```
app/api/nutrition/lookup/route.ts      (ersetzen)
└── Neue Logik: Lokale Tabelle → OpenFoodFacts → null

lib/nutrition/local-ingredients.ts     (neu)
└── ~50 Grundzutaten mit Nährwerten pro 100g

components/recipes/
├── nutrition-card.tsx                 (erweitern)
│   ├── + Quelle-Badge: "Berechnet" | "Manuell"
│   └── + Hinweis bei unbekannten Zutaten
└── nutrition-override-form.tsx        (neu)
    ├── Felder: Kalorien, Eiweiß, Fett, Kohlenhydrate
    └── Nur sichtbar wenn Nutzer "Manuell eingeben" klickt
```

### Datenmodell-Erweiterung

Zwei neue Felder in der `recipe_nutrition`-Tabelle:

| Feld | Typ | Inhalt |
|------|-----|--------|
| `nutrition_source` | text | `"calculated"` oder `"manual"` |
| `unknown_ingredients` | text[] | Zutaten die nicht gefunden wurden |

### Entscheidungen

| Entscheidung | Begründung |
|---|---|
| Lokale Tabelle zuerst | ~80% der Grundzutaten abgedeckt, keine API-Abhängigkeit |
| OpenFoodFacts | Kostenlos, kein Key, keine Rate Limits, DE-Datenbank |
| Kein Claude-Fallback | Schätzungen sind unzuverlässig — lieber "unbekannt" als falsch |
| Source-Badge | Transparenz für Nutzer (weiß woher die Werte kommen) |

### Keine neuen Abhängigkeiten

OpenFoodFacts ist eine einfache REST-API — kein npm-Paket nötig.

## Implementation Notes (Backend)

**Implementiert am 2026-04-02**

- `app/api/nutrition/lookup/route.ts` — Claude-Schätzung ersetzt durch 3-Layer-Lookup
- `lib/nutrition/local-ingredients.ts` — 55 deutsche Grundzutaten mit USDA-Werten
- `supabase/migrations/20260402000000_nutrition_source.sql` — `nutrition_source` + `unknown_ingredients` Felder hinzugefügt
- API-Response enthält jetzt zusätzlich `source: "local" | "openfoodfacts"` — für Frontend-Badge nutzbar
- Kein neues npm-Paket benötigt

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
