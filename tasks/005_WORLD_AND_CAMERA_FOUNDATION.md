# Task 005: Große Welt und Kamerafundament

## Status

`abgeschlossen am 21. Juli 2026`

## Ziel

Das aktuelle 1280×720-Sichtfenster von einer ungefähr 3200×1800 großen Spielwelt trennen und eine verständliche manuelle sowie automatische Kameraführung implementieren.

## Warum jetzt

Die neue Inselrichtung benötigt mehrere Ebenen, weite Flugbahnen und Platz für sechs Figuren. Ohne Kamerafundament würde das vollständige Match auf einem zu engen Sonderfall aufgebaut oder durch dauerhaft winzige Figuren unlesbar.

## Pflichtlektüre

- `AGENTS.md`
- `docs/01_PRODUCT_VISION.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/04_VERTICAL_SLICE.md`
- `docs/06_ART_AND_TONE.md`
- `docs/DECISIONS.md`

## Voraussetzungen

- Task 004 ist abgenommen.

## Scope

- Weltziel ungefähr 3200×1800 bei 1280×720 Sichtfenster,
- vorläufige größere Inselkarte auf Basis des aktuellen Styleframes,
- Welt- und Kameragrenzen,
- Übersichtskamera für große Teile oder die gesamte Karte,
- manuelles Schwenken und Zoomen außerhalb gesperrter Aktionsmomente,
- automatische Rahmung von aktiver Figur, Ziel, Flugbahn und Wirkungszone,
- Projektilverfolgung und kurze Einschlag-Haltephase,
- UI bleibt fest im Screen-Space,
- reduzierte Kamerabewegung oder direkte Schnitte als Option,
- Debuganzeige für Weltgrenzen, Sichtausschnitt, Kameraziel und Zoom,
- Messung von Terrainmaske, Canvastextur und Dirty-Region-Updates.

## Nichtziele

- vollständige Zugreihenfolge,
- 3-gegen-3-Matchabschluss,
- Manager- oder Meta-Ebene,
- neue Wesenassets,
- finale Karte oder prozedurale Kartengenerierung,
- komplexe Kamerasequenzen oder filmische Politur.

## Akzeptanzkriterien

1. Die Welt ist mindestens doppelt so breit und hoch wie das Sichtfenster; Zielwert ist ungefähr 3200×1800.
2. Übersicht zeigt die räumliche Beziehung der wichtigsten Inseln und Figuren.
3. Planung rahmt Akteur, Ziel, Flugbahn und Wirkungszone ohne wichtige UI-Überdeckung.
4. Ausführung folgt dem Projektil und hält den Einschlag sichtbar, ohne die fachliche Simulation zu beeinflussen.
5. Spieler kann sinnvoll schwenken und zoomen; Kamera bleibt innerhalb der Weltgrenzen.
6. Reduzierte Bewegung ersetzt lange Fahrten durch schnellere Übergänge oder Schnitte.
7. Figuren sind im Überblick noch erkennbar und bei Planung/Reaktion gut lesbar.
8. Terrainzerstörung und Ballistik funktionieren an weit auseinanderliegenden Weltpositionen und Kartenrändern.
9. Speicher- und Aktualisierungskosten werden gemessen und in `docs/DECISIONS.md` ergänzt.

## Verifikation

- `npm run typecheck`
- `npm test`
- `npm run build`
- Browserprüfung mit Übersicht, manuellem Pan/Zoom, Planung, Projektilflug, Einschlag und Randpositionen
- Browserprüfung der reduzierten Kamerabewegung

## Abnahmeprotokoll

- Spielwelt und Terrain wurden von 1280×720 auf 3200×1800 Weltpixel erweitert; das Sichtfenster bleibt 1280×720,
- der vorhandene mehrstufige Styleframe wird vorläufig auf den größeren Weltmaßstab abgebildet; Figuren behalten ihre Weltgröße,
- Übersicht bei Zoom 0,40 zeigt Hauptlandmasse, beide fliegenden Inseln und alle vier Testfiguren gemeinsam,
- Planung rahmt Akteur, Ziel, komplette Flugbahn und Wirkungszone in einer HUD-sicheren Fläche,
- Ausführung folgt dem Projektil bei Zoom 0,86 und wechselt für Einschlag und Fall auf einen nahen Ergebnisframe,
- Pfeiltasten und Mausrad beziehungsweise Q/E erlauben begrenztes Schwenken und Zoomen; O stellt die Übersicht wieder her,
- C schaltet automatische Fahrten auf direkte Schnitte um,
- eine eigene HUD-Kamera hält Titel, Intent-Anzeige, Schaltflächen und Statusleiste unabhängig von Weltzoom und Scrollposition fest,
- Debugansicht zeigt Weltgrenze, aktuellen Sichtausschnitt, Kameraziel, Zoom, Kameramodus und Speicherkosten,
- die 1600×900-Zellmaske belegt 1,37 MiB; ihre RGBA-Canvastextur belegt 5,49 MiB,
- der geprüfte Einschlag aktualisierte nur 62×52 Zellen und benötigte in der Browser-Einzelmessung rund 6,1 ms; dies ist ein Kontrollwert, kein belastbarer Benchmark,
- die größere Karte behält drei gültige reproduzierbare Alternativen für das Testziel; „Lass das!“ wählt weiterhin einen anderen erklärten Plan,
- Browserprüfung mit Übersicht, manuellem Zoom, Planung, Manageralternative, Projektilfolge, Einschlag, reduzierter Bewegung und Debugansicht erfolgreich,
- 24 Tests, Typprüfung und Produktionsbuild erfolgreich,
- Browserkonsole nach dem Kernablauf ohne Fehler oder Warnungen.
