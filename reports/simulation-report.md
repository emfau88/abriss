# Simulationsbericht der Match-Engine

Deterministisch erzeugt über `npm run simulate` (Task 022).
Gleiche Szenarien ergeben byte-identische Berichte.

## Karte `good-mood`

- Matches: 3 (Seeds: 21072026, 21072127, 21072228)
- Ausgänge: Crew 2 · Rivalen 1 · Unentschieden 0
- Zuglängen: Minimum 22 · Median 23 · Maximum 26
- Plan-Arten: 70 Angriffe · 1 Positionszüge · 0 Aussetzer
- Trefferbild: 1 Eigentreffer · 0 Kameradentreffer · 0 Out-of-world-Ausschaltungen

| Waffe | Angriffe | Anteil | Gesamtschaden |
| --- | ---: | ---: | ---: |
| Panzerfaust | 28 von 70 | 40.0 % | 2768 |
| Wurfgranate | 6 von 70 | 8.6 % | 371 |
| Geländebrecher | 36 von 70 | 51.4 % | 6 |

| Waffe | in Planung betrachtet | Züge mit gültigem Kandidat | häufigste Scheiterngründe |
| --- | ---: | ---: | --- |
| Panzerfaust | 66 | 28 | Ziel liegt außerhalb wirksamer Reichweite (368) |
| Wurfgranate | 68 | 20 | Ziel liegt außerhalb wirksamer Reichweite (863) · Flugbahn endet ohne Einschlag (2) |
| Geländebrecher | 63 | 61 | Ziel liegt außerhalb wirksamer Reichweite (118) |

Erstzug-Divergenz über 4 Eröffnungssonden × 3 Persönlichkeiten:
0 Sonden wählen unterschiedliche Kandidaten, 0 unterschiedliche Waffen, 4 unterschiedliche Bewegungen.

## Karte `space-resort`

- Matches: 3 (Seeds: 21072026, 21072127, 21072228)
- Ausgänge: Crew 2 · Rivalen 1 · Unentschieden 0
- Zuglängen: Minimum 13 · Median 21 · Maximum 21
- Plan-Arten: 55 Angriffe · 0 Positionszüge · 0 Aussetzer
- Trefferbild: 0 Eigentreffer · 0 Kameradentreffer · 1 Out-of-world-Ausschaltungen

| Waffe | Angriffe | Anteil | Gesamtschaden |
| --- | ---: | ---: | ---: |
| Panzerfaust | 27 von 55 | 49.1 % | 2700 |
| Wurfgranate | 12 von 55 | 21.8 % | 418 |
| Geländebrecher | 16 von 55 | 29.1 % | 0 |

| Waffe | in Planung betrachtet | Züge mit gültigem Kandidat | häufigste Scheiterngründe |
| --- | ---: | ---: | --- |
| Panzerfaust | 52 | 27 | Ziel liegt außerhalb wirksamer Reichweite (254) |
| Wurfgranate | 52 | 31 | Ziel liegt außerhalb wirksamer Reichweite (758) · Flugbahn verlässt das Einsatzgebiet (42) |
| Geländebrecher | 49 | 47 | Ziel liegt außerhalb wirksamer Reichweite (83) |

Erstzug-Divergenz über 4 Eröffnungssonden × 3 Persönlichkeiten:
2 Sonden wählen unterschiedliche Kandidaten, 0 unterschiedliche Waffen, 2 unterschiedliche Bewegungen.
