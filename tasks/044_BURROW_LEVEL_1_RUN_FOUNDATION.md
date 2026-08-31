# Task 044: Burrow – Level 1 und Runfundament

## Status

`technisch abgeschlossen – persönlicher Level-1- und Mobiltest offen`

## Ziel

Burrow erhält ein vollständig start-, spiel-, gewinn- und verlierbares Level 1,
das in höchstens 180 Sekunden Bewegung B, Biomasse, einen Schrein, eine
1-aus-3-Upgradeentscheidung, eine Schlusskutsche und das Wachstum zum Gräber
zu einem verständlichen Loop verbindet.

## Warum jetzt

Variante B ist als Terraingrundlage bestätigt. Das nächste größte Produktrisiko
ist nicht weiteres Bewegungstuning, sondern ob Bewegung, Entscheidung,
Wachstum und Macht einen vollständigen Levelbogen tragen. Task 044 baut dafür
ein wiederverwendbares Runfundament und genau ein abnahmefähiges Level, bevor
Level 2 oder zusätzlicher Content begonnen werden.

## Pflichtlektüre

- `AGENTS.md`
- `BURROW_Produktvision_und_Entwicklungsplan.md`
- `docs/00_PROJECT_INDEX.md`
- `docs/burrow/VISION.md`
- `docs/burrow/VERTICAL_SLICE.md`
- `docs/burrow/TECHNICAL_PLAN.md`
- `docs/burrow/THREE_LEVEL_SLICE.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/DECISIONS.md`
- `tasks/042_BURROW_REACTIVE_WORLD.md`
- `tasks/043_BURROW_TERRAIN_VARIANT_AND_FANTASY_LOOP_PLAN.md`

## Voraussetzungen

- Task 043 und D-062 sind technisch abgeschlossen.
- B bleibt Standard; unterirdischer Burststart entfernt keine Terrainzellen.
- Vorhandene Kutsche, Biomasse, Schrein, Tierreaktion, Stützenstruktur und
  Keimling-/Gräberdarstellung bleiben die Ausgangsbasis.

## Scope

### Gemeinsames Fachmodell

- rendererfreier, serialisierbarer `BurrowRunState`,
- datengetriebene `BurrowLevelDefinition` für Level 1,
- berechneter `BurrowRunBuild` als einzige Quelle für Basis-, Wachstums- und
  Upgradewerte,
- feste Zustände `intro`, `hunt`, `shrine-ready`, `upgrade`, `finale`,
  `level-complete` und `failed`,
- maximal 10.800 aktive 60-Hz-Schritte; Intro, Upgrade und Ergebnis pausieren,
- Level-Einstiegscheckpoint für deterministischen Neustart ohne Biomasse- oder
  Upgradeverdopplung,
- getrennte `levelBiomass` und `totalBiomass` gemäß Drei-Level-Plan.

### Level 1 – Wiesenrand

- vorhandene Arena als Grundlage, nur soweit nötig für klaren Levelstart,
- Schrein vollständig in einer handgebauten, stabilen Seitenhöhle,
- genau ein kleines Beuteverhalten aus der vorhandenen Tierdarstellung und ein
  parametrisiertes Kutschenziel; keine allgemeine NPC-KI,
- Biomasseschwelle so, dass der Schrein bei normalem erfolgreichem Spiel
  ungefähr nach 60 bis 90 Sekunden erwacht,
- dezenter, auch auf kleinem Querformat lesbarer Hinweis zum erwachten Schrein,
- Kopfkontakt öffnet eine pausierte Touch- und Tastaturauswahl.

### Drei Rang-1-Upgrades

- Himmelsstürmer: etwa 12 % höheres Bursttempo und in einer festen vertikalen
  Referenz messbar höhere Scheitelhöhe,
- Vielfraß: ein zusätzlicher Schadenspunkt bei gültigem Kopfkontakt,
- Rammbock: etwa 20 % größerer permanenter Krater bei gültigem Breach oder
  schnellem Wiedereintritt,
- nur eine Auswahl, keine zufälligen Angebote und keine unsichtbaren Werte,
- Burststart und unterirdische Burststrecke bleiben bei allen Pfaden ohne
  permanente Terrainmutation.

### Finale und Übergang

- nach der Wahl beginnt das Finale mit einer verstärkten Händlerkutsche,
- ein gültiger schneller Kopfkontakt verschlingt die Schlusskutsche,
- Sieg erst bei Devour; anschließend kurze Wachstumssequenz zum Gräber,
- Levelabschluss zeigt Zeit, Level-/Gesamtbiomasse und gewähltes Upgrade,
- `Weiter` endet vor Level 2 in einem ehrlichen Slice-Abschlusszustand,
- Zeitablauf erzeugt `failed` mit Neustart vom Level-Einstiegscheckpoint,
- `R` und der sichtbare Neustart setzen den gesamten Run auf Keimling zurück.

## Nichtziele

- keine Implementierung von Level 2 oder Level 3,
- keine Upgrade-Ränge 2 oder 3,
- keine Meta-Währung, Speicherung oder dauerhaften Unlocks,
- keine Wurmlebenspunkte, Gegnerprojektile oder allgemeine Gegner-KI,
- keine neue allgemeine Fahrzeug- oder Gebäudephysik,
- keine neuen Regionen, Ritter, Magier oder finalen Produktionsassets,
- keine Änderung an Projekt Abriss.

