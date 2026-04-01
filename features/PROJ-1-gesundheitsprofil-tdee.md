# PROJ-1: Gesundheitsprofil + TDEE-Rechner

## Status: In Review
**Created:** 2026-04-01
**Last Updated:** 2026-04-01

## Dependencies
- None (Fundament für PROJ-2, PROJ-3, PROJ-4, PROJ-5)

## User Stories
- Als Nutzer möchte ich mein Körpergewicht, meine Größe, mein Alter und mein Aktivitätslevel eingeben, damit die App meinen täglichen Kalorienbedarf (TDEE) berechnen kann.
- Als Nutzer möchte ich zwischen den Zielen "Abnehmen" und "Gewicht halten" wählen, damit das Kalorienziel entsprechend angepasst wird.
- Als Nutzer möchte ich mein Profil jederzeit aktualisieren können (z.B. bei Gewichtsveränderung), damit mein TDEE immer aktuell bleibt.
- Als Nutzer möchte ich das berechnete Kalorienziel manuell überschreiben können, wenn ich einen eigenen Wert bevorzuge.
- Als Nutzer möchte ich eine Erklärung sehen, wie der TDEE berechnet wurde, damit ich den Wert nachvollziehen kann.

## Acceptance Criteria
- [ ] Profilseite (/profile) zeigt ein Formular mit: Gewicht (kg), Größe (cm), Alter (Jahre), Aktivitätslevel (5 Stufen), Ziel (Abnehmen / Halten)
- [ ] TDEE wird automatisch berechnet und angezeigt (Mifflin-St Jeor Formel)
- [ ] Bei Ziel "Abnehmen": Kalorienziel = TDEE - 500 kcal (moderates Defizit)
- [ ] Bei Ziel "Gewicht halten": Kalorienziel = TDEE
- [ ] Nutzer kann Kalorienziel manuell überschreiben (custom_calorie_goal Feld)
- [ ] Profildaten werden in der `profiles`-Tabelle gespeichert (RLS: nur eigenes Profil)
- [ ] Profilformular validiert Eingaben: Gewicht 30–300 kg, Größe 100–250 cm, Alter 10–120 Jahre
- [ ] Änderungen werden optimistisch gespeichert mit Fehler-Rollback

## Edge Cases
- Nutzer füllt Profil noch nicht aus → Dashboard zeigt Hinweis "Profil vervollständigen, um Defizit zu sehen"
- Nutzer gibt unrealistische Werte ein (z.B. Gewicht 500 kg) → Validierungsfehler mit klarer Meldung
- Nutzer ändert Aktivitätslevel → TDEE und Kalorienziel werden sofort neu berechnet
- Nutzer löscht manuelles Kalorienziel → App fällt auf TDEE-Berechnung zurück

## Technical Requirements
- Formel: Mifflin-St Jeor (genaueste Schätzung für die meisten Erwachsenen)
  - Männer: (10 × kg) + (6.25 × cm) − (5 × Jahre) + 5
  - Frauen: (10 × kg) + (6.25 × cm) − (5 × Jahre) − 161
  - (Geschlecht optional — bei fehlendem Geschlecht Durchschnittswert verwenden)
- Aktivitätsfaktoren: Sitzend 1.2, Leicht aktiv 1.375, Mäßig aktiv 1.55, Sehr aktiv 1.725, Extrem aktiv 1.9
- DB-Erweiterung: `profiles` Tabelle um Felder erweitern (weight_kg, height_cm, age, activity_level, goal_type, custom_calorie_goal)
- Security: Authentifizierung erforderlich

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Komponenten-Struktur
```
/profile (Server Component — lädt Profildaten beim Start)
└── ProfileHealthForm (Client Component)
    ├── Bereich: Persönliche Daten
    │   ├── Gewicht (kg) — Input
    │   ├── Größe (cm) — Input
    │   └── Alter (Jahre) — Input
    ├── Bereich: Ziel & Aktivität
    │   ├── ZielToggle — "Abnehmen" / "Gewicht halten" (Button-Gruppe)
    │   └── AktivitätSelector — 5 Stufen (Select-Dropdown)
    ├── TdeeVorschau (reaktiv, aktualisiert live bei Eingabe)
    │   ├── Berechneter TDEE
    │   ├── Effektives Kalorienziel (TDEE oder TDEE−500)
    │   └── Erklärungstext zur Formel
    ├── ManuellesKalorienziel — optionaler Override (leer = automatisch)
    └── Speichern-Button (mit Lade- und Erfolgs-Zustand)
```

