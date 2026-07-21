# Task 004: Erklärte autonome Aktion

## Status

`abgeschlossen am 21. Juli 2026`

## Ziel

Eine vollständige autonome Raketenaktion mit Kandidatenbewertung, sichtbarer Begründung, Persönlichkeitsmodifikation und einmaligem „Lass das!“-Eingriff spielbar machen.

## Warum jetzt

Dies ist der erste direkte Beweis der zentralen Produkthypothese. Erst hier zeigt sich, ob Autonomie, Verständnis und begrenzte Agency gemeinsam funktionieren.

## Pflichtlektüre

- `AGENTS.md`
- `docs/01_PRODUCT_VISION.md`
- `docs/02_GAME_DESIGN.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/04_VERTICAL_SLICE.md`
- `docs/06_ART_AND_TONE.md`

## Voraussetzungen

- Task 003 ist abgenommen.

## Scope

- eine aktive Figur und mindestens zwei mögliche Ziele,
- begrenzte, reproduzierbare Raketen-Kandidaten,
- aufgeschlüsselte Utility-Bewertung,
- die Merkmale Vorsichtig, Sprengfreudig und Angeberisch,
- stabil sortierte Kandidaten und kontrollierte Seed-Variation,
- Intent-UI mit Ziel, Trajektorie, Wirkung, Risiko und Hauptgründen,
- ein „Lass das!“-Kommando,
- Auswahl und Erklärung des nächstbesten gültigen Kandidaten,
- vollständige Ausführung der bestätigten Aktion,
- Debugansicht aller geprüften Kandidaten,
- deterministische Szenariotests.

## Nichtziele

- vollständige Zugreihenfolge,
- 3-gegen-3-Match,
- Wurfgranate,
- langfristiges Crewmanagement,
- finale Figuren- oder UI-Assets.

## Akzeptanzkriterien

1. Die Figur wählt aus mehreren fachlich gültigen Kandidaten.
2. Die UI benennt mindestens die wichtigsten positiven und negativen Bewertungsanteile.
3. Ein Wechsel des Persönlichkeitsmerkmals kann bei passendem Szenario die Auswahl nachvollziehbar verändern.
4. Der gezeigte Plan stimmt mit der späteren fachlichen Ausführung überein.
5. „Lass das!“ kann genau einmal eingesetzt werden und wählt nicht denselben Kandidaten erneut.
6. Der alternative Plan wird vor der Ausführung vollständig neu erklärt.
7. Gleicher Zustand, Seed und Eingriff erzeugen dasselbe Ergebnis.
8. Ein Debugmodus zeigt Seed, Kandidatenwerte und Auswahlreihenfolge.

## Verifikation

- `npm run typecheck`
- `npm test`
- `npm run build`
- Browserprüfung mit allen drei Merkmalen
- kurzer Verständlichkeitstest ohne Erklärung der Bewertungslogik

## Abnahmeprotokoll

- eine aktive Figur bewertet sechs begrenzte Kandidaten für zwei Rivalen,
- alle Kandidaten verwenden die Ballistik aus Task 003 und werden mit aufgeschlüsselten, maschinenlesbaren Nutzenanteilen bewertet,
- Vorsichtig, Sprengfreudig und Angeberisch ändern Auswahl und sichtbare Hauptbegründung nachvollziehbar,
- Kandidatenvariation ist an Seed und Kandidaten-ID gebunden; Gleichstände werden stabil nach ID sortiert,
- Intent-UI zeigt Ziel, Bogen, Flugzeit, Wirkung, Kameraden-/Eigenrisiko, Hauptgründe, Nutzen und Rang,
- „Lass das!“ verwirft genau einen Kandidaten, erklärt den nächstbesten gültigen Plan vollständig neu und ist danach deaktiviert,
- Debugmodus zeigt Seed, Maskenversion, alle Kandidatenwerte und ihre Auswahlreihenfolge,
- Ausführung verwendet exakt die angekündigten Samples und wendet Krater sowie vorhergesagten Explosionsschaden am gemeinsamen Einschlagspunkt an,
- sechs KI-Szenariotests sowie insgesamt 18 Projekttests erfolgreich,
- Browserprüfung mit allen drei Merkmalen, Debugansicht, Ablehnung, Neuplanung und vollständiger Ausführung erfolgreich,
- Verständlichkeits-Heuristik anhand der sichtbaren UI bestanden; der externe Test mit unvorbereiteten Testspielern bleibt das Entscheidungstor von M5,
- `npm run typecheck`, `npm test` und `npm run build`: erfolgreich,
- Browserkonsole: keine Fehler oder Warnungen aus der Anwendung.
