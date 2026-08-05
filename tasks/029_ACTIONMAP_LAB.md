# Task 029: Kleine Actionmap als Comedy-Ketten-Test

## Status

`umgesetzt – Browserprüfung erfolgreich`

## Ziel

Ein isolierter, schnell wiederholbarer Test prüft, ob eine klar angekündigte
Umweltkette aus Schild, Wagen und Triebwerk bereits mit sehr wenig Inhalt eine
interessante Managerentscheidung und eine erzählbare Slapstick-Situation
erzeugt.

## Pflichtlektüre

- `AGENTS.md`
- `docs/01_PRODUCT_VISION.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/04_VERTICAL_SLICE.md`
- `docs/06_ART_AND_TONE.md`
- `docs/DECISIONS.md`
- `tasks/028_INTERACTIVE_OBJECTS_SLICE.md`

## Scope

- eigener Menüstart `ACTIONMAP-TEST`,
- kleine, in Phaser gezeichnete Testbühne ohne neue Rasterassets,
- RINGO, GLIB und Moki mit vorhandenen Laufzeitassets,
- reine, serialisierbare Zustandsmaschine für Schild, Wagen und Triebwerk,
- zwei semantisch verschiedene Pläne: riskante Kette und kontrollierte
  Alternative,
- Wiederverwendung der vorhandenen Figuren-Rückstoßphysik für den
  Triebwerkimpuls,
- automatisierte Tests für Ereignisreihenfolge, Endzustände und Alternative.

## Nichtziele

- keine allgemeine Starrkörper- oder Objektphysik,
- keine Integration in reguläre Matches oder die KI-Balance,
- keine neue Karte im Kartenkatalog,
- kein fertiges Kommandopunkte- oder Meta-System,
- keine neuen Bild- oder Audioassets.

## Akzeptanzkriterien

1. Der Actionmap-Test ist aus dem Hauptmenü startbar und zurücksetzbar.
2. Der riskante Plan löst lesbar Schild → Wagen → Triebwerk → Figurenimpuls aus.
3. Die Alternative lässt das Schild stehen und vermeidet den Figurenimpuls.
4. Zustandsübergänge sind rendererunabhängig und deterministisch getestet.
5. Typecheck, Tests, Produktionsbuild und Browserprüfung sind erfolgreich.

## Abschlussbericht

- Ein eigener `ACTIONMAP-TEST` startet die isolierte Vektorbühne direkt aus
  dem Hauptmenü.
- Der riskante RINGO-Plan inszeniert Schild → Wagen → Triebwerk → Moki; die
  Flugbahn von Moki wird mit der vorhandenen rendererunabhängigen
  Rückstoßphysik berechnet.
- GLIBs Alternative warnt Moki zuerst, lässt das Schild stehen und vermeidet
  dadurch den Figurenimpuls.
- Die Objektzustände und Ereignisreihenfolgen liegen als reine TypeScript-Logik
  unter `src/simulation/actionmap/`; die Szene besitzt keine Gameplay-Autorität.
- Bewusste Einschränkung: Pläne und Objektstrecke sind für diesen Produkttest
  kuratiert. Es gibt weiterhin keine allgemeine Objektphysik und noch keine
  Integration in die reguläre Match-KI.
