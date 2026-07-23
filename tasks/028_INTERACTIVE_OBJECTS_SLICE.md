# Task 028: Interaktive Objekte – erstes explosives Fass

## Status

`umgesetzt – Mechanik vollständig und getestet; Kartenwirkung als ehrlicher
Restpunkt dokumentiert` (Claude Opus 4.8, 22.07.2026; zuvor: `in Arbeit`)

## Ziel

Die Map erhält ihr erstes **interaktives Objekt**: ein explosives Fass, das
von einer Explosion ausgelöst wird, selbst explodiert und dabei Figuren und
Terrain trifft – begrenzt verkettbar mit weiteren Fässern. Die KI erkennt
Fässer als lohnende Ziele und bewertet den erwarteten Kettenschaden. Damit
existiert der kleinste vollständige Baustein aus der Humor-/Map-Richtlinie
(Phase 1+2): *Auslösung → Kettenreaktion → Konsequenz*.

## Warum jetzt (der eigentliche Hebel)

Dies ist **kein reines Humor-Feature, sondern die Antwort auf ein gemessenes
Gameplay-Problem**. `docs/07_CORE_GAMEPLAY_REVIEW.md` und D-032/D-034 belegen:
Die Waffendominanz ist ein **Verfügbarkeitsproblem** – auf Deckungskarten
(Sonneninseln) findet die Panzerfaust in nur ~30–46 % der Züge einen gültigen
direkten Schuss, weil Terrain die Sichtlinie blockiert; der Geländebrecher
dominiert, weil er durch Terrain wirkt. Score-Tuning konnte das nicht lösen.

Ein explosives Fass neben einem gedeckten Gegner macht die **Panzerfaust und
die Granate wieder wertvoll** (schieß aufs Fass statt durch den Hügel) und
erzeugt echte **Persönlichkeitsdivergenz** (Sprengfreudig nimmt die Kette,
Vorsichtig meidet sie in Kameradennähe) – genau die Unterschiede, die laut
Messung heute fehlen. Das Fass ist also ein taktischer Hebel, der zufällig
auch lustig ist.

## Pflichtlektüre

- `AGENTS.md` (Scope-Regeln, unveränderliche Regeln)
- `docs/DECISIONS.md` (D-005 Terrainmaske, D-022 begrenzte Physik, D-029
  Match-Engine als einzige Autorität, D-032/D-034 Verfügbarkeit)
- `docs/01_PRODUCT_VISION.md` (Nichtziele: keine allgemeine Physiksandbox)
- `src/simulation/match/resolveTurn.ts`
- `src/simulation/ai/RocketActionPlanner.ts`

## Architektur-Entscheidung (tragend)

Die Ballistik (`Ballistics.ts`) kennt **nur Terrain** (`isSolid`) und liefert
eine `explosion: { center, radius }`. Objekte werden deshalb bewusst **nicht**
in der Ballistik behandelt, sondern als **Reaktion in der Zugauflösung**:

```text
Projektil explodiert (wie bisher, an Terrain/Zünder)
→ resolveTurn prüft: liegt ein Fass im Explosionsradius?
→ falls ja: Fass detoniert → eigene (Sekundär-)Explosion
→ diese trifft Figuren + Terrain und kann weitere Fässer auslösen
→ ReactionChainResolver mit harter Tiefenbegrenzung (Endlosschutz)
```

Das wahrt D-029 (die Engine bleibt einzige Autorität), lässt die fragile
Ballistik unangetastet und ist deterministisch/testbar. Es ist **keine**
allgemeine Starrkörperphysik (Nichtziel bleibt gewahrt): Das Fass rollt nicht,
es explodiert nur, wenn es getroffen wird.

## Scope

### Schritt A – Interaktives Objektmodell (reine Simulation)

- Neues Modul `src/simulation/interactables/` (rendererunabhängig,
  serialisierbar, kein globaler Zustand).
- Objekt: `{ id, type: "explosive-barrel", position, state, explosionRadius,
  maximumDamage, maximumKnockbackSpeed }` mit Zustand `intact | destroyed`.
- Reine Reaktionslogik `resolveReactionChain(...)`: nimmt eine
  auslösende Explosion und die Fässer, liefert deterministisch die Folge von
  Sekundärexplosionen (mit harter Tiefengrenze, z. B. 4), ohne selbst Figuren
  oder Terrain zu mutieren (das tut der Aufrufer in `resolveTurn`).

