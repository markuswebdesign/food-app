# PROJ-31: Thumbnail-Download zu Supabase Storage beim Import

## Status: Planned
**Created:** 2026-04-24
**Last Updated:** 2026-04-24

## Dependencies
- PROJ-30 (Instagram Import Fix) — für Instagram-Thumbnails
- Supabase Storage Bucket `recipe-images` muss existieren (bereits vorhanden)

## Hintergrund
Beim Import von TikTok- und Instagram-Rezepten wird aktuell nur die externe Bild-URL gespeichert. Diese URLs verfallen (TikTok CDN-Links laufen ab) oder sind abhängig von der Plattform. Bilder sollen stattdessen direkt zu Supabase Storage heruntergeladen und dort dauerhaft gespeichert werden.

## User Stories
- Als Nutzer möchte ich, dass beim TikTok-Import das Thumbnail automatisch heruntergeladen und gespeichert wird, damit das Bild dauerhaft verfügbar ist
- Als Nutzer möchte ich, dass beim Instagram-Import das Post-Bild heruntergeladen wird, damit es nicht nach einiger Zeit verschwindet
- Als Nutzer soll ich keinen Unterschied im Ablauf merken — der Download passiert im Hintergrund

## Acceptance Criteria
- [ ] Beim TikTok-Import: `thumbnail_url` aus dem oEmbed-Response wird zu Supabase Storage hochgeladen
- [ ] Beim Instagram-Import: extrahierte Bild-URL (via PROJ-30) wird zu Supabase Storage hochgeladen
- [ ] Das heruntergeladene Bild ersetzt die externe URL — `image_url` im Rezept zeigt auf Supabase Storage
- [ ] Dateiname: `imported/{recipeId}-thumbnail.{ext}` (oder UUID-basiert)
- [ ] Wenn der Thumbnail-Download fehlschlägt, wird der Import trotzdem abgeschlossen (externe URL als Fallback)
- [ ] Unterstützte Formate: JPEG, PNG, WebP
- [ ] Maximale Bildgröße: 10 MB (größere werden übersprungen, externe URL bleibt)

## Edge Cases
- CDN-URL nicht erreichbar → Import läuft durch, externe URL bleibt als Fallback
- Bild > 10 MB → wird übersprungen, kein Fehler für den Nutzer
- Supabase Storage nicht erreichbar → Import läuft durch, externe URL bleibt
- Unbekanntes Bildformat (z.B. AVIF) → wird übersprungen
- Gleicher Import zweimal → neues Bild überschreibt altes (UUID-basierter Name vermeidet Konflikte)
- Bild-URL ist bereits eine Supabase-URL (z.B. Reimport) → kein erneuter Download

## Technical Requirements
- Download über Node.js `fetch` + `arrayBuffer()` — kein extra npm-Paket nötig
- Upload via Supabase Storage Client (bereits im Projekt vorhanden)
- Bucket: `recipe-images` (public, bereits vorhanden)
- Pfad: `imported/{uuid}.jpg` (oder originale Dateiendung)
- Der Download läuft serverseitig innerhalb der bestehenden Import-API-Route

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
