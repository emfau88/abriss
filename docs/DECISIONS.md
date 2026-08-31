# Entscheidungsprotokoll

Dieses Dokument hält verbindliche, projektweite Entscheidungen fest. Neue Einträge werden angehängt; alte Entscheidungen werden nicht stillschweigend überschrieben.

## 2026-07-21 – D-001: Rundenartig inszenierte autonome Kämpfe

**Entscheidung:** Große Aktionen werden nacheinander geplant, angekündigt und ausgeführt. Kein permanentes Echtzeit-Massengewusel.

**Grund:** Erwartungsspannung, Lesbarkeit und nachvollziehbare Verantwortung sind Kern des Produkts.

## 2026-07-21 – D-002: Fantasy-Abrissfirma als verbindliche Themenrichtung

**Status:** am 21. Juli 2026 durch D-013 aufgehoben.

**Entscheidung:** Der erste Vertical Slice spielt in einer freundlichen Fantasy-Arbeitswelt rivalisierender Abrisscrews.

**Grund:** Thema und Zerstörungsmechanik erklären einander und schaffen Abstand zu direkten Artillery-Kopien.

**Offen:** endgültiger Produktname, Spezies und Markenidentität.

## 2026-07-21 – D-003: Browser-first mit TypeScript und Phaser

**Entscheidung:** TypeScript, Phaser, Vite und Vitest bilden die erste technische Basis.

**Grund:** direkter Browserfokus, gut testbare Fachlogik und geringe Reibung für agentengestützte Entwicklung.

## 2026-07-21 – D-004: Eigene Simulation getrennt von Phaser

**Entscheidung:** Terrain, Ballistik, Kampfregeln, Züge, Zufall und KI liegen in einem rendererunabhängigen Simulationskern.

**Grund:** Vorschau, KI und Ausführung müssen dieselben Regeln nutzen und reproduzierbar testbar sein.

## 2026-07-21 – D-005: Terrainmaske statt allgemeiner Starrkörperlandschaft

**Entscheidung:** Der Vertical Slice verwendet eine veränderbare Kollisionsmaske mit regionalen Updates.

**Grund:** vollständige Physikpolygon-Neuberechnung würde Kollisions-, Performance- und Navigationsrisiken unnötig erhöhen.

## 2026-07-21 – D-006: Utility-KI mit sichtbarer Begründung

**Entscheidung:** Persönlichkeit verändert nachvollziehbare Bewertungsgewichte. Es gibt keinen separaten zufälligen „Versagenswurf“.

**Grund:** Spieler sollen Figuren verantwortlich machen können, ohne das System als defekt wahrzunehmen.

## 2026-07-21 – D-007: Ein negatives Managerkommando im Vertical Slice

**Entscheidung:** „Lass das!“ verwirft einmal pro Match den gezeigten besten Kandidaten und erzwingt eine erklärte Alternative.

**Grund:** Dies prüft begrenzte Agency, ohne direkte Ziel- oder Schusskontrolle einzuführen.

## 2026-07-21 – D-008: Qualität vor Contentmenge

**Entscheidung:** Finale Assets, Kampagne und umfangreiche Meta-Systeme beginnen erst nach einem extern getesteten Vertical Slice.

**Grund:** Das größte Risiko ist der Kernloop, nicht die Menge verfügbarer Inhalte.

## 2026-07-21 – D-009: Fixierte Basisversionen für Task 001

**Entscheidung:** Die technische Basis verwendet Phaser 4.2.1, Vite 8.1.5, TypeScript 7.0.2 und Vitest 4.1.10. Das Lockfile ist verbindlich.

**Grund:** Diese stabilen Versionen sind mit der lokalen Node.js-Laufzeit kompatibel und verhindern nicht reproduzierbare Installationen. Aktualisierungen erfolgen bewusst in einem eigenen Wartungstask.

## 2026-07-21 – D-010: Terrainmaske mit zwei Weltpixeln pro Byte-Zelle

**Entscheidung:** Die logische Welt von 1280×720 Pixeln verwendet im Vertical Slice eine Maske von 640×360 Zellen. Jede Zelle wird als Byte in einem `Uint8Array` gespeichert und repräsentiert 2×2 Weltpixel. Die Maske benötigt 230.400 Byte beziehungsweise 225 KiB.

**Grund:** Direkter Zellzugriff und partielle Übertragung in eine Canvas-Textur bleiben einfach und schnell. Die Auflösung ist für den aktuellen Artillery-Prototyp ausreichend fein, während sie Speicher und Aktualisierungsarbeit gegenüber einer 1:1-Maske um 75 Prozent reduziert.

**Konsequenz:** Explosionen melden die kleinste tatsächlich veränderte Dirty Region. Der Renderer erweitert diese Region nur um eine Zelle, damit neu entstandene Kanten korrekt eingefärbt werden. Falls kleine Figuren oder schmale Terrainstrukturen später sichtbar ungenau kollidieren, wird die Auflösung anhand gemessener Szenarien neu bewertet.

## 2026-07-21 – D-011: Ein Trajektorienresultat für Vorschau, KI und Ausführung

**Entscheidung:** Raketen werden rendererunabhängig mit festen Zeitpunkten von 1/60 Sekunde berechnet. Jeder Schritt wird in Abständen von höchstens einer halben Terrainzelle auf den ersten Maskenkontakt geprüft. Vorschau, KI-Bewertung und sichtbare Wiedergabe erhalten dasselbe unveränderliche Resultat aus Samples, Kontakt und Explosion.

**Grund:** Eine neu berechnete oder von der Darstellung interpolierte Ausführung könnte vom angekündigten Plan abweichen. Ein gemeinsames Resultat macht Übereinstimmung direkt testbar und verhindert Tunneln durch die Zwei-Pixel-Maske.

**Konsequenz:** Andere Geschosse müssen dieselbe fachliche Schnittstelle verwenden oder eine Abweichung ausdrücklich als neue Entscheidung dokumentieren. Visuelle Interpolation darf später nur zwischen diesen Samples stattfinden und den Kontaktpunkt nicht verändern.

## 2026-07-21 – D-012: Begrenzte, stabil erklärte Raketenwahl

**Entscheidung:** Der erste autonome Aktionsslice erzeugt pro lebendem Rivalen drei Raketenbögen. Jeder Kandidat wird über Trefferwirkung, Kameradenrisiko, Eigenrisiko, Abrisswirkung, Showfaktor und Zielabweichung bewertet. Persönlichkeit verändert nur veröffentlichte Gewichte. Eine kleine Variation von maximal 1,25 Nutzenpunkten ist deterministisch an Seed und Kandidaten-ID gebunden; anschließend wird nach Nutzen und bei Gleichstand nach ID sortiert.

**Grund:** Die Figur soll charaktervoll wirken, ohne dass ihre Entscheidung beliebig oder nach einer Neuplanung heimlich verändert erscheint. Kandidatengebundene Variation bleibt auch bei anderer Erzeugungsreihenfolge stabil.

**Konsequenz:** „Lass das!“ speichert die verworfene Kandidaten-ID und wählt den nächsten gültigen Rang. Neue Bewertungsfaktoren brauchen einen maschinenlesbaren Code, einen UI-Text und einen deterministischen Szenariotest.

## 2026-07-21 – D-013: Vielfältige Wesen und geschichtete Inselwelten statt Baustellenthema

**Entscheidung:** Die visuelle und erzählerische Hauptrichtung verwendet unterschiedliche Fantasy-Wesen in fröhlichen, organischen Inselwelten. Karten besitzen mehrere Höhen, Plateaus, Überhänge und fliegende Inseln. Baustellen, Abrissfirmen und Berufsuniformen sind kein verbindlicher Rahmen. D-002 ist damit aufgehoben.

**Grund:** Figurenbindung soll aus verschiedenen Wesen und Persönlichkeiten entstehen. Die Karte trägt einen großen Teil des Spielgefühls und braucht mehr taktische Vertikalität als eine einzelne Bodenlinie. Die bisherige Baustellen- und Papercut-Anmutung war zu eng und entsprach nicht der gewünschten Comic-Artillery-Richtung.

**Konsequenz:** Neue Figurenassets zeigen verschiedene Spezies statt Varianten eines Standardarbeiters. Kartenassets werden in nicht zerstörbaren Hintergrund und alpha-basiertes zerstörbares Vordergrundterrain getrennt. Die sichtbare Alphaform ist die Quelle der Kollisionsmaske. Stilistisch gelten kräftige Comic-Konturen und einfache räumliche Schattierung; konkrete Figuren, Karten oder Marken bestehender Spiele werden nicht kopiert.

## 2026-07-21 – D-014: Große Welt getrennt vom Sichtfenster

**Entscheidung:** 1280×720 bleibt die logische Darstellungsauflösung, nicht die Kartengröße. Der nächste Prototyp verwendet ungefähr 3200×1800 Weltpixel. Figuren behalten ihre Weltgröße; Übersicht und Detail entstehen über Kamera-Zoom statt über eine dauerhafte Verkleinerung aller Spielobjekte.

**Grund:** Mehrere Höhen, fliegende Inseln, weite Flugbahnen und spätere sechs Figuren benötigen deutlich mehr Raum. Dauerhaft kleinere Figuren würden Persönlichkeit, Risikoanzeigen und Reaktionen unnötig schwächen.

**Konsequenz:** Vor dem vollständigen 3-gegen-3-Match entsteht ein Kamerafundament mit Übersicht, manuellem Schwenken/Zoomen sowie automatischer Planung-, Projektil- und Einschlagkamera. D-010 bleibt hinsichtlich Zwei-Pixel-Zellen gültig; seine konkreten Speicherwerte für 1280×720 werden in Task 005 neu gemessen.

## 2026-07-21 – D-015: Weniger kitschige Wesen

**Entscheidung:** Das blaue Hornwesen bleibt ein technischer Platzhalter, ist aber keine verbindliche Figurenreferenz. Weitere Wesen werden weniger glatt, niedlich und maskottchenhaft gestaltet, ohne den freundlichen Comicton zu verlieren.

**Grund:** Verschiedene Wesen sollen eigenwillige Crewmitglieder sein, nicht austauschbare Kuschelmaskottchen. Silhouette, asymmetrische Details und charaktervollere Mimik tragen Persönlichkeit stärker als maximale Niedlichkeit.

**Konsequenz:** Neue Figurprompts vermeiden übergroße Kinderaugen, perfekte Rundungen, hochglänzende Sättigung und reine „cute mascot“-Signale. Angestrebt werden verschmitzte, leicht schräge Designs mit moderater Textur und klarer Lesbarkeit in mehreren Zoomstufen.

## 2026-07-21 – D-016: Kamerafundament und gemessener Weltmaßstab

**Entscheidung:** Der erste große Weltprototyp verwendet 3200×1800 Weltpixel bei unverändertem 1280×720-Sichtfenster. Eine Weltkamera führt Übersicht, Planung, Projektil und Einschlag; eine getrennte HUD-Kamera hält Anzeigen im Screen-Space. Manuelle Kamera bleibt außerhalb des Projektilflugs erlaubt, und automatische Fahrten können durch direkte Schnitte ersetzt werden.

