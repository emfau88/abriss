# Task 033: Sichtbarer und progressiver Spielstart

## Status

`abgeschlossen`

## Ziel

Der öffentliche Build zeigt sofort verständliches Ladefeedback und lädt die
großen HD-Karten erst beim Start eines Matches, statt vor dem Hauptmenü beide
vollständigen Karten zu blockieren.

## Warum jetzt

Die veröffentlichte Fassung blieb beim Kaltstart im Browser mehrere Sekunden
dunkel. Das gefährdet externe Kernloop-Tests, obwohl das Spiel danach stabil
läuft. Vier HD-Kartenbilder stellen den größten Teil des anfänglichen
Assetvolumens.

## Pflichtlektüre

- `AGENTS.md`
- `docs/00_PROJECT_INDEX.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/04_VERTICAL_SLICE.md`
- `docs/05_ROADMAP.md`
- `docs/DECISIONS.md`
- `tasks/014_GITHUB_PAGES_AND_MOBILE_SHELL.md`

## Scope

- sofort sichtbarer HTML-Ladestatus vor dem Phaser-Start,
- kleine Vorschaubilder für die Kartenwahl,
- HD-Hintergrund und HD-Terrain nur für die tatsächlich gestartete Karte,
- sichtbarer Ladefortschritt beim Wechsel in ein Match,
- unveränderte relative Assetpfade für lokale Builds und GitHub Pages,
- automatisierte Metadatenprüfung und Browserprüfung.

## Nichtziele

- keine Änderung der Kartenoptik, Kollisionsmaske oder Simulation,
- kein PWA-/Offlinecache,
- keine verlustbehaftete Änderung der im Match verwendeten HD-Quellen,
- kein allgemeines Asset-Streaming während einer laufenden Aktion.

## Akzeptanzkriterien

1. Vor dem Hauptmenü ist kein leerer dunkler Bildschirm ohne Status sichtbar.
2. Boot lädt keine vollständigen HD-Terrainbilder beider Karten.
3. Ein Match lädt ausschließlich die gewählte HD-Karte vor seiner Erzeugung.
4. Kartenwahl, Manageransicht und beide Karten funktionieren unverändert.
5. Typprüfung, Tests, Produktionsbuild und Browserprüfung bestehen.

## Verifikation

- `npm run typecheck`
- `npm test`
- `npm run build`
- Browser: Kaltstart, Kartenwechsel und Matchstart auf beiden Karten

## Abschlussbericht

Abgeschlossen am 24. August 2026.

- Der sofort sichtbare HTML-Ladestatus überbrückt jetzt auch Modul- und
  Phaser-Start; der Loader meldet danach echten Assetfortschritt.
- Vier 800×450-WebP-Vorschauen ersetzen vor dem Hauptmenü die vier
  3200×1800-HD-Quellen. Das anfängliche Kartenvolumen sinkt damit von
  16,61 MiB auf 138,3 KiB (−99,2 %).
- `MatchScene.preload()` lädt nur Hintergrund und Terrain der gewählten Karte
  sowie die ausschließlich dort benötigten Projektil-/VFX-Sheets. Ein eigener
  Ladebalken hält den Kartenwechsel lesbar.
- Beide Karten, Hauptmenü und Matchstart wurden im Browser visuell geprüft.
  Die HD-Quellen bleiben im Match unverändert.

Prüfungen: `npm run typecheck`, fokussierter Metadatentest, Gesamtsuite
(122 bestanden, 2 übersprungen), Produktionsbuild und Browserprüfung. Der
Build meldet weiterhin nur die bekannte Phaser-Chunkgrößenwarnung.

Verbindliche Entscheidung: `docs/DECISIONS.md`, D-049.
