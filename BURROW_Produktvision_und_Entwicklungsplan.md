# BURROW – Produktvision, Referenzanalyse und nächster Entwicklungsplan

**Stand:** 30. August 2026

**Entscheidungsstand:** Der persönliche Vergleich hat Variante B bestätigt.
Normale Bewegung nutzt eine zehn Sekunden aktive Schnellspur ohne permanente
Terrainzerstörung. Das Drücken von Burst allein stanzt kein Loch an der
Kopfposition; nur Breach und schneller Wiedereintritt erzeugen derzeit lokale
permanente Krater (D-062). Der nächste zulässige Schritt ist der gestuft
umzusetzende Drei-Level-Slice aus Abschnitt 17, nicht die vollständige
Langfristvision.

Der verbindliche Schnitt verbindet drei Schrein-Upgrades, zwei sichtbare
Wachstumsstufen, höhere Breaches, gezielte Strukturzerstörung und eine
eskalierende Schlusskutsche. Details und Entscheidungstore stehen in
`docs/burrow/THREE_LEVEL_SLICE.md` (D-063).

## 1. Ausgangspunkt

Burrow soll **kein Death-Worm-Klon** werden.

Die gewünschte Richtung:
- Mobile First
- humorvolle, helle Fantasywelt
- leicht cozy, aber nicht kitschig
- überzeichnete Slapstick-Zerstörung
- Wurm-/Monsterwesen bewegt sich unterirdisch
- spektakuläre Breaches durch die Oberfläche
- kurze Runs
- sichtbare Machtsteigerung
- vorhandener technischer Kern soll weiterverwendet werden

Der aktuelle Prototyp besitzt bereits:
- unterirdische Bewegung
- Burst
- Oberflächendurchbruch
- Wiedereintauchen
- Kutsche / Ziele
- HP / Treffer
- Biomasse
- Terrainmaske
- Mobile-Steuerung
- erste Gebäudestützen / Kollapslogik
- ein fliehendes Oberflächentier
- einen aktivierbaren Schrein in einer kleinen Höhlenkammer

Das Hauptproblem:

> **Das Erdreich ist gleichzeitig Bewegungsmedium und dauerhaft zerstörbares Terrain.**

Dadurch gräbt der Spieler sich bei normalem Spielen irgendwann seine eigene Spielfläche kaputt.

---

## 2. Death Worm als Referenz

Death Worm zeigt, dass dieser Action-Kern funktioniert:

> **Unterirdisch anfahren → Oberfläche durchbrechen → Ziel treffen/fressen → wieder eintauchen → nächsten Angriff vorbereiten.**

Der entscheidende Unterschied:

### Death Worm
Die Erde funktioniert im Wesentlichen als **Bewegungsmedium**.

Normales unterirdisches Bewegen ist nicht darauf ausgelegt, die komplette Welt dauerhaft in immer größere Hohlräume zu verwandeln.

### Burrow aktuell
Die Erde ist gleichzeitig:
- Bewegungsmedium
- zerstörbares Material
- Oberfläche für Gegner
- Ausgangspunkt für den nächsten Breach

Dadurch entstehen:
- durchlöcherte Oberfläche
- schwebende oder falsch laufende Oberflächenziele
- verlorene Anfahrtsfläche für weitere Breaches
- große Hohlräume mit problematischer Flugphysik
- schlechter erreichbare spätere Ziele

---

## 3. Was Death Worm länger trägt

Die aktuelle Version nutzt mehrere Progressionsebenen:
- Kampagne mit vielen Levels
- mehrere Locations
- Survival-Modi
- Minigames
- XP
- Coins
- unterschiedliche Wurmtypen
- Upgrades
- individuelle Superfähigkeiten
- viele unterschiedliche Ziel-/Gegnertypen

Wichtig ist:

> **Nicht die Story trägt das Spiel, sondern Bewegung, Eskalation, kurze Ziele und Machtsteigerung.**

Die vier Kernprinzipien:

