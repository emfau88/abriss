# Simulationsbericht der Match-Engine

Deterministisch erzeugt über `npm run simulate` (Task 022).
Gleiche Szenarien ergeben byte-identische Berichte.

## Karte `good-mood`

- Matches: 3 (Seeds: 21072026, 21072127, 21072228)
- Ausgänge: Crew 1 · Rivalen 2 · Unentschieden 0
- Zuglängen: Minimum 15 · Median 15 · Maximum 24
- Plan-Arten: 54 Angriffe · 0 Positionszüge · 0 Aussetzer
- Trefferbild: 1 Eigentreffer · 0 Kameradentreffer · 0 Out-of-world-Ausschaltungen

| Waffe | Angriffe | Anteil | Gesamtschaden |
| --- | ---: | ---: | ---: |
| Panzerfaust | 29 von 54 | 53.7 % | 2467 |
| Wurfgranate | 12 von 54 | 22.2 % | 380 |
| Geländebrecher | 13 von 54 | 24.1 % | 0 |

| Waffe | in Planung betrachtet | Züge mit gültigem Kandidat | häufigste Scheiterngründe |
| --- | ---: | ---: | --- |
| Panzerfaust | 48 | 29 | Ziel liegt außerhalb wirksamer Reichweite (326) |
| Wurfgranate | 51 | 28 | Ziel liegt außerhalb wirksamer Reichweite (825) · Flugbahn verlässt das Einsatzgebiet (4) |
| Geländebrecher | 45 | 44 | Ziel liegt außerhalb wirksamer Reichweite (104) |

Erstzug-Divergenz über 4 Eröffnungssonden × 3 Persönlichkeiten:
2 Sonden wählen unterschiedliche Kandidaten, 0 unterschiedliche Waffen, 4 unterschiedliche Bewegungen.

## Karte `space-resort`

- Matches: 3 (Seeds: 21072026, 21072127, 21072228)
- Ausgänge: Crew 2 · Rivalen 1 · Unentschieden 0
- Zuglängen: Minimum 14 · Median 16 · Maximum 21
- Plan-Arten: 51 Angriffe · 0 Positionszüge · 0 Aussetzer
- Trefferbild: 0 Eigentreffer · 1 Kameradentreffer · 1 Out-of-world-Ausschaltungen

| Waffe | Angriffe | Anteil | Gesamtschaden |
| --- | ---: | ---: | ---: |
| Panzerfaust | 30 von 51 | 58.8 % | 2503 |
| Wurfgranate | 5 von 51 | 9.8 % | 169 |
| Geländebrecher | 16 von 51 | 31.4 % | 67 |

| Waffe | in Planung betrachtet | Züge mit gültigem Kandidat | häufigste Scheiterngründe |
| --- | ---: | ---: | --- |
| Panzerfaust | 48 | 30 | Ziel liegt außerhalb wirksamer Reichweite (292) |
| Wurfgranate | 48 | 21 | Ziel liegt außerhalb wirksamer Reichweite (797) · Flugbahn verlässt das Einsatzgebiet (46) |
| Geländebrecher | 45 | 44 | Ziel liegt außerhalb wirksamer Reichweite (103) |

Erstzug-Divergenz über 4 Eröffnungssonden × 3 Persönlichkeiten:
2 Sonden wählen unterschiedliche Kandidaten, 0 unterschiedliche Waffen, 2 unterschiedliche Bewegungen.

## Persönlichkeits-Matchups

Je Paarung ein deterministisches Match (Crew-Team gegen Rivalen-Team,
alle Figuren der Seite mit derselben Persönlichkeit).

| Paarung | Ausgang | Züge |
| --- | --- | ---: |
| good-mood: Crew cautious vs. Rivalen explosive | Rivalen gewinnen | 19 |
| good-mood: Crew explosive vs. Rivalen showboat | Rivalen gewinnen | 14 |
| good-mood: Crew showboat vs. Rivalen cautious | Rivalen gewinnen | 24 |
| space-resort: Crew cautious vs. Rivalen explosive | Crew gewinnt | 9 |
| space-resort: Crew explosive vs. Rivalen showboat | Rivalen gewinnen | 12 |
| space-resort: Crew showboat vs. Rivalen cautious | Rivalen gewinnen | 29 |
