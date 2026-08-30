# Task 043 – technische Browserbelege

30. August 2026. Lokaler Vite-Entwicklungsbuild, isolierter Chromium-Testbrowser.
Kein echter Smartphone- oder persönlicher Produktvergleich.

Nach dem technischen Vergleich hat der Nutzer B als Grundlage gewählt und die
Burststart-Ausstanzung verworfen (D-062). Die älteren `scenario-*`-Belege zeigen
den historischen D-061-Stand und sind für dieses Detail kein aktuelles Soll.
Aktueller Korrekturbeleg:

- `burst-start-fix.json`: B startet ohne Parameter; echter Burstbutton-Klick
  per Maus und emuliertem Touch erreicht Bursttempo 370. Maskenversion und jede
  Terrainzelle bleiben während des Bursts sowie nach Ablauf der Spur identisch;
  Erde am Kopfstartpunkt bleibt vorhanden, Fehlerlisten sind leer.
- `burst-start-fix-*-active.png` / `burst-start-fix-*-expired.png`: Desktop-
  und Touchansichten während des Bursts und nach verschwundener Spur.

- `browser-smoke.json`: Desktop (1280×800), Touch-Emulation (844×390), Eingaben,
  Status vor/nach Neustart und A/B-Wechsel sowie Fehlerlisten; Abriss-Einstieg.
- `scenario-smoke.json`: fest getaktete Scene-Integration mit Teststeuerung,
  Maskenversion, Spurablauf, Stützenzustände und Kollaps. Die ausschließlich
  im Testbrowser injizierte Spielreferenz ist kein Bestandteil des Builds.
- `scenario-recovering-active.png` / `scenario-recovering-expired.png`:
  sichtbare Spur und danach unveränderte tragende Erde.
- `scenario-recovering-structure.png`: lokale Aktionslöcher und Kollaps.
- `touch-recovering-breach.png`: Treffer, Tierreaktion und mobile Bedienflächen.

Die ersten `*-trail.png`-Smokeaufnahmen entstanden teilweise noch im bereits
vorgefertigten Starttunnel; sie beweisen dort keinen Spurablauf. Dafür sind die
separaten `scenario-*`-Aufnahmen und Zellzählungen maßgeblich.

Die oben genannten B-Szenariobilder, die mobile Trefferansicht und der
Abriss-Einstieg wurden visuell geprüft. Die normalen Smoke-Runs
prüfen echte Eingaben; die feste Scene-Integration prüft gezielt die
Terrain-/Rendererreaktion ohne Anspruch auf einen menschlichen Spieltest.
