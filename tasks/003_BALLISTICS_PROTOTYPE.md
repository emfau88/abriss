# Task 003: Gemeinsame Ballistik

## Status

`abgeschlossen am 21. Juli 2026`

## Ziel

Eine deterministische Raketenballistik implementieren, deren Vorschau, KI-Auswertung und sichtbare Ausführung dieselbe Simulationsfunktion verwenden.

## Warum jetzt

Die Übereinstimmung von angekündigtem und tatsächlichem Ergebnis ist Voraussetzung für Vertrauen in autonome Figuren.

## Pflichtlektüre

- `AGENTS.md`
- `docs/02_GAME_DESIGN.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/04_VERTICAL_SLICE.md`

## Voraussetzungen

- Task 002 ist abgenommen.

## Scope

- reine, rendererunabhängige Trajektorienberechnung,
- feste Simulationsschritte,
- Gravitation und definierte Startgeschwindigkeit,
- Terrainkontakt über die gemeinsame Maske,
- Trajektorienresultat mit Kontakt- und Explosionsdaten,
- sichtbare Debugvorschau,
- ausgeführtes Projektil entlang derselben fachlichen Abtastung,
- kreisförmige Explosion über Task 002,
- Seed- und Szenariotests.

## Nichtziele

- Wurfgranate,
- Schaden an Figuren,
- KI-Zielauswahl,
- Wind oder komplexe Streuung,
- Partikel- und Audio-Politur.

## Akzeptanzkriterien

1. Gleiche Eingaben erzeugen dieselbe Trajektorie und denselben Kontaktpunkt.
2. Vorschau und Ausführung treffen im definierten Toleranzbereich denselben Ort.
3. Das Projektil kollidiert mit aktuellem, auch nach Explosionen verändertem Terrain.
4. Ein Treffer erzeugt einen sichtbaren und fachlich korrekten Krater.
5. Kartenränder und eine Trajektorie ohne Treffer werden sicher behandelt.
6. Tests benötigen keinen Phaser- oder Browserkontext.

## Verifikation

- `npm run typecheck`
- `npm test`
- `npm run build`
- Browserprüfung mehrerer Winkel, Kartenränder und bereits zerstörter Bereiche

## Abnahmeprotokoll

- reine Ballistikfunktion ohne Phaser- oder Browserabhängigkeit implementiert,
- feste Schritte von 1/60 Sekunde und zellengenaue Segmentprüfung gegen die aktuelle Terrainmaske,
- Vorschau, KI-Auswertung und Projektilwiedergabe verwenden dasselbe unveränderliche Trajektorienresultat,
- Treffer liefert Kontaktzelle, Kontaktzeit und Explosionsmittelpunkt; die Explosion mutiert die Maske aus Task 002,
- fünf Ballistiktests prüfen Reproduzierbarkeit, identische Vorschau/Ausführung, Treffer nach vorhandenem Krater, Kartenrand und ungültige Wiedergabezeit,
- Browserprüfung mit direktem, kontrolliertem und hohem Bogen; der sichtbare Flug endet am angekündigten Einschlag,
- `npm run typecheck`, `npm test` und `npm run build`: erfolgreich,
- Browserkonsole: keine Fehler oder Warnungen aus der Anwendung.
