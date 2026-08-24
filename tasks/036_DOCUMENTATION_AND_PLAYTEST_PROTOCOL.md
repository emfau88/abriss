# Task 036: Projektdokumentation und externer Kernloop-Test

## Status

`abgeschlossen`

## Ziel

Die verbindliche Dokumentation beschreibt den tatsächlich spielbaren Stand.
Ein kurzes, wiederholbares Protokoll macht Auto, Zielauftrag und Direkt mit
externen Testspielern vergleichbar.

## Warum jetzt

Die drei Kontrollvarianten und eine konfliktstarke Testlage sind technisch
vorhanden. Weitere Systeme oder Balanceänderungen wären ohne Beobachtungen von
Menschen erneut eine Entscheidung aus interner Simulation allein.

## Pflichtlektüre

- `AGENTS.md`
- `docs/00_PROJECT_INDEX.md`
- `docs/01_PRODUCT_VISION.md`
- `docs/02_GAME_DESIGN.md`
- `docs/04_VERTICAL_SLICE.md`
- `docs/05_ROADMAP.md`
- `docs/07_CORE_GAMEPLAY_REVIEW.md`
- `docs/DECISIONS.md`
- `tasks/033_PROGRESSIVE_ASSET_LOADING.md`
- `tasks/034_DELEGATED_TARGET_HYBRID.md`
- `tasks/035_CONFLICT_PROBES_AND_VALIDATION_MATCH.md`

## Scope

- README, Projektindex, Design-, Architektur-, Slice-, Roadmap- und Art-Stand
  auf die implementierte Fassung aktualisieren,
- ein kompaktes moderiertes A/B/C-Protokoll für Auto, Zielauftrag und Direkt,
- klare Beobachtungsfragen und Entscheidungstor,
- keine Änderung der Simulation oder Balance.

## Akzeptanzkriterien

1. Kader, Animationsstandard, Ladeweg und drei Kontrollmodi sind korrekt
   beschrieben.
2. Das Protokoll lässt sich ohne Kenntnis des Chatverlaufs durchführen.
3. Ergebnisse aller Modi werden vergleichbar erfasst.
4. Weitere Produktion bleibt bis zum externen Produktsignal gesperrt.
5. Dokumentlinks und Produktionsbuild funktionieren.

## Abschlussbericht

Abgeschlossen am 24. August 2026.

- Alle verbindlichen Statusdokumente und die öffentliche README wurden auf den
  tatsächlich geprüften Build aktualisiert.
- `docs/08_PLAYTEST_PROTOCOL.md` definiert einen gegenbalancierten Test mit
  Zielgröße zehn Personen, denselben Konfliktsituationen und einer kleinen
  gemeinsamen Bewertungsmatrix.
- Das Entscheidungstor macht ausdrücklich keinen Modus vorab zum Gewinner.
  Ein Produktwechsel zur dauerhaften Direktsteuerung benötigt ein deutliches
  externes Signal und eine neue dokumentierte Entscheidung.

Verbindliche Entscheidung: `docs/DECISIONS.md`, D-052.
