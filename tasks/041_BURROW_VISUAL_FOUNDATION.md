# Task 041: Burrow – visuelle Grundlage vor Gate 4

## Status

`technisch abgeschlossen, visueller Spieltest offen`

## Ziel

Das bestehende Burrow-Labor erhält einen klareren, mobilen Cartoon-Look nach
der bestätigten kompakten Variante: lesbare Erdschichten und Tunnel,
eine modulare Kreaturensilhouette sowie reduziertes Spiel-HUD. Die Arbeit ist
ein testbarer Stil- und Lesbarkeitsbeweis, kein vorgezogener Gate-4- oder
Gate-5-Content.

## Pflichtlektüre

- `AGENTS.md`
- `docs/burrow/VISION.md`
- `docs/burrow/VERTICAL_SLICE.md`
- `docs/burrow/TECHNICAL_PLAN.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/DECISIONS.md`
- `tasks/040_BURROW_MOBILE_DIRECT_CONTROL.md`

## Scope

- drei klar unterscheidbare Erdschichten und kontrastreiche Tunnelränder,
- codegezeichnete Landmarken mit weniger visuellem Rauschen,
- modulare Kreaturendarstellung: Kopf, wiederholbare Körpersegmente,
  Schwanz und sichtbare Rückenplatten als getrennte Renderbauteile,
- vorbereitete, rein visuelle Wachstumsstufen ohne Änderung der Bewegungs- oder
  Kollisionsfachlogik,
- reduzierte Spielanzeige für Ziel, Biomasse, Gefahr-Platzhalter und Burst,
- sichtbares Grab-, Burst- und Durchbruchfeedback,
- Fachtests für die datengetriebene Kreaturen-Optik, sofern neue Fachdaten
  entstehen.

## Nichtziele

- kein Hunter, keine Sensorik, keine neuen Gegner und keine Gate-4-Regeln,
- keine Ergebnisansicht, Mutation oder Run-Ökonomie von Gate 5,
- keine Chunkwelt, Persistenz oder endgültige Produktionsasset-Bibliothek,
- keine Änderung an Abriss oder dem bestehenden Terrainfachmodell.

## Akzeptanzkriterien

1. Oberfläche, Oberboden, tiefer Boden und Tunnel sind auf Mobilgröße sofort
   voneinander unterscheidbar.
2. Die Kreatur bleibt als Kopf–Körper–Schwanz-Silhouette lesbar und kann später
   ohne neues Vollkörper-Spritesheet in drei sichtbare Größenstufen wechseln.
3. Die Spielanzeige enthält keine technische Kachel- oder Debugmetrik mehr.
4. Bewegung, Terrainmutation, Jagd und Stützenkollaps verhalten sich fachlich
   unverändert.
5. Typecheck, Fachtests, Gesamttests, Produktionsbuild und Browserprüfung
   bestehen; Abriss bleibt isoliert.

## Prüfergebnis

- Fachtests, Gesamttests, Typecheck und Produktionsbuild bestehen am
  26. August 2026.
- Die Browserautomatisierung wurde beim lokalen Reload durch die
  Sicherheitsrichtlinie des eingebetteten Browsers abgewiesen. Der offene
  manuelle Test prüft daher ausschließlich die mobile visuelle Lesbarkeit;
  die fachliche Logik bleibt davon unberührt.