**Grund:** Dieselbe Karte muss räumliche Übersicht und lesbare Figurenreaktionen ermöglichen, ohne Simulation oder UI an einen Kamera-Zoom zu koppeln.

**Messung:** Die 1600×900-Byte-Maske belegt 1,37 MiB, die RGBA-Canvastextur 5,49 MiB. Beim geprüften Einschlag wurde eine Dirty Region von 62×52 Zellen in rund 6,1 ms übertragen. Dies ist eine einzelne Entwicklungsbrowser-Messung und kein belastbarer Performancebenchmark.

**Konsequenz:** Die vorhandene 16:9-Karte darf für den Prototyp skaliert werden, bleibt aber kein finales Produktionsasset. Weitere Karten und sechs Einheiten müssen die gleichen Kamera-Safe-Areas und partiellen Terrainupdates einhalten.

## 2026-07-21 – D-017: Maskenbasierter Fall statt allgemeiner Physik

**Entscheidung:** Nach einer Terrainmutation prüft die Simulation den Fußpunkt jeder Figur. Ohne Unterstützung fällt sie senkrecht zum nächsten festen Maskenpunkt derselben X-Position; ohne tieferen Boden fällt sie aus der Welt und wird ausgeschaltet.

**Grund:** Terrainzerstörung braucht sofort eine taktische Konsequenz, eine allgemeine Starrkörper- oder Ragdollsimulation liegt aber außerhalb des Vertical Slice.

**Konsequenz:** Die fachliche Landeposition wird unabhängig von Renderframes festgelegt. Phaser-Tweens, Reaktionspose, VFX und Kamera stellen das Ergebnis nur dar und dürfen es nicht verändern. Horizontales Rutschen, Rückstoß und Fallschaden bleiben spätere eigenständige Regeln.

## 2026-07-21 – D-018: HD-Kartenquellen und getrennter Rendermaßstab

**Entscheidung:** Kartenquellen und veränderbare Terrain-Canvas verwenden 3200×1800 Pixel. Der Browser-Backbuffer rendert mit 1600×900, während UI-Layout und fachliche Sichtfensterberechnung weiterhin in 1280×720 Screen-Space-Koordinaten arbeiten. Die Kollisionsmaske bleibt unabhängig davon bei zwei Weltpixeln pro Zelle.

**Grund:** Die bisherige 1672×941-Quelle, 1600×900-Terrain-Canvas und 1280×720-Backbuffer wurden in großen Browseransichten mehrfach hochskaliert. Darstellungs- und Kollisionsauflösung müssen nicht identisch sein.

**Messung:** Die volle RGBA-Terrain-Canvas belegt 21,97 MiB. Das geprüfte partielle Canvasupdate um einen Krater betraf 124×108 Renderpixel; einschließlich CanvasTexture-Refresh wurden im Entwicklungsbrowser rund 36,8 ms gemessen.

**Konsequenz:** Die Nahansicht ist deutlich schärfer. Der aktuelle CanvasTexture-Refresh lädt trotz partieller CPU-Aktualisierung möglicherweise die gesamte GPU-Textur neu und bleibt vor mehreren gleichzeitigen Terrainereignissen ein expliziter Optimierungspunkt. Kollisionsdeterminismus und Maskenspeicher von 1,37 MiB ändern sich nicht.

## 2026-07-21 – D-019: Fortlaufender Wechselzug vor dem vollen 3-gegen-3-Match

**Entscheidung:** Der vorhandene 2-gegen-2-Prototyp erhält bereits jetzt einen vollständigen Aktionsabschluss, eine teamweise wechselnde Initiative, automatische Gegnerantworten und einen verständlichen Matchausgang. Die spätere 3-gegen-3-Besetzung baut auf demselben `MatchState` auf.

**Grund:** Ohne Folgezustand konnte nur der erste Schuss sinnvoll geprüft werden. Kamera, Terrainfall, Figurenreaktion und Managerintervention lassen sich erst als zusammenhängender Spielablauf beurteilen, wenn mehrere Aktionen denselben veränderten Zustand weiterverwenden.

**Konsequenz:** Alte Flugbahn und Vorschauzone werden beim Einschlag sofort gelöscht. Treffer, Fall und VFX werden vollständig aufgelöst, überlebende Figuren kehren in die Bereitschaftspose zurück, tote Figuren werden übersprungen und erst danach beginnt der nächste Zug. Das einmalige Managerkommando bleibt über das gesamte Match verbraucht; Gegneraktionen brauchen keine Spielerbestätigung.

## 2026-07-21 – D-020: Fairer Autonomietest vor dem direkten Steuerungsexperiment

**Entscheidung:** Die ursprüngliche Autonomie-Hypothese erhält vor Task 011 einen vollständiger ausgestatteten Vergleichsbuild. Der aktive Charakter plant bis zu 190 Weltpunkte lokale Bewegung, kann auf geprüften Bögen springen und wählt zwischen Panzerfaust, Wurfgranate und Geländebrecher. Task 011 bleibt als reversibles Experiment bereit und ist nicht aufgehoben.

**Grund:** Der erste negative Eindruck entstand mit stationären Figuren und nur einer praktisch dominanten Aktion. Damit war weder beobachtbare Eigeninitiative noch der Umgang mit blockierten Gegnern fair getestet. Bewegung, unterschiedliche Wesen und Waffenpräferenzen sind nötig, um den Unterhaltungswert des Zuschauens und begrenzten Eingreifens beurteilen zu können.

**Konsequenz:** Lokale Bewegung bleibt deterministisch, begrenzt und rendererunabhängig; sie ist kein allgemeines Karten-Pathfinding. Bei blockierter direkter Wirkung darf der Geländebrecher Terrain öffnen, obwohl noch kein Gegner Schaden nimmt. Gibt es auch dafür keinen gültigen Schuss, verbessert die Figur ihre Position und beendet den Zug ohne Angriff. Die Wurfgranate ist in diesem Slice eine hohe kontaktgezündete Flugbahn; Abpraller und Zeitzünder sind spätere Erweiterungen. Rückstoß wird nicht stillschweigend ergänzt, sondern bleibt ein eigener getesteter Physik-Slice.

## 2026-07-21 – D-021: Figuren-Mockups sind konkrete Projektvorlagen

**Entscheidung:** Die Dateien unter `beispiele figuren/` wurden ausdrücklich für dieses Spiel als Figuren-Mockups erzeugt. Künftige Produktions- und Testassets sollen die jeweiligen konkreten Designs – Silhouette, Proportionen, Farbgebung, Gesicht, Kleidung und charakteristische Details – so genau wie für konsistente Animationen möglich wiedergeben. Von der Bild-KI hinzugefügte Fantasietitel, Schriftzüge und Logos gehören nicht zum Design und werden entfernt.

**Grund:** Die bisherigen Hinweise behandelten die Bilder fälschlich nur als lose Moodboards und erzeugten dadurch unnötig weit entfernte Neuentwürfe. Der Nutzer besitzt und beabsichtigt diese Mockups als direkte Projektvorlagen.

**Konsequenz:** Frühere, bewusst eigenständige Imagegen-Aufträge für Moki und Vela bleiben als Entstehungsgeschichte dokumentiert, gelten aber nicht als Methode für die nächste Figurengeneration. D-013 bleibt gegenüber fremden Spielen und Marken unverändert; die enge Übernahme gilt ausschließlich für diese projektspezifischen Mockups.

## 2026-07-21 – D-022: Begrenzte Impulsphysik, echte Granatenzünder und Waffenbefehl

**Entscheidung:** Explosionen erzeugen einen deterministischen, waffenabhängigen Figurenimpuls. Eine einfache gesweepte Figurenhülle kollidiert gegen die aktuelle Terrainmaske, darf höchstens einmal gedämpft abprallen und endet mit Landung, Timeout-Fallauflösung oder Out-of-world. Wurfgranaten prallen höchstens zweimal ab und explodieren nach fester Zünderzeit. Zusätzlich erhält das Spielerteam einmal pro Match einen vom „Lass das!“-Kommando getrennten Waffenbefehl für den unmittelbar folgenden Plan.

**Grund:** Explosionen brauchen räumliche Konsequenz, Granaten eine physikalisch erkennbare Eigenart und der Manager eine konkrete positive Eingriffsmöglichkeit. Allgemeine Starrkörperphysik ist dafür nicht nötig.

**Konsequenz:** Figuren-gegen-Figuren-Kollisionen, Rollen und Ragdolls bleiben ausgeschlossen. Die aktuelle Terrainkollision ist bewusst robust angenähert und darf später durch eine präzisere Kapsel ersetzt werden, ohne die deterministischen Ergebnis-Samples aufzugeben. Eine während der Zielsequenz sichtbare Kraft-/Intensitätsanzeige wird als nächster Präsentationsausbau notiert, aber noch nicht implementiert. D-022 ersetzt die inzwischen überholten Aussagen aus D-017 und D-020, nach denen Rückstoß sowie Abpraller und Zeitzünder erst später folgen sollten.

## 2026-07-21 – D-023: Portabler Pages-Build und responsive Spielhülle

**Entscheidung:** Der Vertical Slice wird als statischer GitHub-Pages-Build aus `main` veröffentlicht. Vite und sämtliche öffentlichen Assetpfade bleiben relativ zum Build-Einstieg. Die Browserhülle nutzt dynamische Viewport-Höhe, Safe Areas und Phaser-`FIT`, ohne die logische 1280×720-Oberfläche oder die Simulation geräteabhängig umzubauen.

**Grund:** Externe Tests brauchen einen ohne Installation erreichbaren, reproduzierbaren Build. Relative Pfade vermeiden eine zweite lokale und eine abweichende Pages-Konfiguration. Eine schlanke responsive Hülle macht denselben Teststand auf Mobilgeräten erreichbar, ohne vor der Kernloop-Validierung einen kostspieligen zweiten HUD-Entwurf zu beginnen.

**Konsequenz:** Mobiles Querformat ist die empfohlene Ansicht; Hochformat zeigt weiterhin das vollständige 16:9-Spiel mit entsprechend kleinerer Schrift. Ein späterer echter Touch-/Portrait-HUD-Umbau bleibt eine eigene Produktentscheidung. Der Pages-Workflow führt Tests und Build vor jeder Veröffentlichung aus.

## 2026-07-21 – D-024: Slime als Animations-Qualitätsbeweis

**Entscheidung:** GLIB rekonstruiert den grünen Slime aus `beispiele figuren/2.jpg` eng in einem 32-Frame-Sheet. Idle, Hüpfen und Sprung erhalten je acht Phasen bei 12–16 Bildern pro Sekunde; Waffenaktion, Treffer und Sieg besitzen eigene Sequenzen. Rein kosmetisches Squash-and-Stretch ergänzt die Frames, besitzt aber keine Autorität über Bewegung oder Kollision.

