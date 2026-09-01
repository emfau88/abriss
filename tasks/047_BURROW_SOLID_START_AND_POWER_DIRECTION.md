# Task 047: Burrow – fester Start und Machtrichtung

## Status

Technisch umgesetzt und geprüft. Nutzerfeedback vom 1. September 2026:
Der Feed–Grow-Loop ist
„tatsächlich gar nicht schlecht“; vorgegrabene Hohlräume sollen verschwinden.
Neue Futter-, Beute- und Mutationsideen werden zunächst professionell
konkretisiert, aber noch nicht als breiter Gameplay-Scope implementiert.

## Pflichtlektüre

- `AGENTS.md`, `docs/00_PROJECT_INDEX.md`, `docs/DECISIONS.md`
- `docs/burrow/VISION.md`, `docs/burrow/VERTICAL_SLICE.md`
- `docs/burrow/FEED_GROW_SLICE.md`, `docs/burrow/FEED_GROW_VALIDATION.md`
- Task 046 und aktueller Arena-, Terrain-, Bewegungs- und Scene-Code

## Umfang

1. Der aktuelle Feed–Grow-Run startet vollständig in festem Boden.
2. Historische Schreinhöhle und Führungstunnel bleiben nur für alte
   Regressionsvarianten verfügbar.
3. Tests belegen festen Start ohne permanente Terrainmutation.
4. Ein nicht bindender nächster Designvorschlag beschreibt USP, funktional
   verschiedene Nahrung/Beute und sichtbar mächtigere Mutationen.
5. Tests, Typprüfung, Build und Browserprüfung des neuen Starts.

## Nicht enthalten

- keine Implementierung neuer Mutationen, Futterklassen oder Gegner,
- kein Balancing-Umbau des vollständigen Runs,
- keine neuen finalen Assets oder Meta-Progression.

## Akzeptanz

- Am Start und entlang des früheren Führungstunnels ist der Feed–Grow-Boden
  fest; kein dunkler permanenter Hohlraum ist sichtbar.
- Die erste Bewegung funktioniert weiterhin und erzeugt nur Terrain-B-Spur.
- Historische Arenatests bleiben explizit ausführbar.
- Der Designvorschlag grenzt Burrow klar von Slither.io, Effing Worms und
  Death Worm ab und nennt ein kleines nächstes Validierungstor.

## Prüfergebnis

- 75 Burrow-Tests bestanden.
- Gesamtsuite: 203 Tests bestanden, zwei bestehende übersprungen.
- TypeScript-Typprüfung und Produktionsbuild bestanden.
- Browser: vollständig fester Start, danach ausschließlich helle temporäre
  B-Spur; erste Nahrung und Bewegung funktionieren, keine Browserwarnung.
- Der Designvorschlag ist bewusst noch keine Freigabe zur Implementierung.
