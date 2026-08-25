# Burrow-Produktlabor: technische Grenzen

Stand: 25. August 2026

## Isolation

Burrow darf gemeinsame Abhängigkeiten und Buildwerkzeuge verwenden, importiert
aber keine Abriss-Szene, keinen Managerzustand und keine Artillery-Simulation.
Eine spätere gemeinsame Bibliothek entsteht nur nach nachgewiesener identischer
Anforderung. Frühe, kleine Duplikation ist besser als eine verfrühte
Generalisierung des stabilen Abriss-Codes.

```text
burrow.html
src/burrow/
├── main.ts
├── config.ts
├── simulation/
├── rendering/
├── input/
└── scenes/
public/burrow/
```

## Fachmodell

- Die Bewegung läuft in festen 60-Hz-Schritten.
- Kopfposition, Bewegungsrichtung, Modus und Körperpfad sind fachliche Daten.
- Körpersegmente werden nach zurückgelegter Distanz entlang einer Polyline
  abgetastet, nicht nach Renderframes.
- `carveCapsule()` tastet die gesamte Strecke zwischen zwei Kopfpositionen ab;
  die maximale Geschwindigkeit darf keine Terrainbrücken überspringen.
- Phaser liest Zustand und Eingabe, ist aber nicht die fachliche Wahrheit für
  Bewegung oder Terrainmutation.

## Terrain und Darstellung

Gate 1 verwendet eine eigene binäre Burrow-Maske mit vier Weltpixeln pro Zelle.
Die Darstellung besteht aus kleinen Canvas-Kacheln. Nur von einer Mutation
berührte Kacheln werden neu gezeichnet und zu Phaser hochgeladen. Der bestehende
Abriss-`TerrainMaskRenderer` bleibt unverändert.

Dies ist noch kein Streaming-System. Entfernte Kacheln werden in der kleinen
Arena nicht entladen. Eine Chunkwelt ist erst nach Gate 5 zulässig.

## Eingabe

- Desktop: WASD oder Pfeiltasten, Shift oder Leertaste für Burst.
- Touch: linker Richtungsbereich und große rechte Burst-Fläche.
- Gameplay bleibt mit zwei Daumen bedienbar.
- Eingabe wird vor dem Simulationsschritt in einen normalisierten Richtungsvektor
  und ein Burst-Signal übersetzt.

## Build

Vite baut `index.html` und `burrow.html` als getrennte HTML-Einstiege. Beide
verwenden relative Produktionspfade und werden gemeinsam über GitHub Pages
ausgeliefert. Der öffentliche Abriss-Link bleibt unverändert; Burrow ist nur
über den separaten README-Link erreichbar.
