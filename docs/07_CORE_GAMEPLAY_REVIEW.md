# Review: Taktische Vielfalt des autonomen Kernloops

Stand: 22. Juli 2026

## Zweck und Status

Dieses Dokument hält eine externe Kritik am ersten spielbaren Match, den
anschließenden Code-Gegencheck und den empfohlenen Lösungsweg fest. Es ist ein
Arbeits- und Prüfauftrag, keine stillschweigende Änderung der Produktvision oder
bereits umgesetztes Balancing.

**Gesamturteil:** Die Kritik trifft den momentan wichtigsten Produktrisikopunkt
im Kern. Der autonome Ablauf besitzt funktionierende technische Bausteine, aber
auf den aktuellen Karten meist eine offensichtlich beste Aktion. Dadurch werden
Waffenwahl, Persönlichkeit, Seed-Variation und Managerintervention spielerisch
zu wenig sichtbar.

## Festgehaltene Kritik

1. Fast jede Figur wählt die Abrissrakete, weil sie im Normalfall den höchsten
   direkten Schaden erzeugt. Granate und Geländebrecher sind dadurch selten
   echte Alternativen.
2. Vorsichtige, sprengfreudige und angeberische Figuren wirken gleich, weil die
   aktuellen Startlagen kaum Eigen- oder Freundbeschussrisiko erzeugen.
3. Wiederholte Matches mit unterschiedlichen Seeds führen zu denselben
   Entscheidungen und Ergebnissen. Die angekündigte unberechenbare Crew ist
   deshalb noch nicht erkennbar.
4. „Lass das!“ liefert häufig einen formal anderen, aber praktisch fast
   identischen Plan.
5. Moki findet in mindestens einer beobachteten Eröffnung keine sinnvolle
   Aktion.
6. Vollständige Matches können nicht rendererunabhängig automatisch simuliert
   werden. Spielspaß und Verteilung der Entscheidungen müssen daher bisher zu
   stark durch manuelles Browserklicken beurteilt werden.

## Ergebnis des Code-Gegenchecks

### 1. Raketendominanz: sehr plausibel

Die Profile besitzen aktuell 100 maximalen Schaden für die Rakete, 86 für die
Granate und 70 für den Geländebrecher. Bei freier Schussbahn belohnt die Utility
direkte Gegnerwirkung deutlich stärker als indirekten Gelände- oder
Positionsnutzen. Granate und Brecher sind technisch verschieden, werden aber
noch nicht für genügend strategisch wertvolle Folgewirkungen bewertet.

Die richtige Reaktion ist nicht nur eine pauschale Abschwächung der Rakete,
sondern eine horizontale Differenzierung:

- Rakete: zuverlässiger direkter Einzelschaden,
- Granate: indirekte Wirkung hinter Deckung, Abpraller und Gruppenbedrohung,
- Geländebrecher: neue Wege, Fallgefahr, Sichtlinien und zukünftiger
  Positionsvorteil.

### 2. Persönlichkeiten: vorhanden, im echten Zustand oft wirkungslos

Unterschiedliche Gewichte und synthetische Tests existieren bereits. Auf den
aktuellen Startpositionen bleiben Freundbeschuss- und Eigenrisikowerte jedoch
häufig null. Dann können sich die Profile trotz unterschiedlicher Gewichtung
nicht sichtbar unterscheiden.

Persönlichkeit sollte später nicht nur kleine Zahlen verschieben, sondern
nachvollziehbare Vorlieben und Grenzen besitzen. Beispiele:

- Vorsichtig lehnt deutliches Kameradenrisiko oberhalb einer sichtbaren Grenze
  ab.
- Sprengfreudig akzeptiert begrenztes Risiko und bewertet Mehrfachwirkung sowie
  Terrainfolgen höher.
- Angeberisch bevorzugt innerhalb ähnlich guter Pläne auffällige Bögen und
  schwierige Aktionen, bleibt aber vor klar selbstzerstörerischen Aktionen
  geschützt.

### 3. Seed-Variation: derzeit zu klein für sichtbare Vielfalt

Die aktionsbezogene Variation beträgt höchstens etwa ±1,25 Nutzenpunkte, die
Bewegungsvariation etwa ±1,5. Reale Bewertungsabstände liegen häufig um ein
Vielfaches höher. Verschiedene Seeds entscheiden deshalb nur sehr knappe
Gleichstände; identische Entscheidungen über viele Läufe sind erwartbar.

Empfohlen wird eine deterministische, persönlichkeitsgewichtete Auswahl aus
einem kleinen Band nahezu gleich guter Kandidaten. Ein fester Seed muss weiter
exakt reproduzierbar bleiben. Zufällige Dummheit oder ein versteckter
Versagenswurf bleiben ausdrücklich ausgeschlossen.

