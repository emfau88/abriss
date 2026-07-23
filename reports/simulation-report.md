# Simulationsbericht der Match-Engine

Deterministisch erzeugt über `npm run simulate` (Task 022).
Gleiche Szenarien ergeben byte-identische Berichte.

## Karte `good-mood`

- Matches: 3 (Seeds: 21072026, 21072127, 21072228)
- Ausgänge: Crew 1 · Rivalen 2 · Unentschieden 0
- Zuglängen: Minimum 11 · Median 17 · Maximum 18
- Plan-Arten: 46 Angriffe · 0 Positionszüge · 0 Aussetzer
- Trefferbild: 0 Eigentreffer · 0 Kameradentreffer · 0 Out-of-world-Ausschaltungen

| Waffe | Angriffe | Anteil | Gesamtschaden |
| --- | ---: | ---: | ---: |
| Panzerfaust | 27 von 46 | 58.7 % | 2327 |
| Wurfgranate | 10 von 46 | 21.7 % | 595 |
| Geländebrecher | 9 von 46 | 19.6 % | 0 |

| Waffe | in Planung betrachtet | Züge mit gültigem Kandidat | häufigste Scheiterngründe |
| --- | ---: | ---: | --- |
| Panzerfaust | 40 | 28 | Ziel liegt außerhalb wirksamer Reichweite (360) |
| Wurfgranate | 43 | 22 | Ziel liegt außerhalb wirksamer Reichweite (896) · Flugbahn verlässt das Einsatzgebiet (5) |
| Geländebrecher | 37 | 37 | Ziel liegt außerhalb wirksamer Reichweite (83) |

Erstzug-Divergenz über 6 Eröffnungssonden × 3 Persönlichkeiten:
3 Sonden wählen unterschiedliche Kandidaten, 0 unterschiedliche Waffen, 6 unterschiedliche Bewegungen.

## Karte `space-resort`

- Matches: 3 (Seeds: 21072026, 21072127, 21072228)
- Ausgänge: Crew 3 · Rivalen 0 · Unentschieden 0
- Zuglängen: Minimum 13 · Median 14 · Maximum 17
- Plan-Arten: 43 Angriffe · 1 Positionszüge · 0 Aussetzer
- Trefferbild: 0 Eigentreffer · 1 Kameradentreffer · 1 Out-of-world-Ausschaltungen

| Waffe | Angriffe | Anteil | Gesamtschaden |
| --- | ---: | ---: | ---: |
| Panzerfaust | 24 von 43 | 55.8 % | 2265 |
| Wurfgranate | 9 von 43 | 20.9 % | 262 |
| Geländebrecher | 10 von 43 | 23.3 % | 0 |

| Waffe | in Planung betrachtet | Züge mit gültigem Kandidat | häufigste Scheiterngründe |
| --- | ---: | ---: | --- |
| Panzerfaust | 38 | 24 | Ziel liegt außerhalb wirksamer Reichweite (267) |
| Wurfgranate | 41 | 27 | Ziel liegt außerhalb wirksamer Reichweite (832) · Flugbahn verlässt das Einsatzgebiet (43) |
| Geländebrecher | 35 | 33 | Ziel liegt außerhalb wirksamer Reichweite (114) |

Erstzug-Divergenz über 6 Eröffnungssonden × 3 Persönlichkeiten:
3 Sonden wählen unterschiedliche Kandidaten, 0 unterschiedliche Waffen, 6 unterschiedliche Bewegungen.

## Persönlichkeits-Matchups

Je Paarung ein deterministisches Match (Crew-Team gegen Rivalen-Team,
alle Figuren der Seite mit derselben Persönlichkeit).

| Paarung | Ausgang | Züge |
| --- | --- | ---: |
| good-mood: Crew cautious vs. Rivalen explosive | Crew gewinnt | 16 |
| good-mood: Crew explosive vs. Rivalen showboat | Rivalen gewinnen | 12 |
| good-mood: Crew showboat vs. Rivalen cautious | Rivalen gewinnen | 11 |
| space-resort: Crew cautious vs. Rivalen explosive | Rivalen gewinnen | 16 |
| space-resort: Crew explosive vs. Rivalen showboat | Rivalen gewinnen | 11 |
| space-resort: Crew showboat vs. Rivalen cautious | Rivalen gewinnen | 8 |
