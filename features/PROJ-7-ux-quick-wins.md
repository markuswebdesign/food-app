# PROJ-7: UX Quick Wins (Passwort anzeigen + Mobile Sidebar Auto-Close)

## Status: In Progress
**Created:** 2026-04-01
**Last Updated:** 2026-04-01

## Dependencies
- Keine

## Beschreibung
Drei rein frontend-seitige UX-Verbesserungen:
1. **Passwort anzeigen:** Im Login- und Registrierungsformular kann das Passwort per Auge-Icon ein- und ausgeblendet werden.
2. **Passwort-Stärke:** Bei der Registrierung wird die Passwortstärke visuell angezeigt (Niedrig / Mittel / Sicher).
3. **Mobile Sidebar Auto-Close:** Auf Mobilgeräten schließt die Sidebar automatisch, wenn der Nutzer zu einer anderen Seite navigiert.

---

## Teil 1: Passwort anzeigen beim Login

### User Stories
- Als Nutzer möchte ich mein Passwort beim Eintippen sehen können, damit ich Tippfehler vermeiden kann.
- Als Nutzer möchte ich das Passwort wieder verbergen können, wenn jemand über meine Schulter schaut.

### Acceptance Criteria
- [ ] Im Login-Formular gibt es neben dem Passwortfeld ein Auge-Icon
- [ ] Klick auf das Icon wechselt den Feldtyp zwischen `password` und `text`
- [ ] Das Icon ändert sich visuell je nach Zustand (anzeigen / verbergen)
- [ ] Die Funktion ist sowohl auf Login als auch auf Registrierung verfügbar
- [ ] Funktioniert auf Desktop und Mobile

### Edge Cases
- Das Feld bleibt beim Umschalten gefüllt — kein Datenverlust
- Bei "Passwort vergessen"-Flow nicht relevant (kein Passwortfeld)

---

## Teil 2: Mobile Sidebar Auto-Close

### User Stories
- Als mobiler Nutzer möchte ich, dass die Sidebar nach dem Navigieren automatisch verschwindet, damit ich nicht jedes Mal manuell schließen muss.
- Als mobiler Nutzer möchte ich nach dem Tippen auf einen Menüpunkt sofort den neuen Seiteninhalt sehen.

### Acceptance Criteria
- [ ] Die Sidebar schließt sich automatisch, wenn auf einem mobilen Gerät (< 768px) ein Navigationslink geklickt wird
- [ ] Der Seiteninhalt wird danach vollständig und ohne überlagernde Sidebar angezeigt
- [ ] Auf Desktop (≥ 768px) bleibt die Sidebar dauerhaft sichtbar — kein Auto-Close
- [ ] Kein Flackern oder ungewolltes Öffnen der Sidebar beim Laden einer neuen Seite
- [ ] Funktioniert mit Next.js App Router (`usePathname`)

### Edge Cases
- Klick auf den aktuellen Seiten-Link → Sidebar schließt trotzdem
- Browser-Back/Forward-Navigation → Sidebar bleibt geschlossen
- Erstes Laden der Seite auf Mobile → Sidebar ist standardmäßig geschlossen

---

## Technical Requirements
- Rein frontend-seitige Änderungen, kein Backend benötigt
- Icon aus bestehender Icon-Bibliothek (z.B. Lucide: `Eye`, `EyeOff`)
- Nutzung von Next.js `usePathname` für Navigationserkennung

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
