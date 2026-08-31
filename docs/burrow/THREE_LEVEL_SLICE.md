# Burrow: Drei-Level-Vertical-Slice

Stand: 30. August 2026
Status: Level 1 / Task 044 technisch umgesetzt; persönliche Level-1-Abnahme offen

## Ziel

Burrow wird vom offenen Produktlabor zu einem kleinen, vollständig spielbaren
Run aus drei aufeinanderfolgenden Levels. In ungefähr neun Minuten aktiver
Spielzeit erlebt der Spieler den ganzen versprochenen Bogen:

> graben → breachen → fressen → Schrein finden → Upgrade wählen → wachsen →
> stärker zerstören → Schlusskutsche besiegen

Der Slice beweist nicht Contentmenge, sondern ob Bewegung, Wachstum, Upgrades,
Zerstörung und Machtsteigerung zusammen Lust auf einen weiteren Run machen.

## Form des Runs

- genau drei Levels mit höchstens 180 Sekunden aktiver Spielzeit je Level,
- Upgradeauswahl und Übergänge pausieren die Uhr,
- Wurmstufe und Upgrades bleiben innerhalb des Runs erhalten,
- ein neuer Run setzt Level, Welt, Biomasse, Wachstum und Upgrades zurück,
- Scheitern stellt den gespeicherten Einstieg des aktuellen Levels wieder her,
- nach Level 3 folgt ein kurzer Ergebnisbildschirm mit „Noch eine Runde?“.

Der erste vollständige Run dauert mit Übergängen ungefähr zehn bis zwölf
Minuten. Es gibt noch keine Konten, Währungen, Speicherstände oder Metaprogression.

Der Level-Einstieg enthält Wachstum und Upgrades aus bereits abgeschlossenen
Levels. Beim Wiederholen werden Terrain, Ziele, Levelzeit, Level-Biomasse und
die noch nicht dauerhaft bestätigte Schreinwahl dieses Levels zurückgesetzt.
Damit bleiben frühere Erfolge erhalten, ohne Biomasse oder Upgrades durch
Fehlversuche vervielfachen zu können.

## Gemeinsamer Levelablauf

Jedes Level verwendet dieselbe lesbare Folge:

1. Eine Einblendung nennt Level, Hauptziel und Zeitlimit.
2. Kleine Beute und Weltziele liefern Biomasse.
3. Die Biomasseschwelle weckt den Schrein in seiner festen Höhlenkammer.
4. Kopfkontakt am Schrein pausiert die Simulation und öffnet drei Upgrades.
5. Nach der Wahl erscheint oder verwundbar wird das finale Levelziel.
6. Das finale Ziel muss vor Ablauf der 180 Sekunden besiegt werden.
7. Level 1 und 2 enden mit einer kurzen Wachstumssequenz; Level 3 mit dem
   Runergebnis.

Dadurch hat jedes Level Vorbereitung, Entscheidung und payoff statt nur mehr
Objekte auf derselben Karte.

## Schrein

Jedes Level besitzt genau einen handplatzierten Schrein in einer vorgefertigten,
ausreichend großen Höhle. Die Höhle gehört zur initialen Terrainmaske; sie wird
nicht während des Runs ausgestanzt. Variante B sorgt dafür, dass normale
Bewegung die Kammer nicht erweitert und der Schrein nicht frei in einem
selbstgegrabenen Hohlraum hängt.

Der Schrein ist zunächst dunkel. Nach Erreichen der Biomasseschwelle erhält er
einen sichtbaren Puls, eine kurze Meldung und einen dezenten Richtungshinweis.
Nur gültiger Kopfkontakt aktiviert ihn. Während der Auswahl stehen Simulation,
Leveluhr und Eingabe still. Die Wahl wird einmalig und serialisierbar im
Runzustand gespeichert.

Der Schrein ist Upgrade-Ort und bewusst kein Inventar, Shop oder Zufallsautomat.

## Upgrades

Bei jedem Schrein stehen dieselben drei klaren Pfade zur Wahl. Ein Pfad darf
erneut gewählt und damit auf Rang 2 oder 3 gebracht werden. Es gibt im ersten
Slice keinen Zufall, keine seltenen Karten und keine versteckten Werte.

### Himmelsstürmer – Bewegung und höhere Breaches

- Rang 1: etwa 12 % höheres Bursttempo,
- Rang 2: zusätzlich etwa 15 % kürzerer Burst-Cooldown,
- Rang 3: zusätzlich spürbar stärkere Luftsteuerung.

Die gesteigerte Startgeschwindigkeit muss in einer festen Testsituation eine
messbar größere Scheitelhöhe liefern. Normales Grab- und Spurtempo bleibt
unverändert, damit sich die Grundsteuerung nicht mit jedem Upgrade verschiebt.

### Vielfraß – Jagd und Biomasse

- Rang 1: ein zusätzlicher Schadenspunkt bei gültigem Biss,
- Rang 2: etwa 20 % kürzerer Biss-Cooldown,
- Rang 3: etwa 15 % größere Kopfkontakt-Reichweite.

