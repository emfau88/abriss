import { describe, expect, it } from "vitest";

import { summarizeTeamStatus } from "./TeamStatus";

describe("team HUD status", () => {
  it("summarizes current and maximum HP per team", () => {
    const summary = summarizeTeamStatus([
      {
        id: "bruno",
        displayName: "BRUNO",
        team: "crew",
        hitPoints: 40,
        maximumHitPoints: 140,
      },
      {
        id: "mara",
        displayName: "MARA",
        team: "crew",
        hitPoints: 140,
        maximumHitPoints: 140,
      },
      {
        id: "rival-a",
        displayName: "RIVALE A",
        team: "rivals",
        hitPoints: 0,
        maximumHitPoints: 140,
      },
    ]);

    expect(summary.crew.hitPoints).toBe(180);
    expect(summary.crew.maximumHitPoints).toBe(280);
    expect(summary.rivals.hitPoints).toBe(0);
    expect(summary.rivals.maximumHitPoints).toBe(140);
  });

  it("marks defeated members without changing their input order", () => {
    const summary = summarizeTeamStatus([
      {
        id: "rival-a",
        displayName: "RIVALE A",
        team: "rivals",
        hitPoints: 0,
        maximumHitPoints: 140,
      },
      {
        id: "rival-b",
        displayName: "RIVALE B",
        team: "rivals",
        hitPoints: 25,
        maximumHitPoints: 140,
      },
    ]);

    expect(summary.rivals.members.map((member) => member.id)).toEqual([
      "rival-a",
      "rival-b",
    ]);
    expect(summary.rivals.members[0]?.defeated).toBe(true);
    expect(summary.rivals.members[1]?.defeated).toBe(false);
  });
});
