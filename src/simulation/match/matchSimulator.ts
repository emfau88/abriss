import type { WeaponId } from "../ai/RocketActionPlanner";
import { PERSONALITY_CYCLE } from "./commands";
import {
  activeSimulationUnit,
  type MatchSimulationState,
} from "./matchSimulationState";
import { planTurn, type TurnPlanKind } from "./planTurn";
import { runMatch } from "./runMatch";

/**
 * Massen-Simulator der Match-Engine (Task 022, Review-Phase C): führt
 * injizierte Szenarien headless aus und verdichtet sie zu Kennzahlen für
 * Balance- und Diversitätsfragen. Die Engine kennt weder Karten-Assets noch
 * Dateisystem; Szenarien (Karte × Seed als Zustandsfabrik) liefert die
 * aufrufende Schicht. Vollständig deterministisch.
 */

export interface SimulationScenario {
  readonly mapId: string;
  readonly seed: number;
  createState(): MatchSimulationState;
}

/** Sonde für die Erstzug-Divergenz: ein Startzustand pro Eröffnungsfigur. */
export interface DivergenceProbe {
  readonly mapId: string;
  readonly label: string;
  createState(): MatchSimulationState;
}

export interface SimulateOptions {
  readonly maximumTurns?: number;
  readonly divergenceProbes?: readonly DivergenceProbe[];
}

export interface WeaponUsageSummary {
  readonly weaponId: WeaponId;
  readonly attacks: number;
  /** Anteil an allen Angriffszügen der Karte, gerundet auf 4 Stellen. */
  readonly share: number;
  readonly totalDamage: number;
}

export interface WeaponDiagnosisSummary {
  readonly weaponId: WeaponId;
  /** Züge, in denen die Waffe im Arsenal der Planung war. */
  readonly consideredTurns: number;
  /** Züge mit mindestens einem gültigen Kandidaten dieser Waffe. */
  readonly validTurns: number;
  readonly invalidReasons: Readonly<Record<string, number>>;
}

export interface FirstTurnDivergenceSummary {
  readonly probes: number;
  /** Sonden, bei denen Persönlichkeiten unterschiedliche Kandidaten wählen. */
  readonly divergentSelections: number;
  readonly divergentWeapons: number;
  readonly divergentMovements: number;
}

export interface MapSimulationSummary {
  readonly mapId: string;
  readonly matches: number;
  readonly seeds: readonly number[];
  readonly outcomes: {
    readonly crew: number;
    readonly rivals: number;
    readonly draw: number;
  };
  readonly turnStats: {
    readonly minimum: number;
    readonly median: number;
    readonly maximum: number;
  };
  readonly planKinds: Record<TurnPlanKind, number>;
  readonly weaponUsage: readonly WeaponUsageSummary[];
  readonly weaponDiagnosis: readonly WeaponDiagnosisSummary[];
  readonly selfHits: number;
  readonly friendlyHits: number;
  readonly outOfWorldKnockouts: number;
  readonly firstTurnDivergence: FirstTurnDivergenceSummary | null;
}

export interface SimulationReport {
  readonly maps: readonly MapSimulationSummary[];
}

const WEAPON_IDS: readonly WeaponId[] = ["rocket", "grenade", "breaker"];

function roundShare(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}

function median(sortedValues: readonly number[]): number {
  const middle = Math.floor(sortedValues.length / 2);

  if (sortedValues.length % 2 === 1) {
    return sortedValues[middle] ?? 0;
  }

  return ((sortedValues[middle - 1] ?? 0) + (sortedValues[middle] ?? 0)) / 2;
}

