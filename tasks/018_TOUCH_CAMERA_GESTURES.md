# Task 018: Touch-Kamera und Pinch-Zoom

## Status

`abgeschlossen`

## Ziel

Die Weltkamera lässt sich außerhalb gesperrter Aktionsmomente mit einem Finger
verschieben und mit zwei Fingern stabil um den Gestenmittelpunkt zoomen.

## Pflichtlektüre

- `AGENTS.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/04_VERTICAL_SLICE.md`
- `docs/DECISIONS.md`

## Akzeptanzkriterien

1. Ein Finger verschiebt die Kamera und bleibt an Weltgrenzen geklemmt.
2. Zwei Finger zoomen zwischen den bestehenden Grenzen.
3. Pointer-Wechsel erzeugen keinen Kamerasprung.
4. HUD-Flächen starten keine Weltbewegung.
5. Desktop-Steuerung bleibt unverändert.
6. Tests, Build und mobile Browserprüfung sind erfolgreich.

## Abschlussbericht

Phaser verarbeitet drei aktive Pointer. Rendererunabhängige Gestenmathematik
hält den Weltpunkt unter dem Pinch-Mittelpunkt stabil; Wechsel zwischen einem
und zwei Fingern setzen nur die Basis neu. HUD-Zonen, Hilfe und laufende
Aktionen sperren Gesten. CSS unterdrückt browsernativen Seitenzoom auf dem
Canvas. 51 Tests, Produktionsbuild sowie mobile Hoch-/Querformatprüfung waren
erfolgreich.
