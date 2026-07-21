# Technische Architektur

## Architekturziele

Die Architektur soll drei Eigenschaften schützen:

1. Kampfentscheidungen sind reproduzierbar und testbar.
2. Darstellung kann verbessert werden, ohne Spielregeln zu verändern.
3. Terrain, Ballistik und KI verwenden dieselben fachlichen Abfragen.

## Vorgesehener Stack

- TypeScript mit `strict: true`,
- Phaser für Szenen, Rendering, Audio und Browserinput,
- Vite für Entwicklung und Produktionsbuild,
- Vitest für fachliche Tests,
- Canvas/WebGL über Phaser,
- logische Darstellungsauflösung 1280 × 720, skalierbar auf das Browserfenster,
- davon getrennte Spielwelt mit Zielgröße ungefähr 3200 × 1800 Weltpixel im Vertical Slice.

Konkrete Paketversionen werden bei Projektsetup festgehalten. Abhängigkeiten werden nur ergänzt, wenn ihr Nutzen im aktuellen Meilenstein nachweisbar ist.

## Modulgrenzen

```text
src/
├── simulation/
│   ├── state/
│   ├── random/
│   ├── terrain/
│   ├── ballistics/
│   ├── combat/
│   ├── turns/
│   └── ai/
├── game/
│   ├── scenes/
│   ├── rendering/
│   ├── animation/
│   ├── audio/
│   └── input/
├── ui/
├── content/
└── shared/
```

Abhängigkeiten zeigen nach innen: `game` und `ui` dürfen `simulation` verwenden. `simulation` darf Phaser, DOM, Audio, Systemzeit und Browserzustand nicht importieren.

## Simulationsmodell

Der fachliche Zustand besteht aus serialisierbaren Daten:

- Match- und Zugstatus,
- Figurenwerte und Positionen,
- Terrainmaske oder referenzierte Terrainversion,
- aktive Projektile und Effekte mit Gameplaywirkung,
- Inventar und Aktionsressourcen,
- Seed- und Zufallszustände,
- Ereignis- und Kommandoprotokoll.

Simulationseingaben sind explizite Kommandos. Simulationsergebnisse sind neuer Zustand plus fachliche Ereignisse. Rendering liest Zustand und Ereignisse, besitzt aber keine Autorität über Schaden, Kollision oder Zugfortschritt.

## Zeit und Determinismus

- Die Simulation verwendet einen festen Schritt, zunächst 60 Schritte pro Simulationssekunde.
- Renderframes dürfen Simulationsschritte nachholen, aber keine Spielregeln verändern.
- Gameplay-Zufall wird aus einem Match-Seed abgeleitet.
- Benannte Zufallsströme trennen mindestens KI-Auswahl, Gameplay-Streuung und rein kosmetische Variation.
- Kosmetische Änderungen dürfen eine bestehende Gameplay-Wiederholung nicht verändern.
- Ein Replay speichert Startkonfiguration, Build-/Regelversion, Seed und Managerkommandos.

Bitgenaue Gleichheit zwischen allen JavaScript-Engines ist im ersten Slice kein Versprechen. Innerhalb desselben Builds müssen Tests und Replays reproduzierbar sein. Kritische Vergleiche verwenden stabile Quantisierung oder Toleranzen statt zufälliger Renderframe-Werte.

## Terrain

Das Terrain besteht fachlich aus einer binären oder kompakt klassifizierten Maske in Weltkoordinaten.

Erforderliche Kernoperationen:

- `isSolid(x, y)`,
- Bereichsabfrage,
- Kreis aus Maske entfernen,
- Boden unter einer Figur bestimmen,
- Strahl- oder Segmentabfrage,
- betroffene Region als „dirty“ markieren.

Explosionen verändern fachliche Maske und sichtbare Textur aus demselben Ereignis. Aktualisiert wird nur die betroffene Region. Die Maske wird nicht nach jeder Explosion in allgemeine Physikpolygone umgebaut.

Der Terrainprototyp verwendet gemäß Entscheidung D-010 zwei Weltpixel pro Maskenzelle und eine Byte-Zelle pro Position. Änderungen dieser Auflösung benötigen eine neue Messung und einen Eintrag in `DECISIONS.md`.

