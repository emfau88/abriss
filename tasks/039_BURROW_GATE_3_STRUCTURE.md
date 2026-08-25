# Task 039: Burrow Gate 3 – Untergraben und Kollaps

## Status

`abgeschlossen (technisch; öffentliche persönliche Abnahme offen)`

## Ziel

Ein einziger untergrabbarer Bau beweist, dass dieselbe dauerhafte
Burrow-Terrainmaske zu einer klaren, verständlichen Strukturfolge führen kann.

## Warum jetzt

Der Nutzer bestätigte Gate 1, meldete konkrete Gate-2-Steuerungsverbesserungen
und gab Gate 3 ausdrücklich frei. Bevor Response oder weitere Beute entstehen,
soll ein einzelner, lesbarer Untergraben-zu-Kollaps-Moment geprüft werden.

## Pflichtlektüre

- `AGENTS.md`
- `docs/burrow/VISION.md`
- `docs/burrow/VERTICAL_SLICE.md`
- `docs/burrow/TECHNICAL_PLAN.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/DECISIONS.md`
- `tasks/038_BURROW_GATE_2_HUNT.md`

## Scope

- eine rendererfreie Stützenstruktur mit drei Terrainankern,
- Verlustereignisse und einmaliger Kollaps nach zwei verlorenen Stützen,
- codegezeichnete Hütte, Stützenwarnungen, Trümmer und Staub,
- moderate Arenabreite von 2.560 Weltpixeln ohne Streaming,
- klare README-Trennung der beiden isolierten Produkte,
- vollständige Tests, Browserprüfung, Commit und Pages-Veröffentlichung.

## Nichtziele

- keine allgemeine Gebäudekollision, Fahrzeugphysik oder Ragdolls,
- keine zweite Struktur, Gegner, Alarmstufe oder Kollapsbelohnung,
- keine Chunkwelt, Speicherung, Assets in Produktionsqualität oder Abriss-
  Gameplayänderungen.

## Akzeptanzkriterien

1. Terrainverlust unter einer Stütze wird rendererfrei erkannt und nur einmal
   gemeldet.
2. Zwei verlorene Stützen lösen genau einen irreversiblen Kollaps aus.
3. Die größere Arena nutzt weiterhin nur lokale Kachelupdates.
4. Abriss und Burrow bleiben über URL, README, Code und Tests getrennt.
5. Alle Tests, Typecheck, Build und Desktop-/Touch-Browserprüfung bestehen.

## Verifikation

- Fachtests für Stützenverlust, Schwelle und einmaligen Kollaps,
- `npm run typecheck`, `npm test` und `npm run build`,
- Browser-Smoke für Burrow inklusive Untergraben/Kollaps und Touch,
- Browser-Smoke für Abriss,
- Prüfung des veröffentlichten GitHub-Pages-Links nach Push.

## Technischer Abschlussbericht

Technisch abgeschlossen am 25. August 2026.

- `BurrowStructure` liest drei Anker direkt aus der bestehenden
  `BurrowTerrain`-Maske. Ein verlorener Anker wird einmalig gemeldet; der
  zweite erzeugt einen einmaligen, irreversiblen Kollaps.
- Die Burrow-Arena misst nun 2.560×1.280 Weltpixel, bleibt vollständig geladen
  und nutzt unverändert lokale Terrainkacheln – kein Streaming oder
  Chunk-System.
- Die Szene zeichnet Stützenhütte, verlorene Anker, Kollaps, Staub und
  Gate-3-Status. Die Gate-2-Korrekturen für gepufferten Burst, Stillstand bei
  neutraler Eingabe und breitere Route bleiben enthalten.
- Die Root-README trennt Abriss und Burrow nun als zwei separate Produkte mit
  eigenen URLs, Code- und Produktgrenzen.
- Verifiziert: 19 fokussierte Burrow-Tests, 147 Gesamttests bestanden, 2
  bewusst übersprungen, Typecheck und Produktionsbuild erfolgreich;
  Desktop-/Touch-Smoke für Burrow und Abriss ohne Konsolenfehler.

Bekannte Einschränkung: Der Kollapszustand und seine Einmaligkeit sind
rendererfrei getestet. Die persönliche Bewertung des manuellen Untergrabens
und der sichtbaren Kollapsinszenierung erfolgt erst über den jetzt folgenden
öffentlichen Test.
