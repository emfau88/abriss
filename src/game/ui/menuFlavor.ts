import type { FighterId } from "../../manager/fighterRoster";
import type { WeaponId } from "../../simulation/ai/RocketActionPlanner";

/**
 * Rein kosmetische Menütexte. Der Ton folgt docs/06_ART_AND_TONE.md:
 * warm, slapstickhaft, selbstironisch – nie hämisch oder grimdark. Diese
 * Sprüche verändern kein Spielverhalten; sie geben dem Hauptmenü eine Stimme.
 */

/** Wechselt pro Menübesuch. Ersetzt den festen Untertitel. */
export const MENU_TAGLINES: readonly string[] = [
  "WO SOLL ES HEUTE KRATERN?",
  "DER BODEN HAT SICH NICHTS ZUSCHULDEN KOMMEN LASSEN. EGAL.",
  "HEUTE MIT 12% WENIGER EIGENBESCHUSS (NICHT GARANTIERT)",
  "EIN PLAN ÜBERLEBT DEN ERSTEN SCHUSS. SELTEN.",
  "DIE CREW IST BEREIT. ODER ZUMINDEST ANWESEND.",
  "PRÄZISION IST EINE HALTUNG, KEIN VERSPRECHEN.",
];

/** Kurzer Spruch je Wesen, der beim Antippen im Menü aufpoppt. */
export const FIGHTER_QUIPS: Readonly<Record<FighterId, string>> = {
  slime: "„Ich fange den Aufprall ab. Und die Schuld.“",
  hornling: "„Zeig mir das Handbuch. Dann zeig ich dir das Problem.“",
  moki: "„Zu groß gibt es nicht.“",
  ghost: "„War Absicht. Alles war Absicht.“",
  "pop-diva": "„Ein Sprung braucht ein Finale.“",
  chicken: "„Ich renne nicht. Ich choreografiere Panik.“",
  "raccoon-bandit": "„Ich war nie hier. Das war strategisch.“",
};

export function randomTagline(random: () => number = Math.random): string {
  const index = Math.floor(random() * MENU_TAGLINES.length);
  return MENU_TAGLINES[index] ?? MENU_TAGLINES[0]!;
}

/**
 * Ein-Zeilen-Persönlichkeit je Waffe für die Einsatzplanung. Tag und Spruch
 * folgen der echten Ballistik in WEAPON_PROFILES: Panzerfaust trifft direkt und
 * am härtesten, Wurfgranate hüpft mit Zeitzünder, Geländebrecher hat den
 * größten Terrainradius bei geringstem Schaden.
 */
export interface WeaponFlavor {
  readonly tag: string;
  readonly quip: string;
}

export const WEAPON_FLAVOR: Readonly<Record<WeaponId, WeaponFlavor>> = {
  rocket: {
    tag: "DIREKT",
    quip: "Fliegt geradeaus. Meistens dorthin, wo man hinwollte.",
  },
  grenade: {
    tag: "HÜPFT",
    quip: "Hüpft, wartet, explodiert. In dieser Reihenfolge, wenn man Glück hat.",
  },
  breaker: {
    tag: "TERRAIN",
    quip: "Fragt nicht nach dem Feind. Fragt nach der Wand.",
  },
};
