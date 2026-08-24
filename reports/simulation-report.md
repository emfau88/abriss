# Simulationsbericht der Match-Engine

Deterministisch erzeugt über `npm run simulate` (Task 022).
Gleiche Szenarien ergeben byte-identische Berichte.

## Karte `good-mood`

- Matches: 3 (Seeds: 21072026, 21072127, 21072228)
- Ausgänge: Crew 1 · Rivalen 2 · Unentschieden 0
- Zuglängen: Minimum 11 · Median 17 · Maximum 18
- Plan-Arten: 46 Angriffe · 0 Positionszüge · 0 Aussetzer
- Trefferbild: 0 Eigentreffer · 0 Kameradentreffer · 3 Out-of-world-Ausschaltungen
- Planfamilien-Vielfalt: 38 Familien in 46 Angriffsplänen · 8 Wiederholungen (17.4 %) · häufigste Familie 6.5 %

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

Erstzug-Divergenz über 7 Eröffnungssonden × 3 Persönlichkeiten:
4 Sonden wählen unterschiedliche Kandidaten, 7 unterschiedliche Planfamilien, 0 unterschiedliche Waffen, 7 unterschiedliche Bewegungen.

| Persönlichkeit | Angriffe | unterschiedliche Planfamilien | Panzerfaust | Wurfgranate | Geländebrecher |
| --- | ---: | ---: | ---: | ---: | ---: |
| Vorsichtig | 7 von 7 | 2 | 4 | 3 | 0 |
| Sprengfreudig | 7 von 7 | 3 | 4 | 3 | 0 |
| Angeberisch | 7 von 7 | 2 | 4 | 3 | 0 |

## Karte `space-resort`

- Matches: 3 (Seeds: 21072026, 21072127, 21072228)
- Ausgänge: Crew 3 · Rivalen 0 · Unentschieden 0
- Zuglängen: Minimum 13 · Median 14 · Maximum 17
- Plan-Arten: 43 Angriffe · 1 Positionszüge · 0 Aussetzer
- Trefferbild: 0 Eigentreffer · 0 Kameradentreffer · 7 Out-of-world-Ausschaltungen
- Planfamilien-Vielfalt: 31 Familien in 43 Angriffsplänen · 12 Wiederholungen (27.9 %) · häufigste Familie 7.0 %

| Waffe | Angriffe | Anteil | Gesamtschaden |
| --- | ---: | ---: | ---: |
| Panzerfaust | 24 von 43 | 55.8 % | 2213 |
| Wurfgranate | 9 von 43 | 20.9 % | 262 |
| Geländebrecher | 10 von 43 | 23.3 % | 0 |

| Waffe | in Planung betrachtet | Züge mit gültigem Kandidat | häufigste Scheiterngründe |
| --- | ---: | ---: | --- |
| Panzerfaust | 38 | 24 | Ziel liegt außerhalb wirksamer Reichweite (267) |
| Wurfgranate | 41 | 27 | Ziel liegt außerhalb wirksamer Reichweite (832) · Flugbahn verlässt das Einsatzgebiet (43) |
| Geländebrecher | 35 | 33 | Ziel liegt außerhalb wirksamer Reichweite (114) |

Erstzug-Divergenz über 7 Eröffnungssonden × 3 Persönlichkeiten:
4 Sonden wählen unterschiedliche Kandidaten, 7 unterschiedliche Planfamilien, 0 unterschiedliche Waffen, 7 unterschiedliche Bewegungen.

| Persönlichkeit | Angriffe | unterschiedliche Planfamilien | Panzerfaust | Wurfgranate | Geländebrecher |
| --- | ---: | ---: | ---: | ---: | ---: |
| Vorsichtig | 7 von 7 | 2 | 4 | 3 | 0 |
| Sprengfreudig | 7 von 7 | 4 | 4 | 3 | 0 |
| Angeberisch | 7 von 7 | 2 | 4 | 3 | 0 |

## Persönlichkeits-Matchups

Je Paarung ein deterministisches Match (Crew-Team gegen Rivalen-Team,
alle Figuren der Seite mit derselben Persönlichkeit).

| Paarung | Ausgang | Züge |
| --- | --- | ---: |
| good-mood: Crew cautious vs. Rivalen explosive | Crew gewinnt | 15 |
| good-mood: Crew explosive vs. Rivalen showboat | Rivalen gewinnen | 12 |
| good-mood: Crew showboat vs. Rivalen cautious | Rivalen gewinnen | 11 |
| space-resort: Crew cautious vs. Rivalen explosive | Rivalen gewinnen | 16 |
| space-resort: Crew explosive vs. Rivalen showboat | Rivalen gewinnen | 11 |
| space-resort: Crew showboat vs. Rivalen cautious | Rivalen gewinnen | 8 |

## Gezielte Konfliktsonden

Kleine rendererfreie Situationen aktivieren Risiken und Folgewirkungen,
die in den normalen Eröffnungen meist null bleiben (Task 035).

