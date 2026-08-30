# Task 042: Burrow – reaktive Oberwelt

## Status

`technisch abgeschlossen, persönlicher Spieltest offen`

## Ziel

Der bestehende Burrow-Test prüft, ob die sichtbare Welt auf Durchbrüche und
Kopfkontakt lebendig und verständlich reagiert: ein Oberflächentier flieht,
der bereits stützengestützte Außenposten zeigt Schaden und kollabiert sichtbar,
und ein einzelner Höhlenschrein besitzt eine konkrete Kontaktinteraktion.

## Pflichtlektüre

- `AGENTS.md`
- `docs/burrow/VISION.md`
- `docs/burrow/VERTICAL_SLICE.md`
- `docs/burrow/TECHNICAL_PLAN.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/DECISIONS.md`
- `tasks/041_BURROW_VISUAL_FOUNDATION.md`

## Scope

- ein deterministisches, rendererfreies Fluchtverhalten für genau ein Tier,
- vorhandene Außenposten-Stützen als Turm-Schadens- und Kollapsgrundlage,
- sichtbare, zeitbasierte Renderer-Animationen für Tier, Kutsche und Turm,
- genau ein Schrein, der bei gültigem Kopfkontakt einmalig aktiviert wird,
- fachliche Tests für Flucht und Schreinaktivierung.

## Nichtziele

- kein Hunter, keine Gegnerangriffe, keine allgemeine NPC-Navigation,
- keine Starrkörpertrümmer, keine neue Eingabetaste und kein Inventar,
- keine Progression oder Gate-5-Ergebnisansicht.

## Abnahme

1. Ein Durchbruch in Tierreichweite löst nachvollziehbar die Flucht aus.
2. Verlorene Stützen machen den Turm sichtbar beschädigt; der bestehende
   zweite Verlust löst den einmaligen Kollaps aus.
3. Kutsche, Tier und Turm zeigen lesbare Bewegung bzw. Zustandswechsel.
4. Der Schrein kann einmalig per Kopfkontakt aktiviert werden und zeigt seine
   Wirkung unmittelbar.
5. Burrow-Fachtests, Typecheck, Build und Abriss-Isolation bleiben grün.

## Prüfergebnis

- Typecheck und Produktionsbuild bestehen am 26. August 2026.
- Die vier direkt betroffenen Burrow-Suiten bestehen mit 11 Tests.
- Der volle `npm test`-Aufruf startet in der lokalen Umgebung, liefert aber
  innerhalb der verfügbaren Laufzeit keine Abschlussausgabe und keine
  Fehlermeldung. Das ist vor dem Commit erneut zu prüfen.
- Die Browserautomatisierung darf den lokalen `127.0.0.1`-Tab aufgrund ihrer
  URL-Richtlinie nicht steuern. Der persönliche Spieltest prüft deshalb die
  sichtbaren Animationen und die Erreichbarkeit der Reaktionen.
- Nach Spieltestfeedback ist der Schrein ein kleines, vollständig in der
  vorbereiteten Höhle sichtbares Fundstück statt einer verdeckten Großkulisse.
  Normale Ein-/Austauchvorgänge erzeugen keinen Kamerashake mehr; Burst,
  Treffer, Schrein und Kollaps behalten ihre gezielten Impulse.
- Eine fehlerhafte Render-Skalierung setzte die 1280px-Quelltextur beim Puls
  wieder auf Originalgröße. Der Puls variiert jetzt ausschließlich die kleine
  92×108-Weltgröße des Schreins.