export function simulateMatches(
  scenarios: readonly SimulationScenario[],
  options: SimulateOptions = {},
): SimulationReport {
  const mapIds = [...new Set(scenarios.map((scenario) => scenario.mapId))];
  const maps = mapIds.map((mapId): MapSimulationSummary => {
    const mapScenarios = scenarios.filter(
      (scenario) => scenario.mapId === mapId,
    );
    const outcomes = { crew: 0, rivals: 0, draw: 0 };
    const turnCounts: number[] = [];
    const planKinds: Record<TurnPlanKind, number> = {
      attack: 0,
      reposition: 0,
      skip: 0,
    };
    const weaponAttacks = new Map<WeaponId, { attacks: number; damage: number }>(
      WEAPON_IDS.map((weaponId) => [weaponId, { attacks: 0, damage: 0 }]),
    );
    const weaponDiagnosis = new Map<
      WeaponId,
      {
        consideredTurns: number;
        validTurns: number;
        invalidReasons: Record<string, number>;
      }
    >(
      WEAPON_IDS.map((weaponId) => [
        weaponId,
        { consideredTurns: 0, validTurns: 0, invalidReasons: {} },
      ]),
    );
    let selfHits = 0;
    let friendlyHits = 0;
    let outOfWorldKnockouts = 0;

    for (const scenario of mapScenarios) {
      const state = scenario.createState();
      const teamByUnitId = new Map(
        state.units.map((unit) => [unit.id, unit.team] as const),
      );
      const result = runMatch(state, {
        collectDiagnostics: true,
        ...(options.maximumTurns ? { maximumTurns: options.maximumTurns } : {}),
      });
      outcomes[result.outcome] += 1;
      turnCounts.push(result.turnCount);

      for (const diagnostic of result.diagnostics ?? []) {
        for (const availability of diagnostic.weaponAvailability) {
          const entry = weaponDiagnosis.get(availability.weaponId);

          if (!entry) {
            continue;
          }

          entry.consideredTurns += 1;

          if (availability.valid > 0) {
            entry.validTurns += 1;
          }

          for (const [reason, count] of Object.entries(
            availability.invalidReasons,
          )) {
            entry.invalidReasons[reason] =
              (entry.invalidReasons[reason] ?? 0) + count;
          }
        }
      }

      for (const turn of result.turns) {
        planKinds[turn.planKind] += 1;
        let turnWeapon: WeaponId | null = null;

        for (const event of turn.events) {
          if (event.type === "projectile-resolved") {
            turnWeapon = event.candidate.weaponId;
            const usage = weaponAttacks.get(turnWeapon);
            if (usage) {
              usage.attacks += 1;
            }
          } else if (event.type === "damage-applied") {
            if (turnWeapon) {
              const usage = weaponAttacks.get(turnWeapon);
              if (usage) {
                usage.damage += event.damage;
              }
            }
            if (event.unitId === turn.activeUnitId) {
              selfHits += 1;
            } else if (
              teamByUnitId.get(event.unitId) ===
              teamByUnitId.get(turn.activeUnitId)
            ) {
              friendlyHits += 1;
            }
          } else if (
            (event.type === "knockback-resolved" &&
              event.defeatedOutOfWorld) ||
            (event.type === "fall-resolved" && event.defeated)
          ) {
            outOfWorldKnockouts += 1;
          }
        }
      }
    }

    const totalAttacks = [...weaponAttacks.values()].reduce(
      (sum, usage) => sum + usage.attacks,
      0,
    );
    const sortedTurnCounts = [...turnCounts].sort((left, right) => left - right);
    const probes = (options.divergenceProbes ?? []).filter(
      (probe) => probe.mapId === mapId,
    );

    return {
      mapId,
      matches: mapScenarios.length,
      seeds: mapScenarios.map((scenario) => scenario.seed),
      outcomes,
      turnStats: {
        minimum: sortedTurnCounts[0] ?? 0,
        median: median(sortedTurnCounts),
        maximum: sortedTurnCounts[sortedTurnCounts.length - 1] ?? 0,
      },
      planKinds,
      weaponUsage: WEAPON_IDS.map((weaponId) => {
        const usage = weaponAttacks.get(weaponId) ?? { attacks: 0, damage: 0 };

        return {
          weaponId,
          attacks: usage.attacks,
          share: totalAttacks > 0 ? roundShare(usage.attacks / totalAttacks) : 0,
          totalDamage: usage.damage,
        };
      }),
      weaponDiagnosis: WEAPON_IDS.map((weaponId) => {
        const entry = weaponDiagnosis.get(weaponId)!;

        return {
          weaponId,
          consideredTurns: entry.consideredTurns,
          validTurns: entry.validTurns,
          invalidReasons: entry.invalidReasons,
        };
      }),
      selfHits,
      friendlyHits,
      outOfWorldKnockouts,
      firstTurnDivergence:
        probes.length > 0 ? measureFirstTurnDivergence(probes) : null,
    };
  });

  return { maps };
}

