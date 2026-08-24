# Task 034: Hybridmodus mit delegiertem Zielauftrag

## Status

`abgeschlossen`

## Ziel

Ein dritter Steuerungsmodus lässt den Spieler pro Crewzug ein gegnerisches
Ziel bestimmen, während die Figur Position, Waffe, Flugbahn und Ausführung
weiterhin autonom plant.

## Warum jetzt

Autobattle und vollständige Direktsteuerung prüfen zwei Extreme. Für die
Produktvision fehlt ein kleiner Vergleich, der mehr Agency bietet, ohne die
Crew-Autonomie und den Abstand zu einer direkten Artillery-Kopie aufzugeben.

## Pflichtlektüre

- `AGENTS.md`
- `docs/01_PRODUCT_VISION.md`
- `docs/02_GAME_DESIGN.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/04_VERTICAL_SLICE.md`
- `docs/07_CORE_GAMEPLAY_REVIEW.md`
- `docs/DECISIONS.md`
- `tasks/030_FREE_MANUAL_MOVEMENT.md`
- `tasks/031_SEMANTIC_PLAN_FAMILIES.md`
- `tasks/032_PLAN_FAMILY_DIVERSITY_REPORT.md`

## Scope

- `hybrid` als dritter `ControlMode` neben `auto` und `manual`,
- Menüschalter in derselben Build und Weitergabe auch an Standard-Manager-Matches,
- Auswahl eines lebenden Rivalen per sichtbarem Weltring oder Taste 4/5/6,
- rendererunabhängiges, serialisierbares Zielkommando mit fachlichen Guards,
- KI plant innerhalb des Zielauftrags weiterhin Bewegung, Waffe und Bogen,
- Zielauftrag wird nach dem Zug gelöscht,
- automatisierte Tests und Browserprüfung.

## Nichtziele

- keine direkte Winkel-, Kraft- oder Bewegungssteuerung im Hybridmodus,
- keine Auswahl aus vollständigen Kandidatenkarten,
- keine neuen Managerressourcen oder Balanceänderungen,
- kein Produktentscheid zugunsten eines der drei Modi.

## Akzeptanzkriterien

1. Das Hauptmenü schaltet zyklisch zwischen Auto, Zielauftrag und Direkt.
2. Der Standard-Manager-Einsatz übernimmt die sichtbare Moduswahl.
3. Ein Crewzug im Hybridmodus kann ohne Zielauftrag nicht ausgeführt werden.
4. Nach der Zielwahl enthält jeder gültige Angriffsplan nur das delegierte Ziel
   oder ein zu diesem Ziel gehörendes Kettenobjekt.
5. Bewegung, Waffenwahl, Winkel und Streuung bleiben KI-Entscheidungen.
6. Ungültige, eigene oder besiegte Ziele werden abgelehnt; Rivalenzüge bleiben autonom.
7. Typecheck, Tests, Build und Browserprüfung bestehen.

## Verifikation

- `npm test -- src/simulation/match/commands.test.ts src/game/session/matchSession.test.ts`
- `npm run typecheck`
- `npm test`
- `npm run build`
- Browser: Modusschalter, Manager-Weitergabe, Zielwahl und Ausführung

## Abschlussbericht

Abgeschlossen am 24. August 2026.

- `ControlMode` enthält jetzt `auto`, `hybrid` und `manual`; der sichtbare
  Hauptmenüschalter durchläuft alle drei Varianten.
- Die Moduswahl wird über die Registry auch in einen regulär geplanten
  Manager-Einsatz übernommen und dort in der Kopfzeile bestätigt.
- Im Hybridmodus beginnt jeder Crewzug in der Übersicht mit drei großen,
  touchfähigen Zielringen. Alternativ wählen 4/5/6 die lebenden Rivalen.
- `directActiveTarget()` prüft Team und Lebenszustand, speichert den Auftrag
  rendererunabhängig und beschränkt nur die Gegnerauswahl des vorhandenen
  Planners. Position, Waffe, Bogen, Streuung und Auflösung bleiben autonom.
- Eine unverbindliche Vorschau vor der Zielwahl verbraucht keine
  Loadout-Präferenz. Nach dem Zug wird der Auftrag zusammen mit den übrigen
  temporären Planungsdaten gelöscht.
- Die Spielfläche ist jetzt fokussierbar und benannt; damit funktionieren die
  bestehenden Tastaturkommandos verlässlicher und sind browserautomatisierbar.

Prüfungen: relevante Tests (23 bestanden), Gesamtsuite (124 bestanden,
2 übersprungen), Typprüfung, Produktionsbuild sowie Browserprüfung von
Manager-Weitergabe, Zielwahl, autonomem Folgeplan und Projektilausführung.
Bekannte Einschränkung: Dies ist ein Vergleichsexperiment, noch keine
Entscheidung für den endgültigen Kernmodus.

Verbindliche Entscheidung: `docs/DECISIONS.md`, D-050.