Das Upgrade verändert nur gültige Kopfkontakte. Körpersegmente werden niemals
zu unsichtbaren Trefferflächen.

### Rammbock – Einschlag und Zerstörung

- Rang 1: etwa 20 % größerer permanenter Einschlagkrater,
- Rang 2: stärkerer Schaden gegen gepanzerte Ziele,
- Rang 3: deutlich kräftigeres Struktur- und Trefferfeedback.

Ein unterirdischer Burststart entfernt weiterhin keine Erde. Rammbock wirkt nur
bei tatsächlichem Breach, schnellem Wiedereintritt oder gültigem Zielkontakt.

Die Prozentwerte sind Startwerte für Balancing, keine stillen Garantien. Jede
Änderung läuft über einen expliziten `BurrowRunBuild`, damit Simulation, HUD und
Tests dieselbe Wahrheit verwenden.

## Wachstum und Macht

Der vorhandene Keimling–Gräber–Koloss-Aufbau wird zur echten Runprogression.
Wachstum passiert ausschließlich beim Übergang nach Level 1 und Level 2. So
ändert sich die Kreatur nie mitten in einer Kurve oder Kollision.

| Stufe | Zeitpunkt | sichtbare Wirkung | fachliche Wirkung |
| --- | --- | --- | --- |
| Keimling | Start Level 1 | 18 Segmente, kleiner Kopf | heutige Basiswerte |
| Gräber | Start Level 2 | 23 Segmente, größere Platten | Burst ungefähr 400, schwerer Biss 3, kräftigerer Impact |
| Koloss | Start Level 3 | 28 Segmente, größter Kopf | Burst ungefähr 430, schwerer Biss 4, größter Basis-Impact |

Die bestehende visuelle Kopf- und Körpergröße wächst, der fachliche
Kollisionsradius bleibt im ersten Slice gleich. Dadurch wird der Wurm sichtbar
mächtiger, ohne Tunnelbreiten und Steuerbarkeit zu destabilisieren.

Das höhere Bursttempo der Wachstumsstufen garantiert, dass jeder Run höhere
Sprünge erlebt. Himmelsstürmer verstärkt diese Entwicklung zusätzlich. Kleine
Ziele aus früheren Levels sollen später mit weniger Kontakten besiegt werden;
das macht Macht unmittelbar vergleichbar.

Biomasse ist keine auszugebende Währung. Der Runzustand führt zwei sichtbare
Werte: `levelBiomass` startet in jedem Level bei null und allein dieser Wert
weckt den jeweiligen Schrein; `totalBiomass` summiert den erfolgreichen Run,
begründet die beiden Wachstumsübergänge und fließt in die Ergebniswertung ein.
Nur Biomasse aus erfolgreich abgeschlossenen Levelständen wird dauerhaft in
`totalBiomass` übernommen. Ein Fehlversuch stellt beide Werte aus dem
Level-Einstiegscheckpoint wieder her.

## Level 1 – Wiesenrand: Hunger

**Lernziel:** Bewegung, Breach, Biss, Biomasse und Schrein verstehen.

- freundliche Wiesenarena auf Basis der vorhandenen Welt,
- eine kleine fliehende Beute und die bekannte Händlerkutsche,
- Turm bleibt als lesbare optionale Weltreaktion, nicht als Pflichtziel,
- Biomasseschwelle: bewusst in ungefähr 60–90 Sekunden erreichbar,
- Schrein liegt in einer gut erreichbaren, vorgefertigten Seitenhöhle,
- Finale: Schlusskutsche als klarer Ein-Kontakt-Payoff nach der Schreinwahl.

**Sieg:** Schlusskutsche verschlungen.

**Wachstum:** Keimling wird zum Gräber.

Level 1 wird zuerst vollständig gebaut und persönlich gespielt. Ohne positiven
„Noch eine Runde?“-Eindruck beginnt keine Produktion von Level 2.

## Level 2 – Goblinmarkt: Zerstörung

**Lernziel:** neue Sprunghöhe und gezielte Terrainwirkung für Zerstörung nutzen.

- zweite handgebaute Arena mit Marktoberfläche und stabiler Schreinhöhle,
- mehrere Ziele verwenden dieselbe parametrisierte Beute-/Fahrzeuglogik,
- ein stützengestützter Marktturm ist konkretes Pflicht-Zerstörungsziel,
- normale Grabspur beschädigt keine Stützen; Breach und schneller Impact schon,
- Kollaps vergibt Biomasse und deutliches Slapstick-Feedback,
- Finale: Handelswagen als Ein-Kontakt-Payoff nach der Zerstörungsaufgabe.

**Sieg:** Pflichtstruktur zerstört und Handelswagen verschlungen.

**Wachstum:** Gräber wird zum Koloss.

Es entsteht keine allgemeine Gebäudephysik. Strukturen bleiben Kombinationen
aus wenigen Terrainankern, Zuständen und kuratierten Animationen.

## Level 3 – Burgstraße: Macht

