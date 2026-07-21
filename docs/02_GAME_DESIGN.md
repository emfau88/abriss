# Game-Design-Kern

## Kernloop eines Matches

```text
Aufstellung prüfen
→ nächste aktive Figur bestimmen
→ mögliche Aktionen erzeugen und bewerten
→ Absicht, Risiko und Begründung zeigen
→ optionales Managerkommando
→ Aktion inszeniert ausführen
→ Schaden, Terrain und Positionen aktualisieren
→ ungültige Pläne verwerfen
→ nächste Figur
→ Sieg oder Niederlage
```

Große Aktionen finden nacheinander statt. Kleine Reaktionen wie Fallen, Zurückweichen, Jubeln oder Erschrecken dürfen innerhalb einer Aktion parallel ablaufen.

## Entscheidungsebenen

### Vor dem Match

Der dünne Manager-Slice lässt den Spieler genau drei aus vier Wesen wählen und pro Crewmitglied eine Waffenpräferenz festlegen. Diese Präferenz bestimmt den ersten gültigen Plan der Figur, sperrt ihr Arsenal in späteren Zügen aber nicht. Rollen, Doktrinen und tiefe Ausrüstungsbäume bleiben spätere Entscheidungen.

### Während des Matches

Die Figur entscheidet autonom. Vor der Ausführung zeigt das Spiel:

- Ziel und Aktionsart,
- geplante Position, sofern Bewegung nötig ist,
- angenäherte Flugbahn oder Wirkungszone,
- Eigen- und Freundbeschussrisiko,
- zwei bis vier wichtigste Bewertungsgründe,
- den sichtbaren Einfluss ihrer Persönlichkeit.

Der erweiterte Vertical Slice enthält zwei knappe, getrennte Managerkommandos. Das Spielerteam besitzt je eine Anwendung pro Match:

**„Lass das!“** verwirft den aktuell besten Aktionskandidaten. Die Figur wählt danach den nächstbesten gültigen Kandidaten und erklärt die neue Absicht. Der Spieler zielt oder schießt nicht selbst.

Dieses Kommando prüft, ob begrenzte negative Kontrolle – das Verhindern einer erkennbaren Katastrophe – bereits interessante Verantwortung erzeugt.

**„Nimm diese Waffe!“** gibt für den unmittelbar folgenden Plan Panzerfaust, Wurfgranate oder Geländebrecher vor. Die Figur entscheidet weiterhin selbst über Position, Ziel und Flugbahn innerhalb dieser Waffengattung. Der Befehl ist positive, aber begrenzte Kontrolle und wird unabhängig von „Lass das!“ verbraucht.

### Status der Autonomie-Hypothese

Der erste spielbare Ablauf zeigt ein wesentliches Risiko: Wenn die Figur selbst den optimalen Winkel berechnet und der Spieler nur bestätigt oder einmal widerspricht, fehlen Positionierungs-, Ziel- und Ausführungsfertigkeit. Bei vollständig blockierten Gegnern besitzt der aktuelle Slice zudem weder Laufen noch Springen und kann deshalb nur einen anderen gültigen Bogen wählen oder den Zug überspringen.

Diese Form vollständiger Autonomie gilt deshalb nicht mehr als bestätigte Zielrichtung, sondern als getestete Hypothese mit negativem Signal. Auf ausdrücklichen Wunsch wird sie vor dem direkten Vergleich einmal fair erweitert: Task 012 ergänzt lokale Bewegung, Sprünge, drei Waffenprofile und zwei animierte Wesen. Erst einige vollständige Matches mit dieser Fassung zeigen, ob Positionierungsentscheidungen, Eigenheiten und beobachtbare Aktionen bereits genug Spannung erzeugen. Task 011 bleibt anschließend als reversibler Vergleich bereit: eigene Figuren begrenzt bewegen und springen sowie Winkel und Kraft selbst einstellen; Gegner verwenden weiterhin den Planer. Eine endgültige Produktentscheidung fällt erst nach diesem A/B-Vergleich.

### Nach dem Match

Der Vertical Slice zeigt einen kompakten humorvollen Einsatzbericht. Nach dem ersten abgeschlossenen Manager-Einsatz wird einmalig der Geländebrecher als neue Waffenpräferenz freigeschaltet; dies beweist den Loop technisch, ohne bereits Shop oder Karriereprogression vorzutäuschen. Beziehungen, Verletzungen und Beförderungen bleiben spätere Systeme.

## Zeitpunkt und Umfang der Manager-Ebene

Die Manager-Ebene wird nicht vor dem vollständigen 3-gegen-3-Match gebaut. Zuerst müssen Zugfolge, Bewegung, Waffenfolgen, Eliminierung, Sieg/Niederlage und Kameraführung stabil sein; andernfalls würde eine frühe Meta-UI auf Regeln aufbauen, die sich noch stark verändern.

Der bewusst dünne Manager-Slice ist nach Stabilisierung des 3-gegen-3-Matches nun umgesetzt:

1. eine kleine Crew ansehen und drei Wesen für das nächste Match auswählen,
2. Persönlichkeit, erwartbares Verhalten und eine Stärke/Schwäche pro Wesen verstehen,
3. genau eine einfache Vorbereitung wählen, beispielsweise Werkzeug oder Verhaltenspriorität,
4. mit dieser Konfiguration ein Match spielen,
5. danach einen kurzen Rückblick auf wichtige Entscheidungen und Crewereignisse sehen.

