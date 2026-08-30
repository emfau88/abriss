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

Dies ist noch kein Streaming-System. Auch die für Gate 3 moderat auf
2.560×1.280 Weltpixel verbreiterte Testarena bleibt vollständig geladen;
entfernte Kacheln werden nicht entladen. Eine Chunkwelt ist erst nach Gate 5
zulässig.

## Terraingrundlage (Task 043 / D-061, D-062)

`recovering` ist der gewählte Standard; `persistent` bleibt explizit zum Vergleich.
`recovering` legt normale Grabbewegungen in
einem separaten 4-Pixel-Spurfeld mit Ablauf nach 600 festen 60-Hz-Schritten ab.
Erneute Bewegung erneuert die Frist; Stillstand nicht. Nur aktive Zellen werden
verwaltet, Änderungen und Ablauf melden lokale Kacheln. Ein Snapshot enthält
Tick, Zellkoordinaten und Fristen als JSON-Daten.

Die Spur verändert keine tragende Erde: echte Maske für Flugraum, Höhlen und
Stützen, Spur für schnelleres Gleiten und Darstellung. Nur Breach und Impact
ab 300 Weltpixel/s entfernen lokal Terrain. Burststart und unterirdische
Burststrecke stanzen keine Löcher; der Start bleibt ein Feedbackereignis.
Aufgefüllte Hauptmasken oder restaurierte Stützen gibt es nicht.
Oberflächenobjekte verwenden in beiden Varianten eine maskenbasierte
Bodenabfrage; zu hohe Stufen stoppen die Bewegung. Fehlt Boden unter dem Objekt,
sinkt es in festen Schritten zum nächsten Boden, ohne allgemeine Physik.

## Strukturen

Gate 3 modelliert genau eine kleine Stützenhütte als rendererfreie Daten:
Stützen besitzen je einen Terrainanker und einen aktiven/inaktiven Zustand.
Nach jeder festen Bewegungsauflösung prüft die Struktur dieselbe Burrow-Maske
wie das Graben. Zwei verlorene von drei Stützen erzeugen einmalig das
Kollapsereignis. Phaser zeichnet diese Daten als Warnung, kippende Hütte und
Staub; es simuliert keine Gebäudeteile oder Starrkörper.

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
