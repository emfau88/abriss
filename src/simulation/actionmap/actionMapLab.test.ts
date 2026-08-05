import { describe, expect, it } from "vitest";

import {
  ACTION_MAP_PLANS,
  applyActionMapEvent,
  beginActionMapPlan,
  createActionMapLabState,
  resolveActionMapPlan,
  selectActionMapPlan,
} from "./actionMapLab";

describe("action-map lab", () => {
  it("resolves the risky chain in a fixed readable order", () => {
    const initial = createActionMapLabState();
    const events = ACTION_MAP_PLANS["risky-chain"].events;

    expect(events.map((event) => event.type)).toEqual([
      "sign-falling",
      "sign-landed",
      "cart-rolling",
      "cart-stopped",
      "thruster-fired",
      "moki-blasted",
      "thruster-spent",
      "sequence-complete",
    ]);
    expect(resolveActionMapPlan(initial)).toEqual({
      planId: "risky-chain",
      phase: "complete",
      sign: "fallen",
      cart: "stopped",
      thruster: "spent",
      mokiSafe: false,
      mokiBlasted: true,
    });
  });

  it("keeps the sign and Moki safe in the controlled alternative", () => {
    const alternative = selectActionMapPlan(
      createActionMapLabState(),
      "controlled-push",
    );

    expect(resolveActionMapPlan(alternative)).toMatchObject({
      planId: "controlled-push",
      phase: "complete",
      sign: "upright",
      mokiSafe: true,
      mokiBlasted: false,
    });
  });

  it("does not allow changing the selected plan during execution", () => {
    const executing = beginActionMapPlan(createActionMapLabState());
    const unchanged = selectActionMapPlan(executing, "controlled-push");
    const afterFirstEvent = applyActionMapEvent(
      unchanged,
      ACTION_MAP_PLANS["risky-chain"].events[0]!,
    );

    expect(unchanged).toBe(executing);
    expect(afterFirstEvent.sign).toBe("falling");
  });
});
