import type { MatchTurnEvent } from "./resolveTurn";

/**
 * Task 027 – Match-Chronik.
 *
 * Eine reine, deterministische Deutungsschicht über dem bereits vorhandenen
 * Ereignisprotokoll der Match-Engine (`resolveTurn`/`runMatch`). Sie ändert
 * KEINEN Simulationszustand und liest ausschließlich die Events. Aus dem
 * Rohprotokoll leitet sie die 2–3 markantesten, tonrichtig erzählten Momente
 * eines Matches ab, die der Einsatzbericht und später das Management-Hub
 * aufgreifen.
 *
 * Determinismus: gleicher Match-Verlauf ⇒ gleiche Chronik. Kein Zufall, keine
 * Uhrzeit. Die Auswahl priorisiert nach `severity` und – bei Gleichstand –
 * stabil nach Zugnummer und Einheiten-ID.
 *
 * Erstellt von Claude Opus 4.8 (Anthropic) im Rahmen von Task 027.
 */

export type ChronicleMomentType =
  | "self-hit"
  | "friendly-fire"
  | "world-fall"
  | "hard-landing"
  | "misfire"
  | "large-crater"
  | "turn-skipped";

export interface ChronicleMoment {
  readonly type: ChronicleMomentType;
  /** Zugnummer, in der der Moment ausgelöst wurde. */
  readonly turnNumber: number;
  /** Die handelnde Figur des Zugs (Schütze bzw. übersprungene Figur). */
  readonly actorUnitId: string;
  /** Direkt betroffene Figur, falls abweichend vom Akteur. */
  readonly subjectUnitId: string | null;
  /**
   * Priorität für Auswahl und Reihenfolge. Höher = markanter. Ergibt sich aus
   * Momenttyp-Basiswert plus fallweisem Zuschlag (z. B. Schadenshöhe).
   */
  readonly severity: number;
  /** Fertiger, erzählbarer Text – Figurennamen sind bereits eingesetzt. */
  readonly text: string;
}

/** Ein Zug so, wie ihn die Engine protokolliert – nur das hier Benötigte. */
export interface ChronicleTurnInput {
  readonly turnNumber: number;
  readonly activeUnitId: string;
  readonly events: readonly MatchTurnEvent[];
}

export interface ChronicleUnitInfo {
  readonly team: string;
  readonly displayName: string;
}

export interface MatchChronicleInput {
  readonly turns: readonly ChronicleTurnInput[];
  /** Team- und Namensauflösung je Einheit (aus dem Manager-/Simulationsmodell). */
  readonly unitInfo: ReadonlyMap<string, ChronicleUnitInfo>;
}

/** Basispriorität je Momenttyp; höher schlägt niedriger bei der Auswahl. */
const BASE_SEVERITY: Record<ChronicleMomentType, number> = {
  "self-hit": 90,
  "world-fall": 80,
  "friendly-fire": 70,
  "hard-landing": 55,
  "large-crater": 40,
  misfire: 30,
  "turn-skipped": 15,
};

/**
 * Ab dieser entfernten Zellzahl gilt ein Terrain-Krater als „groß". Kalibriert
 * an echten Headless-Matches (Claude Opus 4.8): reale Krater lagen bei
 * median ~1790 und p90 ~2600–3200 Zellen; dieser Schwellwert greift damit nur
 * das obere Zehntel ab, statt praktisch jeden Einschlag zu melden.
 */
const LARGE_CRATER_CELLS = 2600;

const MAX_MOMENTS = 3;

/**
 * Textvarianten für den häufigsten Momenttyp (großer Krater), damit
 * wiederholte Einsätze und verschiedene Figuren nicht denselben Satz zeigen
 * (Ton-Regel: geringe Wiederholungsrate). Die Auswahl ist deterministisch über
 * die Zugnummer – gleicher Verlauf ⇒ gleiche Zeile.
 */
const LARGE_CRATER_LINES: readonly string[] = [
  "{actor} hinterlässt einen Krater, den man vom Nachbardock aus sieht.",
  "{actor} baut spontan eine neue Schlucht in die Karte.",
  "{actor} sorgt für dringend benötigte frische Luft im Untergrund.",
];

