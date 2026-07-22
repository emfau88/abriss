# Task 026: Streuungsbewusste Kandidatenbewertung

## Status

`bereit`

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