**Lernziel:** den aufgebauten Wurm in einem schnellen Finale ausreizen.

- dritte kompakte Arena mit langer Anfahrtsfläche und tiefem Schreinraum,
- kleine Beute aus Level 1 zeigt durch schnelle Niederlagen den Machtzuwachs,
- ein Turm und eine gepanzerte Eskorte erzeugen räumlichen Druck,
- die Eskorte beschleunigt auf einer festen Fluchtroute statt neue Fahrphysik
  oder allgemeine Gegner-KI einzuführen,
- Finale: königliche Schlusskutsche als schneller Ein-Kontakt-Payoff nach dem
  aufgebauten Machtbogen.

**Sieg:** Schlusskutsche vor dem Kartenende verschlungen.

**Abschluss:** Score, Zeit, Biomasse, Kollapszahl, gewählte Upgrades und
„Noch eine Runde?“.

Der erste Slice benötigt noch keinen Beschuss und keine Lebenspunkte für den
Wurm. Zeitlimit und fliehende Schlusskutsche liefern ausreichend Druck. Aktive
Gegenwehr wird erst geplant, wenn der Drei-Level-Run ohne sie wiederholenswert
ist.

## Effiziente technische Form

Die drei Levels dürfen nicht als drei getrennte Szenen mit kopierter Logik
entstehen. Ein gemeinsamer rendererfreier Kern verwaltet:

- `BurrowRunState`: Level, aktive Zeit, Level- und Gesamtbiomasse, Wachstum,
  Upgrade-Ränge, Score und Ergebnis,
- `BurrowLevelDefinition`: Terrainprofil, Startpunkt, Schreinhöhle, Routen,
  Zieldefinitionen, Schwellen und Finale,
- `BurrowRunBuild`: alle aus Wachstum und Upgrades berechneten Spielwerte,
- ein parametrisiertes Zielsystem für kleine Beute, Kutschen und Elitewagen,
- vorhandene Stützenlogik für alle kuratierten Strukturen.

Phaser zeigt nur Zustand, Übergänge und Auswahl. Runzeit, Upgrades, Zielschaden,
Wachstum und Levelabschluss hängen weder von Renderframes noch realer Uhrzeit ab.
Alle Leveldefinitionen und Runzustände bleiben serialisierbar. Zufall ist für
den ersten Slice nicht erforderlich.

## Baureihenfolge und Tore

### Task 044 – vollständiges Level 1 und gemeinsames Runfundament

Runcontroller, Leveldefinition, Biomasseschwelle, Schreinauswahl, drei
Upgradepfade auf Rang 1, Schlusskutsche, Levelabschluss und Übergang zum Gräber.

**Stand 30. August 2026:** technisch umgesetzt und automatisiert geprüft.
Level 1 nutzt fünf Biomasse (ein fliehendes Bergtier plus die bestehende
Kutsche), pausiert Auswahl und Ergebnis, und endet mit einer Ein-Kontakt-
Schlusskutsche. Ein echter Mobilspieltest und die persönliche
Wiederholungswertung bleiben das Freigabetor für Level 2.

### Folgetask – Level 2

Nur nach persönlicher Level-1-Abnahme: zweite Definition, Pflichtstruktur,
Kollapsbelohnung, Upgrade-Rang 2, gepanzerter Handelswagen und Kolossübergang.

### Folgetask – Level 3 und Runergebnis

Nur nach Level-2-Abnahme: Fluchtroute, königliche Schadensphasen, Upgrade-Rang 3,
Runergebnis und kompletter Neustart.

### Abschlusstor

Mindestens drei vollständige Runs auf Desktop und einem echten Mobilgerät.
Entscheidend sind:

- Bewegung bleibt bis Level 3 kontrollierbar,
- höhere Breaches sind ohne Messwerkzeug fühlbar,
- jedes Upgrade verändert die nächste Minute sichtbar,
- Wachstum ist klar, ohne Kollisionsfehler zu erzeugen,
- Zerstörung bleibt gezielt statt die Karte unspielbar zu machen,
- Level 3 liefert deutlich mehr Macht als Level 1,
- mindestens zwei von drei Runs lösen freiwillig „Noch eine Runde“ aus.

Für die objektive Machtkurve werden zusätzlich feste Referenzszenarien
protokolliert: vertikale Scheitelhöhe eines Bursts je Wachstumsstufe und
Himmelsstürmer-Rang, Kontakte bis zur Basis- und Schlusskutsche sowie
permanent entfernte Terrainzellen je Rammbock-Rang.

## Bewusst nicht enthalten

- Meta-Währung, Speichern oder dauerhafte Unlocks,
- zufällige Upgradepools oder Seltenheiten,
- allgemeine Gegner-KI, Projektilkampf oder Wurmleben,
- mehr als drei Levels oder Regionen,
- offene Welt, Chunkstreaming oder prozedurale Karten,
- neue Formen wie Magier oder Fledermaus,
- finale Assetproduktion vor positiver Drei-Level-Abnahme.
