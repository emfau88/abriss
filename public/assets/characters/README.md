# Figuren-Assets

## Laufzeit-Sheets

- `blue-hornling-sheet.png`: technischer 2×2-Platzhalter; kein Stilanker.
- `moki-mushroom-sheet.png`: 4×4-Testsheet zu je 256×256 Pixeln.
- `slime-fluid-sheet.png`: reduziertes 4×4-Sheet zu je 256×256 Pixeln.
- `ghost-fluid-sheet.png`: reduziertes 4×4-Sheet zu je 256×256 Pixeln.
- `raccoon-bandit-sheet.png`: 4×4-Testsheet mit klaren Idle-, Lauf-,
  Sprung- und Trefferframes zu je 256×256 Pixeln.

`vela-ghost-sheet.png` bleibt als historisches Testasset im Repository, wird
aber nicht mehr geladen. Alte Vela-Kaderdaten werden beim Laden zu Ghost
migriert.

## Aktuelle Qualitätsreferenzen

GLIB rekonstruiert den grünen Slime unten rechts aus `beispiele figuren/2.jpg`.
Ghost rekonstruiert den hellen Geist oben, zweite Figur von links, aus demselben
projektspezifischen Mockup. Fantasietitel, Logo und andere Figuren wurden nicht
übernommen.

Beide 1024×1024-Sheets folgen jetzt dem reduzierten Qualitätsstandard: vier
stabilisierte Idle-, Lauf-, Sprung- und Trefferframes, große Farbflächen und
eine kräftige marineblaue Kontur. Sie laufen mit 8–12 fps; zusätzliche
Schwebe-, Scale- oder Squash-Tweens gibt es nicht mehr. Waffen- und Siegesposen
verwenden bis zu einer späteren Erweiterung die Idle-Pose.

Moki bleibt ein brauchbares Vertical-Slice-Testasset. Das blaue Hornwesen ist
für die gewünschte Richtung zu niedlich und kitschig und wird nicht als
verbindliche Vorlage fortgeführt.

## Moki, Pop-Diva, Chicken und Waschbär

Moki rekonstruiert das kleine Pilzwesen aus `beispiele figuren/1.jpg`: große
rote Punktkappe, heller kompakter Körper und olivgrüner Rucksack. Wie die
anderen reduzierten Figuren nutzt er vier kontrollierte Frames je Zustand und
eine pixelgeprüfte, feste Idle-Fußlinie.

`pop-diva-sheet.png` und `chicken-sheet.png` sind kompakte 4×4-Testsheets
mit jeweils vier stabilisierten Idle-, Lauf-, Sprung- und Trefferframes zu
256×256 Pixeln. Die bewusst einfachen Silhouetten, klaren Farbflächen und
festen Fußlinien testen Lesbarkeit im normalen Schnellmatch-Kameraablauf.
Die Sheets enthalten absichtlich noch keine Waffen- oder Siegesposen.

`raccoon-bandit-sheet.png` erweitert dieselbe Lesbarkeitsreihe: Der helle
Maskenkopf und der kontrastreiche Ringelschwanz bleiben im Spiel auch bei
kleinem Kameramaßstab unterscheidbar. Alle drei Figuren sind im Kader wählbar.

## Generierung

Die transparenten Sheets wurden mit Built-in Imagegen auf einheitlichem
Magenta-Chroma-Key erzeugt, mit Soft-Matte und Despill freigestellt und lokal in
256×256-Zellen normalisiert. Der vollständige Prompt und die technische
Aufbereitung sind in `docs/ASSET_GENERATION.md` dokumentiert.
