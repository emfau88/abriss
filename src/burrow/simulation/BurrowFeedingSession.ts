import { BURROW_START, BURROW_VEHICLE_ROUTE, createBurrowArena, surfaceYAt } from "../content/arena";
import { createFeedingContent } from "../content/feeding";
import { BurrowFeeding } from "./BurrowFeeding";
import { BurrowHunt } from "./BurrowHunt";
import { BurrowMotion, type BurrowInput } from "./BurrowMotion";
import { BurrowRun, type BurrowMutation } from "./BurrowRun";
import { BurrowSurfaceSupport } from "./BurrowSurfaceSupport";

/** Owns the active-step gate: food, prey, trails, cart and cooldown all pause together. */
export class BurrowFeedingSession {
  public readonly terrain = createBurrowArena(false);
  public readonly run = new BurrowRun();
  public readonly motion = new BurrowMotion(this.terrain, BURROW_START, -0.16, "recovering", this.run.build);
  public readonly feeding = new BurrowFeeding(createFeedingContent());
  public readonly hunt = new BurrowHunt({ ...BURROW_VEHICLE_ROUTE, surfaceYAt },
    new BurrowSurfaceSupport(this.terrain), { respawnSeconds: 18 });

  public chooseMutation(mutation: BurrowMutation): boolean {
    const accepted = this.run.chooseMutation(mutation);
    if (accepted) this.motion.setTuning(this.run.build);
    return accepted;
  }
  public step(input: BurrowInput) {
    if (this.run.state.phase === "intro" && (input.direction || input.burstPressed)) this.run.start();
    if (!this.run.active) return null;
    const oldPhase = this.run.state.phase;
    const previous = this.motion.state.position;
    this.run.advanceActiveStep();
    this.motion.setTuning(this.run.build);
    const movement = this.motion.step(input, 1 / 60);
    this.hunt.step(1 / 60);
    const head = this.motion.state;
    const meal = this.feeding.step({ previous, position: head.position, angle: head.angle,
      power: this.run.build.power, burst: head.burstRemaining > 0, vacuum: this.run.state.mutation === "vacuum" });
    const finalCart = this.hunt.state.vehicle.kind === "finale";
    const bite = this.hunt.tryBite({ headPosition: head.position, speed: head.speed, burstActive: head.burstRemaining > 0 });
    this.run.feed(meal.biomass + (bite?.devoured ? 12 : 0), meal.preyEaten, meal.largePreyEaten);
    if (this.run.state.mutation === "chain") this.motion.rewardPrey(meal.preyEaten);
    if (bite?.devoured && finalCart) this.run.complete();
    if (oldPhase !== "surface" && this.run.state.phase === "surface") this.hunt.beginFinale({ vehicleHitPoints: 1 });
    return { movement, meal, bite };
  }
}
