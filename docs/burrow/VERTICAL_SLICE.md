# Burrow-Produktlabor: Entscheidungstore

Stand: 25. August 2026

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

## Spätere Gates

- Gate 2: ein Beutetyp, ein Fahrzeug, Bite/Devour, HP und Biomasse.
- Gate 3: ein Gebäude, wenige Supportpunkte, Untergraben und Kollaps.
- Gate 4: Response-Level, Sensorik, wenige Gegner und einfacher Hunter.
- Gate 5: kurzer Ergebnisbildschirm mit genau einer sichtbaren Mutation.
- Danach: Entscheidung über Chunkwelt und echten 6–10-Minuten-Vertical-Slice.
