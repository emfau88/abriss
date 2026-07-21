# Task 002: Zerstörbares Terrain

## Status

`abgeschlossen am 21. Juli 2026`

## Ziel

Eine eigenständige Szene erstellen, in der sichtbares Terrain und seine fachliche Kollisionsmaske durch kreisförmige Explosionen konsistent verändert werden.

## Warum jetzt

Zerstörbares Terrain ist Produktpfeiler und technisches Risiko. Es muss isoliert funktionieren, bevor Figuren, Navigation oder KI darauf aufbauen.

## Pflichtlektüre

- `AGENTS.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/04_VERTICAL_SLICE.md`
- `docs/DECISIONS.md`

## Voraussetzungen

- Task 001 ist abgenommen.

## Scope

- streng typisierte Terrainmasken-Schnittstelle,
- definierte Welt-zu-Masken-Koordinaten,
- Abfrage von festen und freien Punkten,
- kreisförmiges Entfernen von Terrain mit begrenzter Dirty Region,
- synchrone sichtbare Darstellung der Maske,
- Pointer- oder Debugaktion zum Auslösen einer Testexplosion,
- optional ein einfacher Prüfkörper, der auf festen Boden reagiert,
- Debugansicht der Kollisionsmaske,
- Unit- und Szenariotests für Maskenoperationen.

## Nichtziele

- allgemeine Physikpolygone,
- komplexe einstürzende Gebäude,
- Waffenflugbahnen,
- KI oder Navigation,
- finale Terrainassets.

## Akzeptanzkriterien

1. Eine Testexplosion erzeugt einen sichtbaren kreisförmigen Krater.
2. Kollisionsabfragen melden innerhalb des Kraters Luft.
3. Terrain außerhalb der Dirty Region bleibt unverändert.
4. Teilweise außerhalb der Karte liegende Explosionen verursachen keinen Fehler.
5. Mehrere überlappende Explosionen bleiben konsistent.
6. Die Debugansicht stimmt sichtbar mit dem Terrain überein.
7. Maskenauflösung und Speicherformat werden gemessen und in `docs/DECISIONS.md` festgehalten.

## Verifikation

- `npm run typecheck`
- `npm test`
- `npm run build`
- Browserprüfung mit Explosionen in Mitte, Rand und bestehendem Krater

## Abnahmeprotokoll

- `npm run typecheck`: erfolgreich,
- `npm test`: sieben Tests in zwei Testdateien erfolgreich,
- `npm run build`: erfolgreich,
- Explosion im Terrainzentrum: sichtbarer Krater und übereinstimmende Dirty Region,
- Randexplosion: korrekt auf Kartenrand begrenzt,
- identische überlappende Explosion: keine zweite Mutation,
- Prüfkörper: folgt nach entferntem Boden der nächsten festen Maskenzelle,
- Debugansicht: feste Maskenzellen stimmen mit den sichtbaren Kratern überein,
- Reset: stellt Maske, Textur, Zähler und Prüfkörper wieder her,
- Browserkonsole: keine Warnungen oder Fehler,
- Maskenentscheidung und Messwerte: als D-010 dokumentiert.
