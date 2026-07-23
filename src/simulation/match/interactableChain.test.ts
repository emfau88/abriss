import { describe, expect, it } from "vitest";

import { BinaryTerrainMask } from "../terrain/TerrainMask";
import type { InteractableDefinition } from "../interactables/interactables";
import {
  createMatchSimulation,
  type MatchSimulationState,
} from "./matchSimulationState";
import { planTurn } from "./planTurn";
import { resolveTurn } from "./resolveTurn";

/**
 * Task 028 – Integrationstest: Fässer detonieren innerhalb von resolveTurn und
 * verketten sich, wenn eine Explosion sie berührt. Der Aufbau nutzt einen
 * echten geplanten Schuss und platziert das Fass an dessen Einschlagpunkt,
 * damit der Test realistisch und determiniert bleibt. Erstellt von
 * Claude Opus 4.8 (Anthropic).
 */

function buildSimulation(
  interactableDefinitions?: readonly InteractableDefinition[],
): MatchSimulationState {
  const terrain = BinaryTerrainMask.fromWorldPredicate(
    { worldWidth: 1200, worldHeight: 600, cellSize: 2 },
    (_x, y) => y >= 400,
  );

  return createMatchSimulation({
    seed: 21_072_026,
    terrain,
    unitDefinitions: [
      {
        id: "crew-slime",
        displayName: "GLIB",
        team: "crew",
        spawnX: 200,
        personality: "explosive",
        preferredWeaponId: "rocket",
      },
      {
        id: "rival-1",
        displayName: "RIVALE A",
        team: "rivals",
        spawnX: 700,
        personality: "cautious",
      },
    ],
    ...(interactableDefinitions ? { interactableDefinitions } : {}),
  });
}

describe("interactable detonation inside resolveTurn (Task 028)", () => {
  it("detoniert ein Fass, das im Einschlagradius des Schusses liegt", () => {
    // 1) Trockenlauf: Wo explodiert der geplante Schuss?
    const dryRun = buildSimulation();
    const dryPlan = planTurn(dryRun);
    const dryEvents = resolveTurn(dryRun, dryPlan);
    const terrainEvent = dryEvents.find((e) => e.type === "terrain-mutated");

    expect(terrainEvent).toBeDefined();
    if (terrainEvent?.type !== "terrain-mutated") {
      throw new Error("Erwartete eine Primärexplosion im Trockenlauf.");
    }

    const impact = terrainEvent.center;

    // 2) Echter Lauf: Fass genau am Einschlagpunkt platzieren.
    const withBarrel = buildSimulation([
      { id: "barrel-1", type: "explosive-barrel", spawnX: Math.round(impact.x) },
    ]);
    const plan = planTurn(withBarrel);
    const events = resolveTurn(withBarrel, plan);

    const triggered = events.filter((e) => e.type === "interactable-triggered");
    expect(triggered.length).toBeGreaterThanOrEqual(1);
    expect(withBarrel.interactables[0]?.state).toBe("destroyed");
  });

  it("wickelt eine Kette aus zwei Fässern deterministisch ab", () => {
    const dryRun = buildSimulation();
    const dryPlan = planTurn(dryRun);
    const dryEvents = resolveTurn(dryRun, dryPlan);
    const terrainEvent = dryEvents.find((e) => e.type === "terrain-mutated");
    if (terrainEvent?.type !== "terrain-mutated") {
      throw new Error("Erwartete eine Primärexplosion im Trockenlauf.");
    }
    const impactX = Math.round(terrainEvent.center.x);

    // Zwei Fässer: eines am Einschlag, das zweite knapp daneben (in Reichweite
    // der ersten Detonation, Radius 92).
    const definitions: InteractableDefinition[] = [
      { id: "barrel-a", type: "explosive-barrel", spawnX: impactX },
      { id: "barrel-b", type: "explosive-barrel", spawnX: impactX + 70 },
    ];

    const first = buildSimulation(definitions);
    const firstEvents = resolveTurn(first, planTurn(first));
    const second = buildSimulation(definitions);
    const secondEvents = resolveTurn(second, planTurn(second));

    const firstTriggers = firstEvents.filter(
      (e) => e.type === "interactable-triggered",
    );
    expect(firstTriggers.length).toBe(2);
    // Beide Fässer zerstört, Reihenfolge nach Kettentiefe.
    expect(first.interactables.every((o) => o.state === "destroyed")).toBe(true);
    // Determinismus: identischer Aufbau ⇒ identisches Protokoll.
    expect(JSON.stringify(secondEvents)).toBe(JSON.stringify(firstEvents));
  });

  it("lässt Fässer außerhalb jeder Explosion intakt", () => {
    const withBarrel = buildSimulation([
      // Weit weg vom Geschehen (linker Kartenrand, Schütze steht bei x=200).
      { id: "barrel-far", type: "explosive-barrel", spawnX: 40 },
    ]);
    const events = resolveTurn(withBarrel, planTurn(withBarrel));

    expect(events.some((e) => e.type === "interactable-triggered")).toBe(false);
    expect(withBarrel.interactables[0]?.state).toBe("intact");
  });
});
