# Task 043: Burrow – Terrainvarianten vor dem Fantasy-Loop

## Status

`B persönlich gewählt – Burststart-Korrektur umgesetzt und geprüft`

### Bestätigte Korrektur nach dem Vergleich (D-062)

Der Nutzer wählt B als Grundlage, ohne Erdloch an der Kopfposition beim
Drücken von Burst. B wird Standard; explizites A bleibt zum Vergleich.
Burststart und unterirdische Burststrecke entfernen keine Erde. Spur,
Beschleunigung, Durchbruch und schneller Einschlag bleiben ansonsten erhalten.
Auch das direkte Freistanzen von Stützen durch Burststart entfällt ohne Ersatz.
Regression: Burst mit und ohne Richtung lässt Maske und Stützen unverändert,
auch nach Ablauf der Spur. Typprüfung, Gesamttests, Build und Browser-Smoke
prüfen die Korrektur. Keine neue Content- oder Gate-Freigabe.

Diese Entscheidung ersetzt die widersprechenden Annahmen im nachfolgenden
ursprünglichen Vergleichsplan und seinem historischen Umsetzungsbericht.
Insbesondere sind dessen Burststart-Kraterbelege kein Sollverhalten mehr.

### Prüfergebnis der Korrektur

- 167 Tests bestanden, zwei bestehende Tests übersprungen; darunter 39
  Burrow-Tests. Typprüfung und Produktionsbuild bestanden. Bestehende Warnung:
  großer gemeinsamer Phaser-Chunk.
- Separater Chromium-Testbrowser: Start ohne Parameter wählt B. Echter Klick
  auf den Burstbutton mit Maus und emuliertem Touch aktiviert Burst und erreicht
  370 Weltpixel/s. Die gesamte Terrainmaske bleibt identisch (Version 6), auch
  nach vollständigem Ablauf der Spur; Erde am Startpunkt bleibt vorhanden.
  Keine JavaScript-/Konsolenfehler. Touch-Screenshots visuell geprüft.
- Belege: `docs/burrow/qa/task-043/burst-start-fix.json` und zugehörige
  `burst-start-fix-*.png`. Ältere Belege dokumentieren den Vergleich vor D-062.
- App-Browser-Anbindung weiterhin beim Laufzeitstart nicht verfügbar; keine
  Nutzersitzung automatisiert. Kein echter Smartphone-Test. Nur lokal,
  kein Commit, Push oder Deployment.

## Ziel

Der bestehende Gate-4-Stand erhält zwei unter identischen Bedingungen
spielbare Terrainvarianten, damit ein kurzer persönlicher Vergleich verbindlich
entscheidet, ob Burrow dauerhafte Tunnel behält oder normale Grabspuren nach
kurzer Zeit zusammenfallen, bevor Upgrades, Wachstum oder neuer Content gebaut
werden.

## Warum jetzt

Die neue Produktanalyse
`BURROW_Produktvision_und_Entwicklungsplan.md` benennt ein reales Problem:
Normales Bewegen entfernt derzeit dauerhaft dieselbe Terrainmaske, welche
Oberfläche, Stützen, erneute Anfahrten und vorhandene Tunnel definiert. In einem
längeren Run kann der Spieler dadurch die eigene Spielfläche verbrauchen.

Gleichzeitig wurde in Gate 1 gerade das schnellere Gleiten durch selbst
gegrabene, dauerhafte Tunnel positiv bewertet. Ein direkter Austausch des
Terrainmodells würde deshalb nicht nur einen Fehler beheben, sondern einen
bestätigten Teil der Bewegungsidentität entfernen. Der Umbau beginnt mit einem
isolierten Variantenvergleich und nicht mit zusätzlichem Content.

## Verbindliche Produktfrage

> Welche Terrainvariante trägt auf derselben Karte den besser planbaren und
> freiwillig wiederholbaren Drei-Minuten-Loop, ohne dass Oberfläche und Ziele
> zunehmend unbrauchbar werden?

Task 043 beantwortet nur diese Frage. Er entscheidet noch nicht über Regionen,
Metafortschritt oder ein vollständiges Produkt.

## Pflichtlektüre