**Grund:** Die vierphasigen Testwesen belegen die Zustände, wirken in Bewegung aber noch stockend. Ein einzelnes bewusst einfaches Wesen kann mit stabiler Fußachse, mehr Zwischenbildern und elastischen Übergängen kostengünstig zeigen, welches Bewegungsniveau im Browser erreichbar ist.

**Konsequenz:** GLIB ist der aktuelle Referenzfall für Animationsrhythmus und Übergänge, nicht automatisch für jede Anatomie. Weitere Figuren dürfen andere Framezahlen nutzen, müssen aber denselben stabilen Anker und die Trennung von Simulation und Darstellung einhalten.

## 2026-07-21 – D-025: Dünner Manager-Loop vor tiefer Meta-Progression

**Entscheidung:** Der Vertical Slice erhält jetzt Hauptmenü, Auswahl von drei aus vier Wesen, genau eine Waffenpräferenz pro Crewmitglied, Match und Einsatzbericht. Der Managerzustand ist versioniert und lokal serialisierbar; eine explizite Matchkonfiguration übergibt Crew, Präferenzen und Seed. Nach dem ersten abgeschlossenen Einsatz wird einmalig der Geländebrecher freigeschaltet.

**Grund:** Das 3-gegen-3-Match, die Initiative und der Ausgang sind stabil genug, um das große Ganze erstmals als kleinen vollständigen Produktloop zu erleben. Die eine Freischaltung beweist Persistenz und Rückkehrschleife, ohne bereits eine wirtschaftliche Metaebene zu bauen.

**Konsequenz:** Eine Präferenz beeinflusst nur den ersten gültigen Plan der Figur und sperrt spätere Waffen nicht. Shop, Währungen, Rekrutierungsmarkt, Basisbau, große Ausrüstungsbäume und tiefere Karrierewerte bleiben bis zu echten Spieltests ausgeschlossen. Das schnelle Testmatch bleibt als Entwicklungsweg erhalten.

## 2026-07-21 – D-026: Kartenkatalog und explizite Kartenwahl

**Entscheidung:** Karten werden über einen typisierten Katalog mit Hintergrund,
Terrain, Maskenauflösung und Spawnpunkten beschrieben. Die persistente Auswahl
wird über die `MatchLaunchConfig` an das Match übergeben. Der Space-Resort ist
die zweite Karte und verwendet dieselben Simulationsregeln wie die
Sonneninseln.

**Grund:** Eine zweite Karte soll Variation beweisen, ohne die Matchszene durch
Setting-Sonderfälle oder versteckten Menüstatus zu koppeln.

**Konsequenz:** Neue Karten ergänzen Daten und Assets statt eigener
Terrain-/Kameralogik. Manager- und Testmatch starten dieselbe gewählte Karte.

## 2026-07-21 – D-027: Touch-Gesten bleiben reine Kameradarstellung

**Entscheidung:** Ein Finger verschiebt die Weltkamera; zwei Finger skalieren
sie um den gemeinsamen Weltanker. Pointer-Wechsel setzen die Gestenbasis neu.
HUD, Hilfe und laufende Aktionen sperren Gesten. Zoomgrenzen entsprechen der
Desktop-Kamera.

**Grund:** Mobile Tests brauchen Navigation durch die große Karte, ohne
direkte Figurensteuerung oder geräteabhängige Simulation einzuführen.

**Konsequenz:** Gestenmathematik bleibt Phaser-unabhängig getestet. Sie ändert
weder Seed, KI-Planung, Ballistik noch Matchzustand. Hochformat bleibt
funktional, Querformat empfohlen.

## 2026-07-21 – D-028: Ghost ersetzt Vela im aktiven Kader

**Entscheidung:** Der helle Ghost aus `beispiele figuren/2.jpg` ersetzt Vela im
aktiven Vierer-Kader. Er verwendet ein referenznahes 32-Frame-Sheet mit
achtphasigem Schweben, Gleiten und Ausweichen sowie eigenen Aktions- und
Reaktionssequenzen. Vela-IDs und Waffenpräferenzen werden beim Laden zu Ghost
migriert.

**Grund:** Das alte Vela-Sheet behandelte das Mockup nur als lose Inspiration
und war mit vier Phasen sichtbar stockender. Ghost soll Referenztreue und
flüssige, jitterfreie Bewegung gemeinsam belegen.

**Konsequenz:** Das historische Vela-Asset bleibt dokumentiert, wird aber nicht
mehr geladen. Die rechnerische Frame-Stabilisierung und kosmetische
Hover-Bewegung besitzen keine Gameplay-Autorität.

## 2026-07-22 – D-029: simulation/match ist die einzige Autorität über den Zugverlauf

**Entscheidung:** Die gesamte fachliche Zug-Orchestrierung liegt im neuen Modul `src/simulation/match/`: serialisierbarer `MatchSimulationState` (Figuren, Terrainreferenz, Seed, Manager-Flags), `planTurn()` mit der eingefrorenen Zugseed-Formel `seed + turnNumber * 9973`, `resolveTurn()` mit deterministischem Ereignisprotokoll, `concludeTurn()` für Zugwechsel und Matchausgang, typisierte Managerkommandos sowie `runMatch()` als headless Matchschleife. Die `MatchScene` besitzt keine eigene Schadens-, Terrainmutations-, Fall- oder Zugwechsel-Logik mehr; Tweens schreiben ausschließlich Container, nie Simulationszustand. Ein Golden-Master-Test fror das Planungsverhalten vor der Extraktion ein (beide Karten × vier Eröffnungsfiguren × zwei Seeds × vier Managerfälle) und belegt, dass `planTurn()` alle 64 Fälle identisch reproduziert.

**Grund:** `docs/07_CORE_GAMEPLAY_REVIEW.md` benannte als größtes Produktrisiko, dass vollständige Matches nur im Browser beobachtbar waren. Zugdiagnose, Diversitätsmessung und Balancing brauchen Matches als reine Funktion über Seed und Konfiguration.

**Konsequenz:** Neue fachliche Regeln entstehen zuerst in `simulation/match` samt Test und erst danach in der Darstellung. Für headless Tests dekodiert `src/testing/pngTerrain.ts` die echten Terrain-PNGs über Node-Bordmittel (`node:zlib`, devDependency `@types/node`); der Alpha-Mittelwert je Zellblock ersetzt das Canvas-Downscaling des Browsers, minimale Randzellenabweichungen sind akzeptiert. Bewusste fachliche Abweichung: Figuren außerhalb der Welt werden bei der Fallauflösung übersprungen, statt wie zuvor eine Exception in `findGroundY` auszulösen (latenter Absturz nach Out-of-world-Ereignissen). Referenzlauf Seed 21072026: Sonneninseln → Sieg der Rivalen nach 29 Zügen, Space-Resort → Sieg der Crew nach 17 Zügen.

**Umsetzung:** Task 021, ausgeführt von Claude Fable 5 (Anthropic) am 22. Juli 2026; Golden Master, Engine-Module, Szenen-Umbau und Szenariotests stammen aus dieser Sitzung.

## 2026-07-22 – D-030: Messwerkzeuge vor Balanceänderungen

**Entscheidung:** Balancefragen werden ab jetzt zuerst gemessen, dann verändert. Dafür liefert die Match-Engine zwei Werkzeuge (Task 022): `diagnoseTurn()` erzeugt pro Zug ein serialisierbares Kandidatenprotokoll mit Rängen, Scores und dem jeweils stärksten Pro-/Kontra-Faktor; `simulateMatches()` verdichtet deterministische Matrix-Läufe (Karte × Seed) zu Kennzahlen über Ausgänge, Zuglängen, Waffenanteile, Trefferbild und Erstzug-Divergenz der Persönlichkeiten. `npm run simulate` schreibt den eingecheckten Bericht `reports/simulation-report.md`; der Metrik-Snapshot im Test macht jede Balanceverschiebung zu einer ausdrücklichen, sichtbaren Entscheidung.

**Grund:** `docs/07_CORE_GAMEPLAY_REVIEW.md` fordert Messbarkeit (Phasen A und C), bevor Waffenwerte oder Persönlichkeitsgewichte angefasst werden. Ohne Kennzahlen wären Balanceänderungen Behauptungen.

**Konsequenz:** Der erste Bericht bestätigt die Review-Vermutung messbar: Der Geländebrecher dominiert die Zugwahl (67 % der Angriffe auf den Sonneninseln, 51 % im Space-Resort) bei geringem Schadensbeitrag, die Wurfgranate ist mit 5–6 % marginal, und auf den Sonneninseln wählen alle drei Persönlichkeiten in allen vier Eröffnungssonden denselben Kandidaten (Divergenz nur in der Bewegung). Diese Befunde sind bewusst NICHT in Task 022 korrigiert worden; Waffen- und Persönlichkeitsbalance sind eigene Folgeaufgaben mit diesem Bericht als Vorher-Messung.

**Umsetzung:** Task 022, ausgeführt von Claude Fable 5 (Anthropic) am 22. Juli 2026.

## 2026-07-22 – D-031: Sheet-Stabilität ist testpflichtig

**Entscheidung:** Loop-Animationen von Charakter-Sheets müssen zyklisch stabil sein und werden pixelbasiert automatisch geprüft (Basis-Schwerpunkt-Sprung inklusive Loop-Wrap ≤ 4 px, Fußlinien-Drift ≤ 3 px für Idle). Korrekturen erfolgen rechnerisch durch ganzzahlige Frame-Verschiebung (`ALIGN_SHEETS=1`-Werkzeug), nicht durch Neugenerierung.

**Grund:** Die „jitterfreien“ Sheets aus Task 015/019 waren nur vertikal verankert; horizontal drifteten die Idle-Loops von GLIB um 22 px und GHOST um 28 px mit sichtbarem Rücksprung beim Loop-Neustart. Behauptete Qualität ohne Messung hat sich damit zum zweiten Mal als unzuverlässig erwiesen (vgl. D-030).

**Konsequenz:** Neue oder überarbeitete Sheets müssen den Stabilitätstest bestehen, bevor sie eingebunden werden. Kosmetische Endlos-Scale-Tweens auf Loop-Zuständen sind unzulässig (Kantenflimmern durch Dauer-Resampling); erlaubt bleiben einmalige Übergangs-Squashes und reine Y-Bewegung. Walk/Jump-Drift ist dokumentiert, aber bewusst nicht automatisch korrigiert (posenbedingte Anker-Verschiebungen).

**Umsetzung:** Task 025, ausgeführt von Claude Fable 5 (Anthropic) am 22. Juli 2026.

## 2026-07-22 – D-032: Verfügbarkeit schlägt Score – Waffenbalance über Gültigkeitsregeln

**Entscheidung:** Waffenbalance wird primär über Kandidaten-Gültigkeit gesteuert, nicht über Schadenszahlen: Die Geländebrecher-Fallback-Ausnahme verlangt ≥ 45 % Terrainwirkung, Geländewirkung zählt im Score nur noch für Kandidaten ohne wirksamen Schadensschuss (D-020-Intention), die Panzerfaust erhält einen vierten steilen Bogen (2,5 s) gegen Terrain-Deckung, und die Wurfgranate bekommt Raketen-Radius (62), 96 Maximalschaden, kürzeren Zünder, stumpfere Abpraller und zusätzliche kurz gezielte Kandidaten. Der lineare Schadensabfall bleibt: Die quadratische Variante wurde implementiert, gemessen und belegt verworfen; ebenso ein 3,0-s-Raketenbogen (80,6 % Raketendominanz im Space-Resort).

