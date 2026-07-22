# Task 021: Headless Match-Engine extrahieren

## Status

`umgesetzt – Browserprüfung durch den Nutzer ausstehend` (zuvor: `bereit`)

## Ziel

Die fachliche Zug-Orchestrierung (Planung, Ausführung, Schaden, Terrainmutation,
Rückstoß, Fallauflösung, Zugwechsel, Matchende) wird aus `MatchScene.ts` in eine
rendererunabhängige, serialisierbare Match-Engine unter `src/simulation/match/`
verschoben, ohne das sichtbare Spielverhalten zu verändern.

## Warum jetzt

`docs/07_CORE_GAMEPLAY_REVIEW.md` benennt als größtes Produktrisiko, dass
vollständige Matches nur im Browser ablaufen können. Ohne headless Engine sind
weder Zugdiagnose noch automatische Diversitätstests noch belastbares Balancing
möglich. `MatchScene.ts` (rund 2 960 Zeilen) ist zugleich die einzige Datei, die
die Architekturregel „Simulation, Darstellung und UI bleiben getrennt“ verletzt.

## Pflichtlektüre

- `AGENTS.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md` (Simulationsmodell, Zeit und Determinismus, Zugabschluss)
- `docs/07_CORE_GAMEPLAY_REVIEW.md` (Phase B und Abnahmekriterien)
- `docs/DECISIONS.md`

## Voraussetzungen

- Tasks 001–020 abgeschlossen; `npm run typecheck`, `npm test`, `npm run build` grün.
- Die reinen Module `Ballistics`, `TerrainMask`, `ExplosionKnockback`,
  `TerrainFall`, `LocalMovementPlanner`, `RocketActionPlanner`, `matchState`
  bleiben unverändert nutzbar.

## Leitplanken für die Umsetzung

- **Ein Schritt = ein Commit.** Jeder Schritt endet mit grünem `typecheck`,
  `test`, `build` und – bei sichtbarem Verhalten – einer Browserprüfung.
- **Verhalten einfrieren, dann verschieben.** Kein Schritt ändert Balance,
  Seeds, Rundungen oder Reihenfolgen. Die Zugseed-Formel
  `launchConfig.seed + turnNumber * 9973` wird unverändert übernommen.
- **Kein Big-Bang-Rewrite.** `MatchScene` ruft die Engine schrittweise auf;
  Kamera, HUD, Touch-Input und VFX bleiben in dieser Aufgabe unberührt.

## Scope

### Schritt 0 – Sicherheitsnetz (Golden Master)

Ein Vitest-Szenariotest ruft die vorhandenen reinen Planer exakt so auf, wie
`MatchScene.replan()` es heute tut (gleiche Zugseed-Formel, gleiche
Waffenlisten-Logik inklusive Präferenz- und Zwangswaffenfällen), und friert für
beide Karten × jede mögliche Eröffnungsfigur × mehrere Seeds die gewählte
Bewegung, Waffe, Kandidaten-ID und den Score als Snapshot ein. Dieser Test
pinnt das Planungsverhalten vor jeder Verschiebung fest.

### Schritt 1 – Serialisierbarer Simulationszustand

Neues Modul `src/simulation/match/matchSimulationState.ts`:

- fasst zusammen, was heute verstreut in der Szene liegt: `MatchState`,
  Figurendaten (Position, Persönlichkeit, HP), Referenz auf die Terrainmaske,
  Seed sowie Manager-Flags (`rejectedCandidateIds`, `interventionUsed`,
  `weaponCommandUsed`, `forcedWeaponId`, Waffenpräferenzen und deren Verbrauch),
- reine Erzeugungsfunktion aus `MatchLaunchConfig` + Kartenkatalog,
- keine Phaser-Importe, keine Systemzeit.

`UnitView` in der Szene verweist danach auf diese Daten, statt `hitPoints` und
`worldPosition` selbst zu besitzen.

### Schritt 2 – Planung extrahieren

`src/simulation/match/planTurn.ts`: verschiebt die Logik aus
`MatchScene.replan()` (Bewegungskandidaten, kombinierte Bewertung, Präferenz-
Fallback, Übersprung-Erkennung) in eine reine Funktion
`planTurn(state) → TurnPlan`. Der `TurnPlan` enthält Bewegungs- und Waffenplan,
den Grund eines reinen Positions- oder Leerlaufzugs und die Statusmeldung als
Daten. Die Szene rendert nur noch. Der Golden-Master aus Schritt 0 läuft
zusätzlich gegen `planTurn` und muss identische Ergebnisse liefern.