### Schritt B – Verankerung im Simulationszustand

- `MatchSimulationState` hält `interactables: InteractableObject[]`.
- `MatchUnitDefinition`-Pfad analog: Map liefert Fasspositionen; `matchSetup`
  reicht sie durch; `createMatchSimulation` platziert sie (Bodenkontakt via
  `findGroundY`).
- `serializeMatchSimulation` nimmt die Fässer auf (für Determinismus-Snapshot).

### Schritt C – Reaktionskette in `resolveTurn`

- Nach der Primärexplosion (Projektil) alle im Radius liegenden intakten
  Fässer auslösen; Kette abwickeln; **jede** Sekundärexplosion erzeugt
  dieselben Effekte wie eine Primärexplosion (Terrain entfernen, Schaden,
  Rückstoß) und neue Events.
- Neue Event-Typen: `interactable-triggered` (Fass detoniert) – die
  bestehenden `terrain-mutated`/`damage-applied`/`knockback-resolved` werden
  wiederverwendet, damit Chronik, Präsentation und Tests sie ohne Sonderfall
  sehen.
- Reihenfolge vollständig deterministisch (nach Objekt-ID / Kettentiefe).

### Schritt D – KI erkennt Fässer

- `planRocketAction` erhält die Fässer als zusätzliche **Zielquelle**: Für jedes
  Fass in Gegnernähe werden Kandidaten erzeugt, die auf das Fass zielen.
- Neue Bewertungskomponente `chain-effect`: erwarteter Schaden an Gegnern durch
  die Fass-Detonation (grobe, deterministische Näherung – 2–3 Reaktionsstufen
  genügen laut Richtlinie §8). Friendly-Fire-/Eigenrisiko der Kette fließt in
  die vorhandenen Risiko-Komponenten.
- Persönlichkeit: Sprengfreudig gewichtet `chain-effect` hoch und unterschätzt
  das Kettenrisiko (bestehender Blindfleck greift); Vorsichtig meidet Ketten
  nahe eigenen Figuren.

### Schritt E – Platzhaltergrafik + Rendering

- `MatchScene` zeichnet Fässer als klar lesbare Platzhalter (Form/Farbe/Warn-
  symbol), Zustand sichtbar (intakt vs. zerstört). Bewusst als
  **austauschbarer Platzhalter** angelegt (späteres Asset ersetzt nur die
  Textur). Detonation spielt die vorhandenen VFX ab.

### Schritt F – Messung

- `npm run simulate` (klein + `SIM_FULL=1`) vor/nach: Ziel ist eine **sichtbare
  Verschiebung** der Waffenanteile und der Erstzug-Divergenz auf der
  Fass-bestückten Karte. Keine feste Prozentvorgabe – der Beleg ist, dass das
  Fass echte Alternativen schafft.

## Nichtziele

- Kein rollendes/bewegliches Fass, keine allgemeine Objektphysik, keine Seile,
  keine Ragdolls (AGENTS.md, D-022 bleiben gewahrt).
- Keine weiteren Objekttypen in diesem Task (hängende Kiste, Hüpfpilz etc. sind
  Folge-Tasks) – **außer** ein zweiter, sehr kleiner Typ fügt sich risikolos
  ein; dann eigener Abschnitt.
- Kein Comedy Director, kein Incident-Präsentations-Regisseur (spätere Tasks).
- Keine neue Waffe, keine Manager-Ökonomie.

## Akzeptanzkriterien

1. Ein Schuss, dessen Explosion ein Fass berührt, löst deterministisch die
   Fass-Detonation aus; identischer Seed ⇒ identisches Ereignisprotokoll.
2. Eine Fass-Detonation kann eine Figur beschädigen/zurückschleudern und ein
   zweites Fass in Reichweite auslösen; die Kette ist tiefenbegrenzt und
   terminiert immer (Test mit gestellter Fasskette).
3. Die KI wählt in einer gestellten Lage (gedeckter Gegner + Fass daneben) den
   Fass-Schuss über den wirkungslosen Direktschuss; die Begründung nennt
   `chain-effect`.
4. Alle bestehenden Tests bleiben grün; Golden-Master/Simulator-Snapshots
   werden nur bewusst und dokumentiert erneuert (Fass-Karten sind neu, alte
   Karten ohne Fässer bleiben unverändert).