**Grund:** Die Verfügbarkeits-Diagnose aus Task 022/023 zeigte, dass der Brecher in 100 % der Züge gültig war und in der Mehrheit der Züge die einzige Option – ein Gültigkeits-, kein Score-Problem. Messwerte statt Vermutungen haben zwei intuitive Hebel (quadratischer Abfall, extremer Steilbogen) als kontraproduktiv entlarvt.

**Konsequenz:** Space-Resort liegt im Zielkorridor (47,8/20,8/31,4, Ausgänge 5:5), die Sonneninseln sind deutlich verbessert (54,3 % Brecher statt 66,7 %, Ausgänge 6:4), verfehlen den Korridor aber noch; der dokumentierte Resthebel ist sichtlinien-bewusste Zielpunktwahl oder Kartentuning. Golden-Master- und Metrik-Snapshots wurden als bewusste Balance-Entscheidung erneuert.

**Umsetzung:** Task 023, ausgeführt von Claude Fable 5 (Anthropic) am 22. Juli 2026.

## 2026-07-22 – D-033: Designte Unvollkommenheit – Streukegel und Persönlichkeits-Blindflecken

**Entscheidung:** Das Spiel bleibt ein Autobattler, aber die Figuren handeln bewusst nicht mehr perfekt. Zwei Mechanismen: (1) **Persönlichkeits-Blindflecken** (`PERSONALITY_PERCEPTION`) verzerren die *Wahrnehmung* einzelner Metriken – Vorsichtig übertreibt Risiken, Explosiv redet sie klein, Showboat überschätzt den Showfaktor; die Verzerrung ist in Diagnose und Intent-Panel sichtbar begründet (D-006 gewahrt: kein verborgener Zufallswurf). (2) Ein **Streukegel** (`executionSpread.ts`) trennt angekündigte Absicht von ausgeführtem Ergebnis: Jeder Schuss kündigt einen persönlichkeitsabhängigen Streuradius an, die Ausführung ist ein deterministisch geseedetes, zur Planungszeit feststehendes Sample daraus. D-011 bleibt gewahrt – Vorschau zeigt Absicht plus ehrliche Unsicherheit, wiedergegeben wird exakt das eine vorab feststehende Sample.

**Grund:** Auf die Nutzerfrage „selbst steuern oder Autobattler?“ lautet die Antwort: Autobattler ist tragfähig, aber nur mit Drama zwischen Ankündigung und Ausführung. Die Simulator-Messung belegte zuvor, dass alle Persönlichkeiten identische Kandidaten wählten. Nach dieser Änderung verändern die sechs Persönlichkeits-Matchups die Matchausgänge messbar (gemischte Sieger, Zuglängen 10–23) – Persönlichkeit ist erstmals ausgangswirksam.

**Konsequenz:** Der Streukegel benachteiligt real kurzreichweitige Waffen, weil die Kandidatenbewertung weiter auf die perfekte Vorschau plant; der Panzerfaust-Anteil stieg dadurch von 37,5 %/47,8 % (D-032) auf 62 %/57 %. Diese Balance-Wechselwirkung ist dokumentiert und bewusst nicht durch stille Balance-Verschlechterung oder Entfernen des Streukegels kaschiert, sondern als **Task 026** (streuungsbewusste Bewertung) ausgelagert. Damit ist Task 011 (direktes Steuerungsexperiment) jetzt fair vergleichbar, sollte aber erst nach Task 026 durchgeführt werden.

**Umsetzung:** Task 024, ausgeführt von Claude Fable 5 (Anthropic) am 22. Juli 2026.

## 2026-07-22 – D-034: Streuungsbewusste Bewertung; Waffendominanz ist ein Verfügbarkeitsproblem

**Entscheidung:** Der Streuradius liegt in einer geteilten Quelle (`ai/executionSpreadModel.ts`), aus der sowohl die Ausführung als auch die KI-Bewertung lesen. `measureCandidate` dämpft den erwarteten Schaden um den Streuverlust (`~1,4·s/r`), sodass die KI streuungsbewusst plant statt auf die perfekte Vorschau. Die Persönlichkeits-Streuwahrnehmung (`perceivedSpreadRadius`: Explosiv ×0,5, Vorsichtig ×1,35) ersetzt den früheren separaten `aimError`-Blindfleck. Der Streukegel wurde auf 5/12/9 Weltpunkte verkleinert.

**Grund:** Task 024 hatte den Streukegel eingeführt, ohne dass die KI ihn einplante; die Balance verschob sich auf 62/57 % Panzerfaust. Task 026 sollte das zurückholen.

**Konsequenz und Befund:** Die Messung zeigt, dass die Bewertungsdämpfung die Waffenwahl kaum verändert, weil Rakete und Granate denselben Explosionsradius (62) haben und daher gleich gedämpft werden – die Panzerfaust-Dominanz ist ein **Verfügbarkeits-**, kein Score-Problem (ihre flachere Bahn scheitert seltener an Terrain-Deckung). Wirksam war der kleinere Streukegel: Sonneninseln zurück auf 51,6 % (Referenz ohne Kegel: 48,2 %), Space-Resort seedabhängig 51–68 %. Die streuungsbewusste Bewertung bleibt trotzdem als korrekte Grundlage erhalten (KI plant ehrlich, Erstzug-Divergenz im Space-Resort auf 4/4 gestiegen). Der verbleibende Hebel gegen die Panzerfaust-Verfügbarkeit ist sichtlinien-bewusste Zielpunktwahl oder Kartentuning – ein Kartenthema, kein KI-Bewertungsthema.

**Umsetzung:** Task 026, ausgeführt von Claude Fable 5 (Anthropic) am 22. Juli 2026.

## 2026-07-22 – D-035: Steuerungsmodus als reversibler Testschalter (Autobattle vs. Selbststeuern)

**Entscheidung:** `MatchLaunchConfig` erhält ein Feld `controlMode` (`auto` | `manual`, Default `auto`). Das Hauptmenü bietet einen Umschalter, der das Testmatch wahlweise als Autobattler oder mit manuellem Zielen des Spielerteams startet. Der manuelle Schuss (Maus ziehen → Winkel/Kraft, Waffe 1/2/3) erzeugt über `planManualShot` einen regulären TurnPlan und läuft durch dieselbe deterministische `resolveTurn`-Maschinerie wie ein KI-Zug; beim manuellen Zielen wirkt kein Streukegel. Rivalenzüge bleiben in beiden Modi autonom.

**Grund:** Die offene Produktfrage „Autobattler oder Selbststeuern?“ (Task 011, D-006-Umfeld) soll direkt vergleichbar getestet werden, statt sie theoretisch zu entscheiden. Ein Schalter im Menü macht beide Varianten in derselben Build ohne Codewechsel erlebbar.

**Konsequenz:** Erster Wurf bewusst schlank – kein manuelles Laufen/Springen (Schuss vom Stand), kein optionaler KI-Vorschlag, Manager-Einsatz bleibt Autobattle. Die architektonische Grenze aus D-029 (`simulation/match` als einzige Autorität) bleibt gewahrt: Der manuelle Modus fügt nur eine weitere Plan-Quelle hinzu, keine parallele Ausführungslogik. Nach der Nutzerbewertung wird über Ausbau (Bewegung, Vorschlag) oder Rücknahme entschieden.

**Umsetzung:** Task 011 (erster Wurf), ausgeführt von Claude Fable 5 (Anthropic) am 22. Juli 2026.

## 2026-07-22 – D-035 Ergänzung: Manuelle Bewegung und Touch

Der Testschalter aus D-035 wurde auf Nutzerwunsch vervollständigt. Der manuelle Crew-Zug läuft jetzt zweiphasig (erst bewegen, dann zielen): Bewegungsziele stammen aus demselben deterministischen `planLocalMovement` wie bei der KI (Laufen/Springen im 190-Weltpunkte-Limit) und werden als antippbare Weltmarker angeboten; `applyManualMovement` schreibt die gewählte Position in den Simulationszustand. Steuerung funktioniert per Maus und Touch: Ein-Finger-Zielen (Kamerapan in der Zielphase deaktiviert, Zwei-Finger-Zoom bleibt), antippbare Bewegungsmarker und HUD-Waffenbuttons als tastaturfreie Waffenwahl. Kein manueller Feinlauf jenseits der vorbereiteten Ziele – Bewegung bleibt terrain-sicher und begrenzt. Die Grenze aus D-029 bleibt gewahrt: `manualMovement` und `planManualShot` sind zusätzliche Plan-Quellen, keine parallele Ausführungslogik.

## 2026-07-22 – D-036: `npm test` serialisiert Testdateien (Windows-Robustheit)

**Entscheidung:** `vitest.config.ts` setzt `fileParallelism: false`. Testinhalte, Seeds und Erwartungen bleiben unverändert.

**Grund:** Unter Windows brachen mit Vitest 4.1 und Vite 8.1 **alle** Testdateien beim parallelen Laden reproduzierbar mit `TypeError: Cannot read properties of undefined (reading 'config')` ab – schon beim Import, bevor ein einziger Test lief. Einzeln (`vitest run <datei>`) und seriell (`--no-file-parallelism`) laufen dieselben Dateien vollständig grün (80 bestanden, 2 übersprungen). Es ist also eine Worker-Pool-Regression des Runners, kein Testfehler. Der im Projekt verbindliche Ablauf (`npm test` muss grün sein, AGENTS.md „Definition of Done“) war dadurch komplett blockiert.

**Konsequenz:** `npm test` ist wieder plattformrobust. Serielles Laden kostet Laufzeit (rund 25 s statt weniger), ist aber deterministisch und für die aktuelle Suite unkritisch. Sobald eine spätere Runner-/Vite-Version das Problem behebt, kann die Zeile ersatzlos entfallen.

**Umsetzung:** ausgeführt von Claude Opus 4.8 (Anthropic) am 22. Juli 2026, als Voraussetzung für Task 027.

## 2026-07-22 – D-037: Match-Chronik als reine Deutungsschicht über dem Ereignisprotokoll

**Entscheidung:** Eine neue reine Funktion `buildMatchChronicle` (`simulation/match/matchChronicle.ts`) leitet aus dem bereits vorhandenen, deterministischen Ereignisprotokoll der Match-Engine die 2–3 markantesten Momente eines Matches ab (Selbsttreffer, Friendly Fire, Sturz aus der Welt, wirkungsloser Fehlschuss, sehr großer Krater, echter Aussetzer). Die Momente tragen tonrichtigen Text mit Figurennamen. `MatchReport` erhält ein Feld `chronicle`, die `DebriefScene` zeigt die Momente als kurze Liste statt nur des früheren generischen Spruchs. `MatchScene` akkumuliert die pro Zug ohnehin erzeugten Ereignisse in einer Match-lokalen Liste und speist damit die Chronik beim Berichtsbau.