## Ballistik

Ballistik ist eine reine Simulationsfunktion. Vorschau, KI-Bewertung und Ausführung verwenden dieselben Integrations-, Kollisions- und Explosionsregeln.

Eine Trajektorienauswertung liefert mindestens:

- abgetastete Flugbahn,
- ersten relevanten Kontakt,
- erwartete Explosionsposition,
- betroffene Figuren,
- erwarteten Terrainbereich,
- Unsicherheitsbereich bei Streuung.

Visuelle Partikel und Kamerabewegung sind nicht Teil der Ballistik.

## KI

Die erste KI ist ein begrenztes Utility-System:

```text
gültige Aktionen erzeugen
→ mit echter Ballistik simulieren
→ einzelne Nutzen- und Risikowerte berechnen
→ Persönlichkeitsmodifikatoren anwenden
→ stabil sortieren
→ kontrollierte Seed-Variation anwenden
→ beste Aktion und Begründung ausgeben
```

Ein Aktionsplan enthält nicht nur einen Gesamtwert, sondern aufgeschlüsselte `reasonCodes`, beispielsweise:

- erwarteter Gegnerschaden,
- Ausschaltchance,
- Freundbeschussrisiko,
- Eigenschaden,
- Terrainvorteil,
- Positionsrisiko,
- Persönlichkeitsbonus,
- Unsicherheit.

Die Kandidatenzahl wird begrenzt. Optimierungen dürfen die sichtbare Entscheidungslogik nicht durch ein zweites, abweichendes Modell ersetzen.

Task 012 kombiniert die Waffenplanung mit einem getrennt testbaren `LocalMovementPlanner`. Er erzeugt nur lokale Halten-, Lauf- und Sprungkandidaten innerhalb von 190 horizontalen Weltpunkten, prüft Boden, Kopffreiheit, andere Figuren und Sprung-Samples gegen die Terrainmaske und bewertet die Kandidaten mit derselben gesetzten Zufallsquelle. Für jede mögliche Endposition wird die echte Waffenplanung ausgeführt; ausgewählt wird der gemeinsame Nutzen aus Position und Waffe. Wenn kein Angriff möglich ist, bleibt ein reiner Positionierungszug zulässig. Der Geländebrecher darf einen Kontakt mit ausreichend Terrainwirkung auch ohne unmittelbaren Zielschaden als gültigen Öffnungsplan bewerten.

## Darstellung und UI

Phaser-Szenen übersetzen fachlichen Zustand in Sprites, Terraintextur, Effekte und Kamera. Die Intent-UI zeigt Plan und Gründe vor der Ausführung.

Eine höchstens 68 Pixel hohe obere Leiste zeigt links und rechts Figurenzuordnung, Einzel-HP und aktuelle Team-HP; in der Mitte stehen aktuelle Figur, Zugnummer und die nächsten lebenden Figuren. Die aktive Seite erhält eine Kontur, die aktive Figur zusätzlich einen Pfeil; Balken und Zahlen vermitteln denselben Zustand redundant. Jede Weltfigur trägt außerdem einen eigenen HP-Balken. Das verkleinerte Planpanel bleibt rechts; darunter liegen drei kleine Waffenbefehl-Schaltflächen, die nur auf einem eigenen Planungszug verfügbar sind. Steuerungshinweise erscheinen ansonsten nur in einer einblendbaren Hilfe. Alle Anzeigen lesen ausschließlich den bestehenden Matchzustand und besitzen keine eigene Gameplay-Autorität.

Für die erste Version gelten:

- klare Teamfarben plus Form-/Symbolunterschiede,
- gut sichtbare Wirkungszonen,
- abschaltbare Kamerabewegung,
- pausierbare oder unbegrenzte Planungsphase im barrierearmen Modus,
- keine Information ausschließlich über Farbe vermitteln.