### 1. Bewegung muss alleine Spaß machen
Unterirdisch Angriff vorbereiten, Winkel finden, sauber breachen.

### 2. Der Spieler muss spürbar stärker werden
Anfang:
- kleiner
- langsamer
- niedrigere Breaches
- weniger HP

Später:
- schneller
- größer
- höher
- stärker
- neue Fähigkeiten

### 3. Die Welt eskaliert
Für Burrow z. B.:
- Hühner
- Schafe
- Pilzsammler
- Händler
- Händlerkarren
- Ritter
- Zauberlehrlinge
- Goblinhändler
- gepanzerte Kutschen
- Besenhexen
- Greifenreiter
- kleine Golems
- Hofmagier
- königliche Transporte

### 4. Kurze konkrete Aufgaben
Beispiele:
- Friss 6 Hühner.
- Wirf 3 Ritter um.
- Zerstöre die Händlerkutsche.
- Erreiche eine 5er-Combo.
- Triff einen Greifenreiter.
- Schaffe den Run ohne Schaden.

---

## 4. Effing Worms als zweite Referenz

Effing Worms und Effing Worms 2 zeigen eine ähnliche starke Grundfantasie:

> essen → wachsen → stärker werden → eskalieren

Interessante Elemente:
- einfache Steuerung
- schnelle Action
- Wachstum
- Upgrade-Auswahl
- neue Ziele
- Combos
- Achievements
- sichtbare Evolution

Das passt gut zu Burrow.

---

## 5. Was wir NICHT seriös wissen

Öffentlich nicht sauber belegbar sind:
- exakte Bewegungsgeschwindigkeit von Death Worm
- exakte Sprunghöhe
- exakte Beschleunigung
- exakte Körperlänge
- exakter Zoom
- exakte Upgrade-Kosten
- exakte Wachstumsrate

Diese Werte sollten nicht erfunden werden.

Wenn sie später wichtig sind:
1. Gameplay-Videos frameweise messen
2. Bildschirmrelationen vergleichen
3. Flug-/Bewegungszeiten messen
4. daraus Näherungswerte ableiten

---

# 6. Zentrale neue Entscheidung für Burrow

## Normales Bewegen durch Erde zerstört Terrain nicht mehr dauerhaft.

Der Wurm soll sich trotzdem sichtbar durch Erde bewegen.

Visuelles Feedback:
- aufgewühlte Erde
- kleine Risse
- Staub
- Erdpartikel
- kurz sichtbare Furche
- leicht angehobener Boden
- nachlaufende Grabspur

Diese Darstellung verschwindet schnell wieder bzw. „fällt zusammen“.

### Trennung:

**Bewegung:**
Der Wurm bewegt sich durch Erde. Die Erde bleibt grundsätzlich erhalten.

**Echte Zerstörung:**
Nur bestimmte Aktionen entfernen Terrain wirklich dauerhaft.

Zum Beispiel:
- Oberflächendurchbruch
- schneller Wiedereintritt
- Spezialangriff
- Fundament untergraben
- Schatz freilegen
- Ressourcenkammer öffnen
- Missionsziel
- besonders weiche Erde

Damit bekommt permanentes Graben einen echten Spielzweck.

---

## 7. Warum echte Zerstörung trotzdem bleiben sollte

Die zerstörbare Welt ist einer der interessanten technischen Teile des Projekts.

Sie sollte nicht komplett entfernt werden.

Aber:

> **Terrainzerstörung darf nicht mehr automatisch bei jeder normalen Bewegung passieren.**

Beispiel:
Der Wurm bewegt sich normal unter einer Kutsche entlang. Noch passiert nichts.

Dann Burst mit tatsächlichem Oberflächendurchbruch:
- Wurm schießt hoch
- lokaler Boden reißt auf
- Kutsche wird getroffen
- Erde fliegt
- kleiner Krater bleibt zurück

So bleibt Zerstörung besonders und lesbar.

---

# 8. Burrow – Produktvision in 10 Punkten

