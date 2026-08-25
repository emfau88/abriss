import type { Point } from "./BurrowTerrain";
import { BurrowTerrain } from "./BurrowTerrain";

export interface StructureSupportDefinition {
  readonly id: string;
  readonly position: Point;
}

export interface StructureSupportState extends StructureSupportDefinition {
  readonly active: boolean;
}

export interface BurrowStructureState {
  readonly supports: readonly StructureSupportState[];
  readonly collapsed: boolean;
}

export interface StructureStepResult {
  readonly lostSupportIds: readonly string[];
  readonly collapsedNow: boolean;
}

/**
 * Eine minimale Fachstruktur für Gate 3. Die Stützen besitzen keine Physik:
 * sie lesen ausschließlich dieselbe Terrainmaske, die der Burrower entfernt.
 */
export class BurrowStructure {
  private mutableState: BurrowStructureState;

  public constructor(
    private readonly terrain: BurrowTerrain,
    supports: readonly StructureSupportDefinition[],
    private readonly collapseAfterLostSupports = 2,
  ) {
    if (supports.length < 2) {
      throw new Error("A Burrow structure needs at least two supports.");
    }
    if (collapseAfterLostSupports < 1 || collapseAfterLostSupports > supports.length) {
      throw new Error("The collapse threshold must be within the support count.");
    }
    this.mutableState = {
      supports: supports.map((support) => ({ ...support, position: { ...support.position }, active: true })),
      collapsed: false,
    };
  }

  public get state(): BurrowStructureState {
    return this.mutableState;
  }

  public step(): StructureStepResult {
    if (this.mutableState.collapsed) {
      return { lostSupportIds: [], collapsedNow: false };
    }

    const lostSupportIds: string[] = [];
    const supports = this.mutableState.supports.map((support) => {
      if (!support.active || this.terrain.isSolidWorld(support.position.x, support.position.y)) {
        return support;
      }
      lostSupportIds.push(support.id);
      return { ...support, active: false };
    });
    const lostSupportCount = supports.filter((support) => !support.active).length;
    const collapsedNow = lostSupportCount >= this.collapseAfterLostSupports;
    this.mutableState = { supports, collapsed: collapsedNow };
    return { lostSupportIds, collapsedNow };
  }
}
