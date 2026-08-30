export type BurrowGrowthStage = "sprout" | "burrower" | "colossus";
export type BurrowLevelId = "meadow-edge" | "goblin-market";
export type BurrowRunPhase = "intro" | "hunt" | "shrine-ready" | "upgrade" | "finale" | "level-complete" | "failed";
export type BurrowUpgradeId = "skystrider" | "glutton" | "ram";
export type BurrowUpgradeRanks = Readonly<Record<BurrowUpgradeId, number>>;

export interface BurrowUpgradeDefinition { readonly id: BurrowUpgradeId; readonly name: string; readonly description: string; readonly rankOneDescription: string; readonly rankTwoDescription: string; }
export interface BurrowLevelDefinition { readonly id: BurrowLevelId; readonly number: 1 | 2; readonly name: string; readonly activeStepLimit: number; readonly shrineBiomass: number; readonly finaleHitPoints: number; readonly requiresStructureCollapse: boolean; }
export interface BurrowRunBuild { readonly stage: BurrowGrowthStage; readonly burstSpeedMultiplier: number; readonly burstCooldownMultiplier: number; readonly biteDamageBonus: number; readonly biteCooldownMultiplier: number; readonly impactRadiusMultiplier: number; readonly armoredDamageBonus: number; }
export interface BurrowRunState { readonly level: BurrowLevelDefinition; readonly phase: BurrowRunPhase; readonly activeSteps: number; readonly levelBiomass: number; readonly totalBiomass: number; readonly shrineAwakened: boolean; readonly selectedUpgrade: BurrowUpgradeId | null; readonly upgradeRanks: BurrowUpgradeRanks; readonly structureCollapsed: boolean; readonly build: BurrowRunBuild; }
export interface BurrowRunSnapshot { readonly state: BurrowRunState; readonly checkpoint: BurrowRunState; }

export const LEVEL_1: BurrowLevelDefinition = { id: "meadow-edge", number: 1, name: "Wiesenrand", activeStepLimit: 10_800, shrineBiomass: 5, finaleHitPoints: 8, requiresStructureCollapse: false };
export const LEVEL_2: BurrowLevelDefinition = { id: "goblin-market", number: 2, name: "Goblinmarkt", activeStepLimit: 10_800, shrineBiomass: 5, finaleHitPoints: 12, requiresStructureCollapse: true };
export const BURROW_UPGRADES: readonly BurrowUpgradeDefinition[] = [
  { id: "skystrider", name: "HIMMELSSTÜRMER", description: "+12 % Bursttempo · höhere Flugspitze", rankOneDescription: "+12 % Bursttempo · höhere Flugspitze", rankTwoDescription: "RANG 2 · −15 % Burst-Cooldown" },
  { id: "glutton", name: "VIELFRASS", description: "+1 Bissschaden bei gültigem Kopfkontakt", rankOneDescription: "+1 Bissschaden bei gültigem Kopfkontakt", rankTwoDescription: "RANG 2 · −20 % Biss-Cooldown" },
  { id: "ram", name: "RAMMBOCK", description: "+20 % Breach- und Einschlagkrater", rankOneDescription: "+20 % Breach- und Einschlagkrater", rankTwoDescription: "RANG 2 · +1 Schaden gegen gepanzerte Wagen" },
] as const;
const EMPTY_RANKS: BurrowUpgradeRanks = { skystrider: 0, glutton: 0, ram: 0 };