## 1. Spielerfantasie
Du bist ein zunächst kleines, hungriges Fantasy-Untergrundmonster.

Du tauchst unter einer friedlichen Fantasywelt auf und verursachst zunehmend absurdes Chaos.

Nicht Horror. Nicht Militär. Nicht Grimdark.

Sondern:

> **„Was zum Teufel passiert hier gerade?“**

mit Slapstick.

## 2. Ton
- hell
- freundlich
- leicht cozy
- humorvoll
- farbig
- fantasievoll
- leicht überzeichnet

Humor entsteht aus Reaktionen:
- Ritter verliert Helm
- Händler versucht weiterzuverkaufen
- Zauberer trifft versehentlich eine Wache
- Greifenreiter landet im Heuwagen
- Goblinhändler hat ein „NO REFUNDS“-Schild
- Kutsche verliert erst Gepäck, dann Rad, dann zerfällt sie

## 3. Kernsteuerung
Mobile First.

Links: **Richtung**
Rechts: **Burst**

Optional später eine einzige Spezialfähigkeit.

## 4. Grundbewegung
Unter Erde:
- direkt
- kontrollierbar
- etwas schwer
- beschleunigend
- klare Kurven

Normale Bewegung zerstört Terrain nicht dauerhaft.

## 5. Breach ist der Kernmoment
Tiefer anfahren = mehr Geschwindigkeit = spektakulärerer Angriff.

Ein guter Breach liefert:
- Höhe
- Treffer
- Sound
- Partikel
- Kameraimpuls
- Gegnerreaktion
- Combo
- Biomasse

## 6. Ziele

### Früh
- Hühner
- Schafe
- Pilzsammler
- Gemüsekarren
- Bauern

### Mittel
- Händler
- Ritter
- Wachkutschen
- Zauberlehrlinge
- Marktstände

### Spät
- gepanzerte Wagen
- Greifenreiter
- Besenhexen
- Golems
- Hofmagier
- königliche Eskorte

## 7. Wachstum
Der Wurm wächst sichtbar, aber nicht so stark, dass die Übersicht leidet.

Wachstum betrifft:
- Körperlänge
- leicht Körperbreite
- Maul
- Rückenmerkmale
- Partikeleffekt
- Sound
- Breach-Wucht

## 8. Upgrades
Keine riesigen Skilltrees.

Nach kurzen Abschnitten 1 von 3 wählen.

Beispiele:
- Speed
- Burst
- Maw
- Hide
- Appetite
- Combo Gut
- Impact
- Biomass Magnet

## 9. Runs
Zielgröße:

**3 bis 5 Minuten**

Genug für Wachstum und Eskalation, kurz genug für Mobile.

## 10. Makrofortschritt
Zwischen Runs später:
- neue Regionen
- neue Wurmvarianten
- neue Startfähigkeiten
- kosmetische Körperteile
- schwierigere Missionen
- neue Gegnertypen

Nicht notwendig für den ersten Prototyp.

---

# 9. Beispielregionen

## Region 1 – Meadowvale
- Hühner
- Schafe
- Bauern
- Händler
- Ritter
- Händlerkarren

Finalziel: **Bürgermeisterwagen**

## Region 2 – Goblin Market
- Goblinhändler
- Warenkisten
- kleine Wagen
- Wachen
- Zauberlehrlinge

Finalziel: **gepanzertes Handelsgefährt**

## Region 3 – Castle Outskirts
- Ritter
- Banner
- Wachposten
- Kutschen
- Magier
- Greifenreiter

Finalziel: **königliche Eskorte**

## Region 4 – Wizard Fair
- Besen
- Zauberer
- magische Verkaufsstände
- kleine Golems
- schwebende Kreaturen

Finalziel: **magischer Festwagen**

---

# 10. Die ersten 10 Spielminuten

## Minute 0–1 – Stage 1
**Friss 3 Hühner.**

Spieler lernt:
- bewegen
- breachen
- eintauchen

