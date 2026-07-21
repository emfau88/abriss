# Task 007: Fullscreen-taugliche Weltgrafik

## Status

`abgeschlossen am 21. Juli 2026`

## Ziel

Hintergrund und zerstörbares Terrain bei großen Browserfenstern und naher Aktionskamera klar darstellen, ohne Weltmaßstab oder Terrainregeln zu verändern.

## Pflichtlektüre

- `AGENTS.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/06_ART_AND_TONE.md`
- `docs/DECISIONS.md`
- `docs/ASSET_GENERATION.md`

## Scope

- hochwertige Neuaufbereitung beider Kartenebenen,
- Arbeitsauflösung mindestens 3200×1800,
- unveränderte Trennung in Hintergrund und alpha-basiertes Vordergrundterrain,
- Terrain-Rendertextur in voller Weltauflösung,
- weiterhin maskenbasierte Kollision mit zwei Weltpixeln pro Zelle,
- partielle Updates der hochauflösenden Rendertextur,
- Fullscreen-Prüfung in Übersicht, Planung und Aktionszoom.

## Nichtziele

- neue Figurenassets,
- neue Kartenkomposition oder Biome,
- Änderung der Kollisionsauflösung,
- finale Produktionskarte.

## Akzeptanzkriterien

1. Beide Kartenebenen liegen mindestens in Weltauflösung vor.
2. Nahe Kameraansichten skalieren die Kartenebenen nicht mehr aus einer kleineren Quelle hoch.
3. Terrainmaske und sichtbare Terrainkante bleiben deckungsgleich.
4. Krater aktualisieren nur die betroffene Renderregion.
5. Fullscreen-Browserprüfung zeigt eine deutlich klarere Karte ohne sichtbare Alpha-Artefakte.

## Verifikation

- `npm run typecheck`
- `npm test`
- `npm run build`
- Browserprüfung bei Übersicht und Aktionszoom
- Browserprüfung eines Kraters und seiner Alpha-Kante

## Abnahmeprotokoll

- Hintergrund und Terrain wurden mit Built-in Imagegen unter Erhalt der bestehenden Komposition neu aufbereitet,
- beide ausgelieferten Kartenebenen liegen als 3200×1800-PNG vor,
- der Browser-Backbuffer wurde von 1280×720 auf 1600×900 erhöht; die fachlichen Screen-Space-Koordinaten bleiben 1280×720,
- die Terrain-Canvas rendert Quellfarbe und Alpha in voller 3200×1800-Auflösung, während die Kollisionsmaske unverändert 1600×900 Zellen verwendet,
- Masken-Dirty-Regions werden für Canvasupdates exakt auf Weltpixel erweitert und an Kartenrändern geklemmt,
- die Fullscreen-Browserprüfung zeigt scharfe Konturen in Übersicht und Planung sowie eine deckungsgleiche Kraterkante,
- die Full-HD-Terrain-Canvas benötigt 21,97 MiB; ein geprüftes 124×108-Pixel-Kraterupdate einschließlich Textur-Refresh benötigte rund 36,8 ms,
- der Textur-Refresh ist damit ein dokumentierter Optimierungspunkt vor mehreren gleichzeitigen Terrainereignissen,
- zwei neue Renderer-Helfertests sowie insgesamt 26 Projekttests erfolgreich,
- Typprüfung und Produktionsbuild erfolgreich,
- Browserkonsole ohne Anwendungsfehler oder Warnungen.
