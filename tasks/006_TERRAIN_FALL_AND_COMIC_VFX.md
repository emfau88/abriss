# Task 006: Terrainfall und Comic-VFX

## Status

`abgeschlossen am 21. Juli 2026`

## Ziel

Terrainzerstörung erhält eine sichtbare taktische Folge für Figuren und der bestehende Raketenablauf bekommt ein kleines grafisches VFX-Paket.

## Pflichtlektüre

- `AGENTS.md`
- `docs/01_PRODUCT_VISION.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/04_VERTICAL_SLICE.md`
- `docs/06_ART_AND_TONE.md`
- `docs/DECISIONS.md`

## Scope

- rendererunabhängige Bestimmung, ob eine Figur noch getragen wird,
- Suche nach dem nächsten festen Terrainpunkt senkrecht unter der Figur,
- sichtbare Fallanimation bis zum neuen Boden,
- definierter Fall aus der Welt, wenn kein Boden mehr folgt,
- einfaches Comic-VFX-Atlas für Raketenabgas, Einschlag, Rauch und Terraintrümmer,
- Integration der Effekte ohne Einfluss auf Ballistik oder Schaden,
- Regressionstests für getragen, fallend und aus der Welt fallend.

## Nichtziele

- allgemeine Starrkörper- oder Ragdollphysik,
- horizontales Rutschen, Klettern oder Wegfindung,
- Fallschaden und Rückstoß-Balancing,
- finale Effektgrafik oder Audio.

## Akzeptanzkriterien

1. Entfernt eine Explosion den Boden unter einer Figur, bleibt sie nicht in der Luft stehen.
2. Die Figur landet auf dem nächsten festen Terrainpunkt derselben X-Position.
3. Ohne tieferes Terrain fällt die Figur aus der Welt und wird ausgeschaltet.
4. Die fachliche Landeposition ist unabhängig von Renderframes und Tween-Dauer.
5. Raketenflug und Explosion verwenden erkennbare grafische Effekte im bestehenden Comicstil.
6. Effekte verändern Simulation, Seed, Schaden und Terrainmutation nicht.

## Abnahmeprotokoll

- `resolveTerrainFall` liegt im Phaser-unabhängigen Simulationsmodul und unterscheidet getragen, fallend und aus der Welt fallend,
- Landepositionen werden direkt aus derselben veränderten Terrainmaske wie Ballistik und Kraterdarstellung bestimmt,
- die fachliche Position wird sofort gesetzt; Phaser animiert nur die Darstellung mit einer distanzabhängigen Fallzeit,
- der Browsertest entfernt 1761 Terrainzellen unter Rivale A, meldet den Fall und zeigt die Figur anschließend am Kraterboden statt in der Luft,
- das neue transparente 2×2-Atlas liefert Raketenabgas, Einschlagstern, Rauchwolke und Terraintrümmer in einfacher Comicoptik,
- der vollständige Imagegen-Prompt und die technische Freistellung sind in `docs/ASSET_GENERATION.md` dokumentiert,
- drei neue Falltests sowie insgesamt 24 Projekttests erfolgreich,
- Browserprüfung von Raketenabgas, Einschlag-VFX, Krater, Fall und Landung erfolgreich,
- Typprüfung, Tests und Produktionsbuild erfolgreich,
- Browserkonsole ohne Fehler oder Warnungen.