### Schritt 3 – Auflösung extrahieren

`src/simulation/match/resolveTurn.ts`: verschiebt die fachlichen Anteile aus
`completeAction`, `applyPredictedDamage`, `createKnockbackAnimations`,
`resolveFallsAfterTerrainChange`, `scheduleTurnAdvance` und `finishMatch` in
eine reine Funktion `resolveTurn(state, turnPlan) → { state, events }`.

Ereignisse mindestens: `movementResolved`, `projectileResolved` (mit
Trajektorien-Samples), `terrainMutated` (mit Mutationsdaten für den Renderer),
`damageApplied`, `knockbackResolved` (mit Samples), `fallsResolved`,
`turnAdvanced`, `matchEnded`, `turnSkipped`. Die Szene konsumiert die
Ereignisse und spielt die bereits enthaltenen Samples als Animation ab; die
Schadensrundung `Math.round(calculateBlastDamage(...))` wandert unverändert mit.

### Schritt 4 – Managerkommandos als Engine-Kommandos

„Lass das!“, der einmalige Waffenbefehl und der Persönlichkeitswechsel werden
typisierte Kommandos gegen den Simulationszustand
(`rejectPlan`, `forceWeapon`, `cyclePersonality`). Die Szene reicht nur noch
Eingaben durch.

### Schritt 5 – Headless-Match-Beweis

`src/simulation/match/runMatch.ts`: führt `planTurn`/`resolveTurn` in einer
Schleife bis zum Matchausgang aus. Zwei Szenariotests:

1. Determinismus: derselbe Seed erzeugt in zwei Läufen ein identisches
   Ereignisprotokoll,
2. Eröffnungen: auf jeder unterstützten Karte findet jede mögliche aktive
   Figur im ersten Zug einen Plan oder einen begründeten Positionszug
   (Moki-Regressionsfall aus dem Review).

## Nichtziele

- keine Änderung an Balance, Waffenwerten, Seed-Verhalten oder KI-Bewertung,
- keine Zugdiagnose-Ausgabe und kein Massen-Simulator (Folgeaufgabe, Review
  Phasen A und C),
- kein Umbau von Kamera, HUD, Touch-Gesten, VFX oder Manager-Szenen,
- keine neue Persistenz und kein Replay-Format über das Ereignisprotokoll hinaus.

## Akzeptanzkriterien

1. `src/simulation/match/` enthält Zustand, `planTurn`, `resolveTurn`,
   Kommandos und `runMatch` ohne Phaser-, DOM- oder Zeitimporte.
2. Der Golden-Master aus Schritt 0 ist über alle Schritte hinweg unverändert
   grün.
3. Ein vollständiges Match läuft in Vitest ohne Browser bis zum Ergebnis;
   derselbe Seed liefert ein identisches Ereignisprotokoll.
4. Jede Eröffnungsfigur besitzt auf jeder Karte einen automatisch geprüften
   ersten Zug.
5. `MatchScene` enthält keine eigene Schadens-, Terrainmutations-, Fall- oder
   Zugwechsel-Logik mehr, sondern konsumiert Zustand und Ereignisse.
6. Ein manuell gespieltes Match auf beiden Karten verhält sich im Browser
   sichtbar wie vor dem Umbau (Planvorschau, Einschlag, Rückstoß, Fallen,
   Zugwechsel, Matchende, Managerkommandos).

## Verifikation

- `npm run typecheck && npm test && npm run build` nach jedem Schritt,
- Browserprüfung nach den Schritten 1, 3, 4: je ein Match auf Sonneninseln und
  Space-Resort mit `R`-Neustart, „Lass das!“, Waffenbefehl und Matchende,
- Seed und Ereignisprotokoll eines Beispielmatches im Abschlussbericht.

## Abschlussbericht

Der Bearbeiter berichtet:

1. umgesetztes Ergebnis je Schritt,
2. geänderte Dateien,
3. ausgeführte Prüfungen und Resultate,
4. bekannte Einschränkungen (insbesondere bewusst in der Szene verbliebene
   Darstellungslogik),
5. neuer Eintrag in `docs/DECISIONS.md` zur Engine-Grenze
   (`simulation/match` als einzige Autorität für Zugverlauf).

## Abschlussbericht vom 22. Juli 2026

Bearbeitet und verfasst von **Claude Fable 5** (Anthropic, Claude Code).
Alle fünf Schritte wurden in dieser Sitzung umgesetzt, je Schritt ein Commit
mit grünem `typecheck`, `test` und `build`.

