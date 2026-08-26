# Task 040: Burrow – Mobile Vollbild und direkte Steuerung

## Status

`abgeschlossen`

## Ziel

Die bestehende Burrow-Testarena nutzt auf mobilen Querformatgeräten die volle
Fläche ohne seitliche Letterbox, bietet einen echten Vollbildzugang und reagiert
spürbar direkter auf Touch- und Tastaturkurs.

## Pflichtlektüre

- `AGENTS.md`
- `docs/burrow/VISION.md`
- `docs/burrow/VERTICAL_SLICE.md`
- `docs/burrow/TECHNICAL_PLAN.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/DECISIONS.md`
- `tasks/039_BURROW_GATE_3_STRUCTURE.md`

## Scope

- responsive Burrow-Canvas statt mobilem Seitenrand-Fit,
- kompakte, an Viewportbreite und -höhe angepasste HUD-/Touchpositionen,
- sichtbarer Vollbildbutton auf Touchgeräten bei unterstützter API,
- schnellerer Richtungswechsel, kürzere Beschleunigung und kleinere
  Touch-Deadzone,
- Fachtest für die schärfere Kursreaktion sowie Browserprüfung.

## Nichtziele

- keine neuen Fähigkeiten, Gegner, Assets oder Content-Gates,
- kein Zwangsvollbild und keine Browserrechte,
- keine Änderung an Abriss, Terrainfachmodell oder fester Simulation.

## Akzeptanzkriterien

1. Ein 844×390-Mobilviewport zeigt keine seitlichen Canvasränder.
2. Bei verfügbarer Fullscreen-API ist der Button außerhalb und innerhalb des
   Vollbilds erreichbar.
3. HUD, Richtung und Burst bleiben im mobilen Querformat vollständig bedienbar.
4. Eine starke Kursänderung reagiert innerhalb kurzer fester Schritte deutlich
   direkter als zuvor.
5. Tests, Typecheck, Build und Abriss-Isolation bleiben grün.
