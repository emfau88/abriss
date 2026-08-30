# Task 045: Burrow – Level 2 und Zerstörungsbogen

## Status

`in Umsetzung – ausdrücklich durch Nutzer freigegeben`

## Ziel

Der bestehende Run wird nach dem Abschluss von Level 1 direkt mit dem
vollständig spielbaren zweiten Level **Goblinmarkt** fortgesetzt. Der Gräber
behält seinen Build, erhält genau ein Rang-2-Upgrade am zweiten Schrein, nutzt
gezielte Breach-/Impact-Zerstörung für einen verpflichtenden Marktturm und
wächst nach dem finalen Handelswagen sichtbar zum Koloss.

## Warum jetzt

Der Drei-Level-Plan sah den persönlichen Level-1-Mobiltest als Freigabetor
vor. Der Nutzer hat am 30. August 2026 trotzdem ausdrücklich den nächsten
Bulk angefordert. D-065 dokumentiert diese Freigabe, ohne den persönlichen
Test als erledigt auszugeben.

## Pflichtlektüre

- `AGENTS.md`
- `docs/00_PROJECT_INDEX.md`
- `docs/burrow/VISION.md`
- `docs/burrow/VERTICAL_SLICE.md`
- `docs/burrow/TECHNICAL_PLAN.md`
- `docs/burrow/THREE_LEVEL_SLICE.md`
- `docs/DECISIONS.md`
- `tasks/044_BURROW_LEVEL_1_RUN_FOUNDATION.md`

## Scope

- eine zweite datengetriebene Leveldefinition `Goblinmarkt` mit eigener,
  handgebauter Arena und stabiler Schreinhöhle,
- Fortsetzung aus Level 1 statt zweiter kopierter Szene; Level-Einstieg hält
  Gräber, Gesamtbiomasse und die erste Upgradewahl fest,
- Level-2-Einstiegscheckpoint stellt nur den aktuellen Levelzustand wieder
  her, ohne frühere Fortschritte zu duplizieren oder zu verlieren,
- ein verpflichtender, bestehender Stützenstruktur-Typ als Marktturm;
  nur permanente Breach-/Impact-Zerstörung zählt,
- mehrere parametrisierte Wagenziele als Level-2-Biomassequellen, keine neue
  allgemeine NPC- oder Fahrzeugphysik,
- zweiter Schrein mit Rang 2 desselben gewählten Pfads:
  Himmelsstürmer kürzerer Burst-Cooldown, Vielfraß kürzerer Biss-Cooldown,
  Rammbock stärkerer Schaden gegen die gepanzerte Schlusskutsche,
- gepanzerter Handelswagen als Finale, erst nach Turmkollaps und Schreinwahl,
- Levelabschluss wächst Gräber zum Koloss und endet ehrlich vor Level 3,
- deterministische Fachtests für Fortsetzung, Checkpoint, Rang-2-Build,
  Turmpflicht und Finale.

## Nichtziele

- kein Level 3, keine königliche Kutsche und kein Run-Endscreen,
- keine Rang-3-Upgrades, Meta-Währung oder Speicherung,
- keine Gegnerprojektile, Wurm-HP, allgemeine Gegner-KI oder neue Physik,
- keine Änderung an Abriss.

## Akzeptanzkriterien

1. Ein frischer Run kann Level 1 abschließen und ohne Szenenkopie nach Level 2
   fortsetzen; der Gräber und Rang 1 bleiben aktiv.
2. Scheitern in Level 2 stellt dessen Einstieg wieder her, ohne Level-1-Build
   oder Gesamtbiomasse zu verlieren.
3. Der Marktturm kann nur durch dauerhafte Terrainaktionen kollabieren und ist
   vor dem Finale zwingend.
4. Der zweite Schrein bietet nur den gewählten Pfad auf Rang 2 und pausiert
   die Leveluhr.
5. Rang 2 verändert genau den dokumentierten Buildwert und wird fachlich
   nachgewiesen.
6. Der gepanzerte Handelswagen besitzt mehrere lesbare Schadenszustände;
   Level 2 gewinnt nur nach Turmkollaps, Schreinwahl und Devour.
7. Abschluss zeigt Koloss und endet vor Level 3 ehrlich.
8. Typprüfung, Burrow-Fachtests, Gesamttests, Build und Desktop-/Touch-Smoke
   bleiben grün.

## Abschlussbericht

Der Bearbeiter berichtet Fortsetzung, Checkpoint, Rang-2-Werte, Turm-/Finale-
Abhängigkeit, Prüfungen und den weiterhin offenen echten Mobilspieltest.