### 1. Umgesetztes Ergebnis je Schritt

- **Schritt 0** (`c2ca53f`): Golden-Master-Test friert das Planungsverhalten
  von `MatchScene.replan()` ein – beide Karten × vier Eröffnungsfiguren ×
  zwei Seeds × vier Managerfälle = 64 Snapshot-Fälle, alle mit echten Plänen.
  Dazu `src/testing/pngTerrain.ts`: PNG-Decoder auf Node-Bordmitteln, der die
  echten Terrainkarten headless in `BinaryTerrainMask` übersetzt.
- **Schritt 1** (`0f9c316`): `matchSimulationState.ts` bündelt Figuren,
  MatchState, Terrain, Seed und Manager-Flags; `game/session/matchSetup.ts`
  baut die Figurendefinitionen aus der `MatchLaunchConfig`. `UnitView`
  referenziert die Simulationseinheit statt eigener HP/Positionen.
- **Schritt 2** (`2614a86`): `planTurn()` ersetzt die Planungslogik der Szene;
  der Golden-Master bestätigt alle 64 Fälle als identisch.
- **Schritt 3** (`2fedd68`): `resolveTurn()` liefert das Ereignisprotokoll
  (Bewegung, Projektil, Terrainmutation, Schaden, Rückstoß, Fälle),
  `concludeTurn()` den Zugwechsel. Die Szene spielt nur noch Ereignisse ab;
  Tweens schreiben ausschließlich Container.
- **Schritt 4** (`b862a1a`): Managerkommandos als Engine-Funktionen mit vier
  neuen Tests (Einmaligkeit, Kandidaten-Reset, Persönlichkeitszyklus,
  Ablehnung im Rivalenzug).
- **Schritt 5** (`07f3be3`): `runMatch()` läuft headless bis zum Ausgang.
  Szenariotests: Determinismus (identisches Protokoll bei gleichem Seed) und
  spielbare Eröffnung für jede Figur auf jeder Karte.

### 2. Geänderte Dateien (Kern)

Neu: `src/simulation/match/{matchSimulationState,planTurn,resolveTurn,commands,runMatch}.ts`,
`src/simulation/match/{planningGoldenMaster,commands,runMatch}.test.ts`,
`src/game/session/matchSetup.ts`, `src/testing/pngTerrain.ts`.
Geändert: `src/game/scenes/MatchScene.ts` (konsumiert Zustand/Ereignisse),
`src/content/maps/terrainMaskFromImage.ts` (Schwellwert exportiert),
`tsconfig.json` (+`node`-Types), `package.json` (+`@types/node`, dev).

### 3. Ausgeführte Prüfungen und Resultate

- `npm run typecheck`, `npm test`, `npm run build` nach jedem Schritt grün;
  Endstand 69 Tests in 19 Dateien.
- Golden-Master: `planTurn()` reproduziert alle 64 eingefrorenen Fälle exakt.
- Headless-Referenzlauf Seed 21072026: Sonneninseln → Sieg der Rivalen nach
  29 Zügen (Überlebender `rival-3`), Space-Resort → Sieg der Crew nach
  17 Zügen (`crew-slime`, `crew-ghost`); alle Züge Angriffe, kein Aussetzer.
- Determinismus: zwei Läufe je Karte liefern byte-identische
  Ereignisprotokolle und Endzustände.

### 4. Bekannte Einschränkungen

- Die im Task geforderte **Browserprüfung (Kriterium 6) steht noch aus** –
  diese Sitzung lief ohne Browserzugriff. Bitte je ein Match auf beiden
  Karten mit `R`-Neustart, „Lass das!“, Waffenbefehl, `P` und Matchende
  prüfen; danach kann der Status auf `abgeschlossen` wechseln.
- Headless-Terrainmasken mitteln den Alpha-Wert je Zellblock statt des
  Canvas-Downscalings des Browsers; einzelne Randzellen können abweichen
  (fachlich dokumentiert in D-029).
- Bewusste Abweichung: Figuren außerhalb der Welt werden bei der
  Fallauflösung übersprungen statt eine Exception auszulösen (latenter
  Absturz der alten Szene nach Out-of-world-Ereignissen).
- Kamera, HUD, VFX und Touch blieben unverändert (Nichtziele).

### 5. Neue Einträge in `docs/DECISIONS.md`

- **D-029**: `simulation/match` als einzige Autorität über den Zugverlauf,
  inklusive Headless-Terrain-Verfahren und dokumentierter Abweichungen.
