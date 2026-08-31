# Task 046: Burrow – Sammeln, Jagen, Wachsen

## Status

Technisch umgesetzt und einschließlich vollständigem Browserlauf geprüft.
Nutzerfreigabe am 31. August 2026:
„so bauen“ (D-068). Persönliche Produktabnahme und echter Smartphone-Test
stehen aus; Prüfstand: `docs/burrow/FEED_GROW_VALIDATION.md`.

## Pflichtlektüre

- `AGENTS.md`, `docs/00_PROJECT_INDEX.md`, `docs/DECISIONS.md`
- `docs/burrow/VISION.md`, `docs/burrow/VERTICAL_SLICE.md`
- `docs/burrow/TECHNICAL_PLAN.md`, `docs/burrow/FEED_GROW_SLICE.md`
- `src/burrow/` einschließlich Bewegungs-, Terrain-, Jagd- und Run-Tests

## Auftrag und Plan

1. Den abgelösten Schrein-/Drei-Level-Plan kennzeichnen; B und Isolation bewahren.
2. Nahrung und zwei Größenklassen deterministischer Wurmbeute implementieren.
3. Biomasse unmittelbar in Körperlänge, Machtstufen und Bewegungswerte übersetzen.
4. Eine pausierte Wahl aus drei Mutationen ohne Pflichtschrein integrieren.
5. Untergrund zuerst zeigen, Oberfläche frei erreichbar lassen; nach Wachstum
   und großer Beute eine Ein-Kontakt-Schlusskutsche und echten Abschluss anbieten.
6. Fachtests, Typecheck, gesamte Testsuite, Build und Browserprüfung durchführen.

## Akzeptanz

- Nahrung ist am Start sichtbar und bei normalem Grabtempo fressbar.
- Jede Nahrung und Beute vergibt ihren Wert genau einmal, nur am Kopf.
- Laufendes Wachstum beginnt deutlich vor einem Levelabschluss.
- Größere Beute ist erst als Jäger mit Burst, als Gräber auch normal fressbar.
- Alle drei Mutationen haben nachweisbare, begrenzte Gameplaywirkung.
- Auswahl und Ergebnis pausieren sämtliche Gameplayzustände und verbrauchen
  keine gepufferten Eingaben nach dem Schließen.
- Kein Countdown, Hunger, HP, Multiplayer, Körperduell oder Meta-Fortschritt.
- Neustart stellt den gesamten Ausgangszustand wieder her.
- Normale B-Bewegung und Burststart verändern weiterhin keine permanente Erde.
- Desktop und Zwei-Daumen-Steuerung funktionieren; HUD lässt den Jagdraum frei.

Persönlicher Wiederholungswunsch, Drei-bis-fünf-Minuten-Zieldauer und echter
Smartphone-Test sind Produktabnahme, keine durch Smoke-Tests bewiesenen Fakten.
