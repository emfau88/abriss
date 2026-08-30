import { describe, expect, it } from "vitest";
import { BurrowTerrain } from "./BurrowTerrain";
import { BurrowMotion } from "./BurrowMotion";
import { BurrowTrailField, TRAIL_LIFETIME_TICKS } from "./BurrowTrailField";
import { BurrowStructure } from "./BurrowStructure";
import { parseTerrainVariant } from "./BurrowTerrainVariant";

const DT = 1 / 60;
const right = { direction: { x: 1, y: 0 }, burstPressed: false };
const idle = { direction: null, burstPressed: false };
const soil = () => new BurrowTerrain({ worldWidth: 1200, worldHeight: 900, cellSize: 4, solidAt: () => true });

describe("Burrow terrain comparison", () => {
  it("defaults to B while retaining explicit A for comparison", () => {
    expect(parseTerrainVariant(null)).toBe("recovering");
    expect(parseTerrainVariant("other")).toBe("recovering");
    expect(parseTerrainVariant("recovering")).toBe("recovering");
    expect(parseTerrainVariant("persistent")).toBe("persistent");
    expect(new BurrowMotion(soil(), { x: 100, y: 400 }).terrainVariant).toBe("recovering");
  });

  it("never mutates permanent soil on normal B movement, including construction and idle", () => {
    const terrain = soil();
    const motion = new BurrowMotion(terrain, { x: 100, y: 400 }, 0, "recovering");
    for (let i = 0; i < 120; i += 1) {
      const result = motion.step(right, DT);
      expect(result.terrainMutation).toBeNull();
    }
    expect(terrain.version).toBe(0);
    expect(motion.state.excavatedCells).toBe(0);
    expect(motion.trailField.activeCellCount).toBeGreaterThan(0);
    expect(motion.state.speed).toBe(145);
    for (let i = 0; i < 600; i += 1) motion.step(idle, DT);
    expect(motion.trailField.activeCellCount).toBe(0);
    expect(terrain.version).toBe(0);
  });

  it("keeps normal A tunnels continuous and permanent after more than ten seconds", () => {
    const terrain = soil();
    const motion = new BurrowMotion(terrain, { x: 100, y: 400 }, 0, "persistent");
    for (let i = 0; i < 120; i += 1) motion.step(right, DT);
    for (let i = 0; i < 601; i += 1) motion.step(idle, DT);
    for (let x = 100; x <= motion.state.position.x; x += 4) expect(terrain.isSolidWorld(x, 400)).toBe(false);
    expect(motion.trailField.activeCellCount).toBe(0);
  });

  it("gives a previous B route tunnel speed without erasing the supporting soil", () => {
    const terrain = soil();
    const motion = new BurrowMotion(terrain, { x: 100, y: 400 }, 0, "recovering");
    motion.trailField.markCapsule({ x: 90, y: 400 }, { x: 800, y: 400 }, 31);
    for (let i = 0; i < 90; i += 1) motion.step(right, DT);
    expect(motion.state.speed).toBe(225);
    expect(motion.state.mode).toBe("tunnel");
    expect(terrain.version).toBe(0);
  });

  it("expires at exactly 600 ticks, refreshes crossed cells, and reports only local tiles", () => {
    const field = new BurrowTrailField(soil());
    field.markCapsule({ x: 100, y: 100 }, { x: 120, y: 100 }, 10);
    expect(field.takeDirtyTiles()).toEqual([0]);
    for (let i = 0; i < TRAIL_LIFETIME_TICKS - 1; i += 1) field.advance();
    expect(field.isActiveWorld(100, 100)).toBe(true);
    field.advance();
    expect(field.isActiveWorld(100, 100)).toBe(false);
    expect(field.takeDirtyTiles()).toEqual([0]);
    expect(field.activeCellCount).toBe(0);
    field.markCapsule({ x: 100, y: 100 }, { x: 120, y: 100 }, 10);
    for (let i = 0; i < 500; i += 1) field.advance();
    field.markCapsule({ x: 100, y: 100 }, { x: 120, y: 100 }, 10);
    for (let i = 0; i < 100; i += 1) field.advance();
    expect(field.isActiveWorld(100, 100)).toBe(true);
    const snapshot = field.snapshot();
    expect(JSON.parse(JSON.stringify(snapshot))).toEqual(snapshot);
    expect(snapshot.cells.every(cell => cell.expiresAt > snapshot.tick)).toBe(true);
  });

  it.each([right.direction, null])("keeps B soil and supports intact when starting a burst with direction %j", direction => {
    const terrain = soil();
    const motion = new BurrowMotion(terrain, { x: 100, y: 400 }, 0, "recovering");
    const structure = new BurrowStructure(terrain, [
      { id: "near", position: { x: 102, y: 400 } },
      { id: "far", position: { x: 800, y: 400 } },
      { id: "other", position: { x: 900, y: 400 } },
    ]);
    motion.step(right, DT);
    expect(structure.step().lostSupportIds).toEqual([]);
    const headAtPress = { ...motion.state.position };
    const first = motion.step({ direction, burstPressed: true }, DT);
    expect(first.events.map(event => event.type)).toEqual(["burst"]);
    expect(first.burstStarted).toBe(true);
    expect(motion.state.burstRemaining).toBeGreaterThan(0);
    expect(motion.state.burstCooldown).toBeGreaterThan(0);
    expect(first.terrainMutation).toBeNull();
    expect(structure.step().lostSupportIds).toEqual([]);
    expect(terrain.isSolidWorld(headAtPress.x, headAtPress.y)).toBe(true);
    for (let i = 0; i < 100; i += 1) {
      const step = motion.step({ direction, burstPressed: false }, DT);
      expect(step.events).toEqual([]);
      expect(step.terrainMutation).toBeNull();
    }
    for (let i = 0; i < 600; i += 1) motion.step(idle, DT);
    expect(motion.trailField.activeCellCount).toBe(0);
    expect(terrain.version).toBe(0);
    expect(motion.state.excavatedCells).toBe(0);
    expect(terrain.isSolidWorld(headAtPress.x, headAtPress.y)).toBe(true);
    expect(terrain.isSolidWorld(200, 400)).toBe(true);
    expect(structure.step()).toEqual({ lostSupportIds: [], collapsedNow: false });
  });

  it("can breach and re-enter B soil without oscillating along the surface", () => {
    const terrain = new BurrowTerrain({ worldWidth: 1200, worldHeight: 900, cellSize: 4, solidAt: (_x, y) => y >= 320 });
    const motion = new BurrowMotion(terrain, { x: 450, y: 430 }, -Math.PI / 2, "recovering");
    const events: string[] = [];
    let breached = false;
    let reentered = false;
    for (let i = 0; i < 500; i += 1) {
      const result = motion.step({ direction: breached ? { x: 0.6, y: 1 } : { x: 0, y: -1 }, burstPressed: i === 0 }, DT);
      events.push(...result.events.map(event => event.type));
      if (motion.state.mode === "airborne") breached = true;
      if (breached && motion.state.mode !== "airborne") {
        reentered = true;
        for (let j = 0; j < 60; j += 1) {
          events.push(...motion.step({ direction: { x: 0.6, y: 1 }, burstPressed: false }, DT).events.map(event => event.type));
        }
        break;
      }
    }
    expect(breached).toBe(true);
    expect(reentered).toBe(true);
    expect(events.filter(event => event === "breach")).toHaveLength(1);
    expect(events.filter(event => event === "impact").length).toBeLessThanOrEqual(1);
    expect(motion.state.mode).not.toBe("airborne");
  });

  it.each(["persistent", "recovering"] as const)("replays %s identically with serializable snapshots", variant => {
    const run = () => {
      const terrain = soil();
      const motion = new BurrowMotion(terrain, { x: 200, y: 400 }, 0, variant);
      for (let i = 0; i < 700; i += 1) {
        motion.step({ direction: { x: Math.cos(i / 80), y: Math.sin(i / 80) }, burstPressed: i % 160 === 0 }, DT);
      }
      return JSON.stringify({ state: motion.state, trail: motion.trailField.snapshot(), terrain: terrain.version });
    };
    expect(run()).toBe(run());
  });

  it("emits one fast impact and never refills that crater when the trail expires", () => {
    const terrain = new BurrowTerrain({ worldWidth: 1200, worldHeight: 900, cellSize: 4, solidAt: (_x, y) => y >= 320 });
    const motion = new BurrowMotion(terrain, { x: 450, y: 430 }, -Math.PI / 2, "recovering");
    let impactCount = 0;
    let flying = false;
    let burstDown = false;
    for (let i = 0; i < 600; i += 1) {
      const airborne = motion.state.mode === "airborne";
      flying ||= airborne;
      const fireDown: boolean = airborne && motion.state.velocity.y > 0 && motion.state.burstCooldown === 0 && !burstDown;
      burstDown ||= fireDown;
      const result = motion.step({ direction: flying ? { x: 0, y: 1 } : { x: 0, y: -1 }, burstPressed: i === 0 || fireDown }, DT);
      impactCount += result.events.filter(event => event.type === "impact").length;
      if (result.events.some(event => event.type === "impact")) {
        expect(result.terrainMutation?.removedCells).toBeGreaterThan(0);
        const position = { ...motion.state.position };
        for (let j = 0; j < 700; j += 1) motion.step(idle, DT);
        expect(terrain.isSolidWorld(position.x, position.y)).toBe(false);
        break;
      }
    }
    expect(impactCount).toBe(1);
  });

  it("rejects invalid time without changing the field or motion", () => {
    const motion = new BurrowMotion(soil(), { x: 100, y: 400 }, 0, "recovering");
    const state = motion.state;
    for (const dt of [NaN, Infinity, 0, -1, 1 / 30]) expect(() => motion.step(right, dt)).toThrow();
    expect(motion.state).toEqual(state);
    expect(motion.trailField.tick).toBe(0);
  });
});