- `AGENTS.md`
- `BURROW_Produktvision_und_Entwicklungsplan.md`
- `docs/00_PROJECT_INDEX.md`
- `docs/burrow/VISION.md`
- `docs/burrow/VERTICAL_SLICE.md`
- `docs/burrow/TECHNICAL_PLAN.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/DECISIONS.md`
- `tasks/037_BURROW_GATE_0_AND_1.md`
- `tasks/038_BURROW_GATE_2_HUNT.md`
- `tasks/039_BURROW_GATE_3_STRUCTURE.md`
- `tasks/042_BURROW_REACTIVE_WORLD.md`

## Voraussetzungen

- Der technische Stand von Task 042 ist gesichert und seine direkt betroffenen
  Fachtests sind grün.
- Die neue Produktanalyse aus Commit `62107b1` liegt im lokalen Arbeitsbaum vor.
- Vor der Implementierung dokumentiert `docs/DECISIONS.md`, dass Task 043 ein
  reversibler Produktvergleich und noch kein endgültiger Terrainpivot ist.
- `docs/burrow/VERTICAL_SLICE.md` und `docs/burrow/TECHNICAL_PLAN.md` beschreiben
  die zwei Testvarianten und die zweite Grabspurschicht, ohne die bisherige
  Produktwertung vorwegzunehmen.

## Vergleichsvarianten

### Variante A – dauerhafte Tunnel

- Entspricht dem heutigen fachlichen Verhalten.
- Normale Untergrundbewegung ruft weiterhin `carveCapsule()` auf.
- Bereits entfernte Terrainzellen bleiben offen.
- Vorhandene Tunnel erlauben weiterhin das höhere Tunneltempo.
- Normales Untergraben kann weiterhin Stützen entfernen.

Variante A ist die Regression-Baseline. Ihr Bewegungsgefühl und ihre
Terrainwirkung dürfen während des Umbaus nicht unabsichtlich verändert werden.

### Variante B – zusammenfallende Grabspur

- Normale Untergrundbewegung verändert die permanente Terrainmaske nicht.
- Sie schreibt stattdessen eine fachliche, kurzlebige Grabspur in eine zweite
  Simulationsschicht.
- Die Spur bleibt zunächst exakt zehn Simulationssekunden aktiv.
- Eine aktive Spur ist sichtbar und kann mit dem heutigen Tunneltempo erneut
  befahren werden.
- Nach Ablauf wird sie unpassierbar als Schnellroute und verschwindet visuell;
  die unveränderte permanente Erde benötigt keine Wiederherstellung.
- Vorgefertigte Höhlen und dauerhaft zerstörte Bereiche bleiben echte Öffnungen
  der vorhandenen Terrainmaske.

Die Hauptmaske wird bewusst nicht zeitverzögert wieder aufgefüllt. Eine solche
Lösung könnte den Körper einschließen, Schreinräume schließen oder bereits
verlorene Stützen fachlich wiederherstellen.

## Dauerhafte Zerstörung in Variante B

Permanente Terrainmutation bleibt ein gezieltes Ereignis. Für diesen Test sind
genau folgende Auslöser erlaubt:

1. ein unterirdisch gestarteter Burst erzeugt einmalig eine lokale Öffnung am
   Startpunkt,
2. der Übergang von Erde zu Luft erzeugt einmalig den sichtbaren Breach-Krater,
3. ein schneller Wiedereintritt erzeugt einmalig eine lokale Impact-Öffnung,
4. ein Burst im unmittelbaren Bereich einer Stütze kann dadurch deren
   Terrainanker dauerhaft entfernen.

Ein aktiver Burst fräst nicht während jedes Simulationsschritts einen langen
permanenten Korridor. Die Ereignisse verwenden zunächst die vorhandenen
Bewegungsradien; Task 043 führt keine zusätzliche Radius-Balancematrix ein.

## Technischer Umbau

### 1. Explizite Startkonfiguration

- Ein typisierter Wert `persistent | recovering` wird außerhalb der Simulation
  aus `?terrain=persistent` beziehungsweise `?terrain=recovering` gelesen.
- Die gewählte Variante wird der Scene und anschließend `BurrowMotion`
  ausdrücklich übergeben. Simulationen lesen weder URL noch DOM.
- Fehlt der Parameter, startet während des Vergleichs die bisherige Variante A.
- Das HUD zeigt gut sichtbar `TERRAIN A` oder `TERRAIN B`.
- Ein Wechsel während eines Runs ist nicht erlaubt; ein Variantenwechsel lädt
  einen frischen, identischen Startzustand.

