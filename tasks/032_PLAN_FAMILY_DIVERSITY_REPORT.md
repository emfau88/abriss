# Task 032: Planfamilien- und Persönlichkeitsvielfalt messen

## Status

`abgeschlossen`

## Ziel

Der deterministische Simulationsbericht weist aus, ob Matches tatsächlich
verschiedene taktische Planfamilien erzeugen und ob die drei Persönlichkeiten
in denselben Eröffnungssituationen andere Familien oder Waffen wählen.

## Warum jetzt

Task 031 macht semantische Planfamilien maschinenlesbar. Ohne Aggregation ist
weiterhin nur an einzelnen Kandidaten-IDs sichtbar, ob Figuren variieren. Vor
weiterem Balance-Tuning oder einem Hybridmodus braucht die Roadmap eine
belastbare Vorher-Messung.

## Pflichtlektüre

- `AGENTS.md`
- `docs/01_PRODUCT_VISION.md`
- `docs/02_GAME_DESIGN.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/04_VERTICAL_SLICE.md`
- `docs/07_CORE_GAMEPLAY_REVIEW.md`
- `docs/DECISIONS.md`
- `tasks/022_TURN_DIAGNOSTICS_AND_MASS_SIMULATOR.md`
- `tasks/031_SEMANTIC_PLAN_FAMILIES.md`

## Scope

- Planfamilienanzahl und Wiederholungsanteil pro Karte über vollständige
  Headless-Matches,
- Erstzug-Divergenz der Planfamilien zusätzlich zu Kandidat, Waffe und
  Bewegung,
- Waffen- und Planfamilienübersicht je Persönlichkeit über dieselben
  Eröffnungssonden,
- deterministische Ausgabe in `reports/simulation-report.md`,
- Snapshot- und Regressionstests der neuen Kennzahlen.

## Nichtziele

- keine Balanceänderung aufgrund des Messergebnisses,
- keine neue KI-Utility, Waffe, Karte oder Persönlichkeit,
- keine UI-Anzeige im Match,
- kein statistisches Dashboard und keine externe Telemetrie,
- kein Umbau der MatchScene.

## Akzeptanzkriterien

1. Jede Karte meldet Angriffspläne, unterschiedliche Planfamilien und einen
   nachvollziehbaren Wiederholungsanteil.
2. Die Eröffnungssonden melden, wie oft Persönlichkeiten unterschiedliche
   Planfamilien wählen.
3. Eine Tabelle zeigt pro Persönlichkeit Angriffe, unterschiedliche
   Planfamilien und Verteilung der drei Waffen.
4. Gleiche Szenarien erzeugen byte-identische Daten und denselben
   Markdown-Bericht.
5. `npm run simulate`, Typprüfung, Gesamttests und Produktionsbuild bestehen.

## Verifikation

- `npm test -- src/simulation/match/matchSimulator.test.ts`
- `npm run simulate`
- `npm run typecheck`
- `npm test`
- `npm run build`

## Abschlussbericht

Abgeschlossen am 5. August 2026.

- `matchSimulator.ts` zählt pro Karte ausgeführte Angriffspläne,
  unterschiedliche semantische Planfamilien, weitere Vorkommen bereits
  gesehener Familien, Wiederholungsanteil und Anteil der häufigsten Familie.
- Die Erstzugsonden messen nun zusätzlich Familienabweichungen. Eine Tabelle
  weist für jede Persönlichkeit Angriffe, unterschiedliche Familien und die
  drei Waffenanzahlen aus.
- Snapshot und `reports/simulation-report.md` wurden bewusst aktualisiert und
  durch einen zweiten `npm run simulate`-Lauf byte-identisch bestätigt
  (SHA-256 `6B9EC819710389FE02C1B04A3798974B46A0F95C7E64C533DDD7FBBC20593277`).

### Messbefund der kleinen Matrix

- Sonneninseln: 38 Familien in 46 Angriffen, 17,4 % Wiederholungsanteil,
  häufigste Familie 6,5 %.
- Space-Resort: 31 Familien in 43 Angriffen, 27,9 % Wiederholungsanteil,
  häufigste Familie 7,0 %.
- Alle sieben Eröffnungssonden pro Karte unterscheiden sich zwischen den
  Persönlichkeiten in der Planfamilie, vor allem durch Bewegung und
  Einschlagsbereich.
- Die sichtbarste Rollenentscheidung bleibt jedoch identisch: Jede
  Persönlichkeit wählt je Karte viermal Panzerfaust, dreimal Granate und
  keinmal Geländebrecher. Persönlichkeitsunterschiede sind damit vorhanden,
  aber weiterhin nicht stark genug in der Waffenrolle sichtbar.

Keine Balancewerte wurden verändert. Der nächste belastbare Schritt sind
gezielte konfliktreiche Eröffnungsszenarien, bevor Gewichte angepasst werden.

Prüfungen und Produktionsbuild sind im abschließenden Publish-Bericht
dokumentiert. Verbindliche Entscheidung: `docs/DECISIONS.md`, D-048.