Danach erste Upgrade-Auswahl:
- +10 % Speed
- +15 % Burst
- +1 HP

## Minute 1–2 – Stage 2
**Friss 2 Schafe und 2 Hühner.**

Ziele bewegen sich unterschiedlich.

Upgrade 2.

## Minute 2–3 – Stage 3
**Zerstöre den Gemüsekarren.**

Erstes Mehrtreffer-Ziel, z. B. 3 HP.

Treffer 1:
- Gemüse fliegt

Treffer 2:
- Rad löst sich

Treffer 3:
- Wagen zerfällt

## Minute 3–4 – Stage 4
**Erreiche eine 4er-Combo.**

Spieler muss Angriffe planen.

## Minute 4–5 – Stage 5
Erster Ritter.

Bleibt der Wurm zu lange oben, kann der Ritter Schaden machen.

Dadurch entsteht:

> hoch → treffen → schnell wieder runter

## Minute 5
Erster sichtbarer Wachstumsmoment:
- längerer Körper
- etwas größerer Kopf
- kräftigere Rückenplatten

## Minute 5–7
Meadowvale eskaliert.

Gleichzeitig:
- Tiere
- Händler
- Ritter
- Karren

Aufgabe z. B.:

**Sammle 100 Biomasse.**

## Minute 7–9
Elite-Kutsche:
- mehr HP
- höhere Geschwindigkeit
- Wachen

Der Spieler braucht:
- Timing
- Speed
- Burst
- Wiederholungsangriffe

## Minute 9–10
**Bürgermeister-Flucht**

Eine überzeichnete Kutsche versucht zu entkommen.

Ziel:

**Stoppe den Bürgermeister.**

Danach:
- Score
- Biomasse
- Unlock
- Vorschau auf nächste Region

---

# 11. Empfohlene Progressionsgeschwindigkeit

- kleine Belohnung: alle **30–60 Sekunden**
- Upgrade-Entscheidung: alle **1–2 Minuten**
- sichtbares Wachstum: alle **3–5 Minuten**
- neuer Zieltyp: alle **2–4 Minuten**
- neues Regionsthema: nach ca. **10–20 Minuten** Gesamtfortschritt

---

# 12. Startwerte für Bildschirmrelationen

Nicht als kopierte Death-Worm-Werte, sondern als sinnvolle Burrow-Ausgangswerte.

## Kleiner Wurm
Kopf:
**4–6 % der Bildschirmhöhe**

sichtbarer Körper:
**15–25 % der Bildschirmbreite**

## Mittlere Stufe
Kopf:
**6–8 %**

sichtbarer Körper:
**25–35 %**

## Große Stufe
Kopf:
**8–10 %**

sichtbarer Körper:
**30–45 %**

Der Wurm darf nie so groß werden, dass:
- Ziele nicht mehr sichtbar sind
- Flugbahn nicht mehr eingeschätzt werden kann
- Untergrund unlesbar wird

---

# 13. Kamera

Die Kamera soll zeigen:
- Wurm
- Oberfläche
- nächstes Ziel
- genug Erde für Anfahrt

Bei starkem Breach:
- leicht herauszoomen

Beim Treffer:
- kurzer Kameraimpuls

Keine aggressiven Dauerzooms.

Mobile-Lesbarkeit zuerst.

---

# 14. Geschwindigkeitsrelationen

Keine behaupteten Death-Worm-Zahlen.

Sinnvolle Startrelationen:

- normales Untergrundtempo: **1.0×**
- schneller Tunnel/Speedzone: **1.25–1.5×**
- Burst: **1.8–2.5×**

Wichtig:
Speed muss spürbar sein, darf die Steuerung aber nicht ruinieren.

---

# 15. Eigenständigkeit gegenüber Death Worm

Burrow sollte NICHT übernehmen:
- Militär
- Panzer
- Kampfhubschrauber
- UFOs
- moderne Städte
- Death-Worm-UI
- identische Gegnerfolge
- identische Upgrade-Struktur
- identisches Monsterdesign

