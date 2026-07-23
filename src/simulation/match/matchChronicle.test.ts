import { describe, expect, it } from "vitest";

import {
  buildMatchChronicle,
  type ChronicleTurnInput,
  type ChronicleUnitInfo,
} from "./matchChronicle";
import type { MatchTurnEvent } from "./resolveTurn";

/**
 * Task 027 – Tests der reinen Chronik-Funktion. Alle Eingaben sind synthetische
 * Ereignisprotokolle, damit die Deutung unabhängig von echtem Terrain und ohne
 * Zufall geprüft werden kann (Determinismus-Anforderung). Erstellt von
 * Claude Opus 4.8 (Anthropic).
 */

const unitInfo: ReadonlyMap<string, ChronicleUnitInfo> = new Map([
  ["glib", { team: "crew", displayName: "GLIB" }],
  ["moki", { team: "crew", displayName: "MOKI" }],
  ["rival-a", { team: "rivals", displayName: "RIVALE A" }],
]);

function damage(unitId: string, amount: number): MatchTurnEvent {
  return {
    type: "damage-applied",
    unitId,
    damage: amount,
    remainingHitPoints: Math.max(0, 140 - amount),
  };
}

const projectile = {
  type: "projectile-resolved",
} as unknown as MatchTurnEvent;

describe("buildMatchChronicle (Task 027)", () => {
  it("erkennt einen Selbsttreffer des Schützen", () => {
    const turns: ChronicleTurnInput[] = [
      {
        turnNumber: 3,
        activeUnitId: "moki",
        events: [projectile, damage("moki", 40)],
      },
    ];

    const chronicle = buildMatchChronicle({ turns, unitInfo });

    expect(chronicle).toHaveLength(1);
    expect(chronicle[0]?.type).toBe("self-hit");
    expect(chronicle[0]?.actorUnitId).toBe("moki");
    // Der Text trägt bereits den Figurennamen.
    expect(chronicle[0]?.text).toContain("MOKI");
  });

  it("unterscheidet Friendly Fire vom Treffer am Gegner", () => {
    const friendly: ChronicleTurnInput[] = [
      {
        turnNumber: 5,
        activeUnitId: "glib",
        events: [projectile, damage("moki", 30)],
      },
    ];
    const enemyHit: ChronicleTurnInput[] = [
      {
        turnNumber: 5,
        activeUnitId: "glib",
        events: [projectile, damage("rival-a", 30)],
      },
    ];

    const friendlyChronicle = buildMatchChronicle({ turns: friendly, unitInfo });
    const enemyChronicle = buildMatchChronicle({ turns: enemyHit, unitInfo });

    expect(friendlyChronicle[0]?.type).toBe("friendly-fire");
    expect(friendlyChronicle[0]?.subjectUnitId).toBe("moki");
    expect(friendlyChronicle[0]?.text).toContain("MOKI");
    // Ein sauberer Gegnertreffer ist kein erzählenswerter Vorfall.
    expect(enemyChronicle).toHaveLength(0);
  });

  it("erkennt einen Sturz aus der Welt", () => {
    const turns: ChronicleTurnInput[] = [
      {
        turnNumber: 8,
        activeUnitId: "rival-a",
        events: [
          projectile,
          {
            type: "fall-resolved",
            unitId: "glib",
            state: "out-of-world",
            fromY: 400,
            toY: 2000,
            defeated: true,
          },
        ],
      },
    ];

    const chronicle = buildMatchChronicle({ turns, unitInfo });

    expect(chronicle[0]?.type).toBe("world-fall");
    expect(chronicle[0]?.subjectUnitId).toBe("glib");
  });

  it("erkennt einen wirkungslosen Fehlschuss", () => {
    const turns: ChronicleTurnInput[] = [
      { turnNumber: 2, activeUnitId: "glib", events: [projectile] },
    ];

    const chronicle = buildMatchChronicle({ turns, unitInfo });

    expect(chronicle[0]?.type).toBe("misfire");
  });

  it("priorisiert schwerere Momente und begrenzt auf drei", () => {
    const turns: ChronicleTurnInput[] = [
      { turnNumber: 1, activeUnitId: "glib", events: [projectile] }, // misfire (30)
      {
        turnNumber: 2,
        activeUnitId: "moki",
        events: [projectile, damage("moki", 40)],
      }, // self-hit (~100)
      {
        turnNumber: 3,
        activeUnitId: "glib",
        events: [projectile, damage("moki", 20)],
      }, // friendly-fire (~75)
      {
        turnNumber: 4,
        activeUnitId: "rival-a",
        events: [
          projectile,
          {
            type: "knockback-resolved",
            unitId: "rival-a",
            result: { outcome: "out-of-world", samples: [] } as never,
            defeatedOutOfWorld: true,
          },
        ],
      }, // world-fall (80)
    ];

    const chronicle = buildMatchChronicle({ turns, unitInfo });

    expect(chronicle).toHaveLength(3);
    // Reihenfolge nach severity: self-hit > world-fall > friendly-fire.
    expect(chronicle.map((moment) => moment.type)).toEqual([
      "self-hit",
      "world-fall",
      "friendly-fire",
    ]);
  });

  it("ist deterministisch für denselben Verlauf", () => {
    const turns: ChronicleTurnInput[] = [
      {
        turnNumber: 2,
        activeUnitId: "moki",
        events: [projectile, damage("moki", 40)],
      },
      {
        turnNumber: 3,
        activeUnitId: "glib",
        events: [projectile, damage("moki", 20)],
      },
    ];

    const first = buildMatchChronicle({ turns, unitInfo });
    const second = buildMatchChronicle({ turns, unitInfo });

    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });

  it("meldet einen sehr großen Krater, aber keinen normalen", () => {
    const bigCrater: ChronicleTurnInput[] = [
      {
        turnNumber: 4,
        activeUnitId: "moki",
        events: [
          projectile,
          {
            type: "terrain-mutated",
            mutation: {
              removedCells: 3000,
              dirtyCells: null,
              dirtyWorld: null,
              version: 1,
            },
            center: { x: 100, y: 100 },
            radius: 82,
          },
        ],
      },
    ];
    const smallCrater: ChronicleTurnInput[] = [
      {
        turnNumber: 4,
        activeUnitId: "moki",
        events: [
          projectile,
          {
            type: "terrain-mutated",
            mutation: {
              removedCells: 1200,
              dirtyCells: null,
              dirtyWorld: null,
              version: 1,
            },
            center: { x: 100, y: 100 },
            radius: 62,
          },
        ],
      },
    ];

    expect(buildMatchChronicle({ turns: bigCrater, unitInfo })[0]?.type).toBe(
      "large-crater",
    );
    // Ein normaler Krater ist kein erzählenswerter Vorfall.
    expect(buildMatchChronicle({ turns: smallCrater, unitInfo })).toHaveLength(0);
  });

  it("meldet einen echten übersprungenen Zug", () => {
    const turns: ChronicleTurnInput[] = [
      {
        turnNumber: 6,
        activeUnitId: "glib",
        events: [{ type: "turn-skipped", unitId: "glib" }],
      },
    ];

    const chronicle = buildMatchChronicle({ turns, unitInfo });

    expect(chronicle[0]?.type).toBe("turn-skipped");
  });
});