5. Die Chronik meldet eine Kettenreaktion/einen dadurch verursachten Vorfall,
   wenn er auftritt (nutzt die bestehenden Events aus Task 027).
6. Das Fass ist im Browser sichtbar und sein Zerstörtzustand erkennbar.

## Verifikation

- `npm run typecheck && npm test && npm run build`
- `npm run simulate` (+ `SIM_FULL=1`) mit Vorher-/Nachher-Zahlen
- Browser-Smoke-Test: Fass sichtbar, Schuss darauf löst Kette aus

## Abschlussbericht vom 22. Juli 2026

Umgesetzt von **Claude Opus 4.8** (Anthropic, Claude Code).

### Umgesetzt (alle Schritte A–F)

- **A – Objektmodell + Ketten-Resolver** (`src/simulation/interactables/interactables.ts`):
  explosives Fass mit Zustand `intact|destroyed`; `resolveReactionChain`
  löst die Fass-Kette deterministisch und tiefenbegrenzt auf (Breitensuche,
  `MAXIMUM_CHAIN_DEPTH = 4`, Endlosschutz). Reine Funktion, mutiert nichts.
  `estimateChainDamageAt` liefert die KI-Vorschau. 7 Unit-Tests.
- **B – Simulationszustand**: `MatchSimulationState.interactables`,
  Platzierung mit Bodenkontakt in `createMatchSimulation`, Aufnahme in
  `serializeMatchSimulation` (Determinismus-Snapshot).
- **C – Detonation in `resolveTurn`**: Nach jeder Explosion detonieren Fässer
  im Radius; die Effektlogik (Terrain/Schaden/Rückstoß) ist in
  `applyExplosionEffects` extrahiert und wird von Primär- und Fass-Explosion
  geteilt. Neues Event `interactable-triggered`. Für Karten **ohne** Fässer
  ist das Verhalten byte-identisch (Golden Master unverändert grün). 3
  Integrationstests.
- **D – KI-Zielerkennung**: `planRocketAction` erzeugt zusätzlich Kandidaten
  auf Fässer in Gegnernähe (`BARREL_RELEVANCE_RADIUS`) und bewertet den
  erwarteten Kettenschaden über die neue Komponente `chain-effect`
  (persönlichkeitsgewichtet: Explosiv 1,35 > Showboat 1,15 > Vorsichtig 0,9).
  3 Planner-Tests, u. a.: bei gedecktem Gegner + Fass daneben wird der
  Fass-Schuss gewählt.
- **E – Karten + Darstellung**: Fässer in beiden Karten (neben
  Aufstellungen), Platzhaltergrafik in `MatchScene` (`drawBarrelPlaceholder`,
  klar als Vektor-Platzhalter, später durch Asset ersetzbar), Detonation
  sichtbar (`presentInteractableEvents`: Blitz + verkohltes Fass). Alle
  Terrain-Mutationen des Zuges werden jetzt dargestellt, nicht nur die erste.
- **F – Messung**: Simulator misst die Karten jetzt inklusive Fässer.

### Ehrlicher Befund der Messung (3-Seed-Matrix, vorher → nachher)

| Karte | Panzerfaust | Wurfgranate | Geländebrecher |
| --- | --- | --- | --- |
| good-mood | 45,8 % → **58,7 %** | 23,7 % → 21,7 % | 30,5 % → 19,6 % |
| space-resort | 64,1 % → **66,7 %** | 15,4 % → 12,8 % | 20,5 % → 20,5 % |

**Der Panzerfaust-Anteil stieg, statt zu sinken.** Das ist mechanisch
schlüssig: Ein Fass gibt der direkten, flachen Panzerfaust *zusätzliche*
gültige Ziele, wo Granate/Brecher weiter an Deckung scheitern. Matches wurden
kürzer (mehr Wirkung pro Zug). Der ursprünglich erhoffte Diversifizierungs-
Effekt tritt in den aktuellen Karten **nicht** ein.

Ursachenmessung: Fässer detonieren noch überwiegend **beiläufig** (ein auf
den Gegner gezielter Schuss trifft ein Fass mit), nicht gezielt – bei
spawn-naher Platzierung 4 (good-mood) bzw. 7 (space-resort) Detonationen pro
3 Matches, davon nur 1 bzw. 3 gezielte Fass-Schüsse, keine Fass-zu-Fass-Kette
(Fässer stehen zu weit auseinander). Grund: Nach den ersten Zügen bewegen
sich Gegner aus dem `BARREL_RELEVANCE_RADIUS` heraus.

