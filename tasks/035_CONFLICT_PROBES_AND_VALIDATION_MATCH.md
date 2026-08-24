# Task 035: Konfliktsonden und spielbares Validierungsmatch

## Status

`abgeschlossen`

## Ziel

Kleine deterministische Situationen machen Eigen-/Teamrisiko, Kettenwirkung,
Geländeöffnung und Ring-out messbar; ein kurzes Konfliktmatch stellt dieselbe
Kernloop-Frage mit Auto, Zielauftrag und Direkt im Browser spielbar bereit.

## Warum jetzt

Die bisherigen Eröffnungen erzeugen trotz verschiedener Planfamilien kaum
Risikoereignisse. Persönlichkeits- und Waffenrollen lassen sich deshalb nicht
fair beurteilen. Weitere Gewichte oder eine dritte Vollkarte wären vor
gezielten Konfliktsituationen unbegründet.

## Pflichtlektüre

- `AGENTS.md`
- `docs/01_PRODUCT_VISION.md`
- `docs/02_GAME_DESIGN.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/04_VERTICAL_SLICE.md`
- `docs/07_CORE_GAMEPLAY_REVIEW.md`
- `docs/DECISIONS.md`
- `tasks/022_TURN_DIAGNOSTICS_AND_MASS_SIMULATOR.md`
- `tasks/028_INTERACTIVE_OBJECTS_SLICE.md`
- `tasks/032_PLAN_FAMILY_DIVERSITY_REPORT.md`
- `tasks/034_DELEGATED_TARGET_HYBRID.md`

## Scope

- rendererfreie Szenariofabriken für Teamrisiko, Fasskette, Geländetor und
  Ring-out-Kante,
- Erstzugmessung für alle drei Persönlichkeiten mit erwarteten und tatsächlich
  aufgelösten Folgen,
- deterministischer Abschnitt im bestehenden Simulationsbericht,
- ein kuratiertes `KERNLOOP-TEST`-Match auf vorhandener Karte mit enger
  Konfliktzone und Fasscluster,
- derselbe Menü-Steuerungsmodus gilt für Auto, Zielauftrag und Direkt,
- Tests für Szenarien, Bericht und Matchkonfiguration.

## Nichtziele

- keine dritte Vollkarte oder allgemeine Szenario-Engine,
- keine Balancewertänderung anhand eines einzelnen Probes,
- keine Telemetrie oder externe Datenspeicherung,
- keine Integration der ActionMap-Kette in Standardkarten,
- kein Ersatz für echte externe Spieltests.

## Akzeptanzkriterien

1. Jede Sonde erzeugt deterministisch einen gültigen, benannten Plan oder eine
   fachlich begründete Positionierung.
2. Der Bericht zeigt pro Persönlichkeit Waffe, Ziel, Risiko-, Ketten- und
   Terrainwerte sowie tatsächliche Selbst-/Team-/Ring-out-Folgen.
3. Mindestens zwei Sonden aktivieren zuvor fast immer null bleibende Risiko-
   oder Kettenmetriken.
4. Das Konfliktmatch startet aus dem Hauptmenü und nutzt die sichtbare
   Auto-/Zielauftrag-/Direktwahl.
5. Die Standardkarten und Standard-Balancematrix bleiben unverändert.
6. Typprüfung, Tests, Build und Browserprüfung bestehen.

## Verifikation

- `npm test -- src/simulation/match/conflictScenarios.test.ts src/game/session/matchSession.test.ts`
- `npm run simulate`
- `npm run typecheck`
- `npm test`
- `npm run build`
- Browser: Konfliktmatch in Auto und Zielauftrag, erste Aktion ausführen

## Abschlussbericht

Abgeschlossen am 24. August 2026.

- Vier kleine rendererfreie Sonden decken Teamrisiko, Fasskette,
  Geländeöffnung und Ring-out-Kante ab. Sie werden für alle drei
  Persönlichkeiten sowohl frei autonom als auch mit Zielauftrag ausgewertet.
- `npm run simulate` schreibt die 24 reproduzierbaren Ergebnisse einschließlich
  erwarteter und tatsächlich aufgelöster Folgen in den bestehenden Bericht.
- Die Konflikte werden messbar: Der Zielauftrag auf den riskanten Gegner
  erzeugt tatsächlichen Freundschaden; die Fasssonde zündet zwei Fässer und
  entfernt deutlich Terrain. Freies Auto wählt in derselben Lage häufig einen
  sicheren Gegner. Das trennt Situationsauswahl von fehlender Wirkungslogik.
- `KERNLOOP-TEST · KONFLIKTZONE` startet ein isoliertes Kurzmatch mit enger
  Aufstellung und drei Fässern. Es übernimmt denselben sichtbaren Modus wie der
  Standard-Manager und verändert dessen Konfiguration nicht.
- Bewusst erfolgte kein Gewichtetuning: In der Geländetor-Sonde bleibt die
  Rakete attraktiver als der Geländebrecher; auch die Waffenrollen der drei
  Persönlichkeiten sind noch nicht klar genug getrennt. Das ist ein Ergebnis
  für den externen Vergleich, kein verdeckter Abnahmefehler.

Prüfungen: fokussierte Szenario- und Sessiontests, vollständiger Simulator,
Gesamtsuite (128 bestanden, 2 übersprungen), Typprüfung, Produktionsbuild und
Browserprüfung des Konfliktmatches in Auto und Zielauftrag. Der finale Stand
wird nach der Dokumentationsrunde noch einmal vollständig geprüft.

Verbindliche Entscheidung: `docs/DECISIONS.md`, D-051.
