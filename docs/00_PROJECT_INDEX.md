# Projektindex

Stand: 21. Juli 2026

Dieses Dokument ist der Einstiegspunkt und die Karte der verbindlichen Projektdokumentation. Die Dokumente sollen kompakt bleiben. Inhalte werden nicht in mehreren Dateien parallel gepflegt.

## Aktuelle Phase

Technischer Vertical Slice. M1 bis M3.5 sind abgeschlossen; M4 ist als interner 3-gegen-3-Test spielbar und über GitHub Pages extern erreichbar. Der Build enthält zwei wählbare zerstörbare HD-Karten, gemeinsame Ballistik, fortlaufende Initiative, lokale Lauf-/Sprungpositionierung, drei Waffenprofile, zeitgezündete Abprallgranaten, begrenzten Explosionsrückstoß, Moki sowie die flüssigen 32-Frame-Wesen GLIB und Ghost. Kamera und Gegneraktionen laufen automatisch; außerhalb gesperrter Momente kann die große Welt auf Desktop und per Touch geschwenkt und gezoomt werden. Ein einmaliges Managerkommando kann die nächste Waffenplanung festlegen. Als Nächstes werden vollständige Matches auf Spielspaß und Verständlichkeit geprüft. Task 011 bleibt danach als direkter Steuerungsvergleich bereit; eine umfassende Manager-Metaebene beginnt erst nach diesem Produkttest.

## Verbindliche Dokumente

| Dokument | Zuständigkeit |
| --- | --- |
| `01_PRODUCT_VISION.md` | Ziel, Zielgruppe, Designpfeiler, Nichtziele und Produkthypothesen |
| `02_GAME_DESIGN.md` | Kernloop, Zugstruktur, Spielerentscheidungen, Figurenverhalten und Fairness |
| `03_TECHNICAL_ARCHITECTURE.md` | technische Grenzen, Module, deterministische Simulation und Qualitätsstrategie |
| `04_VERTICAL_SLICE.md` | exakt erlaubter Umfang und Abnahmekriterien des ersten spielbaren Beweises |
| `05_ROADMAP.md` | Reihenfolge der Meilensteine und Entscheidungstore |
| `06_ART_AND_TONE.md` | Welt, Humor, visuelle Regeln und Abgrenzung von Vorbildern |
| `ASSET_GENERATION.md` | Herkunft, Prompts und technische Aufbereitung generierter Styleframe-Assets |
| `DECISIONS.md` | chronologisches Protokoll verbindlicher Entscheidungen und Änderungen |
| `GLOSSARY.md` | einheitliche Begriffe für Produkt, Code und Kommunikation |

## Arbeitsdokumente

- `../AGENTS.md`: dauerhafte Arbeitsregeln für Coding-Agenten.
- `../tasks/TASK_TEMPLATE.md`: Vorlage für kleine, überprüfbare Aufgaben.
- `../tasks/`: priorisierte Implementierungsaufträge.

## Single-Source-of-Truth-Regeln

- Produktzweck und Nichtziele werden nur in `01_PRODUCT_VISION.md` entschieden.
- Spielregeln werden nur in `02_GAME_DESIGN.md` entschieden.
- technische Grundsatzentscheidungen werden nur in `03_TECHNICAL_ARCHITECTURE.md` und `DECISIONS.md` entschieden.
- der aktuelle Lieferumfang wird nur in `04_VERTICAL_SLICE.md` entschieden.
- Tasks beschreiben die Umsetzung eines Ausschnitts, aber erfinden keine neue Produktvision.

## Offene Produktentscheidungen

- endgültiger Spielname und öffentliche Markenidentität,
- genaue Dauer des Eingriffsfensters,
- genaue Ziel-Matchdauer nach ersten Spieltests,
- spätere Form der Management- und Kampagnenebene.

Diese Entscheidungen blockieren den technischen Vertical Slice nicht.
