import type { BurrowMotionTuning } from "./BurrowMotion";

export type BurrowGrowthStage = "sprout" | "hunter" | "burrower";
export type BurrowMutation = "trailrunner" | "vacuum" | "chain";
export type BurrowRunPhase = "intro" | "feeding" | "mutation" | "surface" | "complete";
export const GROWTH = { hunter: 40, mutation: 80, burrower: 180, surface: 240 } as const;

export const BURROW_MUTATIONS = [
  { id: "trailrunner", name: "SPURFLITZER", description: "Auf deiner Schnellspur:\n+25 % Bursttempo und Wendigkeit.", color: 0x7fdbff },
  { id: "vacuum", name: "SOGMAUL", description: "Beim Burst lose Nahrung\nvor deinem Maul einsaugen.", color: 0xd7a1ff },
  { id: "chain", name: "KETTENFRESSER", description: "Wurm gefressen? Dein Burst\nist 0,7 Sekunden früher bereit.", color: 0xffc875 },
] as const satisfies readonly { id: BurrowMutation; name: string; description: string; color: number }[];

export interface BurrowRunState {
  readonly phase: BurrowRunPhase;
  readonly biomass: number;
  readonly activeSteps: number;
  readonly preyEaten: number;
  readonly largePreyEaten: number;
  readonly mutation: BurrowMutation | null;
}
export interface BurrowRunBuild extends BurrowMotionTuning {
  readonly stage: BurrowGrowthStage;
  readonly power: 0 | 1 | 2;
  readonly label: string;
  readonly bodyCount: number;
  readonly headScale: number;
  readonly bodyScale: number;
  readonly mutation: BurrowMutation | null;
}

export class BurrowRun {
  private mutableState: BurrowRunState;
  public constructor(snapshot?: BurrowRunState) {
    this.mutableState = snapshot ? { ...snapshot } : {
      phase: "intro", biomass: 0, activeSteps: 0, preyEaten: 0, largePreyEaten: 0, mutation: null,
    };
  }
  public get state(): BurrowRunState { return this.mutableState; }
  public get active(): boolean { return this.state.phase === "feeding" || this.state.phase === "surface"; }
  public get build(): BurrowRunBuild { return buildForBiomass(this.state.biomass, this.state.mutation); }
  public snapshot(): BurrowRunState { return { ...this.state }; }
  public start(): void {
    if (this.state.phase === "intro") this.mutableState = { ...this.state, phase: "feeding" };
  }
  public advanceActiveStep(): void {
    if (this.active) this.mutableState = { ...this.state, activeSteps: this.state.activeSteps + 1 };
  }
  public feed(biomass: number, preyEaten = 0, largePreyEaten = 0): boolean {
    if (!this.active || !Number.isSafeInteger(biomass) || biomass <= 0 ||
        !Number.isSafeInteger(preyEaten) || preyEaten < 0 ||
        !Number.isSafeInteger(largePreyEaten) || largePreyEaten < 0 || largePreyEaten > preyEaten) return false;
    this.mutableState = { ...this.state, biomass: this.state.biomass + biomass,
      preyEaten: this.state.preyEaten + preyEaten, largePreyEaten: this.state.largePreyEaten + largePreyEaten };
    this.updatePhase();
    return true;
  }
  public chooseMutation(mutation: BurrowMutation): boolean {
    if (this.state.phase !== "mutation" || this.state.mutation ||
        !BURROW_MUTATIONS.some((entry) => entry.id === mutation)) return false;
    this.mutableState = { ...this.state, mutation, phase: "feeding" };
    this.updatePhase();
    return true;
  }
  public complete(): boolean {
    if (this.state.phase !== "surface") return false;
    this.mutableState = { ...this.state, phase: "complete" };
    return true;
  }
  private updatePhase(): void {
    if (this.state.biomass >= GROWTH.mutation && !this.state.mutation) {
      this.mutableState = { ...this.state, phase: "mutation" };
    } else if (this.state.biomass >= GROWTH.surface && this.state.largePreyEaten > 0 && this.state.mutation) {
      this.mutableState = { ...this.state, phase: "surface" };
    }
  }
}

export function buildForBiomass(biomass: number, mutation: BurrowMutation | null = null): BurrowRunBuild {
  const mass = Number.isFinite(biomass) ? Math.max(0, biomass) : 0;
  const power = mass >= GROWTH.burrower ? 2 : mass >= GROWTH.hunter ? 1 : 0;
  const fraction = Math.min(1, mass / GROWTH.surface);
  return {
    stage: power === 0 ? "sprout" : power === 1 ? "hunter" : "burrower", power,
    label: ["KEIMLING", "JÄGER", "GRÄBER"][power]!,
    bodyCount: 10 + Math.floor(fraction * 18), headScale: 0.78 + fraction * 0.38,
    bodyScale: 0.65 + fraction * 0.4, mutation,
    movementSpeedMultiplier: 1 + power * 0.075, burstSpeedMultiplier: 1 + power * 0.11,
    burstCooldownMultiplier: 1, impactRadiusMultiplier: 1 + power * 0.1,
    trailBurstMultiplier: mutation === "trailrunner" ? 1.25 : 1,
    trailTurnMultiplier: mutation === "trailrunner" ? 1.25 : 1,
  };
}
