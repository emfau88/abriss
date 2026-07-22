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
  /** Was die Figur wirklich gut kann – kurz und tonrichtig. */
  readonly strength: string;
  /**
   * Die sichtbare Schwäche. Leitet sich aus dem Persönlichkeits-Blindfleck ab
   * (PERSONALITY_PERCEPTION_NOTES in RocketActionPlanner): cautious übertreibt
   * Risiken, explosive unterschätzt sie, showboat überschätzt den Showfaktor.
   * Als Figureneigenschaft formuliert – ehrlich, weil die KI das wirklich tut.
   */
  readonly weakness: string;
  /** Selbstironischer „Ruf“ der Figur. */
  readonly knownFor: string;
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
    strength: "Hält die Crew aus der Schusslinie.",
    weakness: "Sieht überall Gefahr – auch wo keine ist.",
    knownFor: "Deckungssuche vor Deckungsbedarf.",
  },
  hornling: {
    id: "hornling",
    displayName: "BRUNO",
    species: "HORNWESEN",
    visualId: "hornling",
    personality: "cautious",
    preferredWeaponId: "rocket",
    description: "Misstraut Risiken und Bedienungsfehlern.",
    strength: "Zielt sauber, wenn ihn keiner drängt.",
    weakness: "Zögert lieber einmal zu oft als zu wenig.",
    knownFor: "Ausführliche Bedenken zur Unzeit.",
  },
  moki: {
    id: "moki",
    displayName: "MOKI",
    species: "PILZWESEN",
    visualId: "moki",
    personality: "explosive",
    preferredWeaponId: "grenade",
    description: "Findet größere Krater grundsätzlich besser.",
    strength: "Öffnet jedes Gelände, das im Weg steht.",
    weakness: "Hält sich für unverwundbar. Ist es nicht.",
    knownFor: "Enthusiasmus in Reichweite von Freunden.",
  },
  ghost: {
    id: "ghost",
    displayName: "GHOST",
    species: "GEISTWESEN",
    visualId: "ghost",
    personality: "showboat",
    preferredWeaponId: "grenade",
    description: "Schwebt elegant. Landet Erklärungen eher selten.",
    strength: "Trifft spektakulär, wenn es klappt.",
    weakness: "Überschätzt den eigenen Showfaktor massiv.",
    knownFor: "Fehlschüsse, die angeblich Absicht waren.",
  },
};