**Grund:** Die Vision verspricht „Crew statt Spielfiguren“ und „emergente Geschichten“ (Designpfeiler 5), aber der Einsatzbericht transportierte bisher keine einzige Begebenheit des gespielten Matches. Die Rohdaten lagen bereits deterministisch vor; es fehlte nur die deutende Schicht.

**Konsequenz:** Die Chronik ändert **keinen** Simulationszustand und liest ausschließlich Events – Golden Master und Simulator-Snapshots bleiben unberührt (bestätigt: 88 Tests grün, zuvor 80). Auswahl und Text sind deterministisch (gleicher Verlauf ⇒ gleiche Chronik, per Unit-Test bewiesen). Häufige Momenttypen (großer Krater) werden auf den stärksten Eintrag entdoppelt und mit deterministischen Textvarianten versehen, um die Ton-Regel „keine Spruchflut, geringe Wiederholungsrate“ einzuhalten. Ehrlicher Befund: Auf den aktuellen Karten produziert die kompetente KI fast nur Krater-Momente – die charakterstarken Vorfälle (Selbsttreffer, Kettenreaktion, Weltsturz) entstehen erst mit den interaktiven Map-Objekten (Task 028). Die Chronik-Infrastruktur ist dafür vorbereitet. Der Schwellwert „großer Krater“ (2600 entfernte Zellen) ist an echten Headless-Matches kalibriert (median ~1790, p90 ~2600–3200).

**Umsetzung:** Task 027 (Schritte A/B; Schritt C – Figurenkarten-Stärke/Schwäche – war in `fighterRoster.ts` bereits vorhanden), ausgeführt von Claude Opus 4.8 (Anthropic) am 22. Juli 2026.

## 2026-07-22 – D-038: Interaktive Objekte als Reaktion in der Zugauflösung (erstes explosives Fass)

**Entscheidung:** Interaktive Map-Objekte (erster Typ: explosives Fass) werden **nicht** in der Ballistik behandelt, sondern als Reaktion in der Zugauflösung. `simulation/interactables/interactables.ts` liefert das Objektmodell und einen reinen, tiefenbegrenzten `resolveReactionChain`. `resolveTurn` löst nach jeder Explosion die Fässer im Radius aus; die Effektlogik (Terrain/Schaden/Rückstoß) ist in `applyExplosionEffects` extrahiert und von Primär- und Fass-Explosionen geteilt. Die KI (`planRocketAction`) erzeugt zusätzlich Kandidaten auf Fässer in Gegnernähe und bewertet den erwarteten Kettenschaden über die neue Utility-Komponente `chain-effect` (persönlichkeitsgewichtet). Karten definieren ihre Fässer als Daten; der Simulator misst inklusive Fässer.

**Grund:** Die Ballistik kennt bewusst nur Terrain (`isSolid`) und liefert eine `explosion: {center, radius}`. Objekte dort einzubauen hätte die fragile Trajektorienlogik berührt und die „Ballistik = eine Wahrheit"-Grenze (D-011) verwässert. Als Reaktion in der Engine bleibt D-029 (Match-Engine ist einzige Autorität) gewahrt, das Ganze ist deterministisch/testbar und es entsteht **keine** allgemeine Starrkörperphysik (Nichtziel aus AGENTS.md/D-022 bleibt: das Fass rollt nicht, es explodiert nur bei Treffer). Motivation war der gemessene Verfügbarkeits-Kern der Waffendominanz (D-032/D-034): ein Fass neben einem gedeckten Gegner soll direkte Waffen wieder lohnend machen.