export class BurrowRun {
  private mutableState: BurrowRunState;
  private checkpoint: BurrowRunState;
  public constructor(level: BurrowLevelDefinition = LEVEL_1, snapshot?: BurrowRunSnapshot) {
    if (snapshot) { this.mutableState = cloneState(snapshot.state); this.checkpoint = cloneState(snapshot.checkpoint); return; }
    this.checkpoint = createInitialState(level, 0, EMPTY_RANKS); this.mutableState = cloneState(this.checkpoint);
  }
  public get state(): BurrowRunState { return this.mutableState; }
  public snapshot(): BurrowRunSnapshot { return { state: cloneState(this.mutableState), checkpoint: cloneState(this.checkpoint) }; }
  public start(): void { if (this.mutableState.phase === "intro") this.mutableState = { ...this.mutableState, phase: "hunt" }; }
  public advanceActiveStep(): void { if (!isActivePhase(this.mutableState.phase)) return; const activeSteps = this.mutableState.activeSteps + 1; this.mutableState = activeSteps >= this.mutableState.level.activeStepLimit ? { ...this.mutableState, activeSteps, phase: "failed" } : { ...this.mutableState, activeSteps }; }
  public collectBiomass(amount = 1): boolean {
    if (!Number.isInteger(amount) || amount <= 0 || !isActivePhase(this.mutableState.phase)) return false;
    const levelBiomass = this.mutableState.levelBiomass + amount; const awakenedNow = !this.mutableState.shrineAwakened && levelBiomass >= this.mutableState.level.shrineBiomass;
    this.mutableState = { ...this.mutableState, levelBiomass, shrineAwakened: this.mutableState.shrineAwakened || awakenedNow, phase: awakenedNow && this.mutableState.phase === "hunt" ? "shrine-ready" : this.mutableState.phase }; return awakenedNow;
  }
  public registerStructureCollapse(): boolean { if (!this.mutableState.level.requiresStructureCollapse || this.mutableState.structureCollapsed) return false; this.mutableState = { ...this.mutableState, structureCollapsed: true }; return true; }
  public openUpgrade(): boolean { if (this.mutableState.phase !== "shrine-ready") return false; this.mutableState = { ...this.mutableState, phase: "upgrade" }; return true; }
  public availableUpgrades(): readonly BurrowUpgradeDefinition[] { const chosen = this.mutableState.selectedUpgrade; return this.mutableState.level.number === 1 || !chosen ? BURROW_UPGRADES.filter((u) => this.mutableState.upgradeRanks[u.id] === 0) : BURROW_UPGRADES.filter((u) => u.id === chosen && this.mutableState.upgradeRanks[u.id] === 1); }
  public chooseUpgrade(upgrade: BurrowUpgradeId): boolean { if (this.mutableState.phase !== "upgrade" || !this.availableUpgrades().some((entry) => entry.id === upgrade)) return false; const upgradeRanks = { ...this.mutableState.upgradeRanks, [upgrade]: this.mutableState.upgradeRanks[upgrade] + 1 }; this.mutableState = { ...this.mutableState, selectedUpgrade: upgrade, upgradeRanks, build: buildForRanks(upgradeRanks, stageForLevel(this.mutableState.level.number)), phase: "finale" }; return true; }
  public canBeginFinale(): boolean { return this.mutableState.phase === "finale" && (!this.mutableState.level.requiresStructureCollapse || this.mutableState.structureCollapsed); }
  public completeLevel(): boolean { if (!this.canBeginFinale()) return false; this.mutableState = { ...this.mutableState, phase: "level-complete", totalBiomass: this.mutableState.totalBiomass + this.mutableState.levelBiomass, build: buildForRanks(this.mutableState.upgradeRanks, this.mutableState.level.number === 1 ? "burrower" : "colossus") }; return true; }
  public continueToLevel2(): boolean { if (this.mutableState.level.id !== "meadow-edge" || this.mutableState.phase !== "level-complete") return false; const state = createInitialState(LEVEL_2, this.mutableState.totalBiomass, this.mutableState.upgradeRanks, this.mutableState.selectedUpgrade); this.checkpoint = cloneState(state); this.mutableState = state; return true; }
  public restartFromCheckpoint(): void { this.mutableState = cloneState(this.checkpoint); }
}

export function buildForRanks(ranks: BurrowUpgradeRanks, stage: BurrowGrowthStage): BurrowRunBuild {
  const growth = stage === "sprout" ? { burst: 1, bite: 0, impact: 1 } : stage === "burrower" ? { burst: 400 / 370, bite: 1, impact: 1.1 } : { burst: 430 / 370, bite: 2, impact: 1.25 };
  return { stage, burstSpeedMultiplier: growth.burst * (ranks.skystrider >= 1 ? 1.12 : 1), burstCooldownMultiplier: ranks.skystrider >= 2 ? 0.85 : 1, biteDamageBonus: growth.bite + (ranks.glutton >= 1 ? 1 : 0), biteCooldownMultiplier: ranks.glutton >= 2 ? 0.8 : 1, impactRadiusMultiplier: growth.impact * (ranks.ram >= 1 ? 1.2 : 1), armoredDamageBonus: ranks.ram >= 2 ? 1 : 0 };
}
export function buildForUpgrade(upgrade: BurrowUpgradeId | null, stage: BurrowGrowthStage = "sprout"): BurrowRunBuild { return buildForRanks({ ...EMPTY_RANKS, ...(upgrade ? { [upgrade]: 1 } : {}) }, stage); }
export function isActivePhase(phase: BurrowRunPhase): boolean { return phase === "hunt" || phase === "shrine-ready" || phase === "finale"; }
function stageForLevel(level: 1 | 2): BurrowGrowthStage { return level === 1 ? "sprout" : "burrower"; }
function createInitialState(level: BurrowLevelDefinition, totalBiomass: number, upgradeRanks: BurrowUpgradeRanks, selectedUpgrade: BurrowUpgradeId | null = null): BurrowRunState { return { level, phase: "intro", activeSteps: 0, levelBiomass: 0, totalBiomass, shrineAwakened: false, selectedUpgrade, upgradeRanks: { ...upgradeRanks }, structureCollapsed: false, build: buildForRanks(upgradeRanks, stageForLevel(level.number)) }; }
function cloneState(state: BurrowRunState): BurrowRunState { return { ...state, build: { ...state.build }, upgradeRanks: { ...state.upgradeRanks } }; }