### 2. Kurzlebige fachliche Grabspur

Eine neue rendererfreie Klasse, beispielsweise `BurrowTrailField`, verwaltet:

- durch normale Bewegung markierte Zellen oder Kapselsegmente,
- den festen Ablaufzeitpunkt in Simulationsschritten statt realer Uhrzeit,
- Abfragen, ob eine Weltposition aktuell zur schnellen Route gehört,
- lokal geänderte Regionen für die Darstellung,
- einen begrenzten aktiven Zustand, aus dem ein serialisierbarer Snapshot
  erzeugt werden kann.

Nur aktuell aktive Zellen werden beim Ablauf bearbeitet. Ein vollständiger Scan
der 2.560×1.280-Welt in jedem 60-Hz-Schritt ist nicht zulässig.

### 3. Bewegung von Terrainmutation trennen

`BurrowMotion` liefert getrennte Ergebnisse für:

- Bewegung und Modus,
- permanente Terrainmutation,
- temporäre Grabspurmutation,
- einmalige Burst-, Breach- und Impact-Ereignisse.

In Variante B bestimmt die Kombination aus Hauptmaske und aktiver Grabspur den
Bewegungsmodus:

- feste Erde ohne aktive Spur: heutiges Grabtempo,
- aktive Spur oder echte, umschlossene Höhle: heutiges Tunneltempo,
- offene Oberfläche ohne umgebende Wände: Flugmodus.

Der Körpertrail bleibt distanzbasiert. Er darf weder Renderframes noch den
Ablauf kosmetischer Partikel als fachliche Zeitquelle verwenden.

### 4. Getrennte Darstellung

- `TiledTerrainRenderer` zeichnet weiterhin ausschließlich die permanente
  Terrainmaske.
- Eine eigene dünne Rendererschicht zeigt die aktive Grabspur mit aufgewühlter
  Erde, Rissen und einer klaren nachlaufenden Auflösung.
- Darstellung und Ablauf lesen dieselben fachlichen Spurzustände; Phaser
  entscheidet nicht, wann eine Route noch schnelles Gleiten erlaubt.
- Nur geänderte Kacheln oder Segmente werden aktualisiert.
- Die Spur bleibt auf Mobilgröße von dauerhaften Höhlen und echten Kratern
  unterscheidbar.

### 5. Oberflächenobjekte an echte Maske binden

Kutsche und Tier dürfen nach einem permanenten Krater nicht weiter auf der
ursprünglichen mathematischen `surfaceYAt()`-Kurve schweben.

- Eine kleine rendererfreie Bodenabfrage ermittelt an der aktuellen
  X-Position die oberste tragende Zelle der permanenten Maske.
- Kleine Höhenunterschiede werden nachvollzogen.
- Fehlt innerhalb einer begrenzten Stufe tragfähiger Boden, wechselt das Objekt
  in einen klaren Zustand `gestoppt/ohne Halt`, statt über die Lücke zu laufen
  oder senkrecht wieder hochzuspringen.
- Es entsteht keine allgemeine NPC-Navigation und keine Starrkörperphysik.
- Die Stützen lesen weiterhin ausschließlich permanente Terrainmutation;
  temporäre Grabspuren dürfen keinen Kollaps auslösen.

## Voraussichtlich betroffene Dateien

- `src/burrow/main.ts` oder `src/burrow/config.ts`: typisierte Auswahl der
  Testvariante,
- `src/burrow/scenes/BurrowGameScene.ts`: explizite Orchestrierung und getrennte
  Renderupdates,
- `src/burrow/simulation/BurrowMotion.ts`: Bewegung von permanenter Mutation
  entkoppeln,
- `src/burrow/simulation/BurrowTrailField.ts`: neue temporäre Spur,
- `src/burrow/simulation/BurrowSurfaceSupport.ts`: kleine Bodenabfrage für
  Oberflächenobjekte,
- `src/burrow/simulation/BurrowHunt.ts` und
  `src/burrow/simulation/BurrowWorldResponse.ts`: klarer Zustand bei fehlendem
  Boden,
- `src/burrow/rendering/BurrowTrailRenderer.ts`: rein visuelle Spur,
- zugehörige neue oder angepasste Fachtests,
- `docs/DECISIONS.md`, `docs/burrow/VERTICAL_SLICE.md` und
  `docs/burrow/TECHNICAL_PLAN.md`.

