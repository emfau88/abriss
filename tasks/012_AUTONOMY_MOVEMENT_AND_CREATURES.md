# Task 012: Autonomie mit Bewegung, Wesen und Waffen fair testen

## Status

`abgeschlossen`

## Ziel

Den autonomen Kernloop als vollständigen 3-gegen-3-Test mit sichtbarer Positionierung, zwei animierten Wesen und drei unterscheidbaren Waffen spielbar machen, bevor über direkte Spielersteuerung entschieden wird.

## Warum jetzt

Der bisherige Test ließ Figuren weder laufen noch springen und bot kaum Aktionsvielfalt. Damit konnte die ursprüngliche Produkthypothese nicht fair beurteilt werden; vollständig blockierte Schüsse konnten außerdem zu leeren Zügen führen.

## Pflichtlektüre

- `AGENTS.md`
- `docs/02_GAME_DESIGN.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/04_VERTICAL_SLICE.md`
- `docs/06_ART_AND_TONE.md`
- `docs/DECISIONS.md`

## Voraussetzungen

- Task 008 bis 010 sind abgeschlossen.
- Die große Terrainmaske, gemeinsame Ballistik, Zugfolge und kompakte HUD sind funktionsfähig.

## Scope

- 3-gegen-3-Besetzung mit Moki als Pilzwesen und Vela als Geist,
- je ein stabilisiertes 4×4-Spritesheet für Ruhe, Lauf/Gleiten, Sprung und Aktion,
- rendererunabhängige lokale Bewegungsplanung mit maximal 190 horizontalen Weltpunkten pro Zug,
- Laufen auf zusammenhängendem Boden und kollisionsgeprüfte Sprungbögen,
- Persönlichkeitsgewichtung der Positionierung,
- Panzerfaust, Wurfgranate und Geländebrecher als datengetriebene Profile,
- gemeinsame Ballistik für Vorschau und Ausführung aller drei Profile,
- eigener Kameraframe für die lesbare Bewegungsphase,
- Geländebrecher oder reiner Positionierungszug als Ausweg bei blockierten Gegnern.

## Nichtziele

- direkte Spielersteuerung von Bewegung, Winkel oder Kraft,
- Granatenabpraller und zeitgezündete Granatenphysik,
- Rückstoß, horizontale Impulsphysik oder Ragdolls,
- allgemeines Pathfinding über die gesamte Karte,
- finale Figuren- oder Waffenbalance,
- neues Managerkommando zur direkten Waffenwahl.

## Akzeptanzkriterien

1. Das HUD und die Initiative zeigen drei lebende Figuren pro Team korrekt.
2. Moki und Vela erscheinen mit stabilen transparenten Frames und animieren ohne sichtbare Anker-Sprünge.
3. Ein Aktionsplan kündigt Position, Bewegungsart, Bewegungsbudget und Waffe an.
4. Figuren laufen oder springen vor dem Schuss entlang eines vorab geprüften Pfads.
5. Vorsichtige, sprengfreudige und angeberische Figuren bewerten Bewegung nachvollziehbar unterschiedlich.
6. Wurfgranate und Geländebrecher können neben der Panzerfaust autonom gewählt werden.
7. Ein vollständig blockierter Schuss führt zu Terrainöffnung oder Positionierung statt einer dauerhaften Überspringschleife.
8. Nach Bewegung und Waffeneinsatz wird der Zug vollständig aufgelöst und die Initiative fortgesetzt.

## Verifikation

- `npm run typecheck`
- `npm test -- --run`
- `npm run build`
- Browserprüfung von Lauf, Sprung, Wurfgranate, automatischem Gegnerzug und mehrfachem Zugwechsel
- visueller Check beider final aufbereiteten Spritesheets

## Abschlussbericht

- Moki und Vela wurden als eigenständige, weniger maskottchenhafte Testwesen integriert.
- Bewegung und Waffenwahl liegen im deterministischen Simulationsbereich; Phaser animiert nur die vorab bestimmten Samples.
- Im Browser wurden Nahaufnahme beim Laufen, ein Sprungplan, Mokis Wurfgranate, Velas automatische Aktion und fortlaufende Zugwechsel geprüft.
- Rückstoß bleibt bewusst offen und wird erst nach dem Autonomie-Spieltest als eigener Physik-Slice bewertet.
- Projektweite Richtungsentscheidung: `docs/DECISIONS.md`, D-020.
