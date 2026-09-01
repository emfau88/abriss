# Burrow-Produktlabor: Entscheidungstore

Stand: 31. August 2026

## Aktueller Scope – Feed–Grow und sichtbare Macht (D-068, D-070)

Verbindlich ist jetzt `FEED_GROW_SLICE.md`, umgesetzt durch Task 046 und
gezielt erweitert durch Task 048. Drei Nahrungverben, drei reguläre
Beuterollen und Sogschlund/Donnerrachen/Bebenherz gehören zum selben
Lebensraum; neue Levels, Apex-Gegner und Meta bleiben gesperrt.
Die folgenden Gates dokumentieren die Entstehung des technischen Fundaments;
der frühere Drei-Level-Schreinbogen ist abgelöst. Normale B-Bewegung,
Burststart ohne Krater, Ein-Kontakt-Kutsche und Abriss-Isolation bleiben gültig.

Jedes Gate wird separat implementiert, getestet und vom Nutzer beurteilt. Ein
späteres Gate beginnt nicht automatisch.

## Gate 0 – Isolation

- eigener Einstieg `burrow.html`,
- eigener Code unter `src/burrow/`,
- eigene Assets unter `public/burrow/`,
- eigene Styles, Phaser-Konfiguration und Dokumentation,
- keine Änderung an Abriss-Szenen, -Simulation oder -Managerzustand,
- gemeinsamer Build und gemeinsame CI prüfen beide Einstiege.

## Gate 1 – Bewegungsgefühl

Enthalten:

- eine kleine handgebaute Testarena,
- ein direkt gesteuerter Burrower mit distanzbasiertem Körpertrail,
- kontinuierlich ausgehobene, dauerhaft sichtbare Tunnel,
- langsameres Graben in festem Boden und schnelleres Gleiten im eigenen Tunnel,
- kurzer Burst mit deutlich höherer Geschwindigkeit,
- Austritt an die Oberfläche, Flugphase und Wiedereintauchen,
- ein unbewegliches Durchbruchsziel als verständlicher Wirkungstest,
- virtuelle Richtungssteuerung plus Burst-Fläche für Touch,
- Tastatursteuerung als Desktop-Fallback,
- lesbare Zustands- und Geschwindigkeitsanzeige.

Nicht enthalten:

- Beute, Fressen, Lebenspunkte oder Biomasse,
- Fahrzeuge mit Physik,
- Gebäude, Supportpunkte oder Einstürze,
- Gegner, Response-Level oder Hunter,
- Turm, Mutationen oder Speicherung,
- Chunkstreaming oder große Produktionsregion.

## Abnahme von Gate 1

1. `index.html` startet weiterhin ausschließlich Abriss.
2. `burrow.html` startet ausschließlich das Burrow-Labor.
3. Maus/Tastatur und Touch können Richtung und Burst steuern.
4. Der Körperabstand bleibt bei unterschiedlichen Geschwindigkeiten stabil.
5. Maximales Tempo erzeugt keine Lücken im Tunnel.
6. Oberfläche, Flug und Wiedereintauchen sind visuell und fachlich unterscheidbar.
7. Terrainupdates bleiben lokal segmentiert; keine Welttextur wird pro Schritt
   vollständig hochgeladen.
8. Typecheck, Fachtests, Gesamttests, Produktionsbuild und Browserprüfung bestehen.

## Gate 2 – Jagd und Fressen

Gate 1 wurde am 25. August 2026 nach persönlichem Spieltest positiv bewertet.
Gate 2 prüft nun, ob die bestätigte Bewegung eine kurze, wiederholbare Jagd
tragen kann.

Enthalten:

- genau ein deterministisch patrouillierendes Oberflächenfahrzeug ohne
  Fahrzeugphysik,
- automatische Bites ausschließlich bei gültigem Kopfkontakt,
- klar lesbare Fahrzeug-HP; Tempo und aktiver Burst verstärken den Treffer,
- Devour bei 0 HP mit genau einem Biomassegewinn,
- sichtbarer Biomassezähler und ein kurzer, deterministischer Fahrzeug-Respawn,
- Treffer-, Schaden- und Devour-Feedback ohne zusätzliche Eingabetaste.