Eigenständigkeit entsteht durch:
- helle Fantasywelt
- Slapstick
- Ritter
- Händler
- Goblins
- Zauberer
- Greifen
- Fantasy-Kutschen
- Comedy-Reaktionen
- punktuell echte Terrainzerstörung

---

# 16. Technischer Umsetzungsstand

Die Terraintrennung wurde mit Task 043 umgesetzt und B anschließend als
Grundlage gewählt. Die folgenden Punkte beschreiben den erreichten Kern und
die noch bewusst begrenzte Anschlussarbeit.

## Änderung 1 – normales `carveCapsule()` aus der Bewegung entfernen
Normale Bewegung verändert nur die Position.

Keine permanente Terrainmutation.

Die Terrainmaske bleibt für Spezialaktionen erhalten.

## Änderung 2 – temporäre Grabspur im Renderer
Separates, zehn Sekunden aktives Spurfeld:
- Staub
- Risse
- Erdverdrängung
- Brocken
- kurz dunklere Furche

Keine Änderung an der Kollisionsmaske.

## Änderung 3 – echte Terrainzerstörung an Aktionen koppeln
`carveCapsule()` bleibt erhalten.

Derzeitiger Aufruf nur bei:
- Breach
- schnellem Wiedereintritt ab 300 Weltpixel/s

Burststart allein und die unterirdische Burststrecke entfernen kein Terrain.
Spezialangriffe, Strukturaktionen und Ressourcenkammern sind mögliche spätere
Mechaniken, aber nicht implementiert oder freigegeben.

## Änderung 4 – Oberflächenziele müssen reale Bodenhöhe lesen
Kutschen und Einheiten dürfen nicht auf einer alten `surfaceY` schweben.

Wenn Terrain lokal fehlt:
- Bodenhöhe neu bestimmen
- Einheit senken
- stoppen
- fallen lassen
- oder zerstören

## Änderung 5 – Biomasse behalten
Biomasse kann dienen als:
- Run-XP
- Wachstumsauslöser
- Upgrade-Fortschritt

Keine neue Währung nötig.

## Änderung 6 – Drei-Level-Produkt-Test

Der nächste Test verbindet:
- normale Bewegung und temporäre Grabspur,
- Burst und höhere Breaches,
- wenige parametrisierte Zieltypen,
- Level- und Gesamtbiomasse,
- einen Schrein und ein Upgrade je Level,
- zwei Wachstumsübergänge,
- gezielte Strukturzerstörung und drei eskalierende Finalziele.

Noch kein großes Meta.

## Änderung 7 – vorhandene reaktive Welt weiterverwenden

Das fliehende Tier, der stützengestützte Turm und der aktivierbare Schrein sind
bereits technische Grundlagen. Im Drei-Level-Slice erhalten sie klare Rollen:
Tier als kleine Beute und Weltreaktion, Turm als kuratiertes Zerstörungsziel,
Schrein als Upgrade-Ort. Jeder Schrein steht in einer vorgefertigten Höhle;
Variante B verhindert, dass normales Graben ihn störend freilegt.

---

# 17. Nächster Prototyp: Drei-Level-Vertical-Slice

Der nächste Prototyp ist ein vollständiger Run aus drei Levels mit jeweils
höchstens drei Minuten aktiver Spielzeit:

1. **Wiesenrand – Hunger:** Bewegung, Beute, Biomasse, erster Schrein und
   Händlerkutsche; danach Wachstum zum Gräber.
2. **Goblinmarkt – Zerstörung:** Stützen, Kollaps, zweiter Schrein und
   gepanzerter Handelswagen; danach Wachstum zum Koloss.
3. **Burgstraße – Macht:** höchste Breaches, frühere Beute als Machtvergleich,
   dritter Schrein und mehrphasige königliche Schlusskutsche.

