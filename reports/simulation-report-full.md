# Simulationsbericht der Match-Engine

Deterministisch erzeugt über `npm run simulate` (Task 022).
Gleiche Szenarien ergeben byte-identische Berichte.

## Karte `good-mood`

- Matches: 10 (Seeds: 21072026, 21072127, 21072228, 21072329, 21072430, 21072531, 21072632, 21072733, 21072834, 21072935)
- Ausgänge: Crew 3 · Rivalen 7 · Unentschieden 0
- Zuglängen: Minimum 12 · Median 19 · Maximum 22
- Plan-Arten: 182 Angriffe · 1 Positionszüge · 0 Aussetzer
- Trefferbild: 1 Eigentreffer · 0 Kameradentreffer · 1 Out-of-world-Ausschaltungen

| Waffe | Angriffe | Anteil | Gesamtschaden |
| --- | ---: | ---: | ---: |
| Panzerfaust | 94 von 182 | 51.6 % | 8627 |
| Wurfgranate | 36 von 182 | 19.8 % | 1075 |
| Geländebrecher | 52 von 182 | 28.6 % | 342 |

| Waffe | in Planung betrachtet | Züge mit gültigem Kandidat | häufigste Scheiterngründe |
| --- | ---: | ---: | --- |
| Panzerfaust | 163 | 95 | Ziel liegt außerhalb wirksamer Reichweite (1093) |
| Wurfgranate | 173 | 87 | Ziel liegt außerhalb wirksamer Reichweite (2766) · Flugbahn verlässt das Einsatzgebiet (19) |
| Geländebrecher | 153 | 152 | Ziel liegt außerhalb wirksamer Reichweite (348) |

Erstzug-Divergenz über 4 Eröffnungssonden × 3 Persönlichkeiten:
2 Sonden wählen unterschiedliche Kandidaten, 0 unterschiedliche Waffen, 4 unterschiedliche Bewegungen.

## Karte `space-resort`

- Matches: 10 (Seeds: 21072026, 21072127, 21072228, 21072329, 21072430, 21072531, 21072632, 21072733, 21072834, 21072935)
- Ausgänge: Crew 6 · Rivalen 4 · Unentschieden 0
- Zuglängen: Minimum 9 · Median 12 · Maximum 15
- Plan-Arten: 119 Angriffe · 0 Positionszüge · 0 Aussetzer
- Trefferbild: 1 Eigentreffer · 0 Kameradentreffer · 8 Out-of-world-Ausschaltungen

| Waffe | Angriffe | Anteil | Gesamtschaden |
| --- | ---: | ---: | ---: |
| Panzerfaust | 81 von 119 | 68.1 % | 6913 |
| Wurfgranate | 17 von 119 | 14.3 % | 813 |
| Geländebrecher | 21 von 119 | 17.6 % | 0 |

| Waffe | in Planung betrachtet | Züge mit gültigem Kandidat | häufigste Scheiterngründe |
| --- | ---: | ---: | --- |
| Panzerfaust | 109 | 84 | Ziel liegt außerhalb wirksamer Reichweite (585) |
| Wurfgranate | 109 | 57 | Ziel liegt außerhalb wirksamer Reichweite (1822) · Flugbahn verlässt das Einsatzgebiet (52) |
| Geländebrecher | 99 | 99 | Ziel liegt außerhalb wirksamer Reichweite (213) |

Erstzug-Divergenz über 4 Eröffnungssonden × 3 Persönlichkeiten:
4 Sonden wählen unterschiedliche Kandidaten, 0 unterschiedliche Waffen, 4 unterschiedliche Bewegungen.