/** Deterministische Variantenwahl aus einer nicht-leeren Liste. */
function pickVariant(lines: readonly string[], key: number): string {
  return lines[((key % lines.length) + lines.length) % lines.length] ?? lines[0]!;
}

export function buildMatchChronicle(
  input: MatchChronicleInput,
): readonly ChronicleMoment[] {
  const moments: ChronicleMoment[] = [];

  for (const turn of input.turns) {
    collectTurnMoments(turn, input.unitInfo, moments);
  }

  // Ein Einsatzbericht soll Vielfalt zeigen, keine Wiederholung derselben Art
  // (vgl. Ton-Regel „keine Spruchflut"). Große Krater etwa treten in fast jedem
  // Match mehrfach auf – davon bleibt nur der markanteste. Selbsttreffer,
  // Friendly Fire und Weltstürze sind seltener und je Vorfall einzeln erzählt.
  const deduped = keepStrongestPerRepeatingType(moments.sort(compareMoments));

  return deduped.slice(0, MAX_MOMENTS);
}

/**
 * Behält von „häufigen" Momenttypen nur den stärksten Eintrag, damit der
 * Bericht nicht dreimal denselben Krater meldet. Charakterstarke Einzelfälle
 * (Selbsttreffer, Friendly Fire, Weltsturz) bleiben mehrfach erhalten, weil
 * jeder davon eine eigene kleine Geschichte ist. Erwartet eine bereits nach
 * Priorität sortierte Liste und bewahrt deren Reihenfolge.
 */
const REPEAT_LIMITED_TYPES: ReadonlySet<ChronicleMomentType> = new Set([
  "large-crater",
  "misfire",
  "turn-skipped",
]);

function keepStrongestPerRepeatingType(
  sorted: readonly ChronicleMoment[],
): ChronicleMoment[] {
  const seen = new Set<ChronicleMomentType>();
  const result: ChronicleMoment[] = [];

  for (const moment of sorted) {
    if (REPEAT_LIMITED_TYPES.has(moment.type)) {
      if (seen.has(moment.type)) {
        continue;
      }
      seen.add(moment.type);
    }

    result.push(moment);
  }

  return result;
}

