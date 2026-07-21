import type { TeamId } from "../../simulation/state/matchState";

export interface TeamStatusMemberInput {
  readonly id: string;
  readonly displayName: string;
  readonly team: TeamId;
  readonly hitPoints: number;
  readonly maximumHitPoints: number;
}

export interface TeamStatusMember extends TeamStatusMemberInput {
  readonly defeated: boolean;
}

export interface TeamStatusSummary {
  readonly team: TeamId;
  readonly hitPoints: number;
  readonly maximumHitPoints: number;
  readonly members: readonly TeamStatusMember[];
}

export type TeamStatusByTeam = Readonly<Record<TeamId, TeamStatusSummary>>;

export function summarizeTeamStatus(
  members: readonly TeamStatusMemberInput[],
): TeamStatusByTeam {
  const grouped: Record<TeamId, TeamStatusMember[]> = {
    crew: [],
    rivals: [],
  };

  for (const member of members) {
    if (
      !Number.isFinite(member.hitPoints) ||
      !Number.isFinite(member.maximumHitPoints) ||
      member.hitPoints < 0 ||
      member.maximumHitPoints <= 0 ||
      member.hitPoints > member.maximumHitPoints
    ) {
      throw new Error(`Invalid HUD hit points for ${member.id}.`);
    }

    grouped[member.team].push({
      ...member,
      defeated: member.hitPoints === 0,
    });
  }

  return {
    crew: summarizeTeam("crew", grouped.crew),
    rivals: summarizeTeam("rivals", grouped.rivals),
  };
}

function summarizeTeam(
  team: TeamId,
  members: readonly TeamStatusMember[],
): TeamStatusSummary {
  return {
    team,
    hitPoints: members.reduce((sum, member) => sum + member.hitPoints, 0),
    maximumHitPoints: members.reduce(
      (sum, member) => sum + member.maximumHitPoints,
      0,
    ),
    members,
  };
}