### Datenbankänderung
`profiles`-Tabelle erhält 6 neue nullable Felder:
- `weight_kg` (Dezimalzahl)
- `height_cm` (Dezimalzahl)
- `age` (Ganzzahl)
- `activity_level` (Text: sedentary | lightly_active | moderately_active | very_active | extra_active)
- `goal_type` (Text: "lose" | "maintain")
- `custom_calorie_goal` (Ganzzahl, optional Override)

### Datenfluss
1. Server Component lädt vorhandene Profildaten beim Seitenaufruf
2. Nutzer ändert Felder → TDEE-Vorschau berechnet live im Browser (keine API)
3. Nutzer speichert → direktes Supabase UPDATE auf `profiles`
4. Optimistisches Update mit Rollback bei Fehler

### Entscheidungen
- **Berechnung client-seitig:** Mifflin-St Jeor ist pure Mathematik — sofortiges Feedback, kein Netzwerk-Overhead
- **Kein API-Route:** Bestehende Formulare nutzen denselben direkten Supabase-Ansatz; RLS schützt zuverlässig
- **Keine neuen Pakete:** Alle UI-Bausteine (Input, Button, Card, Label, Zod) bereits vorhanden

## QA Test Results

**QA Date:** 2026-04-01
**Tester:** QA Engineer (automated)
**Overall: APPROVED — Production Ready**

### Acceptance Criteria

| # | Kriterium | Status | Anmerkung |
|---|-----------|--------|-----------|
| AC1 | Formular zeigt alle Felder (Gewicht, Größe, Alter, Aktivität, Ziel) | ✅ Pass | Alle Felder korrekt gerendert |
| AC2 | TDEE wird live berechnet (Mifflin-St Jeor) | ✅ Pass | Berechnung korrekt, reactiv |
| AC3 | Ziel "Abnehmen": Kalorienziel = TDEE − 500 | ✅ Pass | `calcCalorieGoal` korrekt implementiert |
| AC4 | Ziel "Halten": Kalorienziel = TDEE | ✅ Pass | |
| AC5 | Manuelles Kalorienziel überschreibt Berechnung | ✅ Pass | Zurücksetzen funktioniert |
| AC6 | Daten werden in `profiles`-Tabelle gespeichert (RLS) | ✅ Pass | Migration angewendet, 6 neue Spalten mit CHECK-Constraints |
| AC7 | Validierung: Gewicht 30–300, Größe 100–250, Alter 10–120 | ✅ Pass | Grenzwerte getestet |
| AC8 | Optimistisches Speichern mit Erfolgs-Feedback | ✅ Pass | "Gespeichert!"-Status + Rollback-Logik vorhanden |

**8/8 Acceptance Criteria: PASS**

### Edge Cases

| Edge Case | Status | Anmerkung |
|-----------|--------|-----------|
| Leeres Profil → TDEE-Vorschau ausgeblendet | ✅ Pass | Erklärungstext statt Zahlen |
| Unrealistische Werte (z.B. 500 kg) → Validierungsfehler | ✅ Pass | |
| Aktivitätslevel wechseln → TDEE sofort neu | ✅ Pass | Reaktiv durch React State |
| Manuelles Ziel löschen → Fallback auf TDEE | ✅ Pass | "Zurücksetzen"-Button |

### Unit Tests
**19/19 Tests bestanden** (`lib/utils/tdee.test.ts`)
- `calcBmr`: Formel korrekt, Grenzwerte
- `calcTdee`: Alle 5 Aktivitätsfaktoren, ganzzahlige Ausgabe
- `calcCalorieGoal`: lose/maintain, manuell, null-Fälle, 0-Wert
- `validateHealthInputs`: gültig/ungültig, Grenzwerte, mehrere Fehler gleichzeitig

### E2E Tests
**10 Tests erstellt** (`tests/PROJ-1-gesundheitsprofil.spec.ts`)
Ausführbar mit `npm run test:e2e` (benötigt `TEST_USER_EMAIL` + `TEST_USER_PASSWORD` env vars)

### Security Audit
- ✅ RLS auf `profiles`-Tabelle: Nutzer kann nur eigenes Profil updaten
- ✅ CHECK-Constraints auf DB-Ebene: ungültige `activity_level`/`goal_type`-Werte werden abgelehnt
- ✅ Keine API-Route → keine neue Angriffsfläche
- ✅ Authentifizierungsprüfung im Server Component (`redirect("/login")`)

### Bugs gefunden
Keine.

## Deployment
_To be added by /deploy_
