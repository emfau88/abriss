# Task 038: Burrow Gate 2 – Jagd und Fressen

## Status

`abgeschlossen (technisch; erneute persönliche Produktwertung offen)`

## Ziel

Der isolierte Burrow-Prototyp prüft mit einer einzigen, wiederholbaren Jagd,
ob die in Gate 1 bestätigte direkte Bewegung ein unmittelbares Ziel,
verständlichen Schaden und eine kleine Belohnung tragen kann.

## Pflichtlektüre

- `AGENTS.md`
- `docs/burrow/VISION.md`
- `docs/burrow/VERTICAL_SLICE.md`
- `docs/burrow/TECHNICAL_PLAN.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/DECISIONS.md`

## Scope

- ein codegezeichnetes, deterministisch patrouillierendes Fahrzeug,
- rendererfreie Fahrzeug-, Bite-, HP-, Devour- und Biomasse-Logik,
- Kopfkontakt als einzige Trefferquelle,
- stärkerer Treffer bei hohem Tempo oder aktivem Burst,
- sichtbares Treffer- und Devour-Feedback sowie kurzer Fahrzeug-Respawn,
- fokussierte Fachtests, Browserprüfung und vollständige Regression.

## Nichtziele

- keine zweite Beute, keine Angriffs- oder Waffensteuerung,
- keine Fahrzeugphysik, Gegner, Beschuss oder Alarmstufe,
- keine Gebäude, Einstürze, Mutationen, Speicherung oder Chunkwelt,
- keine Änderungen an Abriss-Gameplaycode oder finalen Assets.

## Akzeptanzkriterien

1. Das Fahrzeug patrouilliert unabhängig von Renderframes reproduzierbar.
2. Nur ein gültiger Kopfkontakt bei ausreichendem Tempo löst einen Bite aus.
3. HP, verstärkter Treffer, Devour und Biomasse sind sichtbar und fachlich
   testbar.
4. Ein Devour gewährt genau einmal Biomasse; danach folgt ein klarer Respawn.
5. Die Gate-1-Eingabe bleibt unverändert mit zwei Daumen bedienbar.
6. Abriss bleibt isoliert und vollständig grün.

## Verifikation

- Fachtests für Patrol, Bite-Schwelle, Schadensskalierung, Devour und Respawn,
- `npm run typecheck`, `npm test` und `npm run build`,
- Browser-Smoke auf Desktop und emulierter Touch-Eingabe,
- Browser-Smoke des unveränderten Abriss-Einstiegs.

## Erster technischer Stand

Technisch abgeschlossen am 25. August 2026; persönliche Gate-Bewertung steht
noch aus.

- `BurrowHunt` hält die komplette deterministic Patrol-, Bite-, HP-, Devour-,
  Biomasse- und Respawn-Regel unabhängig von Phaser.
- Das Fahrzeug fährt ausschließlich auf einer festen Route und besitzt keine
  allgemeine Physik. Es wird nur durch den Burrow-Kopf bei mindestens 170 Tempo
  getroffen; aktiver Burst oder mindestens 300 Tempo verursachen zwei Schaden.
- Die Szene zeigt die Kutsche, ihre HP, den Jagdabstand, Treffertexte,
  Biomasse und Respawn-Zeit. Die bestehende Richtungs-/Burst-Steuerung blieb
  unverändert.
- Verifiziert: 13 fokussierte Burrow-Tests, 141 Gesamttests bestanden, 2
  bewusst übersprungen, TypeScript-Prüfung und Produktionsbuild erfolgreich;
  Desktop-, Touch- und Abriss-Browser-Smoke ohne Konsolenfehler.

Bekannte Einschränkung: Die Kutsche und ihr Feedback sind absichtlich
codegezeichnete Testdarstellung. Ob Trefferfenster, Bewegung der Beute und
Wiederholung des kurzen Jagd-Loops langfristig befriedigend sind, wird erst
durch den persönlichen Gate-2-Test entschieden.

## Feedback-Iteration

Der erste persönliche Test meldet einen gelegentlich verlorenen Burst, eine zu
enge Beuteroute und unbeabsichtigtes Weitergraben nach losgelassener Richtung.
Die abgeschlossene Iteration ergänzt einen bis zum festen Schritt gepufferten Burst,
neutralisiert den losgelassenen Touch-Stick, stoppt die Untergrundbewegung ohne
Richtung und verbreitert/verlangsamt die Fahrzeugroute. Diese Änderungen
bleiben vollständig im Gate-2-Scope.

Verifiziert nach der Iteration: 16 fokussierte Burrow-Tests, 144 Gesamttests
bestanden, 2 bewusst übersprungen, Produktionsbuild erfolgreich. Im Browser
löste ein einzelner Burst zuverlässig aus und der Wurm stand ohne Richtung nach
Auslaufen des Bursts bei Tempo 0.