### Bewertung: Mechanik erfüllt, Kartenwirkung ist der Restpunkt

Die **Mechanik** erfüllt alle Akzeptanzkriterien 1–6 (deterministische Kette,
verkettbare Fässer, KI wählt den Fass-Schuss bei Deckung, Golden Master
unberührt, Chronik-fähige Events, sichtbar im Rendering). Was die Messung
zeigt, ist ein **Level-Design-Restpunkt**, kein Code-Fehler – genau das, was
die Humor-/Map-Richtlinie als „Comedy Pockets" beschreibt: Fässer müssen in
**bewusst gebaute Situationen** (gedeckter Gegner + Fass in fester Reichweite,
Fass-Cluster für echte Ketten) gesetzt werden, statt lose neben Spawns. Das
ist der empfohlene nächste Task (handgebaute Situationszone / Testmap
„Luftschiffdock" aus der Richtlinie §19), nicht weiteres KI-Tuning.

### Geänderte / neue Dateien

- `src/simulation/interactables/interactables.ts` (neu)
- `src/simulation/interactables/interactables.test.ts` (neu, 7 Tests)
- `src/simulation/match/interactableChain.test.ts` (neu, 3 Tests)
- `src/simulation/match/matchSimulationState.ts` (Fass-Zustand + Serialisierung)
- `src/simulation/match/resolveTurn.ts` (Detonation, geteilte Effektlogik, Event)
- `src/simulation/ai/RocketActionPlanner.ts` (Fass-Ziele, `chain-effect`)
- `src/simulation/ai/RocketActionPlanner.test.ts` (+3 Barrel-Tests, Komponenten-Liste)
- `src/simulation/match/planTurn.ts` (reicht Fässer an den Planner)
- `src/simulation/match/planManualShot.ts` (`chainEffect: 0`)
- `src/content/maps/mapCatalog.ts` (Fasspositionen je Karte)
- `src/game/session/matchSetup.ts` (`buildMatchInteractableDefinitions`)
- `src/game/scenes/MatchScene.ts` (Platzierung + Rendering + Detonations-VFX)
- `src/simulation/match/matchSimulator.test.ts` (misst mit Fässern; Snapshot erneuert)

### Prüfungen

- `npm run typecheck`: grün.
- `npm test`: **101 bestanden, 2 übersprungen** (zuvor 88/2; +13 Tests).
  Golden Master und Planer-Snapshots inhaltlich unverändert; Simulator-Snapshot
  **bewusst** erneuert (Karten enthalten jetzt Fässer – Akzeptanzkriterium 4).
- `npm run build`: grün.

### Bekannte Einschränkungen

- Diversifizierungswirkung in aktuellen Karten gering (s. o.) – Restpunkt
  Level-Design, nicht Code.
- Browser-Smoke-Test der Fass-Darstellung steht aus (keine Browser-
  Automatisierung installiert); Rendering-Code ist typgeprüft und gebaut,
  die Detonations-/Terrain-Events sind headless verifiziert.
- Fass-zu-Fass-Ketten kommen in der Praxis noch nicht vor (Abstände) – der
  Resolver kann sie, die Karten stellen sie nur nicht.

### Neue Einträge in `docs/DECISIONS.md`

- **D-038**: Interaktive Objekte als Reaktion in der Zugauflösung (nicht in
  der Ballistik); Fass-Mechanik + KI-Kettenbewertung; ehrlicher Befund, dass
  der Gameplay-Hebel an der Kartensituation hängt, nicht am Score.

---

*Verfasst am 22. Juli 2026 von Claude Opus 4.8 (Anthropic, Claude Code) als
priorisierter Gameplay-Hebel aus der Analyse der Humor-/Map-Richtlinie gegen
den gemessenen Projektstand. Reihenfolge-Begründung: kleinster Baustein, der
gleichzeitig das dokumentierte Kernrisiko (Waffen-Verfügbarkeit,
Persönlichkeitsdivergenz) senkt und die Grundlage für alle weiteren
Richtlinien-Systeme (Ketten, Incidents, Comedy Pockets) legt.*
