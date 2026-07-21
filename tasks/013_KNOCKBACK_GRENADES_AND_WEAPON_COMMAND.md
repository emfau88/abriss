# Task 013: Rückstoß, Granatenphysik und Waffenkommando

## Status

`abgeschlossen`

## Ziel

Explosionen schleudern Figuren nachvollziehbar über zerstörtes Terrain, Granaten prallen vor ihrer Zündung ab und der Spieler kann einmal pro Match eine gewünschte Waffengattung für den nächsten Plan vorgeben.

## Warum jetzt

Der autonome 3-gegen-3-Slice besitzt Bewegung und Waffenvielfalt, aber Explosionen wirken ohne Figurenimpuls noch statisch. Die Wurfgranate unterscheidet sich physikalisch noch nicht ausreichend und die Manageragency kann keine erkennbare Waffenpräferenz ausdrücken.

## Pflichtlektüre

- `AGENTS.md`
- `docs/02_GAME_DESIGN.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/04_VERTICAL_SLICE.md`
- `docs/06_ART_AND_TONE.md`
- `docs/DECISIONS.md`

## Voraussetzungen

- Task 012 ist abgeschlossen.
- Gemeinsame Ballistik, Terrainmaske, Fallauflösung und drei Waffenprofile funktionieren.

## Scope

- deterministischer Explosionsimpuls für betroffene Figuren,
- einfache gesweepte Figurenbewegung gegen die aktuelle Terrainmaske,
- höchstens ein gedämpfter Abpraller und anschließende Landung beziehungsweise Out-of-world,
- Granate mit festem Zeitzünder und begrenzten Terrainabprallern,
- dieselben Granaten-Samples für KI, Vorschau und Ausführung,
- ein einmaliges Managerkommando pro Match zur Wahl von Panzerfaust, Wurfgranate oder Geländebrecher,
- Neuplanung unter der gewählten Waffeneinschränkung,
- Dokumentation der Referenzbilder als projektspezifische Mockups,
- Kraft-/Intensitätsanzeige als dokumentierte spätere Idee.

## Nichtziele

- perfekte Kapselkollision oder allgemeine Starrkörperphysik,
- Figuren-gegen-Figuren-Stöße,
- mehrfaches Rollen, komplexe Reibung oder Ragdolls,
- manuelles Zielen und Aufladen der Schusskraft,
- neue Figurenassets.

## Akzeptanzkriterien

1. Ein Explosionsimpuls wird aus Abstand und Richtung reproduzierbar berechnet.
2. Getroffene Figuren folgen vorab berechneten Samples, tunneln in Tests nicht durch repräsentative Terrainkanten und landen oder fallen aus der Welt.
3. Granaten explodieren nach fester Zeit und können vorher begrenzt abprallen.
4. Vorschau, KI und sichtbare Granatenausführung verwenden dasselbe Trajektorienresultat.
5. Das Waffenkommando schränkt die Neuplanung sichtbar auf die gewählte Waffe ein und ist genau einmal pro Match nutzbar.
6. Rückstoß und alle Terrain-/Schadensfolgen werden vor dem nächsten Zug abgeschlossen.

## Verifikation

- `npm run typecheck`
- `npm test -- --run`
- `npm run build`
- Browserprüfung von Granatenabprall, Rückstoß, Waffenkommando und fortlaufendem Zugwechsel

## Abschlussbericht

- `ExplosionKnockback` berechnet Impuls, gesweepte Bewegung, höchstens einen gedämpften Terrainabpraller sowie Landung oder Out-of-world deterministisch.
- Die Szene animiert exakt diese Samples nach der Terrainzerstörung und wartet vor dem Zugwechsel auf Rückstoß und anschließende Fallauflösung.
- Wurfgranaten verwenden gemeinsame Vorschau-/Ausführungssamples, einen festen Zeitzünder und höchstens zwei gedämpfte Terrainabpraller.
- Der Manager kann über HUD oder `1`/`2`/`3` genau einmal pro Match die nächste Waffenplanung auf Panzerfaust, Wurfgranate oder Geländebrecher beschränken.
- Die projektspezifischen Figurenmockups sind als verbindliche direkte Designreferenzen dokumentiert; mitgenerierte Fantasietitel gehören ausdrücklich nicht zum Design.
- Die sichtbare Kraft-/Intensitätsanzeige während einer späteren manuellen Zielsequenz ist dokumentiert, aber bewusst nicht Bestandteil dieses Tasks.
- Verifiziert am 21. Juli 2026 mit 42 Vitest-Tests, erfolgreicher Typprüfung, Produktionsbuild und Browserprüfung eines vollständigen Granaten-/Rückstoß-/Zugwechselablaufs.
