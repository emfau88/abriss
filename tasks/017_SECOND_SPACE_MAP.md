# Task 017: Zweite Space-Resort-Karte

## Status

`abgeschlossen`

## Ziel

Eine zweite 3200×1800-Karte unterscheidet sich in Setting, Palette und Aufbau
klar von der sonnigen Inselwelt, behält aber die mehrstöckige
Artillery-Lesbarkeit mit fliegenden Inseln. Sie ist im Hauptmenü wählbar und
wird als explizite Matchkonfiguration übergeben.

## Pflichtlektüre

- `AGENTS.md`
- `docs/02_GAME_DESIGN.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/04_VERTICAL_SLICE.md`
- `docs/06_ART_AND_TONE.md`
- `docs/ASSET_GENERATION.md`
- `docs/DECISIONS.md`

## Akzeptanzkriterien

1. Beide Karten sind vom Hauptmenü aus eindeutig anwählbar.
2. Die Space-Karte besitzt lesbare Startflächen für sechs Figuren und eine
   andere Höhen-/Inselanordnung.
3. Hintergrund und Terrain sind auf 3200×1800 aufbereitet.
4. Terrainmaske, Zerstörung und Kamera verwenden dieselben Regeln.
5. Auswahl wird serialisiert und explizit ans Match übergeben.
6. Tests, Build und Browserprüfung sind erfolgreich.

## Abschlussbericht

Der Kartenkatalog übergibt die gewählte Welt über die `MatchLaunchConfig`. Das
Hauptmenü zeigt zwei Vorschaukarten und speichert die Auswahl im migrierbaren
Managerzustand. Der Space-Resort besitzt einen eigenen HD-Hintergrund,
transparentes HD-Terrain, andere Spawnpunkte und eine deutlich andere
Asteroiden-Silhouette. Tests, Typprüfung, Produktionsbuild und Browserprüfung
beider Menü-/Matchzustände waren erfolgreich.
