# Task 019: Flüssiger Ghost-Charakter

## Status

`abgeschlossen`

## Ziel

Der konkrete helle Ghost aus `beispiele figuren/2.jpg` wird als hochwertiges,
flüssiges und jitterfreies 32-Frame-Sprite-Sheet umgesetzt und ersetzt Vela im
aktiven Vierer-Kader.

## Pflichtlektüre

- `AGENTS.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/04_VERTICAL_SLICE.md`
- `docs/06_ART_AND_TONE.md`
- `docs/ASSET_GENERATION.md`
- `docs/DECISIONS.md`

## Akzeptanzkriterien

1. Ghost ist als konkrete Vorlage klar wiedererkennbar und übernimmt kein Branding.
2. Bewegungszyklen besitzen mindestens acht Phasen und eine stabile Schwebeachse.
3. Alle relevanten Matchzustände besitzen eine Sequenz.
4. Ghost ist in Crewplanung und Match auswählbar.
5. Bestehende lokale Vela-Daten werden migriert.
6. Tests, Build und Browserprüfung sind erfolgreich.

## Abschlussbericht

Ghost liegt als transparentes 2048×1024-Sheet mit 32 Frames vor. Idle,
Gleiten, Ausweichen, Panzerfaust, Granate, Treffer und Sieg verwenden 8–16 fps;
eine rechnerische Kernstabilisierung und ein dezentes Hover-Tween verhindern
sichtbares Zittern. Der aktive Kader und beide Teams verwenden Ghost. Vela-
Auswahl und Waffenpräferenz werden beim Laden sicher migriert. Tests, Build und
Browserprüfung der animierten Crewkarte waren erfolgreich.
