# Simulationsbericht der Match-Engine

Deterministisch erzeugt über `npm run simulate` (Task 022).
Gleiche Szenarien ergeben byte-identische Berichte.

## Karte `good-mood`

- Matches: 3 (Seeds: 21072026, 21072127, 21072228)
- Ausgänge: Crew 2 · Rivalen 1 · Unentschieden 0
- Zuglängen: Minimum 18 · Median 20 · Maximum 21
- Plan-Arten: 59 Angriffe · 0 Positionszüge · 0 Aussetzer
- Trefferbild: 0 Eigentreffer · 0 Kameradentreffer · 0 Out-of-world-Ausschaltungen

| Waffe | Angriffe | Anteil | Gesamtschaden |
| --- | ---: | ---: | ---: |
| Panzerfaust | 27 von 59 | 45.8 % | 2497 |
| Wurfgranate | 14 von 59 | 23.7 % | 418 |
| Geländebrecher | 18 von 59 | 30.5 % | 66 |

| Waffe | in Planung betrachtet | Züge mit gültigem Kandidat | häufigste Scheiterngründe |
| --- | ---: | ---: | --- |
| Panzerfaust | 53 | 27 | Ziel liegt außerhalb wirksamer Reichweite (355) |
| Wurfgranate | 56 | 27 | Ziel liegt außerhalb wirksamer Reichweite (883) · Flugbahn verlässt das Einsatzgebiet (5) |
| Geländebrecher | 50 | 50 | Ziel liegt außerhalb wirksamer Reichweite (103) |

Erstzug-Divergenz über 4 Eröffnungssonden × 3 Persönlichkeiten:
2 Sonden wählen unterschiedliche Kandidaten, 0 unterschiedliche Waffen, 4 unterschiedliche Bewegungen.

## Karte `space-resort`

- Matches: 3 (Seeds: 21072026, 21072127, 21072228)
- Ausgänge: Crew 3 · Rivalen 0 · Unentschieden 0
- Zuglängen: Minimum 12 · Median 12 · Maximum 15
- Plan-Arten: 39 Angriffe · 0 Positionszüge · 0 Aussetzer
- Trefferbild: 0 Eigentreffer · 0 Kameradentreffer · 1 Out-of-world-Ausschaltungen

| Waffe | Angriffe | Anteil | Gesamtschaden |
| --- | ---: | ---: | ---: |
| Panzerfaust | 25 von 39 | 64.1 % | 2030 |
| Wurfgranate | 6 von 39 | 15.4 % | 252 |
| Geländebrecher | 8 von 39 | 20.5 % | 0 |

| Waffe | in Planung betrachtet | Züge mit gültigem Kandidat | häufigste Scheiterngründe |
| --- | ---: | ---: | --- |
| Panzerfaust | 36 | 25 | Ziel liegt außerhalb wirksamer Reichweite (224) |
| Wurfgranate | 36 | 18 | Ziel liegt außerhalb wirksamer Reichweite (599) · Flugbahn verlässt das Einsatzgebiet (24) |
| Geländebrecher | 33 | 33 | Ziel liegt außerhalb wirksamer Reichweite (84) |

Erstzug-Divergenz über 4 Eröffnungssonden × 3 Persönlichkeiten:
4 Sonden wählen unterschiedliche Kandidaten, 0 unterschiedliche Waffen, 4 unterschiedliche Bewegungen.

## Persönlichkeits-Matchups

Je Paarung ein deterministisches Match (Crew-Team gegen Rivalen-Team,
alle Figuren der Seite mit derselben Persönlichkeit).

| Paarung | Ausgang | Züge |
| --- | --- | ---: |
| good-mood: Crew cautious vs. Rivalen explosive | Crew gewinnt | 18 |
| good-mood: Crew explosive vs. Rivalen showboat | Rivalen gewinnen | 12 |
| good-mood: Crew showboat vs. Rivalen cautious | Rivalen gewinnen | 10 |
| space-resort: Crew cautious vs. Rivalen explosive | Crew gewinnt | 9 |
| space-resort: Crew explosive vs. Rivalen showboat | Rivalen gewinnen | 11 |
| space-resort: Crew showboat vs. Rivalen cautious | Crew gewinnt | 17 |
