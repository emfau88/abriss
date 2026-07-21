# Figuren-Assets

## Laufzeit-Sheets

- `blue-hornling-sheet.png`: technischer 2×2-Platzhalter; kein Stilanker.
- `moki-mushroom-sheet.png`: 4×4-Testsheet zu je 256×256 Pixeln.
- `slime-fluid-sheet.png`: 8×4-Sheet mit 32 Frames zu je 256×256 Pixeln.
- `ghost-fluid-sheet.png`: 8×4-Sheet mit 32 Frames zu je 256×256 Pixeln.

`vela-ghost-sheet.png` bleibt als historisches Testasset im Repository, wird
aber nicht mehr geladen. Alte Vela-Kaderdaten werden beim Laden zu Ghost
migriert.

## Aktuelle Qualitätsreferenzen

GLIB rekonstruiert den grünen Slime unten rechts aus `beispiele figuren/2.jpg`.
Ghost rekonstruiert den hellen Geist oben, zweite Figur von links, aus demselben
projektspezifischen Mockup. Fantasietitel, Logo und andere Figuren wurden nicht
übernommen.

Beide 2048×1024-Sheets enthalten achtphasige Ruhe-, Bewegungs- und
Sprungzyklen sowie Panzerfaust-, Granaten-, Treffer- und Jubelbilder. Sie laufen
im Spiel mit 8–16 fps. Ghost verwendet zusätzlich eine stabilisierte
Schwebeachse und ein sehr kleines kosmetisches Hover-Tween; Bewegung, Kollision
und Physik bleiben rendererunabhängig.

Moki bleibt ein brauchbares Vertical-Slice-Testasset. Das blaue Hornwesen ist
für die gewünschte Richtung zu niedlich und kitschig und wird nicht als
verbindliche Vorlage fortgeführt.

## Generierung

Die transparenten Sheets wurden mit Built-in Imagegen auf einheitlichem
Magenta-Chroma-Key erzeugt, mit Soft-Matte und Despill freigestellt und lokal in
256×256-Zellen normalisiert. Der vollständige Prompt und die technische
Aufbereitung sind in `docs/ASSET_GENERATION.md` dokumentiert.
