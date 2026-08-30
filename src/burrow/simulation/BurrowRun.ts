export type BurrowGrowthStage = "sprout" | "burrower" | "colossus";

export type BurrowRunPhase =
  | "intro"
  | "hunt"
  | "shrine-ready"
  | "upgrade"
  | "finale"
  | "level-complete"
  | "failed";

export type BurrowUpgradeId = "skystrider" | "glutton" | "ram";

export interface BurrowUpgradeDefinition {
  readonly id: BurrowUpgradeId;
  readonly name: string;
  readonly description: string;
}

export interface BurrowLevelDefinition {
  readonly id: "meadow-edge";
  readonly name: string;
  readonly activeStepLimit: number;
  readonly shrineBiomass: number;
  readonly finaleHitPoints: number;
}

export interface BurrowRunBuild {
  readonly stage: BurrowGrowthStage;
  readonly burstSpeedMultiplier: number;
  readonly biteDamageBonus: number;
  readonly impactRadiusMultiplier: number;
}

export interface BurrowRunState {
  readonly level: BurrowLevelDefinition;
  readonly phase: BurrowRunPhase;
  readonly activeSteps: number;
  readonly levelBiomass: number;
  readonly totalBiomass: number;
  readonly shrineAwakened: boolean;
  readonly selectedUpgrade: BurrowUpgradeId | null;
  readonly build: BurrowRunBuild;
}

export const LEVEL_1: BurrowLevelDefinition = {
  id: "meadow-edge",
  name: "Wiesenrand",
  activeStepLimit: 10_800,
  shrineBiomass: 5,
  finaleHitPoints: 8,
};

export const BURROW_UPGRADES: readonly BurrowUpgradeDefinition[] = [
  {
    id: "skystrider",
    name: "HIMMELSSTÜRMER",
    description: "+12 % Bursttempo · höhere Flugspitze",
  },
  {
    id: "glutton",
    name: "VIELFRASS",
    description: "+1 Bissschaden bei gültigem Kopfkontakt",
  },
  {
    id: "ram",
    name: "RAMMBOCK",
    description: "+20 % Breach- und Einschlagkrater",
  },
] as const;

const SPROUT_BUILD: BurrowRunBuild = {
  stage: "sprout",
  burstSpeedMultiplier: 1,
  biteDamageBonus: 0,
  impactRadiusMultiplier: 1,
};

/**
 * Rendererfreie Autorität für einen einzelnen Burrow-Level. Ein späterer
 * Drei-Level-Run kann dieselbe Form mit mehreren Leveldefinitionen fortsetzen.
 */
export class BurrowRun {
  private mutableState: BurrowRunState;
  private readonly checkpoint: BurrowRunState;

  public constructor(level: BurrowLevelDefinition = LEVEL_1) {
    this.checkpoint = createInitialState(level);
    this.mutableState = cloneState(this.checkpoint);
  }

  public get state(): BurrowRunState {
    return this.mutableState;
  }

  public start(): void {
    if (this.mutableState.phase === "intro") {
      this.mutableState = { ...this.mutableState, phase: "hunt" };
    }
  }

  /** Advances only active gameplay. Shrine, selection and result phases pause time. */
  public advanceActiveStep(): void {
    if (!isActivePhase(this.mutableState.phase)) return;
    const activeSteps = this.mutableState.activeSteps + 1;
    this.mutableState = activeSteps >= this.mutableState.level.activeStepLimit
      ? { ...this.mutableState, activeSteps, phase: "failed" }
      : { ...this.mutableState, activeSteps };
  }

  public collectBiomass(amount = 1): boolean {
    if (!Number.isInteger(amount) || amount <= 0 || !isActivePhase(this.mutableState.phase)) return false;
    const levelBiomass = this.mutableState.levelBiomass + amount;
    const shrineAwakened = this.mutableState.shrineAwakened || levelBiomass >= this.mutableState.level.shrineBiomass;
    const awakenedNow = !this.mutableState.shrineAwakened && shrineAwakened;
    const phase = awakenedNow && this.mutableState.phase === "hunt"
      ? "shrine-ready"
      : this.mutableState.phase;
    this.mutableState = {
      ...this.mutableState,
      levelBiomass,
      shrineAwakened,
      phase,
    };
    return awakenedNow;
  }

  public openUpgrade(): boolean {
    if (this.mutableState.phase !== "shrine-ready") return false;
    this.mutableState = { ...this.mutableState, phase: "upgrade" };
    return true;
  }

  public chooseUpgrade(upgrade: BurrowUpgradeId): boolean {
    if (this.mutableState.phase !== "upgrade" || this.mutableState.selectedUpgrade !== null) return false;
    this.mutableState = {
      ...this.mutableState,
      selectedUpgrade: upgrade,
      build: buildForUpgrade(upgrade, "sprout"),
      phase: "finale",
    };
    return true;
  }

  public completeLevel(): boolean {
    if (this.mutableState.phase !== "finale") return false;
    this.mutableState = {
      ...this.mutableState,
      phase: "level-complete",
      totalBiomass: this.mutableState.totalBiomass + this.mutableState.levelBiomass,
      build: { ...this.mutableState.build, stage: "burrower" },
    };
    return true;
  }

  public restartFromCheckpoint(): void {
    this.mutableState = cloneState(this.checkpoint);
  }
}

export function buildForUpgrade(
  upgrade: BurrowUpgradeId | null,
  stage: BurrowGrowthStage = "sprout",
): BurrowRunBuild {
  if (upgrade === "skystrider") return { stage, burstSpeedMultiplier: 1.12, biteDamageBonus: 0, impactRadiusMultiplier: 1 };
  if (upgrade === "glutton") return { stage, burstSpeedMultiplier: 1, biteDamageBonus: 1, impactRadiusMultiplier: 1 };
  if (upgrade === "ram") return { stage, burstSpeedMultiplier: 1, biteDamageBonus: 0, impactRadiusMultiplier: 1.2 };
  return { ...SPROUT_BUILD, stage };
}

export function isActivePhase(phase: BurrowRunPhase): boolean {
  return phase === "hunt" || phase === "shrine-ready" || phase === "finale";
}

function createInitialState(level: BurrowLevelDefinition): BurrowRunState {
  return {
    level,
    phase: "intro",
    activeSteps: 0,
    levelBiomass: 0,
    totalBiomass: 0,
    shrineAwakened: false,
    selectedUpgrade: null,
    build: { ...SPROUT_BUILD },
  };
}

function cloneState(state: BurrowRunState): BurrowRunState {
  return { ...state, build: { ...state.build } };
}