function measureFirstTurnDivergence(
  probes: readonly DivergenceProbe[],
): FirstTurnDivergenceSummary {
  let divergentSelections = 0;
  let divergentWeapons = 0;
  let divergentMovements = 0;

  for (const probe of probes) {
    const selections = new Set<string>();
    const weapons = new Set<string>();
    const movements = new Set<string>();

    for (const personality of PERSONALITY_CYCLE) {
      const state = probe.createState();
      activeSimulationUnit(state).personality = personality;
      const plan = planTurn(state);
      selections.add(plan.action.selected?.id ?? "none");
      weapons.add(plan.action.selected?.weaponId ?? "none");
      movements.add(plan.movement.id);
    }

    if (selections.size > 1) {
      divergentSelections += 1;
    }
    if (weapons.size > 1) {
      divergentWeapons += 1;
    }
    if (movements.size > 1) {
      divergentMovements += 1;
    }
  }

  return {
    probes: probes.length,
    divergentSelections,
    divergentWeapons,
    divergentMovements,
  };
}

const WEAPON_LABELS: Record<WeaponId, string> = {
  rocket: "Panzerfaust",
  grenade: "Wurfgranate",
  breaker: "Geländebrecher",
};

/** Deterministischer Markdown-Bericht ohne Zeitstempel. */
export function renderSimulationReport(report: SimulationReport): string {
  const lines: string[] = [
    "# Simulationsbericht der Match-Engine",
    "",
    "Deterministisch erzeugt über `npm run simulate` (Task 022).",
    "Gleiche Szenarien ergeben byte-identische Berichte.",
  ];

  for (const map of report.maps) {
    const attackTotal = map.weaponUsage.reduce(
      (sum, usage) => sum + usage.attacks,
      0,
    );
    lines.push(
      "",
      `## Karte \`${map.mapId}\``,
      "",
      `- Matches: ${map.matches} (Seeds: ${map.seeds.join(", ")})`,
      `- Ausgänge: Crew ${map.outcomes.crew} · Rivalen ${map.outcomes.rivals} · Unentschieden ${map.outcomes.draw}`,
      `- Zuglängen: Minimum ${map.turnStats.minimum} · Median ${map.turnStats.median} · Maximum ${map.turnStats.maximum}`,
      `- Plan-Arten: ${map.planKinds.attack} Angriffe · ${map.planKinds.reposition} Positionszüge · ${map.planKinds.skip} Aussetzer`,
      `- Trefferbild: ${map.selfHits} Eigentreffer · ${map.friendlyHits} Kameradentreffer · ${map.outOfWorldKnockouts} Out-of-world-Ausschaltungen`,
      "",
      "| Waffe | Angriffe | Anteil | Gesamtschaden |",
      "| --- | ---: | ---: | ---: |",
    );

    for (const usage of map.weaponUsage) {
      lines.push(
        `| ${WEAPON_LABELS[usage.weaponId]} | ${usage.attacks} von ${attackTotal} | ${(usage.share * 100).toFixed(1)} % | ${usage.totalDamage} |`,
      );
    }

    lines.push(
      "",
      "| Waffe | in Planung betrachtet | Züge mit gültigem Kandidat | häufigste Scheiterngründe |",
      "| --- | ---: | ---: | --- |",
    );

    for (const diagnosis of map.weaponDiagnosis) {
      const reasons = Object.entries(diagnosis.invalidReasons)
        .sort((left, right) => right[1] - left[1])
        .slice(0, 2)
        .map(([reason, count]) => `${reason} (${count})`)
        .join(" · ");
      lines.push(
        `| ${WEAPON_LABELS[diagnosis.weaponId]} | ${diagnosis.consideredTurns} | ${diagnosis.validTurns} | ${reasons.length > 0 ? reasons : "–"} |`,
      );
    }

    if (map.firstTurnDivergence) {
      const divergence = map.firstTurnDivergence;
      lines.push(
        "",
        `Erstzug-Divergenz über ${divergence.probes} Eröffnungssonden × ${PERSONALITY_CYCLE.length} Persönlichkeiten:`,
        `${divergence.divergentSelections} Sonden wählen unterschiedliche Kandidaten, ${divergence.divergentWeapons} unterschiedliche Waffen, ${divergence.divergentMovements} unterschiedliche Bewegungen.`,
      );
    }
  }

  lines.push("");
  return lines.join("\n");
}
