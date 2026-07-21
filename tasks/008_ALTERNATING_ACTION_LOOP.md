# Task 008: Fortlaufender Wechselzug

## Status

`abgeschlossen`

## Ziel

Nach einer abgeschlossenen Aktion sauber zur nächsten lebenden Figur des anderen Teams wechseln und mindestens eine gegnerische Antwortaktion vollständig ausführen.

## Pflichtlektüre

- `AGENTS.md`
- `docs/01_PRODUCT_VISION.md`
- `docs/02_GAME_DESIGN.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/04_VERTICAL_SLICE.md`
- `docs/DECISIONS.md`

## Scope

- deterministische Initiative über den bestehenden Matchzustand,
- Abschlussphase nach Einschlag, Schaden und Fallen,
- Ausblenden alter Flugbahn und Wirkungszone,
- Rückkehr überlebender Figuren in eine stehende Pose,
- Aktivierung der nächsten lebenden Figur,
- neue Planung aus dem aktualisierten Terrain- und Figurenzustand,
- gegnerische Aktionen laufen nach lesbarer Ankündigung automatisch ab,
- Spielerseite behält das Managerkommando und bestätigt ihre eigenen Aktionen,
- Sieg/Niederlage, wenn nur ein Team kampffähig bleibt.

## Nichtziele

- vollständige 3-gegen-3-Besetzung,
- Granate oder lokale Bewegung,
- finale Initiative-Balance,
- Manager- oder Meta-Ebene.

## Akzeptanzkriterien

1. Die Szene endet nach dem ersten Einschlag nicht im Zustand `complete`.
2. Alte Trajektorie und roter Vorschaukreis verschwinden beim Einschlag.
3. Eine überlebende getroffene Figur nimmt nach Reaktion und Fall wieder ihre stehende Pose ein.
4. Die nächste lebende Figur wird deterministisch aktiv und plant gegen das andere Team.
5. Eine gegnerische Aktion wird angekündigt und ohne Spielereingriff ausgeführt.
6. Tote Figuren werden in späteren Zügen übersprungen.
7. Ohne lebende Gegner endet das Match mit einem verständlichen Ergebnis.

## Verifikation

- Unit- und Szenariotests der Zugfolge
- `npm run typecheck`
- `npm test`
- `npm run build`
- Browserprüfung über mindestens zwei aufeinanderfolgende Aktionen

## Abnahme 2026-07-21

- Initiative im Prototyp: Bruno → Rivale A → Mara → Rivale B; ausgeschaltete Figuren werden über `advanceTurn` übersprungen.
- Trefferpunkte werden nach jeder Aktion in den unveränderlichen `MatchState` synchronisiert und vor dem nächsten Zug auf Sieg, Niederlage oder Unentschieden geprüft.
- Flugbahn und Vorschaukreis werden beim Einschlag sofort geleert; die eigentlichen Einschlag-VFX laufen nur kurz aus.
- Browserlauf geprüft: Bruno trifft Rivale A, Rivale A reagiert automatisch, die überlebende Figur steht wieder, Mara erhält Zug 3, Rivale B antwortet automatisch und das Match zeigt anschließend einen klaren Ergebniszustand.
- Fullscreen-Canvas: 1600×900 Backbuffer bei 1338,6×753 CSS-Pixeln, daher keine Canvas-Hochskalierung im geprüften Browserfenster.
- Browserkonsole nach dem vollständigen Ablauf ohne neue Fehler.
- `npm run typecheck`, `npm test` (28 Tests) und `npm run build` erfolgreich; die bekannte Vite-Warnung zur Phaser-Chunkgröße bleibt unverändert.