function collectTurnMoments(
  turn: ChronicleTurnInput,
  unitInfo: ReadonlyMap<string, ChronicleUnitInfo>,
  out: ChronicleMoment[],
): void {
  const actorId = turn.activeUnitId;
  const actorTeam = unitInfo.get(actorId)?.team ?? null;
  // Namen direkt beim Sammeln einsetzen – die Aufrufer haben ohnehin genau
  // diese unitInfo, ein separater Render-Schritt bringt keinen Mehrwert.
  const nameOf = (unitId: string): string =>
    unitInfo.get(unitId)?.displayName ?? unitId;
  const actorName = nameOf(actorId);

  // Übersprungener Zug: nur relevant, wenn wirklich nichts geschah.
  if (turn.events.length === 1 && turn.events[0]?.type === "turn-skipped") {
    out.push({
      type: "turn-skipped",
      turnNumber: turn.turnNumber,
      actorUnitId: actorId,
      subjectUnitId: null,
      severity: BASE_SEVERITY["turn-skipped"],
      text: `${actorName} überlegt gründlich und lässt den Zug lieber verstreichen.`,
    });
    return;
  }

  let hadProjectile = false;
  let hadTerrainMutation = false;
  let hadDamage = false;

  for (const event of turn.events) {
    if (event.type === "projectile-resolved") {
      hadProjectile = true;
      continue;
    }

    if (event.type === "terrain-mutated") {
      hadTerrainMutation = true;
      if (event.mutation.removedCells >= LARGE_CRATER_CELLS) {
        out.push({
          type: "large-crater",
          turnNumber: turn.turnNumber,
          actorUnitId: actorId,
          subjectUnitId: null,
          severity:
            BASE_SEVERITY["large-crater"] +
            Math.min(30, event.mutation.removedCells / 40),
          text: pickVariant(LARGE_CRATER_LINES, turn.turnNumber).replaceAll(
            "{actor}",
            actorName,
          ),
        });
      }
      continue;
    }

    if (event.type === "damage-applied") {
      hadDamage = true;
      const subjectTeam = unitInfo.get(event.unitId)?.team ?? null;
      const isActor = event.unitId === actorId;
      const isSameTeam =
        actorTeam !== null && subjectTeam !== null && subjectTeam === actorTeam;

      if (isActor) {
        out.push({
          type: "self-hit",
          turnNumber: turn.turnNumber,
          actorUnitId: actorId,
          subjectUnitId: null,
          severity: BASE_SEVERITY["self-hit"] + Math.min(30, event.damage / 4),
          text: `${actorName} trifft mit großer Entschlossenheit – sich selbst.`,
        });
      } else if (isSameTeam) {
        out.push({
          type: "friendly-fire",
          turnNumber: turn.turnNumber,
          actorUnitId: actorId,
          subjectUnitId: event.unitId,
          severity:
            BASE_SEVERITY["friendly-fire"] + Math.min(30, event.damage / 4),
          text: `${actorName} beweist Teamgeist und trifft ${nameOf(event.unitId)} aus den eigenen Reihen.`,
        });
      }
      continue;
    }

    if (
      (event.type === "fall-resolved" && event.state === "out-of-world") ||
      (event.type === "knockback-resolved" && event.defeatedOutOfWorld)
    ) {
      const subjectTeam = unitInfo.get(event.unitId)?.team ?? null;
      const selfInflicted =
        actorTeam !== null && subjectTeam !== null && subjectTeam === actorTeam;
      let text: string;
      if (event.unitId === actorId) {
        text = `${actorName} verabschiedet sich mit Schwung über die Kartenkante.`;
      } else if (selfInflicted) {
        text = `${actorName} befördert ${nameOf(event.unitId)} versehentlich ins Nichts.`;
      } else {
        text = `${actorName} schickt ${nameOf(event.unitId)} über die Kante – diesmal mit Absicht.`;
      }
      out.push({
        type: "world-fall",
        turnNumber: turn.turnNumber,
        actorUnitId: actorId,
        subjectUnitId: event.unitId === actorId ? null : event.unitId,
        severity: BASE_SEVERITY["world-fall"] + (selfInflicted ? 15 : 0),
        text,
      });
      continue;
    }

    // Harte Landung: ein echter Sturz auf Boden mit spürbarem Fall-Schaden.
    if (
      event.type === "fall-resolved" &&
      event.state === "fall" &&
      event.damage > 0
    ) {
      const isSelf = event.unitId === actorId;
      out.push({
        type: "hard-landing",
        turnNumber: turn.turnNumber,
        actorUnitId: actorId,
        subjectUnitId: isSelf ? null : event.unitId,
        severity: BASE_SEVERITY["hard-landing"] + Math.min(25, event.damage / 3),
        text: isSelf
          ? `${actorName} unterschätzt die Falltiefe und landet schmerzhaft.`
          : `${nameOf(event.unitId)} lernt die Schwerkraft neu kennen.`,
      });
    }
  }

  // Fehlschuss: Es wurde geschossen, aber weder Terrain verändert noch Schaden
  // verursacht. Nur einmal pro Zug.
  if (hadProjectile && !hadTerrainMutation && !hadDamage) {
    out.push({
      type: "misfire",
      turnNumber: turn.turnNumber,
      actorUnitId: actorId,
      subjectUnitId: null,
      severity: BASE_SEVERITY.misfire,
      text: `${actorName} feuert entschlossen ins Leere. Die Landschaft bleibt unbeeindruckt.`,
    });
  }
}

function compareMoments(left: ChronicleMoment, right: ChronicleMoment): number {
  if (Math.abs(right.severity - left.severity) > 1e-9) {
    return right.severity - left.severity;
  }

  if (left.turnNumber !== right.turnNumber) {
    return left.turnNumber - right.turnNumber;
  }

  return left.actorUnitId.localeCompare(right.actorUnitId);
}
