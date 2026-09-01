# Feed–Grow: technischer Prüfstand

31. August 2026 · Task 046 · D-068

## Implementiert

- Ein verbundener Untergrund-Lebensraum, Sporen, zwölf kleine und drei große
  Würmer; einmalige Kopfkontakte und deterministische Beuterouten.
- Körperwachstum ab der ersten Nahrung; 10 bis 28 Körperabschnitte,
  Keimling/Jäger/Gräber bei 0/40/180 Biomasse.
- Eine freie, pausierte Mutationswahl bei 80; konkrete Wirkung aller drei
  Mutationen statt Schadenswerte gegen Ein-Kontakt-Beute.
- Freiwillige Oberfläche und Schlusskutsche nach 240 Biomasse, Mutation und
  großer Beute; Ergebnis und vollständiger Neustart.
- Kein Countdown, Wurmleben, Pflichtschrein oder vorgetäuschtes zweites Level.

## Automatisierte Prüfung

- 74 Burrow-Tests: Nahrung und Beute nur einmal; gesweepte Kopfkontakte;
  Schwellen und Überschuss; große Beute vorher/nachher; Sogkegel und Reichweite;
  Spurbonus nur auf vorhandenen Spuren; Ketten-Cooldown und Begrenzung.
- Regression: schnelleres Graben darf nicht die eigene frisch geschriebene
  Spur als vorausliegende Schnellspur erkennen. Der Geschwindigkeitsfühler
  liegt jetzt außerhalb des frischen Kapselradius einschließlich Zellrundung.
- Vollständiger automatischer Durchlauf mit jeder Mutation durch tatsächliche
  Bewegung, Nahrung, Beute und Schlusskutschenkontakt; keine Teleports oder
  eingespeisten Biomassebelohnungen. Erstes Körpersegment vor zehn Sekunden,
  erste große Beute vor einer Minute bei diesem Testfahrer.
- Intro, Auswahl und Ergebnis halten Bewegung, Beute, Kutsche, Nahrung,
  Terrain und Spurzeit an. Ein frischer Run entspricht dem Ausgangszustand.
- Serialisierbare Nahrungs-/Run-Snapshots und endlicher Schlusskutschenzustand.
- Gesamtes Projekt: 202 Tests bestanden, zwei bestehende Tests übersprungen.
  Typprüfung und Produktionsbuild erfolgreich; bestehender Größenhinweis für
  den gemeinsamen Phaser-Chunk bleibt. Keine Abriss-Gameplayänderungen.

## Browserprüfung

- Desktop: Einstieg ohne Startmodal; sichtbare Nahrung und kleine Beute.
  Gehaltene Richtung, Stillstand nach Loslassen, Tastatur-Burst, laufendes
  Körperwachstum und Übergang zum Jäger tatsächlich gespielt.
- Mutationswahl bei 80 durch normale Spieleingaben erreicht. Keine Bewegung
  während der Auswahl oder durch eine nachträglich gepufferte Richtung.
  Sogmaul ausgewählt; sichtbarer Burst-Sog und weitere Nahrungsaufnahme.
- Querformat und Hochformat: drei lesbare, erreichbare Mutationskarten.
  Unter anderem tatsächliche Canvasgröße 844 × 390 geprüft; der Browserzoom
  kann von der angeforderten Viewportgröße abweichende CSS-Pixel erzeugen.
- Stick und eigener Burstknopf per Zeigereingabe geprüft. Das ist kein
  Nachweis echter gleichzeitiger Zwei-Finger-Bedienung auf einem Smartphone.
- Vollständiger Browserlauf ausschließlich über sichtbare Stick-, Burst- und
  Mutationskarten-Eingaben: Sogmaul, 262 Biomasse, 28 Körperabschnitte,
  neun Würmer (zwei groß), Schlusskutsche und Ergebnisdialog. Der Dialog
  pausierte; „Noch einmal wachsen“ stellte Keimling, 0 Biomasse und die
  Startposition wieder her. Keine Browserfehler oder -warnungen.
- Dieser bewusst umständliche automatisierte Browserfahrer brauchte 8:14
  aktive Spielzeit. Das widerlegt nicht automatisch das menschliche
  Drei-bis-fünf-Minuten-Ziel, bestätigt es aber ausdrücklich noch nicht.

## Noch offen: persönliche Produktabnahme

1. Wirkt erstes Fressen und Wachsen sofort befriedigend?
2. Wird derselbe große Wurm durch die Machtstufen nachvollziehbar leichter?
3. Verändert die gewählte Mutation tatsächlich die eigene Spielweise?
4. Tragen Nahrung, Wege und Jagd den Run ungefähr drei bis fünf Minuten?
5. Entsteht der Wunsch, freiwillig eine andere Mutation auszuprobieren?
6. Echter Smartphone-Test: beide Daumen gleichzeitig, Loslassen,
   Orientierung, Hintergrund/Resume und Vollbild.

Die Testfahrer-Zeiten beweisen Erreichbarkeit, nicht menschliche Run-Dauer
oder Spielspaß. Keine Veröffentlichung/kein Deployment in diesem Task.

## Nachkorrektur D-069

Seit Task 047 startet der öffentliche Feed–Grow-Run ohne vorbereitete Höhle
und ohne Führungstunnel in festem Boden. Ein Arena-Regressionsfall belegt
Terrainversion 0 sowie festen Boden an Start, altem Tunnel und Schreinkammer.
Im Browser war vor der Eingabe keine schwarze Öffnung sichtbar; die erste
Bewegung erzeugte ausschließlich die helle, temporäre Terrain-B-Spur.

## Power-Fantasy-Erweiterung D-070

Task 048 ersetzt die gleichförmige Nahrung und die zwei gefühlten Beutegrößen
durch drei Nahrungverben und drei Jagdrollen. Sporen werden berührt,
Wurzelknollen beim Graben geöffnet und Brutkapseln im Burst oder durch eine
Bebenherz-Welle geknackt. Fadenwürmer sind Grundbeute, Rennwürmer beschleunigen
bei Nähe auf ihrer Route und Panzerwurm-Stirnkontakte werden bis zur
Gräberstufe abgewehrt. Sogschlund sammelt, Donnerrachen verlängert eine aktive
Jagdkette höchstens dreimal und Bebenherz lädt drei körpergebundene Platten.

Automatisiert bestanden 79 Burrow-Tests sowie die Gesamtsuite mit 207
bestandenen und zwei bestehenden übersprungenen Tests. Typprüfung und
Produktionsbuild sind grün; der bekannte Größenhinweis für den gemeinsamen
Phaser-Chunk bleibt.

Im Desktop-Browser wurde der Run mit sichtbaren Eingaben vom festen Start bis
80 Biomasse gespielt. Faden- und Rennwurm, kontinuierliches Körperwachstum und
Jägerstufe waren lesbar. Die pausierte Wahl zeigte Sogschlund, Donnerrachen und
Bebenherz. Danach wurden drei Bebenherz-Platten durch reales Graben geladen und
als große Ring-/Risswelle entladen; eine nahe Nahrung wurde dabei geöffnet.
Die kompakte Querformatansicht blieb lesbar. Es gab keine Browserwarnung oder
-fehler. Das bestätigt technische Erreichbarkeit und Darstellung, nicht die
persönliche 3–5-Minuten-Wertung oder echte Zwei-Daumen-Bedienung.
