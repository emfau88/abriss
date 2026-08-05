import { describe, expect, it } from "vitest";

import {
  PLAN_FAMILY_IMPACT_BUCKET_SIZE,
  PLAN_FAMILY_MOVEMENT_BUCKET_SIZE,
  planFamilyKey,
} from "./planFamily";

const base = {
  targetId: "rival-1",
  weaponId: "rocket" as const,
  movementKind: "walk" as const,
  movementDestination: { x: 400, y: 500 },
  impactPoint: { x: 900, y: 500 },
};

describe("semantic plan families (Task 031)", () => {
  it("groups small arc, movement and impact variations into one family", () => {
    expect(
      planFamilyKey({
        ...base,
        movementDestination: { x: 414, y: 492 },
        impactPoint: { x: 918, y: 510 },
      }),
    ).toBe(planFamilyKey(base));
  });

  it("separates visibly different target, weapon, movement and impact ideas", () => {
    const family = planFamilyKey(base);

    expect(planFamilyKey({ ...base, targetId: "rival-2" })).not.toBe(family);
    expect(planFamilyKey({ ...base, weaponId: "grenade" })).not.toBe(family);
    expect(planFamilyKey({ ...base, movementKind: "jump" })).not.toBe(family);
    expect(
      planFamilyKey({
        ...base,
        movementDestination: {
          x: base.movementDestination.x + PLAN_FAMILY_MOVEMENT_BUCKET_SIZE * 2,
          y: base.movementDestination.y,
        },
      }),
    ).not.toBe(family);
    expect(
      planFamilyKey({
        ...base,
        impactPoint: {
          x: base.impactPoint.x + PLAN_FAMILY_IMPACT_BUCKET_SIZE * 2,
          y: base.impactPoint.y,
        },
      }),
    ).not.toBe(family);
  });

  it("is deterministic and contains only serializable stable parts", () => {
    const first = planFamilyKey(base);
    const second = planFamilyKey({ ...base });

    expect(second).toBe(first);
    expect(JSON.parse(JSON.stringify({ family: first }))).toEqual({
      family: first,
    });
  });
});