**Konsequenz und ehrlicher Befund:** Die **Mechanik** ist vollständig und getestet (deterministische, tiefenbegrenzte Kette; KI wählt den Fass-Schuss bei Deckung; Golden Master für fass-freie Karten byte-identisch; sichtbar im Rendering). Die **Messung** zeigt aber, dass der erhoffte Diversifizierungs-Effekt in den aktuellen Karten ausbleibt: Der Panzerfaust-Anteil **stieg** (good-mood 45,8 %→58,7 %, space-resort 64,1 %→66,7 %), weil das Fass der flachen Panzerfaust zusätzliche Ziele gibt, während Granate/Brecher weiter an Deckung scheitern; Matches wurden kürzer. Fässer detonieren noch überwiegend beiläufig, nicht gezielt, und stehen zu weit auseinander für Fass-zu-Fass-Ketten. **Der Gameplay-Hebel hängt damit an der Kartensituation, nicht am Score** – Fässer müssen in bewusst gebaute Situationszonen („Comedy Pockets": gedeckter Gegner + Fass in fester Reichweite, Fass-Cluster) gesetzt werden. Das ist der empfohlene nächste Schritt (handgebaute Testmap, Richtlinie §19), nicht weiteres KI-Tuning. Der Simulator-Snapshot wurde bewusst erneuert.

**Umsetzung:** Task 028, ausgeführt von Claude Opus 4.8 (Anthropic) am 22. Juli 2026.

## 2026-07-22 – D-039: Vereinfachte 16-Frame-Charaktertests vor weiterer Assetproduktion

**Entscheidung:** Pop-Diva aus `beispiele figuren/3.jpg` und Chicken aus
`beispiele figuren/1.jpg` werden als direkte, aber eine Stufe vereinfachte
4×4-Spritesheets eingebunden. Sie liefern nur Idle, Laufen, Sprung und Treffer
mit vier Frames je Zustand und erscheinen in der aktiven Schnellmatch-Crew.

**Grund:** Der Nutzer möchte vorrangig Ingame-Lesbarkeit und flüssige
Bewegung gegen die komplexeren bisherigen Assets testen, nicht neue Story oder
komplette Aktionsposen.

**Konsequenz:** Beide Sheets erhalten eine pixelgeprüfte feste Idle-Fußlinie;
Kollision und Simulation bleiben unverändert. Waffen- und Siegesposen fallen
bewusst aus dem Testumfang und verwenden vorerst die Idle-Pose.

## 2026-07-23 – D-040: Sechs wählbare Kaderfiguren; Einsatzplanung in zwei Reihen

**Entscheidung:** Diva und Henne (zuvor nur im isolierten Character-Asset-Test) sind nun reguläre Kaderfiguren: `FIGHTER_IDS` umfasst alle sechs. Die Einsatzplanung (`ManagerScene`) zeigt die sechs Figuren in zwei Reihen à drei Karten (Fenster 1600×900); die Karten sind kompakter und über eine gemeinsame Kartenmitte (`centerY`) positioniert, sodass beide Reihen identisch aufgebaut sind. Die englischen Platzhaltertexte beider Figuren wurden auf den durchgängig deutschen, warmen Ton angeglichen. Die Auswahlregel bleibt: genau drei aus dem Kader.

**Grund:** Der Nutzer möchte die neuen Figuren vollständig ins Spiel integriert und als Crew wählbar haben, nicht nur als Test-Loadout. Vier Karten passten in eine Reihe, sechs nicht.

**Konsequenz:** Golden-Master- und Simulator-Snapshots wurden bewusst erneuert – die Änderung ist rein additiv (neue `pop-diva`-/`chicken`-Schlüssel; die Pläne der bestehenden vier Figuren sind unverändert, geprüft). Jede der sechs Figuren erhält auf beiden Karten einen spielbaren Eröffnungszug (Test grün). `managerState`-Defaults und Rivalenauswahl decken den erweiterten Kader bereits ab. Die Browser-Darstellung des Zwei-Reihen-Layouts ist arithmetisch auf Bounds/Überlappung geprüft, aber noch nicht visuell im Browser abgenommen.

**Umsetzung:** ausgeführt von Claude Opus 4.8 (Anthropic) am 23. Juli 2026.

## 2026-08-05 – D-046: Direkte Bewegung wählt freie, geprüfte Bodenpunkte

**Entscheidung:** Der manuelle Steuerungsmodus verwendet keine kleine Liste
vorbereiteter KI-Bewegungsmarker mehr. Maus oder Touch wählen einen beliebigen
erreichbaren Bodenpunkt innerhalb des bestehenden Budgets von 190 horizontalen
Weltpunkten. Die reine Simulation bestimmt die zum Zeiger passende
Terrainoberfläche und validiert Reichweite, Kopffreiheit, Figurenabstand sowie
den vollständigen Lauf- oder Sprungpfad. Die Phaser-Szene stellt nur den
entstandenen Pfad dar und reicht die Auswahl zurück an die Match-Engine.

**Grund:** Drei vorgegebene Positionen fühlten sich nicht wie echte
Selbststeuerung an und hätten den Vergleich Autobattle gegen Direct künstlich
zugunsten der autonomen Variante verzerrt.

**Konsequenz:** Die direkte Variante bietet jetzt echte taktische
Positionswahl, bleibt aber bewusst rundenbasiert. Eine A/D-Echtzeitsteuerung
mit eigener Plattformerphysik ist nicht Teil dieses Experiments: Sie würde
Bediengeschick und ein zweites Bewegungssystem testen statt die eigentliche
Produktfrage „autonome Crew oder direkte Entscheidungen?“. Lauf- und
Sprungvorschau sowie Ausführung lesen dieselben deterministischen Pfadsamples.

**Umsetzung:** Task 030, abgeschlossen am 5. August 2026.

## 2026-08-05 – D-047: „Lass das!“ sperrt eine semantische Planfamilie

**Entscheidung:** Ein angekündigter Angriffsplan gehört zu einer
deterministischen Familie aus Ziel-ID, Waffen-ID, Bewegungsart und
Bewegungsziel-Raster sowie Einschlagspunkt-Raster. Beide räumlichen Raster
verwenden 120 Weltpunkte. Der einmalige Managerbefehl „Lass das!“ sperrt für
den laufenden Zug diese gesamte Familie, nicht nur die konkrete Bogen-ID. Der
Filter sitzt in `planTurn` auf der kombinierten Bewegungs-/Aktionsstufe; der
Ballistikplaner bleibt unverändert.

**Grund:** Eine neue Flugzeit oder ein minimal anderer Winkel derselben Waffe
gegen dasselbe Ziel war intern ein anderer Kandidat, spielerisch aber keine
erkennbare Alternative. Das schwächte den wichtigsten Managerbefehl und
verletzte das Abnahmekriterium aus dem Kernloop-Review.

**Konsequenz:** Der Folgeplan muss sich in mindestens einer sichtbaren
Dimension unterscheiden: Ziel, Waffe, Bewegungsart/-bereich oder
Einschlagsbereich. Gibt es keine andere Angriffsfamilie, bleibt nur eine
nachvollziehbare Positionierung oder ein ausgesetzter Zug. Die Kennung ist
serialisierbar, erscheint in der rendererfreien Zugdiagnose und wird nach
Waffenbefehl oder Zugende gelöscht. Es entsteht bewusst keine allgemeine
Clustering-Engine und noch keine Mehrfachauswahl aus Vorschlagskarten.

**Umsetzung:** Task 031, abgeschlossen am 5. August 2026.

## 2026-08-05 – D-048: Planfamilienvielfalt wird vor Persönlichkeits-Tuning gemessen

**Entscheidung:** Der deterministische Massen-Simulator aggregiert die
semantischen Familienkennungen aus Task 031. Pro Karte meldet er Angriffspläne,
unterschiedliche Familien, weitere Vorkommen bereits gezählter Familien,
Wiederholungsanteil und Anteil der häufigsten Familie. Die identischen
Eröffnungssonden weisen zusätzlich pro Persönlichkeit Familienanzahl und
Waffenverteilung aus.

**Grund:** Kandidaten-IDs überschätzen Unterschiede durch kleine Bogenvarianten.
Gleichzeitig lässt eine reine Waffenstatistik unterschiedliche Bewegung oder
Einschlagsidee unsichtbar. Beide Ebenen werden benötigt, bevor KI-Gewichte
verändert oder ein Hybridmodus beurteilt wird.

**Konsequenz und Befund:** Die vollständigen Testmatches besitzen bereits
breite Familienvielfalt (Sonneninseln 38/46, Space-Resort 31/43; häufigste
Familie jeweils höchstens 7 %). Persönlichkeiten unterscheiden sich in allen
Eröffnungssonden in der Familie, wählen aber exakt dieselben Waffenrollen
(je vier Panzerfaust, drei Granaten, kein Geländebrecher). Daher erfolgt in
diesem Task bewusst kein Balanceeingriff. Als nächstes werden konfliktreiche
Eröffnungsszenarien benötigt, die Risiko-, Ketten- und Terrainpräferenzen
tatsächlich aktivieren; erst danach ist Gewichtetuning sinnvoll.

**Umsetzung:** Task 032, abgeschlossen am 5. August 2026.

## 2026-07-23 – D-045: Actionmap-Labor nutzt Objektzustände statt Starrkörperphysik

**Entscheidung:** Die erste Schild-Wagen-Triebwerk-Situation wird als
isolierter `ACTIONMAP-TEST` umgesetzt. Schild, Wagen und Triebwerk besitzen
wenige serialisierbare Zustände und eine feste, deterministische
Ereignisreihenfolge. Nur der abschließende Figurenimpuls verwendet die
vorhandene Terrain- und Rückstoßphysik. RINGOs riskante Kette und GLIBs
kontrollierte Alternative sind bewusst kuratierte Vergleichspläne.

**Grund:** Der Test soll mit minimalem Inhalt prüfen, ob lesbare Umweltketten
und eine semantisch andere Alternative bereits eine interessante
Managerentscheidung erzeugen. Allgemeine Objektrotation, dynamische
Objektkollision und frei rollende Körper würden den Aufwand stark erhöhen,
ohne diese Produkthypothese besser zu beantworten.

**Konsequenz:** Der reguläre Match- und Balancestand bleibt unverändert. Eine
spätere Übernahme in echte Karten setzt voraus, dass der Labortest spielerisch
überzeugt; erst dann werden Objektziele und Managerkommandos in die reguläre
Planung integriert.

## 2026-07-23 – D-044: Ghost und GLIB folgen dem reduzierten Animationsstandard

**Entscheidung:** Ghost und GLIB ersetzen ihre komplexen 32-Frame-Sheets durch
direkt aus `beispiele figuren/2.jpg` abgeleitete 4×4-Sheets. Wie Moki, Diva,
Henne und RINGO erhalten sie nur Idle, Laufen, Sprung und Treffer mit je vier
stabilisierten Frames. Zusätzliche Ghost-Schwebe- und beide kosmetischen
Skalierungs-Tweens entfallen.

**Grund:** Die vorigen Sheets blieben trotz rechnerischer Ausrichtung sichtbar
jitterig, weil ihre Konturen und Volumen zwischen den Einzelbildern zu stark
wechselten. Klare Silhouetten, große Farbflächen und eine feste Basis sind für
die kleine Matchkamera wichtiger als zusätzliche Posen.

**Konsequenz:** Ghost bleibt als heller, leicht frecher Tuchgeist und GLIB als
grüner Cartoon-Schleim lesbar. Waffen- und Siegeszustände verwenden vorläufig
die Idle-Pose; Simulation, Kollisionsform und Kampfwerte bleiben unverändert.
Die Idle-Basis beider Figuren wird weiterhin pixelbasiert regressionsgetestet.

## 2026-07-23 – D-041: Waschbär-Bandit als dritter reduzierter Charaktertest

**Entscheidung:** Der Waschbär-Bandit aus `beispiele figuren/1.jpg` ergänzt
den regulär wählbaren Kader als RINGO. Er verwendet dasselbe reduzierte
4×4-Format wie Diva und Henne: Idle, Laufen, Sprung und Treffer mit je vier
Frames.

**Grund:** Maskenkopf und Ringelschwanz liefern im kleinen Kameramaßstab eine
besonders robuste, von den bestehenden Wesen klar abweichende Silhouette.

**Konsequenz:** Die Einsatzplanung verwendet jetzt zwei Reihen mit vier bzw.
drei Karten. Der Asset-Test führt Diva, Henne und RINGO vor; Simulation und
Balancewerte bleiben unverändert.

## 2026-07-23 – D-042: Moki wird zum reduzierten Pilz-Animationsstandard

**Entscheidung:** Das bisherige Moki-Sheet wird durch eine direkte, deutlich
einfachere Rekonstruktion des Pilzwesens aus `beispiele figuren/1.jpg`
ersetzt: rote Punktkappe, heller kompakter Körper und Rucksack. Es verwendet
nun dieselben vier stabilisierten Idle-, Lauf-, Sprung- und Trefferphasen wie
die jüngeren Charaktertests.

**Grund:** Die frühere Figur war in der Bewegung zu detailreich und jitterte
sichtbar; die neue Form soll auf Distanz als Cartoon-Pilz lesbar bleiben.

**Konsequenz:** Idle-Schleife und Fußlinie sind pixelbasiert regressionsgetestet.
Waffenaktionen nutzen bis zu einer späteren Erweiterung die Idle-Pose; Simulation
und Werte ändern sich nicht.

## 2026-07-23 – D-043: Fall-Schaden aus der Sturzhöhe

**Entscheidung:** Ein echter Sturz auf Boden (`resolveTerrainFall` → `state: "fall"`) verursacht jetzt Schaden proportional zur Sturzhöhe. Die reine Funktion `fallDamageForDrop` (`simulation/movement/TerrainFall.ts`) lässt kleine Stürze unter einer Schwelle (120 Weltpunkte) folgenlos, wächst darüber linear (0,22 HP je Weltpunkt) und ist bei 110 gedeckelt. Der Schaden wird in `resolveTurn` direkt verrechnet und über das erweiterte `fall-resolved`-Event (`damage`, `remainingHitPoints`) gemeldet – **nicht** als separates `damage-applied`, damit ein Sturz nicht fälschlich als Treffer gewertet wird. Ein Sturz, der die HP auf 0 bringt, gilt als besiegt. Sturz aus der Welt tötet weiterhin komplett ohne zusätzlichen Höhenschaden.

**Grund:** Bisher waren Stürze folgenlos; nur der Fall aus der Welt tötete. Damit fehlte dem Kern das physische Risiko, das die Produktvision verspricht (Designpfeiler 1 „nachvollziehbares Chaos aus Physik" und 4 „Zerstörung verändert Entscheidungen"). Ein Gegner von einer Kante zu sprengen oder ein riskanter Sprung soll spürbare Konsequenzen haben – genau die Spannung, die klassische Artillery-Spiele lebendig macht.

**Konsequenz:** Schwelle und Rate sind an echten Headless-Matches kalibriert (reale „fall"-Stürze: meist 7–60 Weltpunkte Stolperer, gelegentlich 300–560 echte Abstürze). Gemessene Wirkung: auf den flachen Sonneninseln fällt kaum jemand tief genug (0 Fall-Schaden-Events), auf dem vertikalen Space-Resort dagegen spürbar (3 Events, davon 2 tödlich) – Fall-Schaden ist bewusst kartenabhängig. Der Simulator-Snapshot wurde bewusst erneuert; der Golden Master (Erstzug-Planung) bleibt unverändert, weil Fall-Schaden nur die Auflösung betrifft, nicht die Planung. Die Chronik meldet eine „harte Landung" (`hard-landing`) als neuen Vorfallstyp; die Szene zeigt eine schwebende „−N"-Zahl am Landepunkt. Determinismus gewahrt (reine Höhenformel, kein Zufall).

**Umsetzung:** ausgeführt von Claude Opus 4.8 (Anthropic) am 23. Juli 2026.

## 2026-08-24 – D-049: Kartenassets werden progressiv statt vollständig vor dem Menü geladen

**Entscheidung:** Der Start lädt für beide Karten nur eigene 800×450-WebP-
Vorschauen. Die unveränderten 3200×1800-HD-Quellen für Hintergrund und
zerstörbares Terrain werden erst in `MatchScene.preload()` und nur für die
tatsächlich gestartete Karte geladen. Vor Phaser und während des Kartenwechsels
zeigt die Oberfläche jeweils einen sichtbaren Fortschrittsstatus.

**Grund:** Der öffentliche Build zeigte beim Kaltstart mehrere Sekunden nur
eine dunkle Fläche. Die vier HD-Kartenbilder verursachten 16,61 MiB des
anfänglichen Transfers, obwohl das Hauptmenü keine volle Matchauflösung
benötigt.

**Konsequenz:** Die Kartenbilder des Menüstarts benötigen zusammen nur noch
138,3 KiB (−99,2 %). Kollisionsmaske, Matchdarstellung, Simulation und relative
Pages-Pfade bleiben unverändert. Nach dem ersten Match darf dessen HD-Karte im
Phaser-Texturcache verbleiben; allgemeines Laufzeit-Streaming ist weiterhin
nicht Teil des Vertical Slice.

**Umsetzung:** Task 033, abgeschlossen am 24. August 2026.

## 2026-08-24 – D-050: Hybridvergleich delegiert das Ziel, nicht die Ausführung

**Entscheidung:** Neben `auto` und `manual` existiert der reversible
Steuerungsmodus `hybrid`. Vor jedem Crewzug bestimmt der Spieler genau einen
lebenden Rivalen als Zielauftrag. Der vorhandene Utility-Planner entscheidet
innerhalb dieses Auftrags weiterhin selbst über lokale Positionierung, Waffe,
Flugbahn und die bereits sichtbare Streuung. Rivalenzüge bleiben vollständig
autonom.

**Grund:** Der direkte Modus bietet faire Eigensteuerung, entfernt sich aber
von der Managerfantasie. Vollständige Autonomie kann dagegen zu passiv wirken.
Der Zielauftrag prüft mit einer einzigen verständlichen Entscheidung, ob sich
Agency und Figurenautonomie verbinden lassen, ohne bereits Kandidatenkarten,
Kommandopunkte oder ein neues Ausführungssystem zu bauen.

**Konsequenz:** Der Zielauftrag ist ein rendererunabhängiges, serialisierbares
Feld im Matchzustand, wird fachlich validiert und nach dem Zug gelöscht. Ein
unverbindlicher Vorschauplan vor der Wahl verbraucht die Loadout-Präferenz
nicht. Auto, Zielauftrag und Direkt bleiben im selben Build vergleichbar; die
Produktvision ist damit ausdrücklich noch nicht geändert.

**Umsetzung:** Task 034, abgeschlossen am 24. August 2026.

## 2026-08-24 – D-051: Konflikte werden vor weiterem Gewichtetuning gezielt isoliert

**Entscheidung:** Teamrisiko, Fasskette, Geländeöffnung und Ring-out werden in
vier kleinen rendererfreien Erstzugsonden gemessen. Zusätzlich steht dieselbe
enge Konfliktlage als isoliertes `KERNLOOP-TEST`-Match zur Verfügung. Die
Sonden vergleichen freie Autonomie mit einem vorgegebenen Ziel für alle drei
Persönlichkeiten; sie ändern keine Standardkarte und keine Balancewerte.

**Grund:** Die bisherige Massenmatrix zeigte vielfältige Planfamilien, aber
kaum aktivierte Risiko- oder Kettenmetriken. Ohne konfliktstarke Ausgangslagen
war nicht unterscheidbar, ob Bewertungslogik fehlt oder die Karten sie nur
nicht abfragen.

**Konsequenz:** Teamrisiko, Kettenreaktionen und Ring-outs sind nun messbar
aktiv. Freies Auto wählt in riskanten Lagen häufig ein sichereres Ziel, während
der Zielauftrag dieselbe Konfliktwirkung erzwingt. Die weiterhin schwache
Geländebrecher- und Waffenrollentrennung bleibt dokumentiert; Tuning folgt erst
auf externe Beobachtung statt auf eine einzelne synthetische Sonde.

**Umsetzung:** Task 035, abgeschlossen am 24. August 2026.

## 2026-08-24 – D-052: Externer A/B/C-Test ist das nächste Produktentscheidungstor

**Entscheidung:** Auto, Zielauftrag und Direkt werden im selben Build mit dem
gegenbalancierten Ablauf aus `08_PLAYTEST_PROTOCOL.md` extern verglichen. Bis
zu diesem Test beginnt keine neue Vollkarte, keine umfangreiche
Manager-Metaebene und kein größeres Balance- oder Assetpaket.

**Grund:** Alle drei Varianten sind technisch fair spielbar. Simulation und
interne Browserprüfung können jedoch weder erlebte Agency noch Figurenbindung,
Frust oder freiwillige Wiederholungsmotivation zuverlässig beantworten.

**Konsequenz:** Die Produktvision bleibt bis zum Ergebnis Management mit
autonomen Figuren. Gewinnt Direkt deutlich, braucht der Richtungswechsel eine
neue ausdrückliche Produktentscheidung; gewinnt Zielauftrag oder Auto, wird
der jeweilige Managerkern gezielt vertieft. Uneindeutige Ergebnisse führen zu
einem kleineren Folgetest, nicht automatisch zu mehr Content.

**Umsetzung:** Task 036, abgeschlossen am 24. August 2026.

## 2026-08-25 – D-053: Burrow bleibt ein isoliertes Produktlabor im Abriss-Repository

**Entscheidung:** Burrow wird nicht in Projekt Abriss eingebaut. Es besitzt mit
`burrow.html`, `src/burrow/`, `public/burrow/` und `docs/burrow/` eigene
Einstiegs-, Code-, Asset- und Produktgrenzen. `index.html` bleibt Abriss.
Burrow importiert keine Abriss-Szene, Artillery-Simulation oder Managerlogik.

**Grund:** Das vorhandene Repository bietet eine stabile TypeScript-, Phaser-,
Test- und Pages-Infrastruktur. Die direkte Monstersteuerung widerspricht aber
der autonomen Managerfantasie von Abriss und darf sie weder technisch noch
dokumentarisch stillschweigend ersetzen.

**Konsequenz:** Der Vite-Build veröffentlicht beide HTML-Einstiege. Gemeinsame
Abhängigkeiten und CI sind erlaubt; Gameplaycode bleibt getrennt. Ein
automatisierter Isolationstest sperrt versehentliche Abriss-Imports. Burrow ist
erst nach seinen eigenen Entscheidungstoren ein möglicher Produktpivot.

**Umsetzung:** Gate 0 von Task 037, abgeschlossen am 25. August 2026.

## 2026-08-25 – D-054: Burrow Gate 1 prüft ausschließlich Bewegungsgefühl

**Entscheidung:** Der erste spielbare Burrow-Test umfasst nur Kurssteuerung,
distanzbasierten Körpertrail, kontinuierliches Graben, schnelleres
Tunnelgleiten, Burst, Oberflächendurchbruch, Flug und Wiedereintauchen sowie ein
unbewegliches Breach-Ziel. Beute, Gegner, Gebäude, Meta und große Chunkwelt
bleiben ausgeschlossen.

**Grund:** Bewegung und Terrainmutation sind das größte frühe Produktrisiko.
Zusätzliche Systeme würden ein negatives Ergebnis schwer deutbar machen und
unnötige Produktion vor dem Kernbeweis erzeugen.

**Konsequenz:** Die kleine 2048×1280-Arena nutzt eine eigene 4-Pixel-Maske und
256×256-Weltpixel große Renderkacheln. Nur berührte Kacheln werden aktualisiert.
Die Körpersegmente folgen zurückgelegter Distanz statt Renderframes. Gate 2
beginnt erst nach echter Bewertung dieses Spielgefühls.

**Umsetzung:** Gate 1 von Task 037, abgeschlossen am 25. August 2026.

## 2026-08-25 – D-055: Positiver Gate-1-Spieltest erlaubt einen einzelnen Jagd-Loop

**Entscheidung:** Nach positivem persönlichem Spieltest beginnt Burrow Gate 2
mit genau einem patrouillierenden Oberflächenfahrzeug, automatischem Bite bei
Kopfkontakt, HP, Devour und Biomasse. Der Bite erhält keinen zusätzlichen
Button: Richtung und Burst bleiben die vollständige Zwei-Daumen-Steuerung.

**Grund:** Der Spieler bestätigt, dass Graben, Tunnelgleiten, Burst und
Oberflächendurchbruch bereits Spaß machen. Die kleinste noch offene
Produkthypothese ist deshalb nicht mehr die Bewegung, sondern ob dieses
Bewegungsgefühl eine verständliche Jagd und direkte Belohnung trägt.

**Konsequenz:** Das Fahrzeug folgt einer festen Route und verwendet keine
Starrkörper- oder Fahrzeugphysik. Schaden und Biomasse bleiben fachliche,
testbare Burrow-Daten; Phaser zeigt nur Route, HP und Feedback. Gebäude,
Gegner, Response, Meta und weitere Beutetypen bleiben bis zum nächsten
Spieltest ausgeschlossen.

**Umsetzung:** Gate 2 von Task 038, technisch bereit zur persönlichen Abnahme
am 25. August 2026.

## 2026-08-25 – D-056: Gate-2-Feedback priorisiert direkte Steuerungsreaktion und verteilte Jagdfläche

**Entscheidung:** Burst-Eingaben werden bis zu ihrem nächsten festen
Simulationsschritt gepuffert. Unterirdisch stoppt der Burrower ohne
Richtungseingabe unmittelbar; ein losgelassener Touch-Stick wird zentriert. Die
Kutsche fährt langsamer über eine 1.020 Weltpixel breite Oberflächenroute und
beginnt näher am Startbereich.

**Grund:** Der persönliche Gate-2-Test zeigte, dass einzelne Burst-Klicks
gelegentlich wirkungslos wirkten und wiederholte Fehlversuche in der engen
Kutschenzone zu wenig neues, grabbares Terrain übrig ließen. Das sind
Kontroll- und Testarena-Probleme, keine neue Content-Anforderung.

**Konsequenz:** Die direkte Steuerung verbraucht bei losgelassenem Stick kein
Terrain mehr. Ein bereits gestarteter Burst und die Flugbahn laufen weiterhin
sichtbar aus. Die Kutsche bleibt deterministische, physikfreie Beute; nur ihre
Strecke und ihr Tempo ändern sich. Gate 3 bleibt ausgeschlossen.

**Umsetzung:** Feedback-Iteration von Task 038, technisch abgeschlossen am
25. August 2026; erneute persönliche Produktwertung steht offen.

## 2026-08-25 – D-057: Nutzer gibt Gate 3 trotz offener Gate-2-Produktwertung frei

**Entscheidung:** Auf ausdrückliche Nutzerfreigabe folgt nach der Gate-2-
Feedback-Korrektur Gate 3. Es umfasst eine einzige Stützenhütte mit drei
Terrainankern, einem Kollaps nach zwei verlorenen Stützen und eine moderat von
2.048 auf 2.560 Weltpixel verbreiterte, weiterhin vollständig geladene Arena.

**Grund:** Das bestätigte Bewegungsgefühl und die laufende Gate-2-Iteration
reichen aus, um die nächste klar abgegrenzte Hypothese zu prüfen: ob
Untergraben eine sofort verständliche, sichtbare Konsequenz besitzt. Die
verbreiterte Arena verteilt wiederholte Durchbrüche, ohne bereits Chunkstreaming
zu rechtfertigen.

**Konsequenz:** Das ist keine Bestätigung eines späteren Open-World- oder
Physiksystems. Die Struktur leitet sich ausschließlich aus der vorhandenen
Terrainmaske ab; der Kollaps bleibt ein einzelnes Fachereignis mit
Darstellungsfeedback. Gate 4 und alle Meta-Systeme bleiben ausgeschlossen.

**Umsetzung:** Task 039, technisch abgeschlossen am 25. August 2026;
öffentliche persönliche Abnahme steht offen.

## 2026-08-25 – D-058: Mobiles Burrow priorisiert Vollbild, randlose Fläche und unmittelbare Kursreaktion

**Entscheidung:** Burrow wechselt auf eine responsive Phaser-Fläche statt
mobilem 16:9-Fit mit seitlicher Letterbox. Auf Touchgeräten bleibt ein
Vollbildbutton sichtbar, sofern der Browser Vollbild unterstützt. Kurswechsel
reagieren schneller, die Bewegungsbeschleunigung ist kürzer und der
Touch-Deadzone kleiner.

**Grund:** Der persönliche Mobiltest meldet fehlenden Vollbildzugang,
schwarze Seitenränder und eine zu indirekte Steuerung. Diese Probleme betreffen
die unmittelbare Spielbarkeit des bestehenden Gate-1-Kerns und müssen vor
weiteren Content-Gates korrigiert werden.

**Konsequenz:** Das Sichtfeld kann auf sehr breiten Mobilgeräten mehr
Weltbreite zeigen; die kompakte HUD- und Touchposition passt sich an die echte
Canvasgröße an. Die Simulationsschritte, Terrainmaske und Produktisolation
bleiben unverändert. Browser ohne Fullscreen-API behalten die randlose
Viewport-Version ohne irreführenden Button.

**Umsetzung:** Task 040, technisch abgeschlossen am 26. August 2026.

## 2026-08-26 – D-059: Burrow prüft eine modulare visuelle Grundlage vor Gate 4

**Entscheidung:** Vor Sensorik, Hunter und Ergebnis-Loop erhält Burrow einen
kleinen, codegezeichneten Stil- und Lesbarkeits-Pass. Die Kreatur wird in Kopf,
Körpersegmente, Schwanz und aufsetzbare Rückenmerkmale getrennt; drei rein
visuelle Wachstumsstufen dürfen dieselbe Bewegungsdatenbasis verwenden.

**Grund:** Der Nutzer bestätigte die kompakte, kontrastreiche Cartoon-Richtung
als passend. Eine modulare Darstellung vermeidet spätere Vollkörper-
Spritesheets für jede Kreaturengröße und macht sichtbares Wachstum möglich,
ohne den noch unbestätigten Gate-4-/Gate-5-Loop vorwegzunehmen.

**Konsequenz:** Terrainmaske, Kollisionsradien, feste Simulationsschritte und
Gameplaywerte bleiben unangetastet. Der Pass verwendet keine finalen
Produktionsassets und fügt keine Gegner-, Mutations- oder Chunkwelt-Regel ein.
Gate 4 bleibt ein eigenes Freigabetor.

**Umsetzung:** Task 041, technisch abgeschlossen am 26. August 2026;
visueller Spieltest auf Mobilgerät steht offen.

## 2026-08-26 – D-060: Reaktive Weltobjekte vor Gegner-Response testen

**Entscheidung:** Gate 4 beginnt mit einem schmalen, isolierten Reaktionsslice:
ein Tier flieht deterministisch vor nahen Durchbrüchen, der vorhandene
stützengestützte Außenposten dient als zerstörbarer Turm, und ein einzelner
Höhlenschrein wird über Kopfkontakt einmalig aktiviert.

**Grund:** Der gewünschte Beweis ist nicht dekorative Weltkunst, sondern eine
sichtbar reagierende Oberfläche. Die vorhandene Stützen- und Terrainlogik
liefert bereits den kleinsten belastbaren Turm-Kollapskern.

**Konsequenz:** Die Reaktionszustände bleiben rendererfrei und deterministisch.
Phaser animiert nur diese Zustände. Es entstehen weder allgemeine NPC-Navigation
noch Starrkörpertrümmer, Gegnerbeschuss oder eine Gate-5-Ökonomie.

**Umsetzung:** Task 042, in Umsetzung am 26. August 2026.

## 2026-08-30 – D-061: Reversibler Terrainvergleich vor dem Fantasy-Loop

**Entscheidung:** Auf Nutzerfreigabe wird Task 043 umgesetzt. A behält dauerhaftes
Graben; B verwendet eine zehn Sekunden aktive Schnellspur neben der permanenten
Maske. Der Startparameter ist explizit, A bleibt vorerst Standard. Das ist keine
endgültige Änderung der Burrow-Vision und keine Freigabe von Progression.

**Konsequenz:** Die Hauptmaske wird niemals aufgefüllt. B entfernt Terrain nur
lokal bei unterirdischem Burststart, Breach und schnellem Wiedereintritt
(mindestens 300 Weltpixel/s). Ein Burststart am Anker ist gezieltes Untergraben;
kein dauerhaft fräsender Burst-Korridor. Spuren erneuern ihre Lebensdauer beim
erneuten Durchfahren, nicht beim Stillstehen. Die echte Maske entscheidet über
Flugraum und Stützen, die Spur ausschließlich über Untergrundtempo.

Kutsche und Tier erhalten in beiden Varianten dieselbe maskenbasierte
Bodenreaktion. Sie stoppen vor zu großen Stufen; bei unter ihnen entferntem
Boden sinken sie deterministisch zum nächsten Boden und bleiben gestoppt.
Das präzisiert den Plan, ohne schwebende Objekte oder allgemeine Physik zu bauen.
Diese gemeinsame Fehlerkorrektur ist die einzige bewusste Änderung an A.

**Abnahme:** Technische Prüfungen durch den Bearbeiter, persönliche A–B–B–A-
Wertung und Wahl der Standardvariante durch den Nutzer. Keine fingierte Abnahme.

## 2026-08-30 – D-062: B als Grundlage, kein Krater beim Burststart

**Entscheidung:** Nach persönlichem Ausprobieren wählt der Nutzer ausdrücklich
B als Grundlage, jedoch ohne das ausgestanzte Erdloch an der Kopfposition beim
Drücken von Burst. Diese Wahl ersetzt den vorläufigen A-Standard und die
Burststart-Zerstörung aus D-061. Eine quantitative A–B–B–A-Wertung liegt nicht vor.

**Konsequenz:** Ohne Terrainparameter startet B (`recovering`); A bleibt explizit
als Vergleich aufrufbar. Burststart beschleunigt und meldet weiterhin sein
Aktionsereignis, verändert aber keine Terrainzellen. Normale Bewegung und die
gesamte unterirdische Burststrecke hinterlassen nur die zehn Sekunden aktive
Spur. Breach und schneller Wiedereintritt behalten ihre lokalen permanenten
Krater. Es wird weder die Maske aufgefüllt noch bestehender Boden restauriert.

Das direkte Freistanzen eines Stützenankers durch Burststart entfällt ebenfalls.
Ein Ersatzangriff oder eine Anpassung der Stützen ist nicht Teil dieser
Korrektur. Keine Freigabe neuer Inhalte, Progression oder weiterer Gates.

## 2026-08-30 – D-063: Drei vollständige Levels als nächster Burrow-Slice

**Entscheidung:** Der nächste Burrow-Beweis ist ein zusammenhängender Run aus
genau drei höchstens dreiminütigen Levels statt weiterer isolierter
Einzelmechaniktests. Der Run muss die Kernvision praktisch verbinden: Graben,
Fressen, gezielte Zerstörung, drei Schrein-Upgrades, zwei sichtbare
Wachstumsstufen, höhere Breaches und eine eskalierende Schlusskutsche.

**Konsequenz:** Jedes Level besitzt einen Schrein in einer vorgefertigten
Höhlenkammer. Biomasse weckt ihn; Kopfkontakt öffnet eine pausierte 1-aus-3-Wahl
aus Himmelsstürmer, Vielfraß und Rammbock. Upgrades und Wachstum bleiben im Run,
werden bei einem neuen Run aber vollständig zurückgesetzt. Keimling wächst nach
Level 1 zum Gräber und nach Level 2 zum Koloss. Die Grundkollision bleibt trotz
sichtbarer Größe stabil; Wachstum erhöht insbesondere Burst-, Biss- und
Impactwirkung.

Die Levels werden nacheinander freigegeben: zuerst ein vollständiges Level 1
mit gemeinsamem Runfundament, danach Zerstörungslevel 2, zuletzt Machtfinale
Level 3. Es entstehen weder drei kopierte Szenen noch vorgezogene Meta-,
Gegnerkampf- oder Contentsysteme. Der verbindliche Umfang steht in
`docs/burrow/THREE_LEVEL_SLICE.md`.

## 2026-08-30 – D-064: Level 1 bindet die Runform an fünf Biomasse und eine Acht-HP-Schlusskutsche

**Entscheidung:** Task 044 setzt Level 1 als `Wiesenrand` mit 10.800 aktiven
60-Hz-Schritten, einer Schwelle von fünf Biomasse und einer Schlusskutsche mit
acht HP um. Das vorhandene Bergtier ist einmalig fressbare, bei Breach
fliehende Kleinbeute; die vorhandene Kutsche bleibt die wiederkehrende
parametrisierte Jagdbeute. Erst nach Schreinwahl wird sie als nicht
wiederkehrende Schlusskutsche neu eingesetzt.

**Konsequenz:** `BurrowRunState`, `BurrowLevelDefinition` und
`BurrowRunBuild` sind rendererfrei und serialisierbar. Auswahl und Ergebnisse
pausieren die aktive Zeit. `levelBiomass` weckt allein den Schrein;
`totalBiomass` übernimmt die Levelbiomasse erst mit erfolgreichem Abschluss.
Rang 1 bleibt fest: Himmelsstürmer ×1,12 Bursttempo, Vielfraß +1
Kopfbissschaden, Rammbock ×1,20 Breach-/Impactradius. Burststart in B bleibt
bei allen drei Builds ohne permanente Terrainmutation. Der Gräber ist nach
Level 1 sichtbar und Buildzustand, ohne den Kollisionsradius zu ändern.

**Abnahme:** Typprüfung, 47 Burrow-Fachtests, Produktionsbuild und ein
isolierter Desktop-/Touch-Browsersmoke sind grün. Die persönliche
Level-1-Wiederholungswertung und ein echter Mobiltest sind weiterhin vor
Level 2 erforderlich; das ist keine Level-2-Freigabe.

## 2026-08-30 – D-065: Nutzer gibt Bulk 2 vor der persönlichen Level-1-Abnahme frei

**Entscheidung:** Der Nutzer hat nach dem Commit von Bulk 1 ausdrücklich den
nächsten Bulk angefordert. Deshalb beginnt Task 045 mit Level 2, obwohl der
persönliche komplette Level-1- und Mobilspieltest weiterhin offen ist.

**Konsequenz:** Die technische Reihenfolge ist bewusst vorgezogen, nicht die
Produktabnahme fingiert. Level 2 bleibt auf Goblinmarkt, Rang 2, verpflichteten
Marktturm und gepanzerten Handelswagen begrenzt; Level 3, Meta und Gegnerkampf
bleiben gesperrt. Vor Level 3 ist ein persönlicher Test des zusammenhängenden
Level-1→2-Abschnitts weiterhin erforderlich.

## 2026-08-31 – D-066: B ist die einzige öffentliche Terrainregel

**Entscheidung:** Nach der verbindlichen Wahl von B entfernt die öffentliche
Burrow-Oberfläche den A/B-Vergleich vollständig. `recovering` ist fest für
den Spieleinstieg verdrahtet; URL-Parameter und sichtbare A/B-Schalter ändern
den Run nicht mehr. Der Neustart bleibt erhalten.

**Grund:** Der Vergleich hat seinen Zweck erfüllt. Sichtbare Varianten machten
den inzwischen zusammenhängenden Drei-Level-Run wie einen unfertigen Test
wirken und widersprachen der Wahl von B als Grundlage.

**Konsequenz:** `persistent` darf ausschließlich in fachlichen Regressionstests
oder isolierten Entwicklungsuntersuchungen verwendet werden. Es ist keine
öffentliche Regel, kein unterstützter Link und kein Teil des HUDs. B behält die
zehn Sekunden aktive Schnellspur; nur Breach und schneller Wiedereintritt
verändern die tragende Terrainmaske dauerhaft. Die visuelle UI-Politur ändert
keine Simulationswerte oder Level-Abhängigkeiten.
