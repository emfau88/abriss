# Task 016: Dünner Manager-Loop

## Status

`abgeschlossen`

## Ziel

Der Vertical Slice erhält einen kleinen vollständigen Produktloop aus Hauptmenü, Crew-/Ausrüstungsentscheidung, Match und humorvollem Einsatzbericht mit einer nachvollziehbaren Freischaltung.

## Pflichtlektüre

- `AGENTS.md`
- `docs/01_PRODUCT_VISION.md`
- `docs/02_GAME_DESIGN.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/04_VERTICAL_SLICE.md`
- `docs/05_ROADMAP.md`
- `docs/DECISIONS.md`

## Scope

- schlichtes Hauptmenü mit neuem Einsatz und direktem Testmatch,
- Crew-Auswahl aus vier Wesen für drei Matchplätze,
- genau eine verständliche Waffenpräferenz pro gewählter Figur,
- serialisierbare, versionierte lokale Managerdaten,
- Matchkonfiguration wird explizit an die Simulation übergeben,
- nach Sieg oder Niederlage ein kompakter humorvoller Einsatzbericht,
- eine kleine persistente Freischaltung als Loop-Beweis,
- Rückkehr zur Crewplanung oder Hauptmenü.

## Nichtziele

- Shop, Währungen, Preise oder Monetarisierung,
- große Kampagne, Verletzungen, Beziehungen oder komplexe Progression,
- Backend, Konto oder Cloud-Speicher,
- umfangreiche neue Inhalte neben dem Slime.

## Akzeptanzkriterien

1. Hauptmenü → Crew/Ausrüstung → Match → Einsatzbericht → nächste Planung funktioniert ohne manuellen Szenenreset.
2. Genau drei unterschiedliche Figuren können aus vier gewählt werden.
3. Waffenpräferenzen beeinflussen den ersten gültigen Plan der jeweiligen Figur nachvollziehbar, ohne Waffen dauerhaft zu sperren.
4. Managerzustand ist unabhängig von Phaser serialisierbar, versioniert und getestet.
5. Nach dem ersten abgeschlossenen Einsatz wird eine kleine Freischaltung persistent und verständlich angezeigt.
6. Bestehender direkter Testmatch-Einstieg bleibt für schnelle Entwicklung verfügbar.
7. Tests, Typprüfung, Build und Browserprüfung sind erfolgreich.

## Abschlussbericht

- `MainMenuScene`, `ManagerScene`, `MatchScene` und `DebriefScene` bilden den vollständigen kleinen Produktloop; das schnelle Testmatch bleibt im Hauptmenü erhalten.
- Genau drei aus vier Wesen können ein- und ausgewechselt werden. Jede gewählte Figur erhält eine persistente Waffenpräferenz; ein ungültiger Präferenzplan fällt nachvollziehbar auf das freie Arsenal zurück.
- `ManagerState` ist unabhängig von Phaser versioniert, normalisiert, serialisierbar und mit Tests für Roundtrip, ungültige Daten und einmalige Freischaltung abgesichert.
- Die Szene erhält eine explizite `MatchLaunchConfig` statt versteckter Menüwerte. Der Einsatzbericht zeigt Ausgang, Züge, Überlebende, Seed und schaltet nach dem ersten Manager-Einsatz den Geländebrecher frei.
- Im Browser wurden Hauptmenü, Crewwechsel, Loadout, Matchstart, Präferenz/Fallback, Matchabschluss, Einsatzbericht, Freischaltung und Rückkehr geprüft; keine Konsolenfehler.
- Typecheck, 47 Tests und Produktionsbuild sind erfolgreich.
