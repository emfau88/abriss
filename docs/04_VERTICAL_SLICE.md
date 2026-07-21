# Erster Vertical Slice

## Zweck

Der Vertical Slice beweist nicht die Menge späterer Inhalte. Er beantwortet eine Produktfrage:

> Ist eine angekündigte autonome Artillery-Aktion mit sichtbarer Persönlichkeit, begrenztem Eingriff und dauerhaft verändertem Terrain verständlich und unterhaltsam?

## Enthaltener Umfang

### Match

- eine bewusst entworfene zerstörbare Karte, deren Welt ungefähr 2–3 sichtbare Ausschnitte pro Achse umfasst,
- zwei Teams mit je drei Figuren,
- stabile rundenweise Aktivierung,
- Sieg durch Ausschalten des gegnerischen Teams,
- Neustart mit gleichem oder neuem Seed.

### Figuren

- ein technischer Hornwesen-Platzhalter, die animierten Testwesen Moki und Vela sowie GLIB als flüssiger 32-Frame-Slime aus der konkreten Projektvorlage; noch keine finale Produktionspalette,
- die Merkmale Vorsichtig, Sprengfreudig und Angeberisch,
- Lebenspunkte, Team, Position und begrenzte lokale Bewegung,
- klarer aktiver Zustand und erkennbare Teamzugehörigkeit.

### Aktionen

- Abrissrakete,
- abprallende zeitgezündete Wurfgranate,
- Geländebrecher,
- kurze lokale Bewegung als Teil eines Aktionsplans,
- Explosion, Schaden, begrenzter Rückstoß, Fallen und Terrainentfernung.

### KI und Spieleragency

- begrenzte Aktionskandidaten,
- Bewertung mit aufgeschlüsselten Gründen,
- gemeinsame Ballistik für Vorschau und Ausführung,
- sichtbares Ziel, Flugbahn, Wirkungszone und Risiko,
- genau ein „Lass das!“-Kommando pro Match,
- genau ein davon unabhängiger Waffenbefehl pro Match,
- Neuplanung auf den nächstbesten gültigen Kandidaten.

### Präsentation

- funktionale, konsistente Platzhaltergrafik,
- lesbare Intent-Anzeige,
- Übersicht, manuelles Schwenken/Zoomen und automatische Kamera für Planung, Projektil und Einschlag,
- einfache Treffer-, Explosions- und Reaktionsanimationen,
- minimale Audiohinweise erst nach stabilem Gameplay,
- Debugansichten für Terrainmaske, Trajektorie, Seed und KI-Wertung.
- responsive Browserhülle für Desktop sowie mobile Hoch- und Querformate; Querformat bleibt die empfohlene mobile Darstellung.

### Dünner Manager-Loop

- Hauptmenü mit Einsatzplanung und direktem Testmatch,
- Auswahl von genau drei aus vier Wesen,
- eine Waffenpräferenz je Crewmitglied als Einfluss auf den ersten gültigen Plan,
- versionierter lokaler Managerzustand und explizite Matchkonfiguration,
- kompakter Einsatzbericht und einmalige Freischaltung des Geländebrechers als Loop-Beweis.

## Explizit ausgeschlossen

- Karriere, Shop, Rekrutierungsmarkt und Progression über die einzelne Loop-Beweis-Freischaltung hinaus,
- Beziehungen, Verletzungen und Erinnerungen,
- finale Figurenproduktion für die gesamte Crew,
- mehr als drei Waffen,
- Doktrinen und mehrteilige Loadouts über die einzelne Waffenpräferenz hinaus,
- Online- oder lokaler Multiplayer,
- prozedurale Karten,
- Seile, Fahrzeuge, Jetpacks und komplexes Klettern,
- allgemeine Ragdoll- oder Terrain-Starrkörperphysik,
- allgemeine Starrkörper-, Rollen- oder Figurenstoßphysik über den begrenzten Explosionsimpuls hinaus,
- eigenständiger Touch-Steuerungs- oder Hochformat-HUD-Umbau über die responsive Browserhülle hinaus,
- Backend, Konten, Telemetriedienst oder Monetarisierung.

## Funktionale Abnahmekriterien

1. Ein Match kann vollständig bis Sieg oder Niederlage gespielt werden.
2. Gleicher Startzustand, Seed und gleiche Managerkommandos erzeugen im selben Build dasselbe fachliche Ergebnis.
3. Vor jeder großen Aktion sind Ziel, Trajektorie/Wirkungszone, Risiko und wichtigste KI-Gründe sichtbar.
4. Persönlichkeit verändert nachweisbar die Aktionswertung und wird in der Erklärung benannt.
5. „Lass das!“ verwirft den gezeigten Plan genau einmal und erzeugt eine nachvollziehbare Alternative.
6. Der Waffenbefehl schränkt genau einmal den folgenden Plan auf die gewählte Waffengattung ein.
7. Rakete, Wurfgranate und Geländebrecher verwenden in Vorschau, KI und Ausführung dieselbe Kollisionslogik; Granatenabpraller und Zünder sind vorab sichtbar.
8. Explosionen verändern sichtbares Terrain und Kollisionsmaske konsistent.
9. Figuren werden nachvollziehbar zurückgestoßen, kollidieren angenähert mit Terrain und können landen oder aus der Welt fallen.
10. Nach einer Terrainänderung werden ungültige Pläne nicht ausgeführt.
11. Ein Match kann mit ausgegebenem Seed neu gestartet und untersucht werden.
12. Die Karte ist deutlich größer als das Sichtfenster; Übersicht und Aktionskamera halten relevante Figuren, Flugbahn und Einschlag verständlich im Bild.

## Technische Abnahmekriterien

- TypeScript-Strict-Check besteht.
- relevante Unit- und Szenariotests bestehen.
- Produktionsbuild besteht.
- Browser-Smoke-Test besteht.
- keine bekannten unbehandelten Konsolenfehler im Kernablauf.
- Debugmodus kann fachliche Werte zeigen, ohne Spielregeln zu verändern.

## Produkt-Abnahmekriterien

Mit mindestens einigen externen Testspielern wird geprüft:

- Können sie die wichtigste Entscheidung einer Figur erklären?
- Erkennen sie den Einfluss eines Merkmals?
- Verstehen sie den Wert und die Begrenzung von „Lass das!“?
- Bemerken sie mindestens eine taktische Folge der Terrainzerstörung?
- Möchten sie freiwillig eine weitere Runde mit veränderter Entscheidung spielen?

Wenn diese Fragen überwiegend negativ beantwortet werden, wird nicht mit Kampagne oder finaler Assetproduktion begonnen. Zuerst werden Lesbarkeit, Agency oder Kernloop überarbeitet.
