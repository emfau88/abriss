# Roadmap

Die Roadmap arbeitet mit Entscheidungstoren. Ein späterer Meilenstein beginnt erst, wenn der vorherige ein überprüfbares Ergebnis liefert.

## M0 – Verbindliche Projektbasis

Ergebnis:

- Produktvision,
- Game-Design-Kern,
- technische Architektur,
- Vertical-Slice-Scope,
- Arbeitsregeln und erste Tasks.

Tor: Ein neuer Kollege oder Agent kann Ziel, Nichtziele, aktuellen Scope und nächsten Task ohne Chatverlauf erklären.

## M1 – Technische Projektbasis

Ergebnis:

- Vite-/Phaser-/TypeScript-Projekt,
- strikte Typprüfung,
- Vitest,
- minimale Szenenstruktur,
- headless nutzbares Simulationsmodul,
- CI-taugliche Befehle.

Tor: Entwicklungsserver, Tests, Typprüfung und Produktionsbuild funktionieren reproduzierbar.

## M2 – Zerstörbares Terrain und Ballistik

Ergebnis:

- Terrainmaske mit Debugdarstellung,
- kreisförmige Zerstörung,
- gemeinsame Raketenballistik für Vorschau und Ausführung,
- deterministische Szenariotests.

Tor: Ein Schuss erzeugt reproduzierbar einen sichtbaren und kollisionswirksamen Krater.

## M3 – Eine vollständige autonome Aktion

Ergebnis:

- wenige Aktionskandidaten,
- Utility-Bewertung,
- drei Persönlichkeitsprofile,
- Intent-UI,
- „Lass das!“ und Neuplanung,
- Ausführung mit verständlichem Ergebnis.

Tor: Testspieler verstehen ohne Entwicklererklärung, was geplant war, warum und was ihr Eingriff verändert hat.

## M3.5 – Große Welt und Kamerafundament

Ergebnis:

- ungefähr 3200×1800 Weltpixel bei 1280×720 Sichtfenster,
- mehrstufige Karte über mehrere Bildschirmbreiten und -höhen,
- Übersicht sowie manuelles Schwenken und Zoomen,
- automatische Planung-, Projektil- und Einschlagkamera,
- UI fest im Screen-Space,
- gemessene Terrain- und Renderperformance.

Tor: Der Spieler versteht die räumliche Lage in der Übersicht und verliert bei einer automatisch begleiteten Aktion weder Akteur, Ziel noch Ergebnis aus dem Kontext.

## M4 – Spielbares 3-gegen-3-Match

**Status:** technisch abgeschlossen; externes Produktsignal folgt in M5.

Ergebnis:

- Zugreihenfolge,
- Rakete, zeitgezündete Abprallgranate und Geländebrecher,
- lokale Bewegung,
- begrenzter Explosionsrückstoß gegen zerstörtes Terrain,
- einmaliges Managerkommando zur Waffenwahl,
- sieben reduzierte animierte Testwesen,
- Schaden, Fallen und Eliminierung,
- Sieg/Niederlage,
- Neustart und Seedanzeige.

Tor: Mehrere vollständige Matches laufen ohne manuelle Reparatur oder
Zustandsfehler. **Erfüllt:** Headless-Suite, deterministische Massenläufe,
Browserprüfung und Produktionsbuild bestehen.

## M5 – Lesbarkeit und Spielgefühl

**Status:** in Arbeit; Technik und A/B/C-Protokoll stehen, externe Durchführung offen.

Ergebnis:

- klare Kamera- und UI-Führung,
- Reaktionsanimationen,
- erste charakteristische Dialoge,
- grundlegendes Audio,
- Performance- und Barrierefreiheitsoptionen,
- externe Spieltests.

Nächster konkreter Schritt: Auto, Zielauftrag und Direkt nach
`08_PLAYTEST_PROTOCOL.md` mit Zielgröße zehn externen Personen vergleichen.
Bis dahin erfolgen keine neue Vollkarte, kein umfangreiches Gewichtetuning und
keine Vertiefung der Manager-Meta.

Tor: Die Produkthypothesen aus `01_PRODUCT_VISION.md` sind ausreichend bestätigt oder konkret widerlegt.

## M6 – Entscheidung über weitere Produktion

Nur nach erfolgreichem Vertical Slice wird entschieden, ob als Nächstes folgt:

- ein dünner Manager-Slice aus Crewauswahl, Trait-Lesbarkeit, einer Vorbereitung und Ergebnisrückblick,
- persistente Crewentwicklung,
- zusätzliche Karten und Werkzeuge,
- finale Art- und Audiopipeline.

Eine negative Validierung ist kein Anlass, mehr Content hinzuzufügen. Sie führt zu einer gezielten Überarbeitung oder zum Stoppen der betroffenen Idee.

Erst wenn dieser dünne Manager-Slice den Kampf nachweislich interessanter macht, werden Shop, Rekrutierung, langfristige Entwicklung oder eine Kampagne geplant.
