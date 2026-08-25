# Task 037: Burrow Gate 0 und Gate 1

## Status

`abgeschlossen`

## Ziel

Ein vollständig isolierter Mobile-First-Bewegungsprototyp prüft, ob Graben,
Tunnelgleiten, Burst, Surface Breach und Wiedereintauchen bereits ohne weitere
Spielsysteme befriedigend und technisch stabil funktionieren.

## Warum jetzt

Die Burrow-Idee besitzt einen starken unmittelbaren Actionkern, wäre als
vollständiger Pivot aber teuer. Das kleinste riskante Produktsignal ist das
Bewegungsgefühl; Abriss darf durch den Versuch nicht verändert werden.

## Pflichtlektüre

- `AGENTS.md`
- `docs/burrow/VISION.md`
- `docs/burrow/VERTICAL_SLICE.md`
- `docs/burrow/TECHNICAL_PLAN.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/DECISIONS.md`

## Voraussetzungen

- sauberer Stand `ec36da9`,
- bestehende Test-, Build- und Pages-Pipeline ist grün.

## Scope

- Gate-0-Dokumentation und abgegrenzte Produktregeln,
- `burrow.html` und eigener Vite-Einstieg,
- eigene Simulation für Terrain, Körperpfad und Bewegung,
- kachelweise Terrain-Darstellung,
- Desktop- und Touchsteuerung,
- kleine Testarena und ein Durchbruchsziel,
- README-Link zur isolierten Pages-Version,
- Fachtests und Browserabnahme.

## Nichtziele

- keine Änderungen an Abriss-Gameplaycode,
- keine Gegner, Beute, Gebäudephysik oder Meta-Progression,
- keine große oder persistente Chunkwelt,
- keine finalen Assets.

## Akzeptanzkriterien

1. Abriss und Burrow bauen als getrennte Einstiege.
2. Burrow erfüllt alle Gate-1-Kriterien aus `docs/burrow/VERTICAL_SLICE.md`.
3. Der öffentliche README-Link führt direkt zu `burrow.html`.
4. Abriss-Tests bleiben unverändert grün.
5. Browserprüfung umfasst Desktopsteuerung und emulierte Touch-Eingabe.

## Verifikation

- fokussierte Burrow-Fachtests,
- `npm run typecheck`,
- `npm test`,
- `npm run build`,
- Browserprüfung von `/` und `/burrow.html`.

## Abschlussbericht

Abgeschlossen am 25. August 2026.

- Gate 0 trennt Burrow über eigene Produktdokumente, `burrow.html`,
  `src/burrow/` und `public/burrow/` vollständig von Abriss. Vite baut beide
  Einstiege, die README verlinkt das Labor separat.
- Gate 1 bietet eine 2048×1280-Testarena, codegezeichnete Platzhalter, einen
  distanzbasierten 23-Segment-Körper und eine feste 60-Hz-Bewegungssimulation.
- `carveCapsule()` entfernt auch bei maximalem Burst lückenlos Terrain. Graben,
  Tunnelgleiten, Burst, Flug und Wiedereintauchen sind getrennte Zustände.
- Die Terrainansicht besteht aus 256×256-Kacheln; im Browser aktualisierte ein
  normaler Grabschritt sichtbar nur eine bis zwei Kacheln.
- Desktopsteuerung, persistenter Touch-Kurs und große Burst-Fläche wurden im
  Browser geprüft. Der Breach-Pfad traf das Ziel, wechselte in die Flugphase
  und konnte wieder in Terrain eintauchen.
- Der normale Abriss-Einstieg wurde nach der Multi-Page-Änderung separat ohne
  Konsolenfehler geprüft.

Prüfungen: 9 fokussierte Burrow-Tests, vollständige TypeScript-Prüfung,
Gesamtsuite, Produktionsbuild sowie Desktop- und mobiles Browser-Smoke-Testing.
Der finale Gesamtlauf wird unmittelbar vor Veröffentlichung wiederholt.

Bekannte Einschränkung: Das codegezeichnete Wesen und die Arena sind bewusst
funktionale Platzhalter. Ob Masse, Wendeträgheit und Tempo tatsächlich Spaß
machen, benötigt nun den persönlichen Test auf einem echten Touchgerät.

Verbindliche Entscheidungen: `docs/DECISIONS.md`, D-053 und D-054.