Die äußere Browserhülle ist vom festen logischen 16:9-Sichtfenster getrennt. Sie nutzt `100dvh`, mobile Safe Areas und `viewport-fit=cover`; Phaser passt das vollständige Sichtfenster weiterhin mit `FIT` ein. Dadurch bleibt derselbe deterministische Spielzustand auf Desktop, im mobilen Querformat und im Hochformat sichtbar. Hochformat ist funktional, aber wegen der unveränderten HUD-Dichte nicht die bevorzugte Darstellung. Ein Vollbildschalter wird nur angeboten, wenn Browser und Eingabegerät ihn sinnvoll unterstützen.

Der statische Produktionsbuild verwendet relative Vite- und Public-Assetpfade. Dadurch ist dasselbe `dist/` sowohl an einer Domainwurzel als auch unter einem GitHub-Pages-Projektpfad ausführbar. GitHub Actions installiert ausschließlich aus dem Lockfile, führt Tests und Produktionsbuild aus und veröffentlicht danach das unveränderte Build-Artefakt.

## Weltmaßstab und Kamera

Die 1280×720 Pixel beschreiben das Sichtfenster, nicht die Kartenbegrenzung. Der nächste Weltprototyp zielt auf ungefähr 3200×1800 Weltpixel, also etwa das 2,5-Fache der sichtbaren Breite und Höhe. Der genaue Wert darf nach Lesbarkeits- und Performanceprüfung angepasst werden, muss aber mindestens zwei sichtbare Ausschnitte pro Achse ermöglichen.

Figuren behalten ihre fachliche Weltgröße. Sie werden nicht dauerhaft verkleinert, um mehr Karte in einen festen Ausschnitt zu pressen. Stattdessen verwendet die Kamera mehrere reproduzierbare Darstellungsmodi:

- **Übersicht:** ungefähr 0,4 Zoom; zeigt große Teile oder die gesamte Karte und Figuren mit etwa 40–50 Bildschirmpixeln Höhe,
- **Planung:** ungefähr 0,6–0,75 Zoom; rahmt aktive Figur, Ziel, relevante Flugbahn und Wirkungszone gemeinsam,
- **Ausführung:** ungefähr 0,85–1,0 Zoom; folgt Projektil oder Aktion weich und hält den Einschlag kurz im Bild,
- **manuell:** Spieler darf außerhalb gesperrter Aktionsmomente schwenken und zoomen,
- **barrierearm:** automatische Bewegung kann reduziert, beschleunigt oder durch direkte Schnitte ersetzt werden.

UI bleibt im Screen-Space und bewegt sich nicht mit der Weltkamera. Kamerazustand ist Darstellung und verändert weder Simulation, Seed, KI-Bewertung noch Ballistik. Automatische Frames werden aus fachlichen Punkten wie Akteur, Ziel, Trajektoriengrenzen und Einschlag berechnet und anschließend an die Weltgrenzen geklemmt.

Bei 3200×1800 Weltpixeln benötigt die bestehende Zwei-Pixel-Maske 1600×900 Byte-Zellen beziehungsweise rund 1,37 MiB. Die zugehörige RGBA-Canvastextur benötigt rund 5,5 MiB. Diese Größen sind für den Desktop-Slice voraussichtlich vertretbar, werden in Task 005 aber gemessen; Dirty-Region-Updates bleiben verpflichtend.

Die Messung in Task 005 bestätigte 1,37 MiB für die Maske und 5,49 MiB für die damalige halbaufgelöste RGBA-Canvastextur. Task 007 trennt Darstellungs- und Kollisionsauflösung: Die Maske bleibt 1600×900, die schärfere Terrain-Canvas verwendet 3200×1800 beziehungsweise 21,97 MiB. Ein repräsentativer 62×54-Zellen-Krater aktualisierte 124×108 Renderpixel und benötigte einschließlich Textur-Refresh rund 36,8 ms. Der Wert ist eine Entwicklungsbrowser-Einzelmessung; der CanvasTexture-Upload bleibt ein Optimierungspunkt.

Nach jeder Terrainmutation werden Figuren rendererunabhängig gegen dieselbe Maske geprüft. Fehlt die Unterstützung am aktuellen Fußpunkt, wird der nächste feste Punkt senkrecht darunter zur fachlichen Landeposition. Gibt es keinen, fällt die Figur aus der Welt. Animation und Kameraführung interpolieren nur zu diesem bereits bestimmten Ergebnis.

