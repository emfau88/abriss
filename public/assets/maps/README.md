# Fullscreen-Karten

## Sonneninseln

- `sunny-sky-background-hd.png`: 3200×1800-Hintergrund
- `good-mood-terrain-hd.png`: 3200×1800-Terrain mit Alpha

Eine massive untere Landform und zwei schwebende Inseln bilden die freundliche
Gute-Laune-Welt.

## Orbitaler Urlaub

- `space-resort-background-hd.png`: 3200×1800-Weltraumhintergrund
- `space-resort-terrain-hd.png`: 3200×1800-Asteroidenterrain mit Alpha

Die zweite Karte verwendet drei fliegende Asteroideninseln, zwei deutlich
getrennte Bodenniveaus, eine große Senke und kleine Urlaubswitze. Silhouette,
Palette, Startflächen und Höhenrhythmus unterscheiden sich von den
Sonneninseln.

Die Alphaform jedes Vordergrundbilds wird zur Laufzeit auf die
1600×900-Zellen-Terrainmaske abgetastet. Darstellung, Ballistik und Zerstörung
verwenden dadurch dieselbe Form, während die sichtbare Textur in voller
Weltauflösung scharf bleibt. Beide Karten wurden mit Built-in Imagegen erzeugt;
die vollständigen Prompts stehen in `docs/ASSET_GENERATION.md`.
