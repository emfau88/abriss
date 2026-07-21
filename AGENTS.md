# AGENTS.md

## Projekt

Dieses Repository enthält „Projekt Abriss“, ein browserbasiertes, rundenartig inszeniertes 2D-Auto-Artillery-Teammanagement-Spiel. Der öffentliche Titel ist noch nicht festgelegt.

Der verbindliche Dokumentationsindex befindet sich in `docs/00_PROJECT_INDEX.md`.

## Vor jeder Implementierung

1. Lies diese Datei vollständig.
2. Lies die konkrete Aufgabenbeschreibung unter `tasks/`.
3. Lies alle dort als Pflichtlektüre aufgeführten Dokumente.
4. Prüfe den vorhandenen Code, Tests und den aktuellen Arbeitsbaum.
5. Formuliere einen kleinen, überprüfbaren Umsetzungsplan.
6. Implementiere ausschließlich den vereinbarten Umfang.
7. Führe die relevanten Prüfungen und den Produktionsbuild aus.
8. Berichte Änderungen, Prüfergebnisse und bekannte Einschränkungen ehrlich.

Bei Widersprüchen gilt diese Reihenfolge:

1. ausdrücklich bestätigte Nutzerentscheidung,
2. `docs/DECISIONS.md`,
3. Produktvision und Vertical-Slice-Scope,
4. technische Architektur,
5. Task-Datei,
6. bestehende Implementierungsdetails.

Ein Task darf Produktvision oder Architektur nicht stillschweigend überschreiben. Notwendige Abweichungen werden vor oder mit der Umsetzung in `docs/DECISIONS.md` dokumentiert.

## Unveränderliche Produktregeln

- Der Ton bleibt freundlich, farbenfroh und slapstickhaft, nicht zynisch oder grimdark.
- Große Kampfaktionen werden nacheinander inszeniert und bleiben lesbar.
- Figuren entscheiden grundsätzlich autonom; der Spieler beeinflusst sie über begrenzte Managerkommandos.
- Fehler müssen aus Persönlichkeit, sichtbarer Unsicherheit oder nachvollziehbaren Umständen entstehen.
- Zufällige „Dummheit“ ohne verständliche Ursache ist verboten.
- Zerstörbares Terrain muss taktische Konsequenzen haben und darf nicht bloß Dekoration sein.
- Das Spiel muss sich durch Management und Figurenbindung klar von einer direkten Worms-Kopie unterscheiden.

## Unveränderliche technische Regeln

- TypeScript wird mit strikter Typprüfung verwendet.
- Phaser übernimmt Browserintegration und Darstellung, nicht die fachliche Wahrheit der Simulation.
- Simulation, Darstellung und UI bleiben getrennt.
- Spielzustand ist serialisierbar; Simulationslogik hängt nicht von Renderframes oder realer Uhrzeit ab.
- Gameplay-Zufall läuft über explizite, gesetzte Zufallsquellen.
- Terrainkollision basiert im Vertical Slice auf einer veränderbaren Maske.
- KI und tatsächliche Projektilausführung verwenden dieselbe Ballistiklogik.
- KI-Entscheidungen liefern maschinenlesbare Bewertungsanteile und darstellbare Begründungen.
- Versteckter globaler, veränderbarer Zustand ist zu vermeiden.
- Fachlogik erhält automatisierte Tests; Fehlerbehebungen erhalten Regressionstests.

## Scope-Regeln

- Bevorzuge die kleinste spielbare und testbare Lösung.
- Ergänze keine nicht angeforderten Systeme „für später“.
- Kein Multiplayer, Backend, Shop, Live-Service, Machine Learning oder generative KI im laufenden Spiel.
- Keine Seile, Fahrzeuge, komplexen Ragdolls oder allgemeine Starrkörper-Simulation für das Terrain im Vertical Slice.
- Finale Assets werden erst nach erfolgreicher Validierung des Kernloops produziert.

## Erwartete Befehle

Nach Abschluss von `tasks/001_PROJECT_SETUP.md` müssen folgende Befehle existieren:

- Entwicklung: `npm run dev`
- Typprüfung: `npm run typecheck`
- Tests: `npm test`
- Produktionsbuild: `npm run build`

## Definition of Done

Eine Aufgabe ist nur abgeschlossen, wenn:

- ihre Akzeptanzkriterien erfüllt sind,
- relevante Tests und Typprüfung erfolgreich sind,
- der Produktionsbuild erfolgreich ist,
- das Ergebnis im Browser geprüft wurde, wenn sichtbares Verhalten betroffen ist,
- keine sachfremden Änderungen enthalten sind,
- neue verbindliche Entscheidungen dokumentiert sind,
- bekannte Einschränkungen benannt werden.

