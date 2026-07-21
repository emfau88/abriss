# Task 001: Technische Projektbasis

## Status

`abgeschlossen am 21. Juli 2026`

## Ziel

Ein minimales, professionelles Phaser-/TypeScript-Projekt erstellen, das lokal startet, streng typisiert ist, Tests ausführt und als Produktionsbuild gebaut werden kann.

## Warum jetzt

Alle weiteren Prototypen benötigen eine kleine, reproduzierbare Basis. Dieser Task beweist nur die Entwicklungsumgebung und Modulgrenzen; er baut noch kein Kampfsystem.

## Pflichtlektüre

- `AGENTS.md`
- `docs/00_PROJECT_INDEX.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/04_VERTICAL_SLICE.md`
- `docs/DECISIONS.md`

## Voraussetzungen

- unterstützte Node.js- und npm-Versionen sind lokal verfügbar,
- konkrete Abhängigkeitsversionen werden vor Installation geprüft und anschließend im Lockfile fixiert.

## Scope

- `package.json` und Lockfile,
- Vite mit TypeScript,
- Phaser-Bootstrap,
- Vitest-Konfiguration,
- `tsconfig` mit strenger Typprüfung,
- Verzeichnisstruktur gemäß Architektur,
- minimale Boot- und Match-Platzhalterszene,
- rendererunabhängiges Simulationsmodul mit einem kleinen Beispieltest,
- zentrale Entwicklungs-, Typprüfungs-, Test- und Buildbefehle,
- `.gitignore`,
- kurze Ergänzung der lokalen Startanleitung in `README.md`.

## Nichtziele

- Terrainzerstörung,
- Waffen oder Projektile,
- Figuren-KI,
- finale UI oder Assets,
- zusätzliche Frameworks, State-Management-Bibliotheken oder Backenddienste.

## Akzeptanzkriterien

1. `npm run dev` startet die Browseranwendung ohne Konsolenfehler.
2. Eine Phaser-Szene zeigt einen bewusst einfachen Projektplatzhalter und Build-/Debuginformation.
3. `simulation` importiert weder Phaser noch Browser-APIs.
4. `npm run typecheck` besteht mit strikter Typprüfung.
5. `npm test` führt mindestens einen sinnvollen Test des Simulationsmoduls erfolgreich aus.
6. `npm run build` erzeugt einen erfolgreichen Produktionsbuild.
7. Es existieren keine ungenutzten Produktionsabhängigkeiten.

## Verifikation

- `npm run typecheck`
- `npm test`
- `npm run build`
- Anwendung im Browser öffnen und Bootszene visuell prüfen
- Browserkonsole auf Fehler prüfen

## Übergabe

Task 001 wurde abgenommen und Task 002 auf `bereit` gesetzt.

Abnahmeprotokoll:

- `npm run typecheck`: erfolgreich,
- `npm test`: zwei Tests erfolgreich,
- `npm run build`: erfolgreich,
- Desktop- und schmales Browserlayout: visuell geprüft,
- Browserkonsole: keine Warnungen oder Fehler,
- bekannte Einschränkung: Der Phaser-Anteil erzeugt im ungeteilten Produktionsbundle eine Größenwarnung; Code-Splitting wird erst relevant, sobald zusätzliche Einstiegspunkte oder größere eigene Module hinzukommen.
