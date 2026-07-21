# Task 015: Flüssiger Slime-Charakter

## Status

`abgeschlossen`

## Ziel

Ein einfacher, charmanter Slime aus dem projektspezifischen Figuren-Mockup beweist, dass Weltfiguren in Idle, Bewegung, Sprung, Waffenaktion, Treffer und Sieg deutlich flüssiger und lebendiger animiert werden können als die bisherigen Testfiguren.

## Pflichtlektüre

- `AGENTS.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/04_VERTICAL_SLICE.md`
- `docs/06_ART_AND_TONE.md`
- `docs/ASSET_GENERATION.md`
- `docs/DECISIONS.md`

## Scope

- konkrete Slime-Vorlage aus `beispiele figuren/2.jpg` eng übernehmen,
- Imagegen-Keyposes auf entfernbarer Chroma-Fläche erzeugen,
- konsistentes transparentes Sprite-Sheet für mehrere Animationen aufbereiten,
- mindestens Idle, Laufen/Hüpfen, Sprung, Panzerfaust, Granate, Treffer und Sieg,
- höhere Bildrate, Squash-and-Stretch und saubere Bodenausrichtung,
- Slime als tatsächlich eingesetzte Matchfigur integrieren,
- Animationen und Assetherkunft dokumentieren.

## Nichtziele

- Austausch aller bisherigen Figuren,
- Skelettanimation oder allgemeines Runtime-Mesh-System,
- finale Produktionsqualität für die gesamte Figurenpalette.

## Akzeptanzkriterien

1. Der Slime ist klar als konkrete Vorlage aus dem Mockup wiedererkennbar.
2. Keine Fantasietitel, Logos oder Mockup-Texte werden übernommen.
3. Alle relevanten Matchzustände haben eine lesbare Animation oder Reaktionspose.
4. Bewegungen laufen sichtbar flüssiger als bei Moki und Vela, ohne Zittern oder wechselnden Fußpunkt.
5. Tests, Typprüfung, Build und Browserprüfung sind erfolgreich.

## Abschlussbericht

- GLIB rekonstruiert den grünen Slime aus `beispiele figuren/2.jpg` in `public/assets/characters/slime-fluid-sheet.png` ohne Mockup-Text oder Branding.
- Das transparente 8×4-Sheet enthält 32 Frames: je acht für Idle, Hüpfen und Sprung sowie eigene Panzerfaust-, Granaten-, Treffer- und Siegphasen.
- GLIB läuft mit 12–16 fps und zusätzlichen rein kosmetischen Squash-and-Stretch-Tweens; Fußpunkt, Simulation und Terrainkollision bleiben davon unberührt.
- Im Browser wurden Idle, erste lokale Bewegung und Aktionsübergang als aktive Startfigur geprüft; es traten keine Konsolenfehler auf.
- Typecheck, 47 Tests und Produktionsbuild sind erfolgreich.
