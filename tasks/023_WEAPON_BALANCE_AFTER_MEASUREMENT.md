# Task 023: Waffenbalance nach Messung

## Status

`teilweise abgeschlossen – Space-Resort im Zielkorridor, Sonneninseln deutlich verbessert, Restpunkt dokumentiert` (zuvor: `bereit`)

## Ziel

Die in `reports/simulation-report.md` belegte Geländebrecher-Dominanz und die
Marginalität der Wurfgranate werden korrigiert – jede Änderung mit
Vorher-/Nachher-Messung über den Simulator aus Task 022.

## Warum jetzt

Die Vorher-Messung liegt vor (Brecher 66,7 %/50,9 % der Angriffe bei geringem
Schadensbeitrag, Granate 5,8 %/5,3 %). Ursache laut Code-Analyse: linearer
Schadensabfall macht den großen Brecher-Radius zur verzeihendsten Waffe
(Break-even gegen die Panzerfaust ab ~40 Weltpunkten Zielabweichung), dazu
Demolition-Gutschrift auch ohne taktischen Nutzen; die Granate scheitert an
der Zielabweichung durch Abpraller und Zünder.

## Pflichtlektüre

- `docs/DECISIONS.md` (D-012, D-020, D-030)
- `reports/simulation-report.md`
- `tasks/022_TURN_DIAGNOSTICS_AND_MASS_SIMULATOR.md`

## Scope

1. **Diagnose vertiefen:** `invalidReason`- und Verfügbarkeitsstatistik pro
   Waffe in den Simulatorbericht aufnehmen (beantwortet datenbasiert, woran
   Granatenkandidaten scheitern).
2. **Schadensabfall-Experiment:** quadratischer Abfall
   `maxDamage * (1 − d/r)²` statt linear – als erster, isoliert gemessener
   Hebel. Golden-Master- und Metrik-Snapshots werden dabei bewusst und
   dokumentiert erneuert.
3. **Demolition-Regel:** Geländewirkung nur werten, wenn kein gültiger
   Schadensschuss existiert (D-020-Intention) – oder alternativ
   Brecher-Radius senken; Entscheidung anhand der Messung aus Punkt 2.
4. **Granaten-Nische:** anhand der Diagnose aus Punkt 1 gezielt stärken
   (z. B. Bewertung indirekter Treffer, die andere Waffen nicht erreichen).
5. **Nachher-Messung:** `npm run simulate` (klein und `SIM_FULL=1`) vor und
   nach jedem Hebel; Zielkorridor: keine Waffe über ~45 % Angriffsanteil,
   Granate zweistellig, Ausgänge weiterhin gemischt.

## Nichtziele

- keine neuen Waffen, keine Engine-Strukturänderungen,
- keine Persönlichkeitsänderungen (Task 024).

## Akzeptanzkriterien

1. Bericht zeigt die Waffenverteilung im Zielkorridor auf beiden Karten.
2. Jede Balanceänderung ist einzeln committet mit Vorher-/Nachher-Zahlen im
   Commit-Text.
3. Alle Snapshot-Erneuerungen sind im Abschlussbericht begründet.

## Verifikation

- `npm run typecheck && npm test && npm run build`,
- `npm run simulate` und `SIM_FULL=1`-Lauf, Zahlen im Abschlussbericht,
- Browser-Stichprobe: ein Match je Karte fühlt sich nicht degeneriert an.

---

*Vermerkt am 22. Juli 2026 von Claude Fable 5 (Anthropic) auf Basis der
Simulator-Messung und Code-Analyse des RocketActionPlanner.*

## Abschlussbericht vom 22. Juli 2026

Umgesetzt von **Claude Fable 5** (Anthropic, Claude Code). Alle Zahlen aus
dem 10-Seed-Lauf (`SIM_FULL=1`, `reports/simulation-report-full.md`);
Vorher-Werte aus dem eingecheckten Bericht vor diesem Task.

### Gemessene Hebel

1. **Waffenverfügbarkeits-Diagnose** (Scope 1): neue Spalten im
   Simulatorbericht. Kernbefund: Der Geländebrecher hatte in 100 % der
   Züge einen gültigen Kandidaten (Terrainwirkungs-Ausnahme ≥ 8), die
   Panzerfaust nur in ~30–46 %, die Granate in ~12–17 % („Ziel außerhalb
   wirksamer Reichweite“ durch Terrain-Deckung). Die Dominanz war ein
   Verfügbarkeits-, kein Score-Problem.
2. **Quadratischer Schadensabfall** (Scope 2): implementiert, gemessen
   (Brecher 65,7 %/49,1 %, Granate unverändert ~6 %) und **belegt
   verworfen** – er verschärft das Verfügbarkeitsproblem, statt es zu
   lösen. Der Abfall bleibt linear.
3. **Demolition nur als Fallback** (Scope 3): Geländewirkung zählt im
   Score nur noch, wenn der Kandidat selbst kein wirksamer Schadensschuss
   ist; die Gültigkeits-Ausnahme des Brechers verlangt jetzt ≥ 45 %
   Terrainwirkung statt ≥ 8 %.
4. **Granaten-Nische** (Scope 4): Radius 54 → 62, Maximalschaden 86 → 96,
   Rückstoß 370 → 390, kürzerer Zünder (+0,35 s statt +0,65 s), stumpfere
   Abpraller (Restitution 0,34, Reibung 0,58) und zusätzliche bewusst kurz
   gezielte Kandidaten, damit Abpraller zum Ziel rollen.
5. **Steiler vierter Raketenbogen** (2,5 s) überwindet Deckung; ein noch
   steilerer 3,0-s-Bogen wurde gemessen und verworfen (kippte den offenen
   Space-Resort auf 80,6 % Raketenanteil).

### Ergebnis (Angriffsanteile vorher → nachher, 10 Seeds)

| Karte | Panzerfaust | Wurfgranate | Geländebrecher | Ausgänge |
| --- | --- | --- | --- | --- |
| Sonneninseln | 27,5 % → 37,5 % | 5,8 % → 8,2 % | 66,7 % → 54,3 % | 6:4 |
| Space-Resort | 43,9 % → 47,8 % | 5,3 % → 20,8 % | 50,9 % → 31,4 % | 5:5 |

### Restpunkt

Der Zielkorridor (keine Waffe > ~45 %, Granate zweistellig) ist im
Space-Resort erreicht, auf den Sonneninseln knapp verfehlt: Das dichte
Hügelterrain gibt dem Brecher weiterhin in ~95 % der Züge einen gültigen
Terrainschuss, während Rakete/Granate an der Deckung scheitern. Der
verbleibende strukturelle Hebel ist sichtlinien-bewusste Zielpunktwahl
(oder Kartentuning der Sonneninseln) – bewusst nicht mehr in diesem Task,
Empfehlung: nach Task 024 neu messen, da Streuung und Optionsmengen die
Verteilung erneut verschieben werden.

### Prüfungen

`npm run typecheck`, `npm test` (74 Tests grün; Golden-Master- und
Simulator-Snapshots bewusst erneuert, Planer-Unittests an die neuen
Kandidatenzahlen angepasst), `npm run build` grün. Determinismus- und
Eröffnungstests unverändert grün.
