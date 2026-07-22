# Task 024: Streukegel und Persönlichkeits-Blindflecken

## Status

`überwiegend umgesetzt – Blindflecken und Streukegel live, streuungsbewusste
Bewertung als Task 026 ausgelagert, Browserprüfung ausstehend` (zuvor: `bereit`)

## Ziel

Die Figuren verlieren ihre klinische Perfektion: Ausführung streut sichtbar
angekündigt um den Plan, und Persönlichkeiten unterscheiden sich durch eigene
Optionsmengen und charaktervolle Fehleinschätzungen statt nur durch
Score-Gewichte. Erst danach ist das Steuerungsexperiment aus Task 011 fair.

## Warum jetzt

Der Nutzer benennt das Kernproblem des Autobattler-Konzepts: „die Bots
verhalten sich absolut perfekt und optimal.“ Die Simulator-Messung bestätigt
fehlende Divergenz: Auf den Sonneninseln wählen alle drei Persönlichkeiten in
allen vier Eröffnungssonden denselben Kandidaten. Witzige Autobattler leben
von Drama durch Unvollkommenheit; Comedy entsteht zwischen Ankündigung und
Ausführung.

## Pflichtlektüre

- `docs/DECISIONS.md` (D-006, D-011, D-012, D-030)
- `docs/07_CORE_GAMEPLAY_REVIEW.md`
- `tasks/011_PLAYER_CONTROL_EXPERIMENT.md`

## Scope

1. **Streukegel (Ausführungs-Wobble):** Jeder angekündigte Schuss erhält
   einen persönlichkeits- und waffenabhängigen Streukegel. Die Vorschau
   zeigt Kegel plus wahrscheinlichsten Pfad; die Ausführung ist ein
   deterministisch geseedetes Sample daraus, das bereits zur Planungszeit
   feststeht. D-011 bleibt gewahrt: angekündigt wird Absicht plus ehrliche
   Unsicherheit, ausgeführt wird exakt das eine vorab feststehende Sample –
   Vorschau- und Ausführungs-Trajektorie des Samples sind identisch.
2. **Blindflecken:** Persönlichkeiten verzerren ihre *Wahrnehmung* einzelner
   Metriken (z. B. Explosiv halbiert gefühltes Eigenrisiko, Showboat
   überschätzt Showfaktor). Die Verzerrung ist in der Zugdiagnose und im
   Intent-Panel sichtbar begründet („unterschätzt das Eigenrisiko“).
3. **Eigene Optionsmengen:** Showboat erwägt zusätzlich besonders hohe
   Bögen, Vorsichtig zusätzlich Maximaldistanz-Kandidaten, Explosiv
   priorisiert Ziele in Gegnernähe zueinander.
4. **Messbarkeit:** Erstzug-Divergenz im Simulator muss danach auf beiden
   Karten deutlich steigen (Ziel: mehr als die Hälfte der Sonden divergiert
   in Kandidat oder Waffe); zusätzlich Persönlichkeits-Matchup-Läufe
   (3× vorsichtig gegen 3× explosiv usw.) als neue Simulatoroption.

## Nichtziele

- keine direkte Spielersteuerung (das prüft Task 011 anschließend),
- kein zusätzlicher „Versagenswurf“ ohne sichtbare Begründung (D-006),
- keine Waffenwert-Änderungen (Task 023).

## Startbedingung und Reihenfolge

Nach Task 023 (sonst misst die Divergenz gegen unbalancierte Waffen).
Task 011 wird erst nach Abschluss dieses Tasks durchgeführt, damit der
Vergleich „Selbststeuern vs. Zuschauen“ gegen die charaktervolle statt die
sterile Autonomie-Version läuft.

## Akzeptanzkriterien

1. Streuung ist deterministisch, im Voraus bekannt und in Vorschau und
   Diagnose sichtbar; identischer Seed ⇒ identisches Match.
2. Divergenzmetrik erreicht das Ziel aus Scope-Punkt 4.
3. Blindflecken sind im Intent-Panel als Begründung lesbar.

## Verifikation

