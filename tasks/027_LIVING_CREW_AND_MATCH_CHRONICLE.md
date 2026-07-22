# Task 027: Lebendige Crew und Einsatz-Chronik

## Status

`Entwurf`

## Ziel

Die Manager-Ebene erzeugt und erinnert Geschichten: Ein Match liefert 2–3
benannte Schlüsselmomente, der Einsatzbericht erzählt sie, und die Crew wird
im Hauptmenü und in der Einsatzplanung als lebendige Truppe mit sichtbarer
Persönlichkeit gezeigt. Nach diesem Task fühlt sich der Manager wie ein Ort mit
eigener Crew an, nicht wie ein Einstellungsdialog.

## Warum jetzt

Die Vision verspricht „Crew statt Spielfiguren" und „emergente Geschichten"
(`docs/01_PRODUCT_VISION.md`, Designpfeiler 5). Die aktuelle Manager-Ebene löst
dieses Versprechen nicht ein: `ManagerScene` ist ein Auswahldialog (3 aus 4
Wesen, je eine Waffe), `DebriefScene` zeigt Zahlen und einen generischen Spruch,
und `MatchReport` transportiert keine einzige Begebenheit des gespielten Matches.
Damit bleibt der „dünne Manager-Slice" aus `docs/05_ROADMAP.md` (M6) unvalidiert
– nicht wegen fehlender Grafik, sondern weil kein Erinnerungs-Kreislauf existiert.

Die Match-Engine liefert die Rohdaten bereits vollständig und deterministisch:
`resolveTurn()` protokolliert pro Zug jeden relevanten Ausgang
(`projectile-resolved`, `damage-applied`, `knockback-resolved` mit
`defeatedOutOfWorld`, `fall-resolved` mit `state: "out-of-world"`,
`terrain-mutated`, `turn-skipped`). Es fehlt nur eine deutende Schicht, die
daraus benannte Momente macht, und deren Anbindung an Bericht und Manager-UI.

## Pflichtlektüre

- `AGENTS.md`
- `docs/01_PRODUCT_VISION.md` (Designpfeiler, Nichtziele)
- `docs/02_GAME_DESIGN.md` (Manager-Slice, Persönlichkeiten)
- `docs/06_ART_AND_TONE.md` (Ton: slapstickhaft, warm, nie grimdark)
- `memory/match-engine-boundary.md` (Match-Engine ist alleinige Autorität)

## Voraussetzungen

- Task 021 (Headless-Match-Engine) abgeschlossen: `resolveTurn`/`runMatch`
  liefern das Ereignisprotokoll.
- Task 024 (Persönlichkeits-Blindflecken): `PERSONALITY_PERCEPTION_NOTES` in
  `src/simulation/ai/RocketActionPlanner.ts` existiert als Charaktertext.

## Gesamtbild (Vollversion, zur Orientierung – NICHT vollständig in diesem Task)

Die reife Manager-Ebene, auf die hingebaut wird:

- **Lebende Crew:** Persönlichkeit, Macken, je eine Stärke und eine sichtbare
  Schwäche, kurzfristige Stimmung/Form und Beziehungen zwischen Figuren.
- **Erinnerungs-Kreislauf:** Match → benannte Momente → Chronik-Einträge →
  veränderte Stimmung/Ruf → sichtbar bei nächster Planung und im Menü.
