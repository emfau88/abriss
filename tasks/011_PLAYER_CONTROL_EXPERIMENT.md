# Task 011: Spielersteuerung als Kernloop testen

## Status

`umgesetzt (Testschalter + manuelle Bewegung + manuelles Zielen, Maus und Touch) – Browserprüfung und Bewertung durch den Nutzer ausstehend` (zuvor: `bereit`)

## Ziel

In einem kleinen, reversiblen Gameplay-Experiment prüfen, ob direkte Kontrolle über Positionierung und Schuss beim Spielerteam mehr Spielspaß erzeugt, ohne Persönlichkeiten und die vorhandene Entscheidungslogik zu verlieren.

## Empfohlene Hypothese

Der Spieler steuert die aktive eigene Figur direkt: begrenztes Laufen, ein klar begrenzter Sprung sowie manuelles Einstellen von Winkel und Kraft. Gegner verwenden den bestehenden Planer. Für das Spielerteam wird derselbe Planer höchstens als optionaler Vorschlag verwendet und führt nicht automatisch den optimalen Schuss aus.

## Scope des Experiments

- Bewegungsbudget pro Zug,
- robuste Bewegung entlang der zerstörbaren Terrainoberfläche,
- begrenzter Sprung mit gültiger Landeposition,
- manuelles Zielen und Kraftwahl für die Rakete,
- vorhandene gemeinsame Ballistik für Vorschau und Ausführung,
- Zugabschluss nach Bewegung und Schuss,
- Gegner-KI verwendet Planung plus dieselben Bewegungsregeln,
- blockierte Ziele führen zu Positionierung oder alternativem Ziel statt Zugstillstand,
- optionaler, einklappbarer „Vorschlag“-Plan für das Spielerteam.

## Persönlichkeiten ohne Kontrollverlust

- sichtbare Vorlieben für Waffen und Risiko,
- unterschiedliche Bewegungs-/Sprungprofile innerhalb fairer Grenzen,
- Reaktionen, Kommentare und Rivalitäten,
- nachvollziehbare kleine Stärken und Schwächen,
- keine heimliche Änderung eines vom Spieler eingestellten Winkels,
- kein absichtliches Fehlzielen nur für einen Witz.

## Vergleichskriterium

Nach wenigen internen Matches wird bewertet:

1. Entstehen interessante Entscheidungen schon bei Position, Winkel und Kraft?
2. Fühlen sich Figuren trotz direkter Kontrolle unterschiedlich an?
3. Hilft der optionale Vorschlag, ohne die Lösung vorwegzunehmen?
4. Funktionieren blockierte Situationen ohne Leerlauf?
5. Ist das Match verständlicher und spannender als der autonome Slice?

## Nichtziele

- finale Steuerung für Touch und Gamepad,
- vollständiges Pathfinding,
- Seile, Teleporter oder komplexe Fortbewegungswerkzeuge,
- Manager-Metaebene,
- endgültige Balance.

## Abschlussbericht vom 22. Juli 2026 (erster Wurf)

Umgesetzt von **Claude Fable 5** (Anthropic, Claude Code) auf Nutzerwunsch:
An/Aus-Schalter im Hauptmenü zwischen Autobattle und Selbststeuern.

### Umgesetzt

1. **Steuerungsmodus** `controlMode` (`auto` | `manual`) in
   `MatchLaunchConfig`; Default `auto`, sodass alle bestehenden Startpfade
   (Manager-Einsatz inklusive) unverändert Autobattle bleiben.
2. **Hauptmenü-Schalter**: Umschalt-Button „⚙ AUTOBATTLE / 🎯 SELBST ZIELEN“.
   Die Wahl liegt in der Phaser-Registry, übersteht damit den Kartenwechsel
   (`scene.restart`) und wird an das Testmatch übergeben.
3. **Manuelles Zielen** (Nutzerwahl „volles Zielen per Maus“, Worms-Style):
   In `MatchScene` zielt der Spieler bei Crew-Zügen selbst – von der Figur
   wegziehen setzt Winkel und Kraft, eine Live-Vorschaubahn zeigt den Bogen
   und den Explosionsradius, Tasten 1/2/3 wechseln die Waffe, Loslassen
   schießt. Rivalenzüge bleiben autonom.
