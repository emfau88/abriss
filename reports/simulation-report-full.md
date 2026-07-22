# Simulationsbericht der Match-Engine

Deterministisch erzeugt über `npm run simulate` (Task 022).
Gleiche Szenarien ergeben byte-identische Berichte.

## Karte `good-mood`

- Matches: 10 (Seeds: 21072026, 21072127, 21072228, 21072329, 21072430, 21072531, 21072632, 21072733, 21072834, 21072935)
- Ausgänge: Crew 6 · Rivalen 4 · Unentschieden 0
- Zuglängen: Minimum 20 · Median 26 · Maximum 33
- Plan-Arten: 243 Angriffe · 14 Positionszüge · 0 Aussetzer
- Trefferbild: 5 Eigentreffer · 0 Kameradentreffer · 0 Out-of-world-Ausschaltungen

| Waffe | Angriffe | Anteil | Gesamtschaden |
| --- | ---: | ---: | ---: |
| Panzerfaust | 91 von 243 | 37.5 % | 9020 |
| Wurfgranate | 20 von 243 | 8.2 % | 1221 |
| Geländebrecher | 132 von 243 | 54.3 % | 100 |

| Waffe | in Planung betrachtet | Züge mit gültigem Kandidat | häufigste Scheiterngründe |
| --- | ---: | ---: | --- |
| Panzerfaust | 240 | 91 | Ziel liegt außerhalb wirksamer Reichweite (1311) |
| Wurfgranate | 247 | 67 | Ziel liegt außerhalb wirksamer Reichweite (3055) · Flugbahn endet ohne Einschlag (3) |
| Geländebrecher | 230 | 212 | Ziel liegt außerhalb wirksamer Reichweite (461) |

Erstzug-Divergenz über 4 Eröffnungssonden × 3 Persönlichkeiten:
0 Sonden wählen unterschiedliche Kandidaten, 0 unterschiedliche Waffen, 4 unterschiedliche Bewegungen.

## Karte `space-resort`

- Matches: 10 (Seeds: 21072026, 21072127, 21072228, 21072329, 21072430, 21072531, 21072632, 21072733, 21072834, 21072935)
- Ausgänge: Crew 5 · Rivalen 5 · Unentschieden 0
- Zuglängen: Minimum 10 · Median 15 · Maximum 25
- Plan-Arten: 159 Angriffe · 0 Positionszüge · 0 Aussetzer
- Trefferbild: 0 Eigentreffer · 0 Kameradentreffer · 13 Out-of-world-Ausschaltungen

| Waffe | Angriffe | Anteil | Gesamtschaden |
| --- | ---: | ---: | ---: |
| Panzerfaust | 76 von 159 | 47.8 % | 7343 |
| Wurfgranate | 33 von 159 | 20.8 % | 1710 |
| Geländebrecher | 50 von 159 | 31.4 % | 0 |

| Waffe | in Planung betrachtet | Züge mit gültigem Kandidat | häufigste Scheiterngründe |
| --- | ---: | ---: | --- |
| Panzerfaust | 148 | 79 | Ziel liegt außerhalb wirksamer Reichweite (762) |
| Wurfgranate | 149 | 79 | Ziel liegt außerhalb wirksamer Reichweite (2143) · Flugbahn verlässt das Einsatzgebiet (77) |
| Geländebrecher | 138 | 130 | Ziel liegt außerhalb wirksamer Reichweite (236) |

Erstzug-Divergenz über 4 Eröffnungssonden × 3 Persönlichkeiten:
2 Sonden wählen unterschiedliche Kandidaten, 0 unterschiedliche Waffen, 2 unterschiedliche Bewegungen.
