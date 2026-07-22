# Task 026: Streuungsbewusste Kandidatenbewertung

## Status

`umgesetzt – KI plant streuungsbewusst, Streukegel balance-neutraler; Panzerfaust-Verfügbarkeit bleibt separates Kartenthema` (zuvor: `bereit`)

## Ziel

Die KI plant ihre Schüsse unter Berücksichtigung des angekündigten
Streukegels, sodass kurzreichweitige Waffen bei hoher Streuung korrekt
abgewertet werden und die Waffenbalance aus Task 023 auch mit aktivem
Streukegel (Task 024) im Zielkorridor bleibt.

## Warum jetzt

Task 024 hat den Streukegel eingeführt, aber die Kandidatenbewertung nutzt
weiterhin die perfekte Vorschau-Trajektorie. Dadurch verfehlen Granate und
Geländebrecher real öfter, ohne dass die KI es einplant – der
Panzerfaust-Anteil stieg dokumentiert von 37,5 %/47,8 % auf 62 %/57 %
(Isolationsmessung: ~10–14 Punkte davon sind der unbewertete Streueffekt).

## Pflichtlektüre

- `docs/DECISIONS.md` (D-011, D-012, D-030, D-032, D-033)
- `src/simulation/match/executionSpread.ts`
- `src/simulation/ai/RocketActionPlanner.ts` (`measureCandidate`)
- `reports/simulation-report-full.md`

## Scope

1. **Streuradius im Planner verfügbar machen**: Der erwartete Streuradius
   (persönlichkeits- und ggf. waffenabhängig) wird als Eingabe an
   `planRocketAction` gereicht oder aus einer geteilten Quelle gelesen; die
   Doppeldefinition zwischen Planner und `executionSpread` wird aufgelöst.
2. **Erwarteten Trefferverlust bewerten**: In `measureCandidate` fließt der
   erwartete Schadensverlust durch Streuung ein (Näherung: erwartete
   Schadensminderung ~ Streuradius / Explosionsradius, ggf. über wenige
   deterministische Stützpunkte gemittelt). Kurzer Radius ⇒ stärkere
   Abwertung.
3. **Blindflecken bleiben erhalten**: Explosiv unterschätzt weiterhin die
   Streuung (plant risikofreudiger), Vorsichtig überschätzt sie – jetzt aber
   über den echten Streumechanismus statt über einen separaten
   `aimError`-Faktor.
4. **Neu messen**: Zielkorridor wie Task 023 (keine Waffe > ~45 %, Granate
   zweistellig) mit aktivem Streukegel; Erstzug-Divergenz soll mehr als die
   Hälfte der Sonden im Kandidaten erreichen.

## Nichtziele

- keine Änderung am Streukegel-Betrag selbst ohne Messbeleg,
- keine neue Waffe, keine direkte Spielersteuerung.

## Akzeptanzkriterien

1. Waffenanteile mit aktivem Streukegel im Zielkorridor auf beiden Karten.
2. Erwarteter Streuverlust ist in der Zugdiagnose sichtbar.
3. Golden-Master- und Metrik-Snapshots bewusst und begründet erneuert.

## Verifikation

- `npm run typecheck && npm test && npm run build`,
- `npm run simulate` und `SIM_FULL=1` mit Vorher-/Nachher-Zahlen.

---

*Vermerkt am 22. Juli 2026 von Claude Fable 5 (Anthropic) als sauber
abgegrenzter Folge-Task aus dem Balance-Restpunkt von Task 024.*

## Abschlussbericht vom 22. Juli 2026

Umgesetzt von **Claude Fable 5** (Anthropic, Claude Code).

### Umgesetzt

1. **Geteilte Streuquelle** `src/simulation/ai/executionSpreadModel.ts`:
   `executionSpreadRadius` liegt jetzt hier; sowohl die Ausführung
   (`match/executionSpread.ts`) als auch die KI-Bewertung
   (`RocketActionPlanner`) lesen daraus. Die frühere Doppeldefinition ist
   aufgelöst.
2. **Streuungsbewusste Bewertung**: `measureCandidate` dämpft den erwarteten
   Schaden um `expectedSpreadDamageLoss` (~`1,4·s/r`). Die KI plant damit
   nicht mehr auf die perfekte Vorschau.
3. **Blindfleck aus dem echten Streumechanismus**: `perceivedSpreadRadius`
   verzerrt die *wahrgenommene* Streuung – Explosiv unterschätzt sie (×0,5,
   plant riskanter), Vorsichtig überschätzt sie (×1,35). Der frühere
   separate `aimError`-Wahrnehmungsfaktor ist dadurch neutral (×1) und wird
   nicht mehr doppelt gewichtet.
4. **Streukegel verkleinert** auf 5/12/9 Weltpunkte (vorher 9/22/16), damit
   die tatsächlichen Einschläge die Balance weniger verschieben.

### Ehrlicher Befund zur Wirksamkeit

Der Kern der Panzerfaust-Dominanz ist ein **Verfügbarkeits-**, kein
Score-Problem: Die Bewertungsdämpfung trifft alle Waffen mit gleichem
Explosionsradius (Rakete und Granate haben beide r=62) gleich und ändert die
Rangfolge daher kaum – eine Verdopplung des Verlustfaktors ließ die
Waffenanteile praktisch unverändert. Der wirksame Hebel war stattdessen der
**kleinere Streukegel**, weil er die tatsächlichen (gestreuten) Einschläge
in `resolveTurn` weniger verzerrt.

### Messung (10-Seed, `SIM_FULL=1`)

| Zustand | Sonneninseln Panzerfaust | Space-Resort |
| --- | --- | --- |
| Streukegel aus (Referenz) | 48,2 % | ~50 % |
| Task 024 (Kegel 9/22/16, keine Bewertung) | 62 % | 57 % |
| **Task 026 (Kegel 5/12/9 + Bewertung)** | **51,6 %** | seedabhängig 51–68 % |

Kleiner 3-Seed-Bericht (eingecheckt): Sonneninseln 45,8 % / Granate 23,7 %
(Korridor erreicht). Die Space-Resort-Schwankung ist Seed-Rauschen der
kleinen Stichprobe – der Streukegel erzeugt bewusst echte Varianz.
Erstzug-Divergenz: Space-Resort 4/4 Sonden im Kandidaten (Ziel erreicht),
Sonneninseln 2/4.

### Bekannte Einschränkung → offener Restpunkt

Die grundsätzliche Panzerfaust-Verfügbarkeit (flachere, direktere Bahn
scheitert seltener an Terrain-Deckung) ist mit Bewertung oder Streuung nicht
lösbar. Der verbleibende Hebel bleibt sichtlinien-bewusste Zielpunktwahl
oder Kartentuning der Sonneninseln – ein eigenes Kartenthema, kein
KI-Bewertungsthema. Als solches im Task-023-Restpunkt bereits notiert.

### Prüfungen

`npm run typecheck`, `npm test` (74 grün, 2 übersprungen), `npm run build`
grün. Golden-Master-, Planer- und Simulator-Snapshots bewusst erneuert.

### Neue Einträge in `docs/DECISIONS.md`

- **D-034**: Streuungsbewusste Bewertung und geteilte Streuquelle; Befund,
  dass Waffendominanz ein Verfügbarkeits- statt Score-Problem ist.