Dateinamen dürfen bei der Umsetzung leicht abweichen. Die fachlichen Grenzen
und Abhängigkeitsrichtungen sind verbindlich.

## Umsetzungsreihenfolge

1. Dokumentiere den reversiblen Test und sichere die Variante-A-Regressionen.
2. Führe die typisierte Terrainkonfiguration ein, noch ohne Verhaltensänderung.
3. Implementiere und teste die kurzlebige Grabspurschicht isoliert.
4. Entkopple `BurrowMotion` und beweise beide Bewegungsvarianten in Fachtests.
5. Kopple die vier erlaubten Zerstörungsereignisse an die permanente Maske.
6. Ergänze die lokale Spur-Darstellung ohne Gameplayautorität.
7. Binde Kutsche und Tier an die kleine permanente Bodenabfrage.
8. Führe Fachtests, Gesamttests, Typprüfung und Produktionsbuild aus.
9. Prüfe beide Varianten im Browser auf Desktop und Touchgerät.
10. Führe erst danach das persönliche Vergleichsprotokoll durch und
    dokumentiere die Entscheidung.

## Scope

- zwei explizit startbare Terrainvarianten in derselben Arena,
- zehn Sekunden aktive und erneut schnell befahrbare Grabspur in Variante B,
- lokale permanente Burst-, Breach-, Impact- und Stützenzerstörung,
- minimales fachliches Bodenverhalten für vorhandene Oberflächenobjekte,
- notwendige Renderer- und HUD-Anpassung,
- deterministische Fachtests und persönliches Vergleichsprotokoll.

## Nichtziele

- keine Hühner, Schafe, Ritter oder zusätzlichen Gegnertypen,
- keine Upgrades, Mutation, sichtbare neue Wachstumsstufe oder Run-Ökonomie,
- keine Schlusskutsche und kein Ergebnisbildschirm,
- keine neue Region, Chunkwelt, Persistenz oder allgemeine Physik,
- keine neuen Eingabetasten oder Spezialfähigkeiten,
- keine Änderung an Abriss-Dateien oder der Abriss-Produktvision,
- keine endgültige Entfernung einer Terrainvariante vor dem persönlichen Test.

## Fachliche Tests

Mindestens folgende Regressionen sind erforderlich:

1. Variante A entfernt bei normaler Bewegung weiterhin lückenlos Terrain und
   erreicht in einem vorhandenen Tunnel das heutige Tunneltempo.
2. Variante B erhöht bei normaler Bewegung weder Version noch entfernte Zellen
   der permanenten Maske.
3. Eine frische Grabspur erlaubt in Variante B das heutige Tunneltempo.
4. Dieselbe Spur bleibt vor zehn Simulationssekunden aktiv und ist danach
   zuverlässig abgelaufen.
5. Spurerzeugung und Ablauf melden nur lokale schmutzige Regionen.
6. Ein Burst-, Breach- oder Impact-Ereignis erzeugt in Variante B genau die
   erwartete permanente Mutation und wiederholt sie nicht pro Renderframe.
7. Eine normale Grabspur unter einer Stütze löst keinen Stützenverlust aus;
   eine erlaubte permanente Aktion kann ihn auslösen.
8. Kutsche und Tier bleiben nach einer lokalen Oberflächenöffnung entweder auf
   gültigem Boden oder wechseln deterministisch in den Zustand ohne Halt.
9. Beide Varianten liefern bei identischer Eingabefolge reproduzierbare
   Ergebnisse.

## Browserabnahme

Für beide URLs wird mit derselben Arena und demselben frischen Start geprüft:

- `burrow.html?terrain=persistent`
- `burrow.html?terrain=recovering`

Je Variante sind mindestens zu prüfen:

1. normales Graben und eine absichtliche Rückfahrt durch die eigene Route,
2. ein Burst-Breach nahe Kutsche oder Tier,
3. ein normaler Durchgang unter einer Stütze,
4. ein gezielter Burst an einer Stütze,
5. ein schneller Wiedereintritt,
6. sichtbarer Spurablauf ohne Sprite-, Kamera- oder Terrainflackern,
7. Neustart mit sauberem Ausgangszustand,
8. unveränderte Abriss-Startseite unter `index.html`.