4. **Engine-Anbindung** `planManualShot` (`src/simulation/match/`): erzeugt
   aus Waffe und Startgeschwindigkeit einen vollständigen TurnPlan mit
   gültigem Kandidaten, der durch dieselbe `resolveTurn`-Maschinerie läuft
   (Schaden, Rückstoß, Fall, Zugwechsel). **Kein Streukegel** beim manuellen
   Zielen – der Spieler hat selbst gezielt, ausgeführt wird exakt der
   anvisierte Bogen (drei Vitest-Fälle sichern Plan, Auflösung und
   Determinismus ab).

### Bewusste Grenzen dieses ersten Wurfs

- **Kein manuelles Laufen/Springen**: Der Spieler schießt vom Stand. Das
  Bewegungsbudget aus der Hypothese ist ein Folgeschritt; der Testschalter
  soll zuerst das Zielgefühl beantworten.
- **Kein optionaler KI-Vorschlag** im manuellen Modus (das Intent-Panel
  zeigt stattdessen die Zielanleitung).
- Manager-Einsatz bleibt bewusst Autobattle; der Schalter wirkt auf das
  Testmatch.

### Zu bewerten durch den Nutzer (Vergleichskriterium)

Ein Testmatch je Modus spielen und beurteilen: Entstehen interessante
Entscheidungen schon bei Winkel/Kraft? Fühlt sich Selbststeuern spannender
an als der Autobattler – oder bestätigt sich, dass Zuschauen + Eingreifen
der bessere Kern ist? Danach Richtungsentscheidung.

### Prüfungen

`npm run typecheck`, `npm test` (77 grün, 2 übersprungen), `npm run build`
grün. Browserprüfung steht aus.

### Neue Einträge in `docs/DECISIONS.md`

- **D-035**: Steuerungsmodus als reversibler Testschalter.

## Ergänzung vom 22. Juli 2026: Bewegung von Hand und Touch

Auf Nutzerwunsch nachgezogen (der erste Wurf ließ nur Zielen vom Stand zu).
Umgesetzt von **Claude Fable 5** (Anthropic, Claude Code).

### Manuelle Bewegung

- Der manuelle Crew-Zug hat jetzt zwei Phasen: **erst bewegen, dann zielen.**
- `manualMovement.ts` liefert die gültigen Bewegungsoptionen aus demselben
  deterministischen, terrain-sicheren `planLocalMovement`, das die KI nutzt
  (Laufen/Springen im 190-Weltpunkte-Limit) plus „hier bleiben“.
- Die Szene zeigt jedes Laufziel (→) und jeden Sprung (⤴) als antippbaren
  Marker; Auswahl bewegt die Figur animiert dorthin und wechselt danach
  automatisch in die Zielphase. Der „HIER BLEIBEN“-Button überspringt die
  Bewegung.
- `applyManualMovement` schreibt die Zielposition in den Simulationszustand,
  bevor gezielt wird – der Schuss startet also von der neuen Position.

### Touch

- **Zielen** funktioniert per Ein-Finger-Touch (ziehen = Winkel/Kraft,
  loslassen schießt); in der Zielphase ist Ein-Finger-Kamerapan deaktiviert,
  Zwei-Finger-Zoom bleibt erlaubt.
- **Bewegung** über antippbare Marker (Touch wie Maus).
- **Waffenwahl** ohne Tastatur: Die HUD-Waffenbuttons wählen im Zielmodus die
  Zielwaffe (Touch-Ersatz für 1/2/3) und heben die aktive Waffe hervor.
- Ein Mindest-Ziehweg verhindert, dass ein versehentlicher Tap sofort feuert.

### Tests

`manualMovement.test.ts` (Optionen inkl. hold-first, 190-Limit, Anwendung)
plus die bestehenden `planManualShot`-Tests. Gesamt 80 grün, 2 übersprungen;
`npm run typecheck` und `npm run build` grün.

### Weiterhin offen / zu bewerten

Browserprüfung auf Desktop und Touch durch den Nutzer; danach die
Kern-Bewertung Autobattle vs. Selbststeuern. Bewusst noch nicht dabei:
optionaler KI-Vorschlag im manuellen Modus, freies Feinlaufen jenseits der
vorbereiteten Bewegungsziele.
