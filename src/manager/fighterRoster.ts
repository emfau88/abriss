import type { CreatureVisualId } from "../content/characters/creatureKits";
import type {
  Personality,
  WeaponId,
} from "../simulation/ai/RocketActionPlanner";

export type FighterId = "slime" | "hornling" | "moki" | "ghost";

export interface FighterDefinition {
  readonly id: FighterId;
  readonly displayName: string;
  readonly species: string;
  readonly visualId: CreatureVisualId;
  readonly personality: Personality;
  readonly preferredWeaponId: WeaponId;
  readonly description: string;
}

export const FIGHTER_IDS: readonly FighterId[] = [
  "slime",
  "hornling",
  "moki",
  "ghost",
];

export const FIGHTER_ROSTER: Readonly<Record<FighterId, FighterDefinition>> = {
  slime: {
    id: "slime",
    displayName: "GLIB",
    species: "SCHLEIMWESEN",
    visualId: "slime",
    personality: "cautious",
    preferredWeaponId: "rocket",
    description: "Federt erst, denkt dann – meistens.",
  },
  hornling: {
    id: "hornling",
    displayName: "BRUNO",
    species: "HORNWESEN",
    visualId: "hornling",
    personality: "cautious",
    preferredWeaponId: "rocket",
    description: "Misstraut Risiken und Bedienungsfehlern.",
  },
  moki: {
    id: "moki",
    displayName: "MOKI",
    species: "PILZWESEN",
    visualId: "moki",
    personality: "explosive",
    preferredWeaponId: "grenade",
    description: "Findet größere Krater grundsätzlich besser.",
  },
  ghost: {
    id: "ghost",
    displayName: "GHOST",
    species: "GEISTWESEN",
    visualId: "ghost",
    personality: "showboat",
    preferredWeaponId: "grenade",
    description: "Schwebt elegant. Landet Erklärungen eher selten.",
  },
};
