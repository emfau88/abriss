# Task 025: Idle-Jitter von GLIB und GHOST beheben

## Status

`bereit`

## Ziel

Die Idle-Animationen von GLIB (Slime) und GHOST laufen sichtbar ruhig und
zyklisch; „jitterfrei“ ist danach keine Behauptung mehr, sondern ein
dauerhafter, automatischer Test über die Sheet-Pixel.

## Befund (gemessen am 22. Juli 2026)

Headless-Vermessung der Alpha-Schwerpunkte aller acht Idle-Frames
(`decodeRgbaPng` aus Task 021, Schwelle Alpha ≥ 40):

| Sheet | Schwerpunkt-Drift X | größter Einzelsprung | Fußlinien-Drift |
| --- | ---: | ---: | ---: |
| `slime-fluid-sheet.png` | 21,9 px (138→117) | ~22 px beim Loop-Wrap f7→f0 | 3 px |
| `ghost-fluid-sheet.png` | 27,8 px (135→107) | 13,5 px mitten im Loop (f5→f6) | 3 px |

**Ursache 1 – nicht zyklischer Loop:** Der Bildinhalt wandert über die acht
Frames stetig nach links und springt beim Neustart des Loops zurück. Bei
12 fps ruckt die Figur dadurch etwa einmal pro Sekunde um 12–16
Bildschirmpixel. Die frühere „rechnerische Frame-Stabilisierung“ (D-024,
D-028) hat nur vertikal verankert – die Fußlinie ist mit 3 px sauber –, die
horizontale Lage aber nie geprüft.

**Ursache 2 – endloser kosmetischer Scale-Tween:**
`MatchScene.animateCreatureTransition()` legt ausschließlich bei Slime und
Ghost dauerhaft wiederholte Scale-Tweens (±2 %, 340 ms, yoyo) über das Idle.
Das ständige Neu-Sampling der auf ~57 % verkleinerten 256er-Frames erzeugt
Kantenflimmern zusätzlich zum Sheet-Ruck – und doppelt das „Atmen“, das die
Frames bereits enthalten.

## Lösungsweg

### Schritt 1 – Messung als Regressionstest

Vitest-Test (nutzt `decodeRgbaPng`), der für jede Loop-Animation (idle,
walk, jump) beider Sheets prüft: größter Frame-zu-Frame-Sprung des
Schwerpunkts **einschließlich Wrap f7→f0** ≤ 4 px, Fußlinien-Drift ≤ 3 px.
Der Test schlägt zunächst erwartungsgemäß fehl und dokumentiert den Defekt.

### Schritt 2 – Sheets rechnerisch neu ausrichten

Einmaliges Node-Werkzeug (PNG-Decoder vorhanden; Encoder über
`node:zlib.deflateSync` ergänzen): verschiebt jeden Frame ganzzahlig
horizontal, sodass der Schwerpunkt des unteren Inhaltsdrittels (Basis der
Figur, stabiler als der Gesamtschwerpunkt bei Arm-/Schweifbewegung) über
alle Frames auf dem Median liegt; vertikal bleibt die Fußlinie unverändert.
Randprüfung: alle Bounding-Boxen besitzen ≥ 14 px Abstand zum Framerand,
die nötigen Verschiebungen (≤ 28 px) passen ohne Beschnitt. Die korrigierten
PNGs werden committet; Schritt-1-Test wird grün.

### Schritt 3 – Kosmetische Tweens zähmen

In `animateCreatureTransition()`: keine endlos wiederholten Scale-Tweens
mehr für Loop-Zustände (idle, ready, planning, walk) – das Atmen liefert
das Sheet selbst. Der Ghost behält seinen Schwebe-Tween nur auf Y (ohne
Scale-Anteil); einmalige Squash-Übergänge bei Ereignissen (jump, startled,
action) bleiben unverändert erhalten (D-024: Kosmetik ohne Autorität).

### Schritt 4 – Browserprüfung

Beide Figuren im Match und im Manager beobachten: Idle ruhig, Loop ohne
Ruck, Übergänge weiterhin lebendig; Gegenprobe mit `R`-Neustart.

## Nichtziele

- keine neuen Frames oder KI-Bildgenerierung (reine Ausrichtung),
- keine Änderung an Simulation, Ankern der Container oder Kamera,
- Moki und Hornling nur mitmessen, nicht umbauen (4-Frame-Sheets).

## Akzeptanzkriterien

1. Regressionstest über die Sheet-Pixel ist grün (inklusive Wrap-Prüfung).
2. Kein endloser Scale-Tween mehr auf Loop-Zuständen.
3. Browserprüfung bestätigt ruhiges Idle bei GLIB und GHOST.

## Verifikation

- `npm run typecheck && npm test && npm run build`,
- Vorher-/Nachher-Messwerte der Ausrichtung im Abschlussbericht.

---

*Befund, Messung und Lösungsweg am 22. Juli 2026 erstellt von Claude Fable 5
(Anthropic).*