Nicht enthalten:

- weitere Beutetypen, Waffen oder Angriffsbuttons,
- Gegner-KI, Beschuss oder Response-Level,
- Gebäude, Supportpunkte, Kollaps oder allgemeine Fahrzeugphysik,
- persistente Progression, Mutationen oder Speicherung.

## Abnahme von Gate 2

1. Ein Fahrzeug fährt reproduzierbar innerhalb einer kleinen Oberflächenroute.
2. Nur der Burrow-Kopf kann treffen; langsames oder entferntes Berühren zählt
   nicht als Bite.
3. Ein schneller Durchbruch oder Burst-Kontakt verursacht sichtbar mehr
   Schaden als ein regulärer Treffer.
4. HP, Bite, Devour und Biomasse sind ohne Erklärung voneinander
   unterscheidbar.
5. Ein verschlungenes Fahrzeug vergibt Biomasse genau einmal und kehrt erst
   nach seinem sichtbaren Respawn zurück.
6. Gate-1-Steuerung, Terrainmutation und Abriss-Isolation bleiben intakt.
7. Typecheck, Fachtests, Gesamttests, Produktionsbuild und Desktop-/Touch-
   Browserprüfung bestehen.

## Technischer Stand von Gate 2

Stand: bereit zur persönlichen Abnahme am 25. August 2026.

Ein codegezeichnetes Fahrzeug patrouilliert auf einer festen Route und besitzt
drei HP. Nur der Burrow-Kopf löst bei ausreichendem Tempo einen automatischen
Bite aus; aktiver Burst verursacht zwei statt eines Schadenspunkts. Nach dem
Devour vergibt die rendererfreie Jagdlogik genau eine Biomasse und setzt das
Fahrzeug nach 3,2 Sekunden mit vollen HP zurück. Die Fachtests decken Patrol,
Kontaktgrenze, Skalierung, Devour und Respawn ab. Ob der resultierende
Jagd-Loop persönlich motivierend und klar genug wirkt, entscheidet der nächste
Spieltest.

## Gate-2-Feedback-Iteration

Der erste persönliche Test meldete zwei konkrete Hindernisse: Ein Burst konnte
zwischen Render- und festem Simulationsschritt verloren gehen, und die frühe,
nur 480 Weltpixel breite Kutschenroute erschöpfte wiederholte Durchbrüche an
derselben Oberfläche. Gate 2 puffert deshalb Burst-Eingaben bis zur nächsten
Simulation, hält den Wurm bei neutraler Untergrundsteuerung an und erweitert
die langsamere Kutschenroute auf 1.020 Weltpixel mit näherem Startpunkt.
Flug und ein bereits ausgelöster Burst bleiben bewusst in Bewegung.

## Gate 3 – Untergraben und Kollaps

Der Nutzer hat Gate 3 am 25. August 2026 ausdrücklich freigegeben, während
die persönliche Bewertung des überarbeiteten Gate-2-Jagdloops weiter offen
bleibt. Gate 3 prüft ausschließlich, ob dauerhaft verändertes Terrain eine
einfache, verständliche Strukturfolge erzeugt.

Enthalten:

- eine einzelne codegezeichnete Stützenhütte in der erweiterten Testarena,
- genau drei fachlich modellierte, im Terrain verankerte Stützen,
- sichtbare Warnung bei verlorener Stütze,
- irreversibler, deterministischer Kollaps nach Verlust von zwei Stützen,
- sichtbares Trümmer- und Staubfeedback ohne Starrkörperphysik,
- eine moderate Arenabreite von 2.560 statt 2.048 Weltpixeln, weiterhin ohne
  Streaming oder Chunkwelt.

Nicht enthalten:

- mehrere Gebäudetypen, frei platzierbare Gebäude oder Bauphysik,
- Fahrzeugkollisionen, Gegner, Response-Level oder Belohnungen für Kollaps,
- allgemeine Starrkörper-, Seil- oder Flüssigkeitssimulation,
- weitere Meta-, Mutations- oder Speichersysteme.

## Abnahme von Gate 3