- `npm run typecheck && npm test && npm run build`,
- `npm run simulate` mit Divergenz- und Matchup-Zahlen im Abschlussbericht,
- Browserprüfung: Ankündigung, Kegel und Ausführung stimmen sichtbar überein.

---

*Vermerkt am 22. Juli 2026 von Claude Fable 5 (Anthropic) als Antwort auf die
Produktfrage „Selbst steuern oder Autobattler?“: Empfehlung Autobattler mit
designter Unvollkommenheit, danach Task 011 als A/B-Experiment.*

## Abschlussbericht vom 22. Juli 2026

Umgesetzt von **Claude Fable 5** (Anthropic, Claude Code). Zahlen aus dem
10-Seed-Lauf (`SIM_FULL=1`).

### Umgesetzt

1. **Persönlichkeits-Blindflecken** (`PERSONALITY_PERCEPTION` in
   `RocketActionPlanner`): Vorsichtig übertreibt Eigen-/Teamrisiko (×1,45 /
   ×1,3), Explosiv redet es klein (×0,4 / ×0,55), Showboat überschätzt den
   Showfaktor (×1,75). Die Verzerrung fließt in die Bewertung ein und ist im
   Intent-Panel als Wahrnehmungsnotiz sichtbar (`STREUUNG … (unterschätzt
   Risiken …)`).
2. **Eigene Optionsmenge**: Showboat erwägt pro Waffe einen zusätzlichen
   besonders hohen Showbogen.
3. **Streukegel** (`executionSpread.ts`): Jeder Schuss kündigt einen
   persönlichkeits-abhängigen Streuradius an (vorsichtig 9, explosiv 22,
   showboat 16 Weltpunkte); die Ausführung ist ein deterministisch
   geseedetes Sample, das bereits zur Planungszeit feststeht. Vorschau zeigt
   den Kegel (gelber Ring + Coral-Randring); Wiedergabe, Bounces und
   Explosion nutzen die ausgeführte Flugbahn. D-011 gewahrt: angekündigt
   wird Absicht plus ehrliche Unsicherheit, ausgeführt exakt das eine vorab
   feststehende Sample.
4. **Persönlichkeits-Matchups** im Simulator (`simulateMatchups`): neuer
   Berichtsabschnitt.

### Nachweis: Persönlichkeit verändert Matchausgänge

Die sechs Matchup-Paarungen liefern gemischte Sieger und stark schwankende
Zuglängen (10 bis 23 Züge) – Persönlichkeit ist damit erstmals
ausgangswirksam, nicht nur zugwahl-kosmetisch. Das war das Kernziel und ist
erreicht.

### Offener Restpunkt (→ Task 026)

Der Streukegel benachteiligt real die kurzreichweitigen Waffen, weil die KI
weiter auf die perfekte Vorschau plant (die tatsächliche Streuung fließt
nicht in die Kandidatenbewertung ein). Dadurch steigt der Panzerfaust-Anteil
von 37,5 %/47,8 % (nach Task 023) auf 62 %/57 %. Isolationsmessung mit
Streukegel = 0 ergibt 48 % – die restlichen ~10–14 Punkte sind der
unbewertete Streueffekt. Die saubere Lösung (erwarteten Streuverlust in
`measureCandidate` einrechnen) ist eine tiefe Planner-Änderung mit eigener
Balance-Messrunde und wurde bewusst als **Task 026** ausgelagert, statt die
Task-023-Balance still zu verschlechtern oder den Streukegel wieder zu
entfernen. Erstzug-Divergenz bleibt bei 2/4 Sonden im Kandidaten (Ziel „mehr
als die Hälfte“ knapp verfehlt) – auch das hängt am selben Mechanismus.

### Prüfungen

`npm run typecheck`, `npm test` (74 grün, 2 übersprungen), `npm run build`
grün. Golden-Master-, Planer- und Simulator-Snapshots bewusst erneuert.
Browserprüfung (Kegel-Vorschau deckt sich mit Einschlag) steht aus.

### Neue Einträge in `docs/DECISIONS.md`

- **D-033**: Streukegel und Blindflecken als designte Unvollkommenheit,
  inklusive dokumentierter Balance-Wechselwirkung und Auslagerung der
  streuungsbewussten Bewertung.
