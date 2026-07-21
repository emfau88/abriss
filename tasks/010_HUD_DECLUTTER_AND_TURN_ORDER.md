# Task 010: HUD entzerren und Zugfolge zeigen

## Status

`abgeschlossen`

## Ziel

Das Spielfeld wieder in den Mittelpunkt rücken und trotzdem Teamzustand, aktive Figur, nächste Züge und den angekündigten Plan verständlich sichtbar halten.

## Scope

- alte große Überschrift und permanente Steuerungserklärung entfernen,
- schmale obere Leiste aus Crew, Zugfolge und Rivalen,
- aktuelle sowie nächste lebende Figuren anzeigen,
- Planpanel deutlich verkleinern und Inhalt priorisieren,
- Steuerungshilfe nur über einen kleinen Hilfe-Schalter einblenden,
- sichtbarer HP-Balken direkt an jeder Figur,
- automatische Kamera-Safe-Areas an das kleinere HUD anpassen.

## Nichtziele

- manuelles Zielen, Laufen oder Springen,
- Änderung der autonomen Planungslogik,
- finale 3-gegen-3-UI,
- neue Charakterassets.

## Akzeptanzkriterien

1. Keine dekorative Titelzeile oder permanente Tastaturlegende verdeckt das Spielfeld.
2. Team-HP und Einzel-HP bleiben in einer höchstens 70 Pixel hohen oberen Leiste sichtbar.
3. Aktuelle Figur und mindestens zwei folgende lebende Figuren sind erkennbar.
4. Das Planpanel benötigt deutlich weniger Breite und Höhe als zuvor.
5. Steuerungshinweise erscheinen nur auf Anforderung.
6. Jede Figur trägt einen eigenen, synchronisierten HP-Balken.
7. Planung, Einschlag und Gegnerzug bleiben ohne HUD-Überlappung lesbar.

## Verifikation

- Unit-Test der Zugvorschau
- `npm run typecheck`
- `npm test`
- `npm run build`
- Browserprüfung bei Planung, Treffer und Teamwechsel

## Abnahme 2026-07-21

- Dekorative Überschrift, Unterzeile und permanente Tastaturlegende entfernt.
- Obere Leiste ist 68 Pixel hoch und kombiniert Crew, aktuelle/nächste Züge und Rivalen.
- Zugfolge wird aus dem rendererunabhängigen Matchzustand erzeugt und überspringt ausgeschaltete Figuren.
- Planpanel von 368×526 auf 288×366 logische Pixel reduziert und inhaltlich gekürzt.
- Steuerungshilfe öffnet und schließt über `H` beziehungsweise einen kleinen Hilfe-Schalter.
- Jede Weltfigur besitzt einen eigenen numerischen HP-Balken; der geprüfte Treffer aktualisierte Rivale A und beide HUD-Ebenen auf 40 HP.
- Kamera-Safe-Areas an die schmalere obere Leiste und das kleinere rechte Panel angepasst.
- Planung, Treffer, automatische Gegnerantwort und Zug 3 im Browser ohne neue Konsolenfehler geprüft.
- `npm run typecheck`, `npm test` (31 Tests) und `npm run build` erfolgreich.
