import type { Personality, WeaponId } from "./RocketActionPlanner";

/**
 * Gemeinsames Streumodell (Task 026): Sowohl die Ausführung
 * (`match/executionSpread.ts`) als auch die Kandidatenbewertung
 * (`RocketActionPlanner.measureCandidate`) leiten den Streuradius aus dieser
 * einen Quelle ab. Vorher lag der Wert nur in der Match-Engine, sodass die
 * KI die Streuung nicht einplanen konnte und kurzreichweitige Waffen
 * strukturell überbewertet hat.
 */

const PERSONALITY_SPREAD: Record<Personality, number> = {
  cautious: 5,
  explosive: 12,
  showboat: 9,
};

// Task 026: waffenneutrale Streuung. Die Balance-Referenz ist der Zustand
// OHNE Streukegel (~48 % Panzerfaust); die streuungsbewusste Bewertung soll
// die durch den Streukegel entstandene Verzerrung zurücknehmen, nicht die
// Waffen zusätzlich unterschiedlich bestrafen.
const WEAPON_SPREAD_FACTOR: Record<WeaponId, number> = {
  rocket: 1,
  grenade: 1,
  breaker: 1,
};

/**
 * Tatsächlicher Streuradius der Ausführung in Weltpunkten – die ehrliche,
 * angekündigte Streuung.
 */
export function executionSpreadRadius(
  personality: Personality,
  weaponId: WeaponId,
): number {
  return Math.round(
    PERSONALITY_SPREAD[personality] * WEAPON_SPREAD_FACTOR[weaponId],
  );
}

/**
 * Wie stark die Persönlichkeit die eigene Streuung wahrnimmt (Blindfleck aus
 * dem echten Streumechanismus, Task 026): Explosiv redet die Streuung klein
 * und plant dadurch riskanter, Vorsichtig überschätzt sie und plant
 * konservativer. Showboat schätzt die Streuung realistisch ein.
 */
const PERSONALITY_SPREAD_PERCEPTION: Record<Personality, number> = {
  cautious: 1.35,
  explosive: 0.5,
  showboat: 1,
};

export function perceivedSpreadRadius(
  personality: Personality,
  weaponId: WeaponId,
): number {
  return (
    executionSpreadRadius(personality, weaponId) *
    PERSONALITY_SPREAD_PERCEPTION[personality]
  );
}

/**
 * Erwarteter Anteil des Zielschadens, der bei linearem Abfall über den
 * Explosionsradius durch die Streuung verloren geht. Näherung: Die Explosion
 * landet im Mittel etwa den halben Streuradius neben dem Zielpunkt, was bei
 * Radius `r` rund `0.5·s/r` der Wirkung kostet; ein Verstärkungsfaktor
 * berücksichtigt die Fälle, in denen das Ziel ganz aus dem Radius fällt.
 * Ergebnis in [0, 1). Kurzer Radius ⇒ größerer Verlust.
 */
export function expectedSpreadDamageLoss(
  perceivedSpread: number,
  explosionRadius: number,
): number {
  if (explosionRadius <= 0) {
    return 0;
  }

  const loss = (1.4 * perceivedSpread) / explosionRadius;
  return Math.min(0.85, Math.max(0, loss));
}