## Akzeptanzkriterien

1. Level 1 lässt sich aus einem frischen Run gewinnen und durch Zeitablauf
   verlieren; pausierte Zustände verbrauchen keine Levelzeit.
2. `levelBiomass` weckt den Schrein genau einmal. Auswahl und Levelabschluss
   können weder Biomasse noch Upgrade verdoppeln.
3. Der Schrein steht vollständig in seiner initialen Höhle und bleibt bei
   normaler B-Bewegung sichtbar verankert.
4. Jede der drei Karten verändert ausschließlich die dokumentierten Werte.
   Eine feste Simulation belegt für Himmelsstürmer die höhere Scheitelhöhe.
5. Vielfraß reduziert die nötigen gültigen Kopfkontakte; Körpersegmente treffen
   weiterhin nicht.
6. Rammbock vergrößert nur zulässige Aktionskrater. Burststart lässt die gesamte
   Terrainmaske unverändert.
7. Die Schlusskutsche beendet das Level ausschließlich bei einem gültigen
   Devour.
8. Wachstum zum Gräber ist sichtbar und fachlich aktiv, verändert den
   Kollisionsradius aber nicht.
9. Scheitern stellt Zeit, Welt, Ziele, Biomasse und aktuelle Schreinwahl exakt
   aus dem Level-Einstiegscheckpoint wieder her.
10. Desktop und Touch können Bewegung, Schreinwahl, Neustart und Abschluss ohne
    neue Gameplaytaste bedienen.
11. Abriss-Isolation, Typprüfung, Fachtests, Gesamttests und Produktionsbuild
    bleiben grün.

## Verifikation

- Fachtests für Runzustand, Zeitpause, Biomasseschwelle, Einmaligkeit,
  Checkpoint und Levelabschluss,
- deterministische Referenztests für Scheitelhöhe, Bisskontakte und Kratergröße,
- Regressionstest: Burststart verändert in B mit jedem Upgrade null Zellen,
- `npm run typecheck`,
- `npm test`,
- `npm run build`,
- Browser-Smoke auf Desktop und Touch für kompletten Sieg-, Fehler- und
  Neustartpfad sowie Abriss-Einstieg,
- persönlicher Level-1-Test auf einem echten Mobilgerät vor Freigabe von Level 2.

## Abschlussbericht

Der Bearbeiter berichtet:

1. beobachtbaren Levelablauf und tatsächliche aktive Spieldauer,
2. Zustandsmodell, Leveldefinition und wirksame Buildwerte,
3. geänderte Dateien und neue Entscheidungseinträge,
4. Tests, Browser-Smoke, Build und echten Mobiltest getrennt,
5. bekannte Einschränkungen und persönliche Entscheidung zu Level 2.

## Technisches Prüfergebnis – 30. August 2026

- `BurrowRun` hält den serialisierbaren Levelzustand, die aktive 180-Sekunden-
  Uhr, den Level-Einstiegscheckpoint, getrennte Level-/Gesamtbiomasse und die
  sieben vorgesehenen Phasen. Level 1 verwendet fünf Biomasse und eine
  Ein-Kontakt-Schlusskutsche (D-067).
- Der vorhandene Schrein bleibt in der initialen Seitenhöhle und steht mit
  seinem Spritefuß auf deren Boden. Das Bergtier
  bleibt deterministisch fliehend und ist einmalig fressbare Kleinbeute; die
  bestehende Kutsche ist die parametrisierte Wiederholungsbeute vor dem Finale.
- Rang 1 ist direkt am gemeinsamen Build verknüpft: Himmelsstürmer erhöht die
  Burstgeschwindigkeit um 12 %, Vielfraß addiert einen Kopfbissschaden und
  Rammbock vergrößert nur Breach-/Impactkrater um 20 %. Der B-Burststart bleibt
  in allen Fällen maskenstabil.
- Die Wahl pausiert per Touch oder 1/2/3; R sowie die sichtbare Schaltfläche
  starten den Run frisch. Desktop- und Touch-Smoke prüfen Auswahl,
  Schlusskutsche, Abschluss, Fehlzustand und Neustart ohne Konsolenfehler.
- Prüfungen: 47 Burrow-Fachtests grün; der vollständige Vitest-Lauf zeigte
  sämtliche Einzelfälle ohne Testfehler, seine Schlusszusammenfassung wurde in
  dieser Windows-Umgebung nach rund 30 Sekunden nicht mehr ausgegeben.
  Typecheck und Produktionsbuild sind grün. Bekannte Buildwarnung bleibt der
  große Phaser-Chunk.

### Offen vor Level 2

- Persönlicher kompletter Level-1-Run und echter Mobiltest, insbesondere
  Wiederholungswunsch, reale Dauer bis zum Schrein und Lesbarkeit der
  Abschlusslesbarkeit und den Ein-Kontakt-Payoff der Schlusskutsche.
- Keine Level-2-Freigabe, keine Meta-, Gegner- oder zusätzliche Regionsarbeit.