1. Jede Stütze wird allein aus der Burrow-Terrainmaske abgeleitet.
2. Das Untergraben einer Stütze erzeugt genau ein verständliches
   Stützen-Ereignis.
3. Der Verlust der zweiten Stütze löst genau einen Kollaps aus; spätere Schritte
   können ihn nicht wiederholen.
4. Der Kollaps ist sichtbar, lesbar und verändert keine Abriss-Datei.
5. Die größere, weiterhin vollständig geladene Arena bleibt mit lokalen
   Terrainupdates flüssig und ohne Chunkstreaming.
6. Typecheck, Fachtests, Gesamttests, Produktionsbuild und Browserprüfung
   bestehen.

## Technischer Stand von Gate 3

Stand: technisch abgeschlossen, öffentliche persönliche Abnahme offen am
25. August 2026.

Die 2.560×1.280-Welt bleibt vollständig geladen und aktualisiert Terrain nur
kachelweise. Die einzelne Stützenhütte besitzt drei Terrainanker; der Verlust
eines Ankers erzeugt ein Ereignis, der Verlust des zweiten löst genau einmal
den irreversiblen Kollaps aus. Die Fachtests beweisen Erstverlust, Schwelle,
Einmaligkeit und den unberührten Ausgangszustand. Desktop- und Touch-Browser-
Smoke bestätigten die Gate-3-Anzeige sowie die unveränderte Abriss-URL ohne
Konsolenfehler. Das persönliche Spielgefühl des tatsächlichen Untergrabens und
Kollapses wird nach der öffentlichen Veröffentlichung bewertet.

- Gate 4 beginnt mit einem reaktiven Weltbeweis: fliehendes Oberflächentier,
  sichtbare Turm-Schadenstufen und ein einziger aktivierbarer Fundort. Erst
  nach persönlicher Bewertung folgen Response-Level, Sensorik, wenige Gegner
  und ein einfacher Hunter.
- Gate 5: kurzer Ergebnisbildschirm mit genau einer sichtbaren Mutation.
- Danach: Entscheidung über Chunkwelt und echten 6–10-Minuten-Vertical-Slice.

## Task 043 – Terrainvergleich vor weiteren Gates

Der frühere Terrainvergleich ist abgeschlossen: Die öffentliche Burrow-Version
startet ausschließlich mit B (`recovering`, zehn Sekunden aktive Schnellspur).
Normales Graben entfernt keine tragende Erde; Burststart verändert ebenfalls
keine Terrainzellen. Nur Breach und schneller Einschlag erzeugen lokale
permanente Aktionskrater. Der Neustart setzt den Run vollständig zurück.
`persistent` (A) bleibt ausschließlich eine fachliche Regressionsvariante und
wird weder per URL noch im HUD angeboten (D-066). Die maskenbasierte
Bodenreaktion verhindert schwebende Oberflächenobjekte. Neue Inhalte oder
Folgegates sind durch diese Korrektur nicht freigegeben.

## Historisch: geplanter Drei-Level-Slice (D-063, durch D-068 abgelöst)

Der folgende Abschnitt dokumentiert nur den damals mit D-063 freigegebenen,
inzwischen abgelösten Produktscope. Er ist keine Arbeitsanweisung für Task 046
und gibt weder Level 2 noch Schreinproduktion frei.

Mit D-063 war nach der Terrainwahl der nächste Produktscope freigegeben:
ein gemeinsamer Run aus drei Levels zu höchstens 180 Sekunden aktiver Spielzeit.
Jedes Level enthält Ziel, Biomasseschwelle, Schrein in einer vorgefertigten
Höhle, genau eine 1-aus-3-Upgradeentscheidung und ein Finale. Nach Level 1 und
2 wächst der Wurm sichtbar und fachlich; Level 3 endet an einer mehrphasigen
Schlusskutsche und einem Ergebnisbildschirm.

Die Freigabe gilt gestuft. Task 044 baut ausschließlich das gemeinsame
Runfundament und ein vollständiges Level 1. Level 2 beginnt erst nach
persönlicher Abnahme dieses Loops, Level 3 erst nach Level 2. Der vollständige
Scope, Upgradepfade und Erfolgskriterien stehen in `THREE_LEVEL_SLICE.md`.
