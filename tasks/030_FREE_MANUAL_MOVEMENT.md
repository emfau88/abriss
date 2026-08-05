# Task 030: Freie manuelle Positionswahl

## Status

`abgeschlossen`

## Ziel

Im Steuerungsmodus `manual` wählt der Spieler innerhalb des bestehenden
Bewegungsbudgets einen beliebigen erreichbaren Bodenpunkt, statt auf wenige
vom KI-Planer vorgegebene Marker beschränkt zu sein.

## Warum jetzt

Der Vergleich zwischen Autobattle und Selbststeuern wäre verzerrt, solange
die direkte Variante nur ungefähr drei vorberechnete Positionen anbietet.
Vor dem geplanten Kernloop-Test benötigt Task 011 deshalb eine faire, aber
weiterhin kleine und terrain-sichere Positionssteuerung.

## Pflichtlektüre

- `AGENTS.md`
- `docs/01_PRODUCT_VISION.md`
- `docs/02_GAME_DESIGN.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/04_VERTICAL_SLICE.md`
- `docs/DECISIONS.md`
- `tasks/011_PLAYER_CONTROL_EXPERIMENT.md`

## Voraussetzungen

- Task 011 stellt manuelle Bewegungs- und Zielphasen bereit.
- `LocalMovementPlanner` besitzt die verbindlichen Lauf-, Sprung-,
  Freiraum- und Reichweitenregeln.
- Die vorhandene Match-Engine bleibt Autorität über Figurenpositionen.

## Scope

- freie Maus-/Touch-Auswahl eines erreichbaren Bodenpunkts innerhalb von
  190 horizontalen Weltpunkten,
- Live-Vorschau des gültigen Lauf- oder Sprungpfads,
- Auswahl der zum Zeiger passenden begehbaren Oberfläche,
- bestehende Lauf-/Sprunganimation und anschließende manuelle Zielphase,
- reine TypeScript-Validierung für Reichweite, Terrain, Kopffreiheit und
  Abstand zu anderen Figuren,
- Aktualisierung von Hilfe, Taskstatus und Entscheidungsprotokoll.

## Nichtziele

- keine Echtzeit-Plattformersteuerung oder neue Starrkörperphysik,
- kein freies Klettern, Seil, Jetpack oder universelles Pathfinding,
- keine Änderung der KI-Bewegung oder des 190-Punkte-Budgets,
- keine semantische Planfamilie oder Balanceänderung in diesem Task,
- kein endgültiger Produktentscheid zwischen Auto und Direct.

## Akzeptanzkriterien

1. Im manuellen Bewegungsabschnitt erscheinen keine drei festen Zielmarker
   mehr; ein frei gewählter erreichbarer Bodenpunkt kann angeklickt oder
   angetippt werden.
2. Der Zeiger zeigt vor der Auswahl einen gültigen Lauf- oder Sprungpfad und
   dessen Zielposition.
3. Ziele außerhalb der Reichweite, ohne Freiraum, auf anderen Figuren oder
   ohne gültigen Pfad werden nicht angewendet.
4. Die ausgewählte Bewegung wird erst über die Simulationsfunktion fachlich
   übernommen und danach aus denselben Pfadsamples animiert.
5. Maus und Touch funktionieren; `HIER BLEIBEN` bleibt verfügbar.
6. Relevante Tests, Typprüfung, Produktionsbuild und Browserprüfung bestehen.

## Verifikation

- `npm test -- src/simulation/match/manualMovement.test.ts`
- `npm run typecheck`
- `npm test`
- `npm run build`
- Browser: manuelle Bewegung auf beiden Karten, Lauf, Sprung, ungültiges Ziel,
  `HIER BLEIBEN` sowie Übergang zum Zielen prüfen.

## Abschlussbericht

Abgeschlossen am 5. August 2026.

- Die vorberechneten Weltmarker wurden durch freie Maus-/Touch-Auswahl ersetzt.
- `planLocalMovementTo` bestimmt zur Zeigerposition die passende Oberfläche
  und akzeptiert sie nur bei gültiger Reichweite, Kopffreiheit, Figurenabstand
  und kollisionsfreiem Lauf- oder Sprungpfad.
- Die Szene zeigt den exakten Simulationspfad live: Türkis für Laufen, Gelb
  für Springen und Rot für ein ungültiges Ziel. Derselbe Pfad wird nach der
  Auswahl zuerst auf den Simulationszustand angewendet und danach animiert.
- `HIER BLEIBEN` und der anschließende manuelle Zielmodus bleiben erhalten.
- Browserprüfung: auf Sonneninseln freie Laufwahl, ungültiges Ziel und Wechsel
  ins Zielen geprüft; auf beiden Karten die markerlose Auswahlphase geprüft.
  DIVAs Startpunkte besitzen innerhalb des 190-Punkte-Budgets keinen sinnvoll
  erreichbaren Sprungabsatz. Der Sprungfall ist deshalb zusätzlich auf einer
  realen, veränderbaren Test-Terrainmaske vollständig geprüft.

Prüfungen: `npm run typecheck`, `npm test` (117 bestanden, 2 übersprungen),
`npm run build` und Headless-Browser ohne Konsolen-/Laufzeitfehler. Der Build
meldet weiterhin nur die bekannte Phaser-Chunkgrößenwarnung.

Verbindliche Entscheidung: `docs/DECISIONS.md`, D-046.
