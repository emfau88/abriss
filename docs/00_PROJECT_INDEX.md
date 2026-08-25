# Projektindex

Stand: 24. August 2026

Dieses Dokument ist der Einstiegspunkt und die Karte der verbindlichen Projektdokumentation. Die Dokumente sollen kompakt bleiben. Inhalte werden nicht in mehreren Dateien parallel gepflegt.

## Aktuelle Phase

Technischer Vertical Slice am Produkttor. Das vollständige 3-gegen-3-Match ist
mit zwei zerstörbaren HD-Karten, sieben reduzierten Cartoon-Figuren, drei
Waffen, lokaler Bewegung, Rückstoß, chronologischem Einsatzbericht und dünner
Managerhülle spielbar. Der Start lädt kleine Kartenvorschauen; nur die gewählte
HD-Karte wird beim Matchstart nachgeladen. Auto, der delegierte Zielauftrag und
freie Direktsteuerung stehen als reversible A/B/C-Varianten im selben Build.
Vier deterministische Konfliktsonden und das kurze `KERNLOOP-TEST`-Match machen
Teamrisiko, Fassketten, Geländeöffnung und Ring-out gezielt prüfbar. M4 ist
technisch abgeschlossen; M5 wartet jetzt auf den dokumentierten externen
Spieltest. Weitere Meta- oder Contentproduktion beginnt erst nach dessen
Produktsignal.

## Verbindliche Dokumente

| Dokument | Zuständigkeit |
| --- | --- |
| `01_PRODUCT_VISION.md` | Ziel, Zielgruppe, Designpfeiler, Nichtziele und Produkthypothesen |
| `02_GAME_DESIGN.md` | Kernloop, Zugstruktur, Spielerentscheidungen, Figurenverhalten und Fairness |
| `03_TECHNICAL_ARCHITECTURE.md` | technische Grenzen, Module, deterministische Simulation und Qualitätsstrategie |
| `04_VERTICAL_SLICE.md` | exakt erlaubter Umfang und Abnahmekriterien des ersten spielbaren Beweises |
| `05_ROADMAP.md` | Reihenfolge der Meilensteine und Entscheidungstore |
| `06_ART_AND_TONE.md` | Welt, Humor, visuelle Regeln und Abgrenzung von Vorbildern |
| `08_PLAYTEST_PROTOCOL.md` | Ablauf, Beobachtungsbogen und Entscheidungstor des externen A/B/C-Tests |
| `ASSET_GENERATION.md` | Herkunft, Prompts und technische Aufbereitung generierter Styleframe-Assets |
| `DECISIONS.md` | chronologisches Protokoll verbindlicher Entscheidungen und Änderungen |
| `GLOSSARY.md` | einheitliche Begriffe für Produkt, Code und Kommunikation |

## Arbeitsdokumente

- `../AGENTS.md`: dauerhafte Arbeitsregeln für Coding-Agenten.
- `07_CORE_GAMEPLAY_REVIEW.md`: festgehaltene Kernloop-Kritik, Gegencheck,
  Lösungsreihenfolge und messbare Abnahmekriterien.
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

## Isoliertes Burrow-Produktlabor

Burrow ist seit dem 25. August 2026 als separater Multi-Page-Einstieg im selben
Repository vorhanden. Es ist kein bestätigter Pivot und verändert keine
Abriss-Produktentscheidung. Gate 1 wurde persönlich positiv bewertet; Gate 2
erhielt eine technische Feedback-Iteration und Gate 3 testet aktuell eine
einzelne Untergraben-zu-Kollaps-Folge. Verbindlich für diesen abgegrenzten
Bereich sind:

- `burrow/VISION.md`,
- `burrow/VERTICAL_SLICE.md`,
- `burrow/TECHNICAL_PLAN.md`.

Der direkte Test läuft über `burrow.html`; Abriss bleibt unter `index.html`.
