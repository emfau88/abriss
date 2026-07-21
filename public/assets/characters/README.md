# Figuren-Styleframe

`blue-hornling-sheet.png` ist ein durch Built-in Imagegen erzeugter und lokal freigestellter technischer Platzhalter. Er ist kein endgültiger Hauptcharakter und ausdrücklich kein verbindlicher Stilanker.

## Bewertung

Die vier Posen und die technische Freistellung sind brauchbar. Das Design ist für die gewünschte Figurenrichtung jedoch zu niedlich und kitschig. Künftige Wesen sollen eigenwilliger, etwas asymmetrischer, weniger glatt und farblich weniger maskottchenhaft werden, ohne in Grimdark oder realistische Gewaltästhetik zu kippen.

## Aufbau

- Bildgröße: 1254×1254 Pixel
- Raster: 2 Spalten × 2 Zeilen
- Framegröße: 627×627 Pixel
- Frames: bereit, planen, Aktion, erschrocken/getroffen

Weitere Wesen sollen dieselbe ungefähre Bildschirmgröße und funktionale Ankerpunkte verwenden, sich in Silhouette, Körperbau und Bewegung aber klar unterscheiden.

## Animierte Testwesen

- `moki-mushroom-sheet.png`: 1024×1024 Pixel, 4×4 Frames zu je 256×256 Pixeln; Zeilen für Ruhe, Laufen, Sprung und Aktion.
- `vela-ghost-sheet.png`: 1024×1024 Pixel, 4×4 Frames zu je 256×256 Pixeln; Zeilen für Ruhe, Gleiten, Sprung/Schweben und Aktion.
- `slime-fluid-sheet.png`: 2048×1024 Pixel, 8×4 Frames zu je 256×256 Pixeln; achtphasige Ruhe-, Hüpf- und Sprungzyklen sowie Panzerfaust-, Granaten-, Treffer- und Jubelbilder.

Beide Sheets wurden mit Built-in Imagegen als eigenständige Designs aus den lokalen Moodboards abgeleitet, per Magenta-Chroma-Key freigestellt und anschließend pro Frame auf eine gemeinsame Fuß-/Schwebeachse stabilisiert. Moki und Vela sind hochwertige Vertical-Slice-Testassets, aber keine zugesagte finale Produktionsqualität.

Der Slime rekonstruiert dagegen bewusst die konkrete projektspezifische Vorlage unten rechts aus `beispiele figuren/2.jpg`. Seine 32 Bilder laufen mit 8–16 fps und werden im Spiel durch rein kosmetisches Squash-and-Stretch ergänzt. Damit ist er der aktuelle Qualitätsbeweis für flüssigere Figurenanimation; die Physik bleibt unverändert rendererunabhängig.

## Generierung

- Modus: Built-in Imagegen
- Anwendungsfall: `stylized-concept`
- Freistellung: grüner Chroma-Key, danach Soft-Matte und Despill
- Kernausrichtung: ein kompaktes blaues Hornwesen mit cremefarbenem Bauch, Flossenohren und gelbem Schal; vier konsistente Posen; gezeichnete Comic-Kontur, einfache Cel-Schattierung und moderate Textur; ausdrücklich keine Berufsuniform, Baustellenausrüstung, Papercut-Optik oder bestehende Franchise-Figur.

Der vollständige verwendete Prompt ist in `docs/ASSET_GENERATION.md` dokumentiert.
