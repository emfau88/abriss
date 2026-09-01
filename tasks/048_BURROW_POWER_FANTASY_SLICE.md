# Task 048: Burrow – Nahrungsnetz und sichtbare Macht

## Status

Technisch umgesetzt und geprüft. Am 1. September 2026 ausdrücklich zur
Umsetzung freigegeben („ok go“). Persönliche Produktwertung und echter
Smartphone-Test bleiben ein separates Produkttor.

## Pflichtlektüre

- `AGENTS.md`, `docs/00_PROJECT_INDEX.md`, `docs/DECISIONS.md`
- `docs/burrow/VISION.md`, `docs/burrow/VERTICAL_SLICE.md`
- `docs/burrow/FEED_GROW_SLICE.md`, `docs/burrow/POWER_FANTASY_DIRECTION.md`
- Tasks 046 und 047 sowie aktueller Feeding-, Run-, Motion-, Rendering- und HUD-Code

## Umfang

1. Der feste, höhlenlose Start aus Task 047 bleibt erhalten.
2. Drei Nahrungverben ersetzen die rein gleichförmige Nahrung: Sporenperlen,
   aufbrechbare Wurzelknollen und mit Burst knackbare Brutkapseln.
3. Drei reguläre Beuterollen unterscheiden sich in Größe, Wert und Jagdregel:
   Fadenwurm, fliehender Rennwurm und frontal gepanzerter Panzerwurm.
4. Die Mutationswahl besteht aus Sogschlund, Donnerrachen und Bebenherz.
5. Körperlicht, Mutationsladung, spektraler Kiefer, Sogbahnen und Bodenwelle
   machen Wachstum und Mutationswirkung ohne neue Bitmap-Assets lesbar.
6. Der bestehende Feed–Grow-Abschluss, Terrain B, direkte Steuerung und
   Abriss-Isolation bleiben erhalten.

## Nicht enthalten

- kein Wurzelwächter oder weiteres Apex-Duell,
- kein neues Level, keine Meta-Progression und kein Shop,
- keine allgemeine Gegnernavigation, Physik oder Körperkollision,
- keine finalen Produktionsassets oder neue Audio-Produktion.

## Akzeptanz

- Jede Nahrungsklasse verlangt ein erkennbar anderes Verb und vergibt ihre
  Biomasse genau einmal.
- Faden-, Renn- und Panzerwurm besitzen klar unterschiedliche Silhouetten;
  Rennwürmer fliehen deterministisch, Panzerwurm-Stirnkontakte werden vor der
  Gräberstufe blockiert.
- Jede Mutation verändert den Burst sichtbar und fachlich testbar.
- Donnerrachen verlängert nur einen aktiven Burst und höchstens dreimal.
- Bebenherz lädt höchstens drei Körperplatten durch Graben und entlädt lokal,
  deterministisch und ohne allgemeine Physik.
- Ein vollständiger Run bleibt mit jeder Mutation erreichbar und serialisierbar.
- Burrow-Fachtests, Gesamttests, Typprüfung, Produktionsbuild und Browserprüfung
  bestehen.

## Prüfergebnis

- 79 Burrow-Fachtests bestanden, darunter vollständige rendererfreie Runs mit
  allen drei Mutationen ohne Teleport oder eingespeiste Belohnung.
- Gesamtsuite: 207 Tests bestanden, zwei bestehende übersprungen.
- TypeScript-Typprüfung und Produktionsbuild bestanden; der bestehende Hinweis
  auf den gemeinsamen Phaser-Chunk über 500 kB bleibt.
- Browser: fester Start, drei Nahrung-/Beutesilhouetten, Wachstum und Jägerstufe
  regulär gespielt; Mutationswahl bei 80 geöffnet, Bebenherz gewählt, drei
  Rückenplatten durch Graben geladen und sichtbare Bodenwelle ausgelöst.
- Mobile Querformatansicht geprüft; keine Browserwarnung oder -fehler.