### 4. „Lass das!“: technisch anders, semantisch oft zu ähnlich

Aktuell wird eine einzelne Kandidaten-ID verworfen. Ein anderer Winkel oder eine
benachbarte Bewegung kann danach dieselbe Waffe gegen dasselbe Ziel mit nahezu
demselben Ergebnis erneut vorschlagen. Der vorhandene Test beweist eine andere
ID, aber keine für den Spieler bedeutsam andere Absicht.

Eine Neuplanung sollte deshalb entweder eine ganze semantisch ähnliche
Planfamilie ausschließen oder einen Mindestabstand erzwingen. Bedeutsam anders
ist ein Plan beispielsweise durch ein anderes Ziel, eine andere Waffe, eine
andere Position oder einen klar abweichenden Einschlagspunkt.

### 5. Moki: plausibler Karten-/Planer-Regressionsfall

Der konkrete beobachtete Lauf liegt nicht im Repository und konnte deshalb
nicht exakt reproduziert werden. Der Planner kann bei fehlendem gültigem Angriff
jedoch einen Zug überspringen oder nur lokal positionieren. Jede unterstützte
Karte braucht deshalb einen automatischen Eröffnungstest für jede mögliche
aktive Figur. Moki soll nicht per Sonderregel repariert werden; Spawn,
Bewegungsreichweite und Kandidatenerzeugung müssen allgemein funktionieren.

### 6. Architekturkritik: in der Richtung richtig, aber zu absolut

Ballistik, Terrain, Bewegung, Rückstoß, Fallauflösung, Matchzustand und Teile der
Aktionsplanung sind bereits rendererunabhängig und getestet. Die komplette
Zug-Orchestrierung – Planung, Ausführung, Schaden, Terrainmutation, Reaktionen
und Zugwechsel – steckt jedoch noch in der großen `MatchScene.ts`. Es fehlt eine
headless ausführbare Match-Engine. Damit ist die Kritik für vollständige
automatische Matches richtig, ohne dass das Projekt von null neu gebaut werden
müsste.

## Präzisierungen zu den vorgeschlagenen Sofortmaßnahmen

### Treffer nicht immer mit vollem Schaden

Linearer Explosions-Falloff existiert bereits. Die KI plant aber oft sehr nahe
am Zielzentrum, weshalb Treffer praktisch maximal wirken. Verdeckte
Zufallsschäden wären keine gute Lösung. Besser sind sichtbare Zielunsicherheit,
Streuung oder mehrere plausibel versetzte Einschlagpunkte, die weiterhin dem
Fairnessvertrag entsprechen.

### Figuren näher zusammenstellen

Konfliktreichere Startlagen sind als Test und für einzelne Karten sinnvoll.
Alle Figuren pauschal eng zu gruppieren würde dagegen schnell unvermeidbaren
Freundbeschuss erzeugen. Besser sind ausgewählte Konfliktzonen, verschiedene
Höhen, zeitweise Gruppenrisiken und mehrere repräsentative Startformationen.

## Empfohlener Lösungsweg

### Phase A – Messbarkeit vor Balancing

Für jeden geplanten Zug wird eine kompakte Diagnose erzeugt:

- Karte, Seed, Zug und aktive Figur,
- Persönlichkeit, Start- und Zielposition,
- gewählte Bewegung, Waffe, Ziel und Einschlagspunkt,
- erwarteter Schaden, Eigen-/Kameradenrisiko, Terrain- und Showwert,
- Abstand zwischen bestem und zweitbestem Kandidaten,
- Anteil der Seed-Variation,
- Grund für einen reinen Positions- oder Leerlaufzug.

Damit wird zuerst die aktuelle erste Karte reproduzierbar vermessen, statt
Balance aus Einzelfällen abzuleiten.

### Phase B – Headless Match-Engine extrahieren

Die vorhandenen reinen Simulationsmodule werden weiterverwendet. Aus der
`MatchScene` wird nur die fachliche Orchestrierung in eine serialisierbare Engine
verschoben:

```text
MatchState + Kommando
→ Planung oder Auflösung
→ neuer MatchState
→ fachliche Ereignisse für Darstellung und Bericht
```

Phaser konsumiert anschließend Ereignisse wie Bewegung, Projektilflug,
Explosion, Schaden, Landung und Zugwechsel, ist aber nicht mehr der einzige Ort,
an dem ein vollständiges Match ablaufen kann.

### Phase C – Automatische Match- und Diversitätstests

Ein Simulator führt viele Matches über Karten, Aufstellungen und Seeds aus und
meldet mindestens:

