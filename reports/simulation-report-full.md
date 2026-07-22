# Simulationsbericht der Match-Engine

Deterministisch erzeugt über `npm run simulate` (Task 022).
Gleiche Szenarien ergeben byte-identische Berichte.

## Karte `good-mood`

- Matches: 10 (Seeds: 21072026, 21072127, 21072228, 21072329, 21072430, 21072531, 21072632, 21072733, 21072834, 21072935)
- Ausgänge: Crew 4 · Rivalen 6 · Unentschieden 0
- Zuglängen: Minimum 9 · Median 13.5 · Maximum 24
- Plan-Arten: 141 Angriffe · 0 Positionszüge · 0 Aussetzer
- Trefferbild: 2 Eigentreffer · 0 Kameradentreffer · 4 Out-of-world-Ausschaltungen

| Waffe | Angriffe | Anteil | Gesamtschaden |
| --- | ---: | ---: | ---: |
| Panzerfaust | 88 von 141 | 62.4 % | 7425 |
| Wurfgranate | 29 von 141 | 20.6 % | 1253 |
| Geländebrecher | 24 von 141 | 17.0 % | 105 |

| Waffe | in Planung betrachtet | Züge mit gültigem Kandidat | häufigste Scheiterngründe |
| --- | ---: | ---: | --- |
| Panzerfaust | 121 | 92 | Ziel liegt außerhalb wirksamer Reichweite (844) |
| Wurfgranate | 131 | 79 | Ziel liegt außerhalb wirksamer Reichweite (2287) · Flugbahn verlässt das Einsatzgebiet (11) |
| Geländebrecher | 111 | 110 | Ziel liegt außerhalb wirksamer Reichweite (239) |

Erstzug-Divergenz über 4 Eröffnungssonden × 3 Persönlichkeiten:
2 Sonden wählen unterschiedliche Kandidaten, 0 unterschiedliche Waffen, 4 unterschiedliche Bewegungen.

## Karte `space-resort`

- Matches: 10 (Seeds: 21072026, 21072127, 21072228, 21072329, 21072430, 21072531, 21072632, 21072733, 21072834, 21072935)
- Ausgänge: Crew 7 · Rivalen 3 · Unentschieden 0
- Zuglängen: Minimum 8 · Median 14 · Maximum 26
- Plan-Arten: 151 Angriffe · 0 Positionszüge · 0 Aussetzer
- Trefferbild: 4 Eigentreffer · 2 Kameradentreffer · 9 Out-of-world-Ausschaltungen

| Waffe | Angriffe | Anteil | Gesamtschaden |
| --- | ---: | ---: | ---: |
| Panzerfaust | 86 von 151 | 57.0 % | 7220 |
| Wurfgranate | 19 von 151 | 12.6 % | 578 |
| Geländebrecher | 46 von 151 | 30.5 % | 69 |

| Waffe | in Planung betrachtet | Züge mit gültigem Kandidat | häufigste Scheiterngründe |
| --- | ---: | ---: | --- |
| Panzerfaust | 141 | 88 | Ziel liegt außerhalb wirksamer Reichweite (762) |
| Wurfgranate | 141 | 63 | Ziel liegt außerhalb wirksamer Reichweite (2193) · Flugbahn verlässt das Einsatzgebiet (93) |
| Geländebrecher | 131 | 128 | Ziel liegt außerhalb wirksamer Reichweite (274) |

Erstzug-Divergenz über 4 Eröffnungssonden × 3 Persönlichkeiten:
2 Sonden wählen unterschiedliche Kandidaten, 0 unterschiedliche Waffen, 2 unterschiedliche Bewegungen.
