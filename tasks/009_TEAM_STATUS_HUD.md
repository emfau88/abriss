# Task 009: Kompakte Team- und HP-Übersicht

## Status

`abgeschlossen`

## Ziel

Während jeder Kameraeinstellung auf einen Blick zeigen, welche Figuren zu welchem Team gehören, wie viele Lebenspunkte jede Figur besitzt und wie hoch die aktuelle Team-Gesamtgesundheit ist.

## Scope

- zwei kompakte Teamkarten im festen HUD,
- Figurenname und aktuelle HP je Teammitglied,
- aktueller und maximaler Team-HP-Wert,
- klarer Marker für die aktive Figur und das aktive Team,
- sofortige Aktualisierung nach Schaden, Fall, Zugwechsel und Matchende,
- verständliche Sprache ohne Debug- oder Simulationsbegriffe.

## Nichtziele

- neue Charakterassets,
- Änderung von Initiative, Bewegung oder Steuerungsmodell,
- Inventar-, Waffen- oder Status-Effekt-Anzeige,
- finale 3-gegen-3-HUD-Balance.

## Akzeptanzkriterien

1. Beide Teams sind auch in Nahaufnahmen gleichzeitig sichtbar.
2. Jede Figur ist eindeutig einem Team zugeordnet.
3. Einzel-HP und Team-HP stimmen mit dem Matchzustand überein.
4. Aktive Figur und aktives Team sind visuell hervorgehoben.
5. Ausgeschaltete Figuren bleiben erkennbar, werden aber klar abgeschwächt.
6. Das HUD überdeckt weder Planpanel noch Statusleiste.

## Verifikation

- Unit-Test für Teamzusammenfassung
- `npm run typecheck`
- `npm test`
- `npm run build`
- Browserprüfung vor und nach mindestens einem Treffer

## Abnahme 2026-07-21

- Zwei feste Teamkarten zeigen „Deine Crew“ und „Rivalen“ gleichzeitig.
- Jede Karte enthält Figurennamen, Einzel-HP, HP-Balken und aktuelle/maximale Team-HP.
- Aktives Team wird gelb umrandet; die aktive Figur erhält zusätzlich einen Pfeil.
- Nach dem geprüften ersten Treffer wechselte Rivale A von 140 auf 40 HP und die Rivalen-Team-HP sofort von 280 auf 180.
- Beim automatischen Zugwechsel wanderte die Hervorhebung korrekt zu „Rivalen · am Zug“ und Rivale A.
- Debuganzeige beginnt nun unterhalb der Teamkarten; Planpanel und Statusleiste bleiben frei.
- Drei lokale Figuren-Moodboards geprüft und in `docs/06_ART_AND_TONE.md` als Referenz mit klaren Übernahme-/Abgrenzungsregeln dokumentiert.
- Browserkonsole ohne Fehler; `npm run typecheck`, `npm test` (30 Tests) und `npm run build` erfolgreich.