- Auswahlrate jeder Waffe,
- Ziel- und Bewegungsverteilung,
- Anteil von Leerlauf-/reinen Positionierungszügen,
- Eigen- und Freundbeschussrisiko,
- messbare Verhaltensunterschiede der Persönlichkeiten,
- semantischen Abstand nach „Lass das!“,
- Matchlänge, Siegverteilung und Wiederholungsgrad.

Ein einzelner Startwert wie „keine Waffe sollte in einem breiten Basisszenario
mehr als ungefähr 70 Prozent aller Angriffe belegen“ darf als Warnsignal dienen,
aber nicht ungeprüft zur endgültigen Designregel werden.

### Phase D – Gezielt balancieren

Erst auf Basis der Messwerte werden Waffenutility, Startformationen,
Persönlichkeitsgrenzen, Kandidatenband und semantische Neuplanung angepasst.
Jede Änderung erhält ein reproduzierbares Szenario und wird anschließend erneut
über vollständige Matches geprüft.

## Abnahmekriterien für den nächsten Kernloop-Schritt

- Ein identischer Seed erzeugt weiterhin exakt denselben Matchverlauf.
- Jede unterstützte Eröffnung erlaubt jeder möglichen aktiven Figur mindestens
  eine nachvollziehbar sinnvolle Aktion oder eine klar begründete taktische
  Positionierung.
- Keine Waffe dominiert alle repräsentativen Karten- und Deckungssituationen.
- Persönlichkeiten unterscheiden sich in passenden Risikosituationen messbar
  und für Spieler erklärbar.
- „Lass das!“ erzeugt eine semantisch erkennbare Alternative statt nur einer
  anderen internen ID.
- Abweichungen entstehen aus sichtbarer Unsicherheit, Persönlichkeit, Physik
  oder Terrain – niemals aus unbegründeter Zufallsdummheit.
- Vollständige Matches laufen ohne Browser und liefern auswertbare Berichte.

## Priorität im großen Ganzen

Die nächste größere Gameplay-Arbeit sollte Messbarkeit und die headless
Match-Orchestrierung sein. Eine tiefere Manager-Metaebene, weitere Waffenmengen
oder viele zusätzliche Figuren sollten erst folgen, wenn mehrere automatische
und manuelle Matches echte taktische Alternativen sowie unterhaltsame
Persönlichkeitsunterschiede belegen.

## Status des zuletzt erstellten Feedback-Asset-Pakets

Das Grafikpaket aus Task 020 ist vollständig eingebunden:

- `public/assets/projectiles/comic-projectile-sheet.png` ersetzt die bisherigen
  geometrischen Projektile. Rakete, Granate und Geländebrecher werden im Flug
  anhand der aktuellen simulierten Geschwindigkeit ausgerichtet.
- `public/assets/vfx/secondary-vfx-sheet.png` liefert zweiphasige
  Granatenabpraller und Landestaub. Die Effekte reagieren ausschließlich auf
  bereits feststehende Simulationsereignisse.
- `public/assets/ui/feedback-icon-sheet.png` liefert sechs tatsächlich genutzte
  Icons für die drei Waffen, Teamgesundheit, Zugfolge und Managerkommando in
  Match-HUD und Einsatzplanung.

Diese Assets verbessern Lesbarkeit und Feedback, ändern aber bewusst keine der
oben beschriebenen Entscheidungs-, Architektur- oder Balancefragen.

## Fortschritt vom 22. Juli 2026: Phase B umgesetzt (Task 021)

Ergänzt von Claude Fable 5 (Anthropic). Die in diesem Review geforderte
headless Match-Orchestrierung existiert seit Task 021 als Modul
`src/simulation/match/` (Zustand, `planTurn`, `resolveTurn`, `concludeTurn`,
Managerkommandos, `runMatch`). Damit sind folgende Abnahmekriterien dieses
Dokuments automatisch geprüft:

- Determinismus: identischer Seed erzeugt in zwei headless Läufen ein
  identisches Ereignisprotokoll samt Endzustand (beide Karten).
- Eröffnungen: jede der vier möglichen Eröffnungsfiguren erhält auf beiden
  Karten einen Angriff oder eine begründete Positionierung – der
  Moki-Regressionsfall ist als dauerhafter Test verankert.
- Vollständige Matches laufen ohne Browser: Referenzlauf Seed 21072026 endet
  auf den Sonneninseln nach 29 Zügen (Sieg der Rivalen) und im Space-Resort
  nach 17 Zügen (Sieg der Crew), ausnahmslos mit Angriffszügen.

Noch offen aus diesem Review: Zugdiagnose-Berichte (Phase A im Sinne
auswertbarer Kandidatenprotokolle pro Zug), Massen-Simulator mit
Diversitätsmetriken (Phase C) sowie die inhaltlichen Balancefragen
(Waffendominanz, spürbare Persönlichkeitsunterschiede).
