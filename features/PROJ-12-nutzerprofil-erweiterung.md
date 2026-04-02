# PROJ-12: Nutzerprofil Erweiterung (Profilbild + Rezept-Autor)

## Status: Planned
**Created:** 2026-04-01
**Last Updated:** 2026-04-01

## Dependencies
- Authentifizierung (deployed)
- PROJ-1: Gesundheitsprofil (Deployed)
- Rezeptverwaltung (deployed)

## Beschreibung
Zwei zusammengehörige Erweiterungen rund um das Nutzerprofil:
1. **Profilbild:** Nutzer können ein Foto hochladen, das als Avatar in der Sidebar und auf der Profilseite angezeigt wird.
2. **Rezept-Autor:** Bei jedem Rezept wird angezeigt, welcher Nutzer es hinzugefügt hat — inklusive Avatar aus dem Profilbild.

---

## Teil 1: Profilbild hochladen

### User Stories
- Als Nutzer möchte ich ein Profilbild hochladen, damit ich die App persönlicher gestalten kann.
- Als Nutzer möchte ich mein Profilbild jederzeit ändern oder löschen können.
- Als Nutzer möchte ich, dass mein Profilbild im Menü/Avatar-Bereich angezeigt wird.

### Acceptance Criteria
- [ ] Auf der Profil-Seite gibt es einen Upload-Bereich für das Profilbild
- [ ] Unterstützte Formate: JPG, PNG, WebP (max. 5 MB)
- [ ] Das Bild wird nach dem Upload auf einheitliche Größe skaliert (z.B. 200x200px)
- [ ] Das Profilbild wird in der Sidebar/Navigation als Avatar angezeigt
- [ ] Ohne Profilbild wird ein Fallback-Avatar (Initialen oder Platzhalter-Icon) angezeigt
- [ ] Bild kann gelöscht werden → Fallback-Avatar wird wieder angezeigt
- [ ] Bild wird in Supabase Storage gespeichert

### Edge Cases
- Datei > 5 MB → Fehlermeldung vor dem Upload
- Nicht unterstütztes Format → klare Fehlermeldung
- Schlechte Verbindung während Upload → Fehler anzeigen, Retry möglich

---

## Teil 2: Rezept-Autor anzeigen

### User Stories
- Als Nutzer möchte ich bei jedem Rezept sehen, wer es hinzugefügt hat.
- Als Nutzer möchte ich meine eigenen Rezepte von denen anderer Nutzer unterscheiden können.
- Als Nutzer möchte ich die Rezeptliste nach "Meine Rezepte" filtern können.

### Acceptance Criteria
- [ ] Jedes Rezept zeigt den Namen des Erstellers an (Karte + Detailansicht)
- [ ] Profilbild des Autors (aus Teil 1) wird neben dem Namen angezeigt, wenn vorhanden
- [ ] Neue Rezepte werden beim Erstellen automatisch dem eingeloggten Nutzer zugeordnet
- [ ] Bestehende Rezepte ohne Autor-Zuordnung zeigen "Unbekannt"
- [ ] Rezeptliste ist nach "Meine Rezepte" / "Alle Rezepte" filterbar

### Edge Cases
- Rezepte vor Einführung der Funktion → `created_by` = NULL → "Unbekannt"
- Nutzer löscht seinen Account → Rezepte bleiben, Autor zeigt "Gelöschter Nutzer"
- Importierte Rezepte → Autor = Nutzer, der importiert hat

---

## Technical Requirements
- Supabase Storage für Bildspeicherung (Profilbilder)
- Bild-Komprimierung auf Client-Seite vor Upload
- `created_by` (user_id FK) Feld in Rezepte-Tabelle (DB-Migration)
- JOIN auf Profil-Tabelle für Anzeigename + Avatar-URL

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
