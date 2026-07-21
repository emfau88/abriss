# Task 011: Spielersteuerung als Kernloop testen

## Status

`bereit`

## Ziel

In einem kleinen, reversiblen Gameplay-Experiment prüfen, ob direkte Kontrolle über Positionierung und Schuss beim Spielerteam mehr Spielspaß erzeugt, ohne Persönlichkeiten und die vorhandene Entscheidungslogik zu verlieren.

## Empfohlene Hypothese

Der Spieler steuert die aktive eigene Figur direkt: begrenztes Laufen, ein klar begrenzter Sprung sowie manuelles Einstellen von Winkel und Kraft. Gegner verwenden den bestehenden Planer. Für das Spielerteam wird derselbe Planer höchstens als optionaler Vorschlag verwendet und führt nicht automatisch den optimalen Schuss aus.

## Scope des Experiments

- Bewegungsbudget pro Zug,
- robuste Bewegung entlang der zerstörbaren Terrainoberfläche,
- begrenzter Sprung mit gültiger Landeposition,
- manuelles Zielen und Kraftwahl für die Rakete,
- vorhandene gemeinsame Ballistik für Vorschau und Ausführung,
- Zugabschluss nach Bewegung und Schuss,
- Gegner-KI verwendet Planung plus dieselben Bewegungsregeln,
- blockierte Ziele führen zu Positionierung oder alternativem Ziel statt Zugstillstand,
- optionaler, einklappbarer „Vorschlag“-Plan für das Spielerteam.

## Persönlichkeiten ohne Kontrollverlust

- sichtbare Vorlieben für Waffen und Risiko,
- unterschiedliche Bewegungs-/Sprungprofile innerhalb fairer Grenzen,
- Reaktionen, Kommentare und Rivalitäten,
- nachvollziehbare kleine Stärken und Schwächen,
- keine heimliche Änderung eines vom Spieler eingestellten Winkels,
- kein absichtliches Fehlzielen nur für einen Witz.

## Vergleichskriterium

Nach wenigen internen Matches wird bewertet:

1. Entstehen interessante Entscheidungen schon bei Position, Winkel und Kraft?
2. Fühlen sich Figuren trotz direkter Kontrolle unterschiedlich an?
3. Hilft der optionale Vorschlag, ohne die Lösung vorwegzunehmen?
4. Funktionieren blockierte Situationen ohne Leerlauf?
5. Ist das Match verständlicher und spannender als der autonome Slice?

## Nichtziele

- finale Steuerung für Touch und Gamepad,
- vollständiges Pathfinding,
- Seile, Teleporter oder komplexe Fortbewegungswerkzeuge,
- Manager-Metaebene,
- endgültige Balance.