Shop, Währungen, Basisbau, großer Ausrüstungsbaum, Rekrutierungsmarkt und dauerhafte Progression bleiben bis zur erfolgreichen Validierung dieses kleinen Kreislaufs ausgeschlossen.

## Zugstruktur

1. Eine lebende Figur wird nach einer stabilen Initiative-Reihenfolge aktiv.
2. Die KI erzeugt eine begrenzte Menge gültiger Kandidaten.
3. Jeder Kandidat wird mit derselben Simulationslogik wie die spätere Ausführung geprüft.
4. Der beste Kandidat wird zusammen mit seiner Begründung angekündigt.
5. Der Spieler kann „Lass das!“, einmalig den Waffenbefehl oder keine Intervention einsetzen.
6. Die Aktion wird ohne weitere direkte Steuerung ausgeführt.
7. Alle Folgen werden abgeschlossen, bevor der nächste Zug beginnt.

Die genaue Dauer des Eingriffsfensters wird erst nach Bedienungstests festgelegt. Entwicklungs- und Barrierefreiheitsmodus dürfen unbegrenzte Bedenkzeit anbieten.

## Persönlichkeiten im Vertical Slice

Persönlichkeit verändert Bewertungsgewichte; sie würfelt keinen separaten Versagenswurf.

- **Vorsichtig:** bewertet Selbst- und Freundbeschuss deutlich negativer.
- **Sprengfreudig:** bewertet Explosionswirkung und Terrainveränderung höher, auch bei erhöhtem Risiko.
- **Angeberisch:** bevorzugt wirkungsvolle, schwierigere Aktionen gegenüber sicheren kleinen Vorteilen.

Jede Modifikation erscheint in der Entscheidungsaufschlüsselung. Kosmetische Dialoge dürfen die Erklärung unterstützen, aber niemals ersetzen.

## Waffen im Vertical Slice

- **Abrissrakete:** direkte, motorisierte Flugbahn; explodiert beim ersten relevanten Kontakt.
- **Wurfgranate:** hoher, langsamer Bogen mit kleinerem Radius und geringerem Maximalschaden; prallt höchstens zweimal gedämpft ab und explodiert nach fester, vorher sichtbarer Zünderzeit.
- **Geländebrecher:** großer Terrainradius bei geringerem Maximalschaden; darf ein blockierendes Hindernis öffnen, auch wenn im selben Zug noch kein Gegner getroffen wird.

Alle Waffen verwenden dieselbe fachliche Ballistik-, Kollisions-, Schaden- und Terrainlogik. Werte bleiben datengetrieben und werden erst nach funktionaler Validierung balanciert. Explosionen erzeugen inzwischen einen waffenabhängigen Impuls; die Figur kollidiert über eine einfache gesweepte Hülle mit Terrain, prallt höchstens einmal ab und landet oder fällt aus der Welt.

### Spätere Kraftinszenierung

Als nächster Präsentationsausbau soll die Zielsequenz – ähnlich der lesbaren Kraftaufladung klassischer Artillery-Spiele – zeigen, mit welcher Intensität das Projektil abgefeuert wird. Auch bei autonomer Zielwahl kann eine kurze ansteigende Kraftanzeige Erwartung und Spannung erzeugen. Sie verändert im aktuellen Task noch keine Eingabe oder Simulation und wird erst umgesetzt, wenn geklärt ist, ob sie rein ankündigt oder dem Spieler ein Timing-Fenster gibt.

## Fairnessvertrag der KI

Eine ausgeführte Aktion muss aus dem zuvor gezeigten Plan ableitbar sein. Abweichungen sind nur zulässig, wenn nach der Planung ein sichtbares Ereignis die Situation verändert oder eine ausgewiesene Unsicherheit eintritt.

Die UI unterscheidet:

- sichere Vorhersage,
- sichtbaren Streubereich,
- geschätztes Risiko,
- nachträglich veränderte Lage.

Die KI erhält keine Informationen, die dem Spieler prinzipiell verborgen bleiben, und darf Ballistik oder Kollision nicht mit einer vereinfachten „Cheat“-Logik bewerten.

## Bewegung und Terrain

Der erste vollständige Match-Build erlaubt nur robuste, lokale Bewegung:

- höchstens 190 horizontale Weltpunkte pro Zug,
- begrenztes Laufen auf zusammenhängendem Boden,
- ein einfacher, vorab kollisionsgeprüfter Sprung über Hindernisse oder auf eine erreichbare Kante,
- kontrolliertes Heruntersteigen oder Fallen.

Bewegung und Angriff werden gemeinsam bewertet. Ist kein wirksamer Angriff möglich, darf eine Figur stattdessen einen reinen Positionierungszug machen; der Geländebrecher kann blockierendes Terrain gezielt öffnen. Nach jeder Terrainveränderung werden betroffene Kandidaten verworfen und bei Bedarf neu geplant. Seile, Klettern, Fahrzeuge, frei kollabierende Bauwerke und universelles Pathfinding sind ausgeschlossen.

## Siegbedingung

Ein Team gewinnt, wenn keine gegnerische Figur mehr kampffähig ist. Weitere Missionsziele werden erst nach dem Vertical Slice untersucht.

## Noch nicht entschieden

- Matchlänge und Lebenspunkte-Balance,
- Initiative-Modell für die spätere Kampagne,
- ob vor dem Match Positionen frei gewählt werden,
- Anzahl und Wiederaufladung späterer Managerkommandos,
- Tiefe des langfristigen Crewmanagements.

Diese Punkte werden über Prototypen und Spieltests entschieden, nicht nur durch Diskussion.