Ein Schrein pro Level bietet Himmelsstürmer, Vielfraß oder Rammbock. Upgrades
und Wachstum bleiben innerhalb des Runs erhalten. Level 1 wird vollständig
gebaut und persönlich bewertet, bevor Level 2 beginnt; dasselbe Tor gilt vor
Level 3. Der technische und inhaltliche Detailplan steht in
`docs/burrow/THREE_LEVEL_SLICE.md`.

---

# 18. Erfolgskriterien

Der Test ist erfolgreich, wenn:

1. Untergrundbewegung alleine Spaß macht.
2. Breaches gut planbar sind.
3. Mehrfaches Spielen zerstört die Oberfläche nicht.
4. Ziele bleiben erreichbar.
5. Jede gewählte Verbesserung ist in der folgenden Spielminute spürbar.
6. Gräber und Koloss sind sichtbar mächtiger und erreichen höhere Breaches.
7. Gezielte Zerstörung und Schlusskutschen eskalieren über die drei Levels.
8. Nach dem vollständigen Run will man noch eine Runde.

---

# 19. Vorerst NICHT bauen

Noch nicht:
- Magierform
- Fledermausform
- komplexes Crafting
- Open World
- große Höhlensysteme
- Untergrundstädte
- komplexe Physik
- große Skilltrees
- Base Building
- umfangreiche Story
- zehn Wurmtypen
- persistente Welt

Erst wenn der einfache Wurmloop trägt.

---

# 20. Vorläufige Gesamtvision

> **Burrow ist ein schnelles Mobile-First-Fantasy-Actionspiel, in dem ein zunächst kleines Untergrundmonster unter einer fröhlichen Fantasywelt auf Beute lauert, explosiv durch die Oberfläche bricht, Tiere, Händler, Ritter und zunehmend absurdere Ziele überfällt und innerhalb kurzer Runs sichtbar größer und stärker wird.**

Die Welt reagiert humorvoll.

Der Wurm wird mächtiger.

Die Ziele eskalieren.

Das Spiel soll wirken:
- chaotisch
- befriedigend
- lustig
- unmittelbar
- leicht verständlich

Die wichtigste technische Richtungsänderung:

> **Normale Untergrundbewegung ist nicht mehr identisch mit permanenter Terrainzerstörung.**

Echte Zerstörung bleibt erhalten, wird aber zu einem gezielten Gameplay-Ereignis.

---

# 21. Referenzquellen

## Death Worm
Google Play:
https://play.google.com/store/apps/details?id=com.playcreek.DeathWorm_Free

Apple App Store:
https://apps.apple.com/us/app/death-worm/id408657000

Öffentlich belegte Elemente:
- 50M+ Google-Play-Downloads
- Kampagne
- Survival
- Minigames
- XP
- Coins
- neue Locations
- neue Wurmtypen
- Upgrades
- individuelle Superfähigkeiten
- viele unterschiedliche Ziele/Gegner

## Effing Worms
Kongregate:
https://www.kongregate.com/en/games/effinggames/effing-worms

Effing Games – Effing Worms 2:
https://effinggames.com/play/effing-worms-2

Newgrounds – Effing Worms 2:
https://www.newgrounds.com/portal/view/598901

Referenzideen:
- essen
- wachsen
- evolven
- Upgrade-Auswahl
- Combos
- konkrete Achievements
- einfache direkte Steuerung

---

# 22. Nächste konkrete Entscheidung

**Terrainentscheidung abgeschlossen:** B trägt den weiteren Test; die störende
Burststart-Ausstanzung wurde entfernt und technisch geprüft.

Der nächste Schritt beantwortet nur diese Frage:

> **Trägt Bewegung B einen vollständigen Drei-Level-Run, in dem Schrein-Upgrades,
> Wachstum, höhere Breaches und gezielte Zerstörung bis zu einer klaren
> Machtfantasie eskalieren?**

Wenn **ja**: ausbauen.

Wenn **nein**: erst dann über Magierform, Fledermaus, Mining oder größere Pivots sprechen.