| Sonde | Steuerung | Persönlichkeit | Plan | erwartetes Risiko Team/Selbst | Kette | Terrain | echte Folgen |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Teamrisiko | Auto | Vorsichtig | Panzerfaust → RIVALE B | 0 / 0 | 0 | 50 % | 99 Gegnerschaden · 1 Ring-out · 1516 Zellen entfernt |
| Teamrisiko | Zielauftrag A | Vorsichtig | Panzerfaust → RIVALE A | 25 / 0 | 0 | 50 % | 99 Gegnerschaden · 29 Teamschaden · 1523 Zellen entfernt |
| Teamrisiko | Auto | Sprengfreudig | Panzerfaust → RIVALE C | 0 / 0 | 0 | 50 % | 90 Gegnerschaden · 1529 Zellen entfernt |
| Teamrisiko | Zielauftrag A | Sprengfreudig | Panzerfaust → RIVALE A | 25 / 0 | 0 | 50 % | 88 Gegnerschaden · 41 Teamschaden · 1530 Zellen entfernt |
| Teamrisiko | Auto | Angeberisch | Panzerfaust → RIVALE B | 0 / 0 | 0 | 50 % | 99 Gegnerschaden · 1 Ring-out · 1528 Zellen entfernt |
| Teamrisiko | Zielauftrag A | Angeberisch | Panzerfaust → RIVALE A | 23 / 0 | 0 | 50 % | 90 Gegnerschaden · 19 Teamschaden · 1536 Zellen entfernt |
| Fasskette | Auto | Vorsichtig | Panzerfaust → RIVALE C | 0 / 0 | 0 | 50 % | 90 Gegnerschaden · 1 Ring-out · 1523 Zellen entfernt |
| Fasskette | Zielauftrag A | Vorsichtig | Geländebrecher → FASS (→ RIVALE A) | 0 / 0 | 28 | 61 % | 24 Gegnerschaden · 2 Fass/Fässer · 4710 Zellen entfernt |
| Fasskette | Auto | Sprengfreudig | Panzerfaust → RIVALE C | 0 / 0 | 0 | 50 % | 90 Gegnerschaden · 1522 Zellen entfernt |
| Fasskette | Zielauftrag A | Sprengfreudig | Geländebrecher → FASS (→ RIVALE A) | 0 / 0 | 29 | 61 % | 29 Gegnerschaden · 2 Fass/Fässer · 4710 Zellen entfernt |
| Fasskette | Auto | Angeberisch | Panzerfaust → RIVALE B | 0 / 0 | 0 | 50 % | 99 Gegnerschaden · 1 Ring-out · 1529 Zellen entfernt |
| Fasskette | Zielauftrag A | Angeberisch | Geländebrecher → FASS (→ RIVALE A) | 0 / 0 | 27 | 61 % | 23 Gegnerschaden · 2 Fass/Fässer · 4710 Zellen entfernt |
| Geländetor | Auto | Vorsichtig | Panzerfaust → RIVALE C | 0 / 0 | 0 | 50 % | 90 Gegnerschaden · 1 Ring-out · 1522 Zellen entfernt |
| Geländetor | Zielauftrag A | Vorsichtig | Panzerfaust → RIVALE A | 0 / 0 | 0 | 50 % | 97 Gegnerschaden · 1529 Zellen entfernt |
| Geländetor | Auto | Sprengfreudig | Panzerfaust → RIVALE C | 0 / 0 | 0 | 50 % | 90 Gegnerschaden · 1523 Zellen entfernt |
| Geländetor | Zielauftrag A | Sprengfreudig | Panzerfaust → RIVALE A | 0 / 0 | 0 | 50 % | 93 Gegnerschaden · 1510 Zellen entfernt |
| Geländetor | Auto | Angeberisch | Panzerfaust → RIVALE B | 0 / 0 | 0 | 50 % | 99 Gegnerschaden · 1 Ring-out · 1528 Zellen entfernt |
| Geländetor | Zielauftrag A | Angeberisch | Panzerfaust → RIVALE A | 0 / 0 | 0 | 50 % | 90 Gegnerschaden · 1537 Zellen entfernt |
| Ring-out-Kante | Auto | Vorsichtig | Panzerfaust → RIVALE B | 0 / 0 | 0 | 50 % | 100 Gegnerschaden · 1 Ring-out · 1510 Zellen entfernt |
| Ring-out-Kante | Zielauftrag A | Vorsichtig | Panzerfaust → RIVALE A | 0 / 0 | 0 | 37 % | 100 Gegnerschaden · 1 Ring-out · 1140 Zellen entfernt |
| Ring-out-Kante | Auto | Sprengfreudig | Panzerfaust → RIVALE C | 0 / 0 | 0 | 50 % | 88 Gegnerschaden · 1516 Zellen entfernt |
| Ring-out-Kante | Zielauftrag A | Sprengfreudig | Panzerfaust → RIVALE A | 0 / 0 | 0 | 37 % | 89 Gegnerschaden · 1 Ring-out · 1245 Zellen entfernt |
| Ring-out-Kante | Auto | Angeberisch | Panzerfaust → RIVALE B | 0 / 0 | 0 | 50 % | 99 Gegnerschaden · 1 Ring-out · 1528 Zellen entfernt |
| Ring-out-Kante | Zielauftrag A | Angeberisch | Panzerfaust → RIVALE A | 0 / 0 | 0 | 37 % | 90 Gegnerschaden · 1057 Zellen entfernt |