## Rückstoß – begrenzter Physik-Slice

Rückstoß ist kein bloßer Sprite-Tween. `ExplosionKnockback` berechnet rendererunabhängig eine reproduzierbare Figurenflugbahn gegen das inzwischen beliebig zerstörte Terrain. Die aktuelle Näherung verwendet acht Prüfpunkte als einfache Körperhülle und unterteilt jede Bewegung auf höchstens eine halbe Terrainzelle, damit repräsentative schmale Kanten nicht übersprungen werden.

Der implementierte erste Umfang enthält:

1. datengetriebener Explosionsimpuls aus Abstand, Richtung und Waffenprofil,
2. feste Simulationsschritte für eine punkt- oder kapselähnliche Figur mit Gravitation,
3. gesweepte Abfragen gegen dieselbe Terrainmaske wie Ballistik und Fallen,
4. höchstens ein gedämpfter Abpraller, anschließend Landung oder Fall aus der Welt,
5. dieselben berechneten Samples für Animation, Kamera und fachliches Ergebnis,
6. Szenariotests für Flachlandung, Wandkontakt ohne Tunneln, Reichweite und Out-of-world; Kraterränder und Mehrfachtreffer werden zusätzlich im Browser geprüft.

Damit entsteht bereits ein klarer Worms-artiger Schleudereffekt. Figuren-gegen-Figuren-Stöße, mehrfaches Rollen, allgemeine Starrkörperrotation und Ragdolls bleiben außerhalb dieses ersten Umfangs; sie würden Komplexität und Fehlerfläche deutlich erhöhen, ohne den Kernnutzen proportional zu verbessern.

## Zugabschluss und Initiative

Die Szene verwendet den rendererunabhängigen `MatchState` als Autorität für aktive Figur, Zugnummer, Lebenspunkte und Initiative. Die Reihenfolge des aktuellen 3-gegen-3-Prototyps wechselt zwischen den Teams und überspringt ausgeschaltete Figuren. Nach einem Einschlag bleibt die Szene in einer kurzen Auflösungsphase, bis Schaden, Terrainmutation, Fallbewegung und VFX beendet sind. Erst danach wird der Matchausgang geprüft und gegebenenfalls der nächste Zug geplant. Gegnerpläne werden mit derselben Vorschau angekündigt, aber nach einem festen Lesefenster automatisch ausgeführt. Auch ein reiner Positionierungszug durchläuft einen vollständigen Abschluss; dadurch entstehen bei blockierten Schüssen keine leeren Überspringschleifen.

## Inhaltsdaten

Waffen, Merkmale und Balancewerte werden datengetrieben definiert, zunächst als streng typisierte TypeScript-Daten. Externe JSON-Schemas werden erst benötigt, wenn Inhalte außerhalb des Builds bearbeitet oder importiert werden.

## Teststrategie

### Unit-Tests

- Seed-Zufall,
- Maskenoperationen und Randfälle,
- Ballistik ohne Renderer,
- Schaden und Rückstoß,
- Kandidatenbewertung und Persönlichkeitsmodifikatoren,
- Zugreihenfolge und Zustandsübergänge.

### Deterministische Szenariotests

Feste Startzustände und Seeds prüfen komplette Aktionen. Erwartet werden fachliche Ereignisse und relevante Endzustände, nicht Pixelbilder oder Animationsframes.

### Browser-Smoke-Tests

Mindestens Start, Matchbeginn, eine ausgeführte Aktion, Terrainänderung und Neustart werden in einem echten Browser geprüft. Sichtbare Features erhalten zusätzlich manuelle visuelle Kontrolle.

## Vorläufige Qualitätsziele

- flüssige Darstellung auf einem üblichen aktuellen Desktop-Browser,
- keine langen UI-Blockaden während normaler KI-Planung,
- reproduzierbare Testfälle mit ausgegebenem Seed,
- verständliche Fehlermeldung statt stiller Zustandskorruption,
- Produktionsbuild ohne Typfehler und bekannte Konsolenfehler.