Desktop-Smoke und persönlicher Touchtest sind beide erforderlich. Beide Seiten
müssen ohne neue Konsolenfehler laufen.

## Persönliches Vergleichsprotokoll

Der Vergleich besteht aus vier Runs zu je exakt drei Minuten in der Reihenfolge
`A – B – B – A`. Jeder Run beginnt frisch; die Variante bleibt im HUD angezeigt,
wird währenddessen aber nicht gewechselt oder nachjustiert. Nach jedem Run werden festgehalten:

- Spaß an der reinen Untergrundbewegung, Skala 1–5,
- Planbarkeit des nächsten Breaches, Skala 1–5,
- Lesbarkeit von temporärer Spur und permanentem Krater, Skala 1–5,
- Zustand der Oberfläche nach drei Minuten, Skala 1–5,
- bewusste Wiederverwendung einer eigenen Route: ja/nein,
- Erreichbarkeit von Kutsche, Tier, Turm und Schrein: jeweils ja/nein,
- unmittelbarer Wunsch nach einem weiteren Run, Skala 1–5,
- kurze freie Begründung für die bevorzugte Variante.

Biomasse, ausgelöste Breaches, Kollaps und Schreinaktivierung werden ergänzend
notiert, sind aber kein Ersatz für die persönliche Produktwertung.

## Entscheidungstor

### Variante B wird Standard, wenn

- die Oberfläche nach drei Minuten sichtbar besser nutzbar bleibt,
- die Bewegungswertung gegenüber A nicht um mehr als einen Punkt fällt,
- die eigene Spur in mindestens einem B-Run bewusst wiederverwendet wird,
- Breaches weiterhin planbar bleiben und die gezielte Zerstörung verständlich
  ist.

### Variante A bleibt Standard, wenn

- der Ablauf der Spur das Bewegungsgefühl oder die räumliche Orientierung klar
  verschlechtert,
- die Spur praktisch nicht bewusst wiederverwendet wird,
- das Oberflächenproblem im echten Drei-Minuten-Test geringer ist als
  angenommen.

### Das Ergebnis ist uneindeutig, wenn

- beide Varianten die Oberfläche unbrauchbar machen,
- die visuelle Spur nicht zuverlässig vom permanenten Krater unterscheidbar
  ist,
- Steuerungs- oder Bodenfehler den Vergleich dominieren.

Bei einem uneindeutigen Ergebnis wird ausschließlich die erkannte Störgröße in
einem kleinen Folgetest korrigiert. Es beginnt kein Upgrade- oder Contenttask.

Die Nutzerentscheidung wird anschließend in `docs/DECISIONS.md` festgehalten.
Nur die gewählte Variante wird Produktionsstandard; die unterlegene
Testkonfiguration darf nicht als dauerhaftes zweites Regelsystem mitgeschleppt
werden.

## Freigabefolge nach Task 043

Das positive Terrainergebnis hat D-063 konkretisiert. Der historische Vorschlag
eines einzelnen Drei-Minuten-Tests wird durch den verbindlichen Drei-Level-Plan
in `docs/burrow/THREE_LEVEL_SLICE.md` ersetzt. Der erste Folgetask darf zunächst
nur enthalten:

- gemeinsames rendererfreies Run- und Leveldefinitionsfundament,
- ein vollständiges Level 1 mit höchstens 180 Sekunden aktiver Zeit,
- einen Schrein in einer vorgefertigten Höhle und genau eine 1-aus-3-Wahl,
- die drei Upgradepfade auf Rang 1,
- eine besondere Schlusskutsche aus der vorhandenen Kutschenlogik,
- Scheitern, Levelabschluss und Wachstum vom Keimling zum Gräber.

Level 2 beginnt erst nach persönlicher Level-1-Abnahme, Level 3 erst nach
Level 2. Ritter, Magier, weitere Regionen und Makrofortschritt bleiben auch
danach bis zur positiven Drei-Level-Abnahme gesperrt.

## Verifikation

- `npm test -- src/burrow/simulation`
- `npm run typecheck`
- `npm test`
- `npm run build`
- Browser-Smoke beider Varianten auf Desktop
- persönlicher Touchtest beider Varianten
- vier protokollierte Drei-Minuten-Runs

## Abschlussbericht

Der Bearbeiter berichtet:

1. umgesetzte Trennung von Bewegung, Grabspur und permanenter Zerstörung,
2. geänderte Dateien und dokumentierte Entscheidung,
3. ausgeführte Fachtests, Gesamttests, Typprüfung und Buildresultate,
4. Browser- und Touchprüfungen beider Varianten,
5. protokollierte Vergleichswerte und bevorzugte Variante,
6. bekannte Einschränkungen und bewusst nicht begonnene Folgearbeit.

## Technisches Prüfergebnis – 30. August 2026

- Umsetzung auf dem bestehenden, noch uncommitteten Task-42-Stand; dessen
  Weltobjekte und Änderungen wurden erhalten. Die GitHub-Produktanalyse aus
  Commit `62107b1` wurde unverändert als lokale Pflichtlektüre übernommen.
- A bleibt Standard. Die sichtbaren A/B-Links starten jeweils frisch; der
  Neustartknopf und R setzen auch Spur, Pointerzustand und Weltreaktionen zurück.
- B verwendet ein sparsames Spurfeld mit 600-Tick-Fristen. Erneutes Durchfahren
  erneuert die Frist, Stillstand nicht. Der Renderer zeigt lockere Erde statt
  eines permanenten Lochs; die letzten zwei Sekunden sind abgeschwächt.
- Lokale permanente Aktionen sind fachliche Ereignisse. Die Oberfläche wird
  für B erst beim Austritt des Kopfzentrums verlassen, damit unveränderte Erde
  nicht sofort einen falschen Wiedereintritt auslöst.
- D-061 präzisiert die gemeinsame Bodenreaktion für A und B: zu hohe Stufen
  stoppen, tatsächlich entfernter Boden unter einem Objekt lässt dieses mit
  fester Sinkgeschwindigkeit zum nächsten Boden absinken und dort stoppen.
- Baseline vor Umbau: 24 Burrow-Tests bestanden. Nach Umbau: 38 Burrow-Tests;
  vollständige Suite: 166 bestanden, zwei bestehende Tests übersprungen.
  Typprüfung und Produktionsbuild bestanden. Bekannte Buildwarnung bleibt
  der große gemeinsame Phaser-Chunk, keine neue Abhängigkeit wurde ergänzt.
- Browser-Smoke mit separatem gebündelten Chromium: beide Varianten mit
  Desktop-Tasten und emulierter Touch-Richtung, sichtbarer Treffer/Tierflucht,
  A/B-Wechsel, Neustart und Abriss-Einstieg ohne JavaScript-/Konsolenfehler.
  Die Browser- und Computer-Use-Anbindung der App scheiterten bereits beim
  lokalen Laufzeitstart (`failed to write kernel assets`); der Fallback
  verwendete ausschließlich einen isolierten Testbrowser, keine Nutzersitzung.
- Zusätzlich wurden echte Scene-Updates mit festen Schritten im Testbrowser
  ausgeführt: B-Spur von 1.693 auf null aktive Zellen, danach null Overlaykacheln,
  permanente Maskenversion unverändert bei 6. Normales Untergraben ließ in B
  drei Stützen stehen; gezielter Burst reduzierte auf zwei, zweiter gezielter
  Stützenangriff löste den sichtbaren Kollaps aus. A blieb dauerhaft ausgehoben.
  Screenshots wurden visuell geprüft.
- Belege: `docs/burrow/qa/task-043/browser-smoke.json`, `scenario-smoke.json`
  und zugehörige Screenshots. Das persönliche Formular liegt unter
  `docs/burrow/TERRAIN_PLAYTEST.md`.

### Noch offen / bewusst begrenzt

- Kein echter Smartphone-Test und keine persönliche A–B–B–A-Wertung durchgeführt.
  Es wurde keine Standardvariante gewählt und kein Folgegate freigegeben.
- Krater können weiterhin kumulieren; B reduziert gewöhnliche Grabzerstörung,
  garantiert aber keine unendlich spielbare Oberfläche. Das ist Teil des Tests.
- Gestoppte Tiere/Kutschen besitzen keine Umweg-KI oder komplexe Fallphysik.
- Die Spur ist eine funktionale, schraffierte Testdarstellung; keine finalen
  Partikel-/Bodenassets. Bestehende statische Grasdetails sind nicht maskendynamisch.
- Nur lokal umgesetzt und geprüft; kein Commit, Push oder Deployment ausgeführt.
