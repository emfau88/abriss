# Task 022: Zugdiagnose und Massen-Simulator

## Status

`in Arbeit`

## Ziel

Die headless Match-Engine aus Task 021 erhält auswertbare Zugdiagnosen und
einen deterministischen Massen-Simulator mit Kennzahlenbericht, damit die
offenen Balancefragen aus `docs/07_CORE_GAMEPLAY_REVIEW.md` (Waffendominanz,
Persönlichkeitsunterschiede, Zugvielfalt) messbar werden.

## Warum jetzt

Task 021 liefert Matches als reine Funktion über Seed und Konfiguration.
Ohne Diagnose und Aggregation bleibt aber unsichtbar, *warum* Figuren so
entscheiden und ob Waffen oder Persönlichkeiten degenerieren. Das Review
fordert genau diese Messbarkeit als Phasen A und C.

## Pflichtlektüre

- `AGENTS.md`
- `docs/07_CORE_GAMEPLAY_REVIEW.md` (Phasen A und C, Abnahmekriterien)
- `docs/DECISIONS.md` (D-012, D-029)
- `tasks/021_HEADLESS_MATCH_ENGINE.md` (Abschlussbericht)

## Voraussetzungen

- Task 021 umgesetzt; `npm run typecheck`, `npm test`, `npm run build` grün.

## Scope

### Teil A – Zugdiagnose

`src/simulation/match/turnDiagnostics.ts`: `diagnoseTurn(state, turnPlan)`
liefert einen serialisierbaren Datensatz pro Zug – aktive Figur, Team,
Persönlichkeit, Zugseed, Plan-Art, Manager-Einflüsse (Präferenz, Zwangswaffe,
verworfene Kandidaten), gewählte Bewegung mit Score sowie die bestplatzierten
Waffenkandidaten mit Score, Rang, stärkstem Pro-/Kontra-Faktor und
Ungültigkeitsgrund. `runMatch()` sammelt Diagnosen optional
(`collectDiagnostics`), ohne das bestehende Ereignisprotokoll zu verändern.

### Teil B – Massen-Simulator

`src/simulation/match/matchSimulator.ts`: `simulateMatches(scenarios)` führt
injizierte Szenarien (Karte × Seed als Zustandsfabrik) headless aus und
aggregiert pro Karte: Ausgänge, Zuglängen (Minimum/Median/Maximum),
Plan-Arten, Waffenanteile und -schaden der ausgeführten Angriffe,
Eigen-/Kameradentreffer, Out-of-world-Ausschaltungen sowie eine
Erstzug-Divergenzmessung über alle Eröffnungsfiguren × drei Persönlichkeiten.
`renderSimulationReport()` erzeugt daraus einen Markdown-Bericht.
Die Engine bleibt frei von `game/`- und Node-Importen; Szenarien liefert die
Testschicht (echte Karten über `src/testing/pngTerrain.ts`).

### Teil C – Zugang

- `npm run simulate` führt den Simulator aus und schreibt
  `reports/simulation-report.md` (deterministisch, eingecheckt),
- Standard-Testlauf nutzt eine kleine Matrix (2 Karten × 3 Seeds); die
  Umgebungsvariable `SIM_FULL=1` erweitert auf eine größere Matrix.

## Nichtziele

- keine Balance-Änderungen aufgrund der Messwerte in diesem Task,
- keine Änderung an Engine-Verhalten, Seeds oder Ereignisprotokoll,
- keine Visualisierung im Spiel-HUD, kein Replay-Viewer.

## Akzeptanzkriterien

1. Jeder Zug eines headless Matches besitzt auf Wunsch eine serialisierbare
   Diagnose mit Kandidatenrängen und Begründungsfaktoren.
2. Der Simulator läuft deterministisch: gleiche Szenarien ⇒ identischer
   Bericht (per Snapshot geprüft).
3. `reports/simulation-report.md` beantwortet nachvollziehbar: Wie oft
   gewinnt welches Team, wie lang sind Matches, welche Waffe dominiert,
   unterscheiden sich Persönlichkeiten im Erstzug?
4. Bestehende 69 Tests bleiben grün; das Determinismusprotokoll aus Task 021
   ist unverändert.

## Verifikation

- `npm run typecheck && npm test && npm run build`,
- `npm run simulate` erzeugt den Bericht reproduzierbar,
- Stichprobenkontrolle des Berichts gegen die Rohdaten eines Einzelmatches.

## Abschlussbericht

Der Bearbeiter berichtet Ergebnis, geänderte Dateien, Prüfungen, gemessene
Kernzahlen und neue Einträge in `docs/DECISIONS.md`.
