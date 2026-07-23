import { describe, expect, it } from "vitest";

import {
  EXPLOSIVE_BARREL_DEFAULTS,
  MAXIMUM_CHAIN_DEPTH,
  resolveReactionChain,
  type InteractableObject,
} from "./interactables";

/**
 * Task 028 – Tests des Reaktionsketten-Resolvers. Schwerpunkt: Determinismus,
 * Terminierung, Tiefengrenze und korrektes Verketten. Erstellt von
 * Claude Opus 4.8 (Anthropic).
 */

function barrel(
  id: string,
  x: number,
  y: number,
  overrides: Partial<InteractableObject> = {},
): InteractableObject {
  return {
    id,
    type: "explosive-barrel",
    position: { x, y },
    state: "intact",
    explosionRadius: EXPLOSIVE_BARREL_DEFAULTS.explosionRadius,
    maximumDamage: EXPLOSIVE_BARREL_DEFAULTS.maximumDamage,
    maximumKnockbackSpeed: EXPLOSIVE_BARREL_DEFAULTS.maximumKnockbackSpeed,
    ...overrides,
  };
}

describe("resolveReactionChain (Task 028)", () => {
  it("löst ein Fass im Explosionsradius aus", () => {
    const result = resolveReactionChain({
      trigger: { center: { x: 100, y: 100 }, radius: 60 },
      interactables: [barrel("b1", 130, 100)],
    });

    expect(result.destroyedInteractableIds).toEqual(["b1"]);
    expect(result.explosions).toHaveLength(1);
    expect(result.explosions[0]?.depth).toBe(1);
    expect(result.explosions[0]?.sourceInteractableId).toBe("b1");
  });

  it("lässt ein Fass außerhalb des Radius unberührt", () => {
    const result = resolveReactionChain({
      trigger: { center: { x: 100, y: 100 }, radius: 40 },
      interactables: [barrel("b1", 400, 100)],
    });

    expect(result.explosions).toHaveLength(0);
    expect(result.destroyedInteractableIds).toHaveLength(0);
  });

  it("verkettet ein zweites Fass in Reichweite des ersten", () => {
    // b1 wird direkt getroffen; sein Radius (92) erreicht b2 in 80 px Abstand.
    const result = resolveReactionChain({
      trigger: { center: { x: 100, y: 100 }, radius: 30 },
      interactables: [barrel("b1", 110, 100), barrel("b2", 190, 100)],
    });

    expect(result.destroyedInteractableIds).toEqual(["b1", "b2"]);
    expect(result.explosions.map((e) => e.depth)).toEqual([1, 2]);
  });

  it("terminiert und begrenzt die Kettentiefe", () => {
    // Eine lange, eng gestaffelte Reihe: mehr Fässer als die Tiefengrenze
    // erlaubt. Es dürfen höchstens MAXIMUM_CHAIN_DEPTH Stufen detonieren.
    const line: InteractableObject[] = [];
    for (let index = 0; index < 12; index += 1) {
      line.push(barrel(`b${index.toString().padStart(2, "0")}`, 100 + index * 80, 100));
    }

    const result = resolveReactionChain({
      trigger: { center: { x: 100, y: 100 }, radius: 30 },
      interactables: line,
    });

    // Stufen 1..MAXIMUM_CHAIN_DEPTH ⇒ höchstens so viele Detonationen wie
    // Stufen (hier je Stufe genau eines, da streng linear gestaffelt).
    expect(result.explosions.length).toBeLessThanOrEqual(MAXIMUM_CHAIN_DEPTH);
    const maxDepth = Math.max(...result.explosions.map((e) => e.depth));
    expect(maxDepth).toBeLessThanOrEqual(MAXIMUM_CHAIN_DEPTH);
  });

  it("ist deterministisch und reihenfolgestabil", () => {
    const interactables = [
      barrel("bravo", 190, 100),
      barrel("alpha", 110, 100),
    ];
    const first = resolveReactionChain({
      trigger: { center: { x: 100, y: 100 }, radius: 30 },
      interactables,
    });
    const second = resolveReactionChain({
      trigger: { center: { x: 100, y: 100 }, radius: 30 },
      interactables: [...interactables].reverse(),
    });

    // Gleiche Lage ⇒ gleiche Kette, unabhängig von der Eingabereihenfolge.
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });

  it("ignoriert bereits zerstörte Fässer", () => {
    const result = resolveReactionChain({
      trigger: { center: { x: 100, y: 100 }, radius: 60 },
      interactables: [barrel("b1", 130, 100, { state: "destroyed" })],
    });

    expect(result.explosions).toHaveLength(0);
  });
});
