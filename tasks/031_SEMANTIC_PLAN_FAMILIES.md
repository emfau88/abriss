# Task 031: Semantische Planfamilien für „Lass das!“

## Status

`abgeschlossen`

## Ziel

Der einmalige Managerbefehl „Lass das!“ verwirft nicht nur eine konkrete
Kandidaten-ID, sondern die sichtbar gleiche Planfamilie. Der neu erklärte Plan
muss sich mindestens in Ziel, Waffe, Bewegungsbereich oder Einschlagsbereich
unterscheiden.

## Pflichtlektüre

- `AGENTS.md`
- `docs/01_PRODUCT_VISION.md`
- `docs/02_GAME_DESIGN.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/04_VERTICAL_SLICE.md`
- `docs/07_CORE_GAMEPLAY_REVIEW.md`
- `docs/DECISIONS.md`
- `tasks/004_AUTONOMOUS_ACTION_SLICE.md`
- `tasks/021_HEADLESS_MATCH_ENGINE.md`

## Scope

- reine, deterministische Familienkennung aus Ziel, Waffe,
  Bewegungsziel-Bereich und Einschlagspunkt-Bereich,
- Speichern der abgelehnten Familie im serialisierbaren Matchzustand,
- Familienfilter in der kombinierten Bewegungs-/Aktionsplanung,
- verständlicher Status beim Managerbefehl,
- Regressionstests für gleiche Familie, semantische Alternative,
  Determinismus und Zustandsbereinigung nach dem Zug.

## Nichtziele

- keine Auswahl aus drei Vorschlagskarten,
- kein delegierter Zielauftrag oder neuer Hybridmodus,
- keine neue Waffe, Kartenänderung oder Balancewertänderung,
- keine Änderung der Ballistik oder Zugauflösung,
- keine allgemeine Ähnlichkeits- oder Clustering-Engine.

## Akzeptanzkriterien

1. Flugzeit-/Winkelvarianten derselben Waffen-, Ziel-, Bewegungs- und
   Einschlagsfamilie werden gemeinsam verworfen.
2. Der Folgeplan stammt, sofern verfügbar, aus einer anderen semantischen
   Familie; sonst wird nachvollziehbar positioniert oder ausgesetzt.
3. Familienbildung und Replanung sind seed-deterministisch und rendererfrei.
4. Waffenbefehl und Zugabschluss löschen die temporäre Ablehnung wie bisher.
5. Typprüfung, relevante Tests, Gesamtsuite, Produktionsbuild und
   Browserprüfung bestehen.

## Verifikation

- `npm test -- src/simulation/match/planFamily.test.ts src/simulation/match/commands.test.ts`
- `npm run typecheck`
- `npm test`
- `npm run build`
- Browser: „Lass das!“ verwenden und alten/neuen Intent visuell vergleichen.

## Abschlussbericht

Abgeschlossen am 5. August 2026.

- `planFamily.ts` bildet eine deterministische Familie aus Ziel, Waffe,
  Bewegungsart/-raster und Einschlagsraster. Die Rastergröße von 120
  Weltpunkten fasst kleine Winkel- und Positionsvarianten zusammen, ohne
  sichtbar andere Ideen zu verschlucken.
- `rejectActivePlan` speichert Kandidaten-ID und Familienkennung. `planTurn`
  filtert auf der kombinierten Bewegungs-/Aktionsstufe, weil nur dort das
  Bewegungsziel bekannt ist.
- Diagnose und serialisierter Matchzustand enthalten die Familienkennung; ein
  Waffenbefehl und der Zugabschluss löschen sie wieder.
- Das UI benennt die verworfene Idee verständlich und kündigt ausdrücklich
  einen sichtbar anderen Plan an.
- Browserbefund: DIVA wechselte auf Sonneninseln von einem hohen
  Panzerfaustbogen gegen RIVALE C zu einem direkten Bogen gegen RIVALE A;
  Flugbahn, Ziel und Kamerarahmen änderten sich sichtbar. Keine Browserfehler.

Prüfungen: `npm run typecheck`, relevante Tests (10 bestanden), `npm test`
(121 bestanden, 2 übersprungen) und `npm run build`. Der Build meldet nur die
bekannte Phaser-Chunkgrößenwarnung.

Verbindliche Entscheidung: `docs/DECISIONS.md`, D-047.