- **Ruf über Läufe:** selbstironische Auszeichnungen statt XP-Balken
  („Bekannt für: 4 eingerissene eigene Bauwerke").
- **Später (eigener Task):** kurze Kampagne aus 3–5 Einsätzen mit persistenter
  Crew und Bogenkurve – ohne Shop, Wirtschaft oder Rekrutierung (Vision-Nichtziel).

Dieser Task baut nur die tragende Kette A–C. Stimmung, Ruf-Chronik und
Beziehungen (D–E) sind Folge-Tasks und hier ausdrücklich Nichtziel.

## Scope

### Schritt A – Match-Chronik aus vorhandenen Ereignissen (Simulation)

Eine **neue, reine Funktion** leitet aus dem vorhandenen Ereignisprotokoll die
markantesten Momente ab. Keine Änderung an `resolveTurn`, `planTurn` oder der
Balance; nur Lesen der Events.

- Neue Datei, z. B. `src/simulation/match/matchChronicle.ts`.
- Eingabe: die pro Zug gesammelten `MatchTurnEvent[]` (im Headless-Pfad bereits
  als `MatchRunResult.turns[].events`; im Szenen-Pfad muss `MatchScene` die
  bisher nur transienten `pendingEvents` je Zug **akkumulieren**, siehe Schritt B).
- Ausgabe: `readonly ChronicleMoment[]` (2–3 Einträge), jeweils mit
  Ereignisart, beteiligter `unitId` (bzw. Figur), Schweregrad/Priorität und
  einem kurzen, tonalen Text.
- Erkannte Momenttypen (alle aus vorhandenen Events ableitbar):
  - **Selbstschaden / Eigentor:** `damage-applied` auf eine Einheit desselben
    Teams wie der aktiven Einheit des Zugs (inkl. Schütze selbst).
  - **Friendly Fire:** Schaden an Teamkamerad ohne Selbsttreffer.
  - **Sturz aus der Welt:** `fall-resolved` mit `state: "out-of-world"` oder
    `knockback-resolved` mit `defeatedOutOfWorld: true`.
  - **Fehlschuss:** `projectile-resolved` ohne folgendes `terrain-mutated`/
    `damage-applied` (Explosion ohne Wirkung bzw. keine Explosion).
  - **Großer Krater:** `terrain-mutated` mit großem Radius/hoher Zellzahl.
  - **Übersprungener Zug:** `turn-skipped`.
- Auswahllogik: deterministisch (gleicher Match-Verlauf → gleiche Chronik),
  nach Priorität gekürzt auf max. 3. Kein Zufall, keine Uhrzeit.

### Schritt B – Einsatzbericht erzählt die Momente (Manager/Scene)

- `MatchReport` (`src/game/session/matchSession.ts`) um ein Feld
  `chronicle: readonly ChronicleMoment[]` erweitern.
- `MatchScene` akkumuliert die `pendingEvents` je Zug in einer Match-lokalen
  Liste (`resolveTurn`-Aufrufe bei `MatchScene.ts` ~1215 und ~1516) und übergibt
  sie beim Bau des Reports (`createMatchEndButton`, ~2060) an die Chronik-Funktion.
- `DebriefScene` (`src/game/scenes/DebriefScene.ts`) zeigt die Momente mit
  Figurennamen statt des generischen `remark`. Der bisherige Ausgangs-Text darf
  als Rahmen bleiben, ersetzt aber nicht die konkreten Momente.
- Momenttexte nutzen `FIGHTER_ROSTER[...].displayName`. Ton: slapstickhaft,
  warm, selbstironisch (`docs/06_ART_AND_TONE.md`), nie hämisch oder grimdark.

### Schritt C – Persönlichkeit sichtbar machen (Manager-UI + Menü)

- **Figurenkarte** (`ManagerScene.createFighterCard`): je Wesen eine **Stärke**
  und eine **sichtbare Schwäche/Macke** als kurzer Charaktertext ergänzen. Die
  Schwäche leitet sich aus dem Blindfleck ab (`PERSONALITY_PERCEPTION_NOTES`),
  als Figureneigenschaft formuliert (z. B. „unterschätzt Eigenrisiko" →
  „hält sich für unverwundbar"). Datenquelle: neue Felder in
  `FIGHTER_ROSTER` (`src/manager/fighterRoster.ts`), keine Sim-Änderung.
- **Auswahl-Feedback:** Beim Wählen einer Karte eine kurze vorhandene Pose/
  Reaktion abspielen (Idle-Animationen laufen bereits, `ManagerScene.ts:147`).
  Keine neuen Assets.
- **Hauptmenü als Zuhause** (`MainMenuScene`): Die Crew unten im Bild präsent
  und idle-animiert zeigen (vorhandene `CREATURE_VISUALS`/Animationen). Die
  Kartenwahl aus dem Hauptmenü in die Einsatzplanung verschieben ist **optional**
  in diesem Task und darf zurückgestellt werden, wenn der Umfang zu groß wird;
  in dem Fall bleibt die Kartenwahl vorerst, wird aber unter der Crew platziert.

## Nichtziele

- Keine Änderung an Ballistik, Schaden, Bewegung, Zugreihenfolge oder Balance.
- Keine Änderung an `resolveTurn`/`planTurn`/`matchSimulator` außer reinem Lesen.
- Keine Stimmung/Form, kein persistenter Ruf, keine Beziehungen (Folge-Task D–E).
- Keine Kampagne, kein Shop, keine Wirtschaft, keine Rekrutierung.
- Keine neuen Figuren-Assets, keine finale Produktionsgrafik.
- Golden-Master- und Snapshot-Verhalten der Match-Engine bleibt unverändert.

## Akzeptanzkriterien

1. Ein und derselbe Match-Verlauf (gleicher Seed, gleiche Kommandos) erzeugt
   im selben Build dieselbe Chronik (deterministisch, per Unit-Test bewiesen).
2. Nach einem Match nennt der Einsatzbericht mindestens einen konkreten Moment
   dieses Matches mit Figurennamen; bei einem selbst herbeigeführten Eigentor
   oder Weltsturz taucht dieser Moment auf.
3. Jede Figurenkarte in der Einsatzplanung zeigt eine Stärke und eine sichtbare
   Schwäche, die zur Persönlichkeit/zum Blindfleck der Figur passt.
4. Das Hauptmenü zeigt die Crew sichtbar und idle-animiert.
5. Die Chronik-Funktion ändert keinen Simulationszustand (reine Funktion).
6. Alle bestehenden Tests, Golden Master und Snapshots bleiben grün ohne
   inhaltliche Neubewertung der Match-Engine.

## Verifikation

- `npm run typecheck`
- `npm test` (inkl. neuer `matchChronicle`-Tests und unveränderter Golden Master)
- `npm run build`
- Browser-Smoke-Test: Einsatz planen → Match spielen → Bericht zeigt benannte
  Momente → zurück ins Menü, Crew ist präsent und animiert.
- Optional: `npm run simulate` weiterhin unverändert (Chronik hängt nicht an der
  Balancemessung).

## Abschlussbericht

Der Bearbeiter berichtet:

1. umgesetztes Ergebnis,
2. geänderte Dateien,
3. ausgeführte Prüfungen und Resultate,
4. bekannte Einschränkungen,
5. neue Einträge in `docs/DECISIONS.md`.
