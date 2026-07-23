import type { Vector2 } from "../ballistics/Ballistics";

/**
 * Task 028 – Interaktive Map-Objekte, erster Typ: explosives Fass.
 *
 * Bewusst KEIN Teil der Ballistik und KEINE allgemeine Starrkörperphysik
 * (Nichtziel, vgl. AGENTS.md / D-022). Ein Fass reagiert nur: Liegt es im
 * Radius einer Explosion, detoniert es und erzeugt eine eigene Explosion, die
 * wiederum Figuren, Terrain und weitere Fässer treffen kann. Die Kette wird
 * hier als reine, deterministische Funktion aufgelöst; das Mutieren von
 * Figuren und Terrain bleibt dem Aufrufer (`resolveTurn`) vorbehalten, damit
 * die Match-Engine die einzige Autorität bleibt (D-029).
 *
 * Erstellt von Claude Opus 4.8 (Anthropic).
 */

export type InteractableType = "explosive-barrel";
export type InteractableState = "intact" | "destroyed";

export interface InteractableObject {
  readonly id: string;
  readonly type: InteractableType;
  readonly position: Vector2;
  state: InteractableState;
  /** Radius der eigenen Detonation. */
  readonly explosionRadius: number;
  /** Maximalschaden der eigenen Detonation (im Zentrum). */
  readonly maximumDamage: number;
  /** Rückstoß-Höchstgeschwindigkeit der eigenen Detonation. */
  readonly maximumKnockbackSpeed: number;
}

/** Serialisierbare Definition aus der Kartendaten-Ebene. */
export interface InteractableDefinition {
  readonly id: string;
  readonly type: InteractableType;
  /** Weltspalte; die Höhe wird beim Erzeugen aus dem Terrain bestimmt. */
  readonly spawnX: number;
}

/** Standardwerte des explosiven Fasses – bewusst wuchtig, damit die Kette zählt. */
export const EXPLOSIVE_BARREL_DEFAULTS = {
  explosionRadius: 92,
  maximumDamage: 82,
  maximumKnockbackSpeed: 470,
} as const;

/**
 * Eine Fass-Detonation in der Reaktionskette. Die auslösende Primärexplosion ist
 * hier NICHT enthalten – `explosions` meldet ausschließlich Fässer, daher ist
 * die Quelle immer ein echtes Fass und die Tiefe immer ≥ 1.
 */
export interface ChainExplosion {
  readonly center: Vector2;
  readonly radius: number;
  readonly maximumDamage: number;
  readonly maximumKnockbackSpeed: number;
  /** ID des detonierten Fasses (immer gesetzt). */
  readonly sourceInteractableId: string;
  /** Kettentiefe: 1 = direkt vom Auslöser, 2 = von einem anderen Fass, usw. */
  readonly depth: number;
}

/**
 * Harte Tiefengrenze der Kette (Endlosschutz und Lesbarkeit, vgl. Richtlinie
 * §7: „meist zwei bis vier gut lesbare Schritte"). Die Primärexplosion ist
 * Tiefe 0; danach sind bis zu vier Fass-Stufen erlaubt.
 */
export const MAXIMUM_CHAIN_DEPTH = 4;

export interface ReactionChainInput {
  /** Die auslösende Explosion (i. d. R. der Projektileinschlag). */
  readonly trigger: {
    readonly center: Vector2;
    readonly radius: number;
  };
  /** Alle Fässer im Match; nur intakte reagieren. */
  readonly interactables: readonly InteractableObject[];
}

export interface ReactionChainResult {
  /**
   * Die durch Fässer ausgelösten Sekundärexplosionen in
   * Auslösungsreihenfolge (deterministisch). Enthält NICHT die Primärexplosion.
   */
  readonly explosions: readonly ChainExplosion[];
  /** IDs der in dieser Kette zerstörten Fässer, in Auslösungsreihenfolge. */
  readonly destroyedInteractableIds: readonly string[];
}

function isWithin(center: Vector2, point: Vector2, radius: number): boolean {
  const dx = center.x - point.x;
  const dy = center.y - point.y;
  return dx * dx + dy * dy <= radius * radius;
}

/**
 * Löst die Fass-Kette deterministisch auf. Reihenfolge: Breitensuche über die
 * Detonationsstufen; innerhalb einer Stufe stabil nach Objekt-ID. Ein Fass
 * detoniert höchstens einmal. Die Funktion verändert die übergebenen Objekte
 * NICHT – sie meldet nur, was passiert; der Aufrufer setzt die Zustände und
 * wendet Schaden/Terrain an.
 */
export function resolveReactionChain(
  input: ReactionChainInput,
): ReactionChainResult {
  const explosions: ChainExplosion[] = [];
  const destroyedIds: string[] = [];
  const detonated = new Set<string>();

  // Nur intakte Fässer können reagieren; stabile Sortierung nach ID.
  // `filter` liefert bereits eine frische Liste, daher kein zusätzliches slice.
  const reactive = input.interactables
    .filter((object) => object.state === "intact")
    .sort((left, right) => left.id.localeCompare(right.id));

  // Stufe 0 = Primärexplosion. Wir sammeln pro Stufe die neu ausgelösten
  // Fässer und arbeiten sie stufenweise ab, bis die Tiefengrenze erreicht ist.
  let frontier: { center: Vector2; radius: number }[] = [
    { center: input.trigger.center, radius: input.trigger.radius },
  ];
  let depth = 1;

  while (frontier.length > 0 && depth <= MAXIMUM_CHAIN_DEPTH) {
    const nextFrontier: { center: Vector2; radius: number }[] = [];

    for (const barrel of reactive) {
      if (detonated.has(barrel.id)) {
        continue;
      }

      const triggeredBySome = frontier.some((source) =>
        isWithin(source.center, barrel.position, source.radius),
      );

      if (!triggeredBySome) {
        continue;
      }

      detonated.add(barrel.id);
      destroyedIds.push(barrel.id);
      const explosion: ChainExplosion = {
        center: { ...barrel.position },
        radius: barrel.explosionRadius,
        maximumDamage: barrel.maximumDamage,
        maximumKnockbackSpeed: barrel.maximumKnockbackSpeed,
        sourceInteractableId: barrel.id,
        depth,
      };
      explosions.push(explosion);
      nextFrontier.push({
        center: explosion.center,
        radius: explosion.radius,
      });
    }

    frontier = nextFrontier;
    depth += 1;
  }

  return { explosions, destroyedInteractableIds: destroyedIds };
}
