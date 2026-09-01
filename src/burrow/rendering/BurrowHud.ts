import { BURROW_MUTATIONS, GROWTH, type BurrowMutation, type BurrowRun } from "../simulation/BurrowRun";
import type { BurrowMotion } from "../simulation/BurrowMotion";

/** DOM UI stays separate from the simulation and exposes the same state accessibly. */
export class BurrowHud {
  private readonly root = document.createElement("div");
  private readonly title: HTMLElement;
  private readonly mass: HTMLElement;
  private readonly progress: HTMLElement;
  private readonly goal: HTMLElement;
  private readonly toast: HTMLElement;
  private readonly modal: HTMLElement;
  private previousPhase = "";
  private lastAnnouncement = "";
  private toastUntil = 0;

  public constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly choose: (mutation: BurrowMutation) => void,
    private readonly restart: () => void,
  ) {
    this.root.className = "burrow-overlay";
    this.root.innerHTML = '<section class="burrow-hud" aria-label="Wachstum">' +
      '<div class="burrow-hud-heading"><strong data-title></strong><span data-mass></span></div>' +
      '<div class="burrow-growth-track" role="progressbar" aria-label="Biomasse" aria-valuemin="0" aria-valuemax="240"><i data-progress></i></div>' +
      '<p data-goal></p></section><div class="burrow-toast" role="status" hidden></div>' +
      '<div class="burrow-modal" hidden></div>';
    document.querySelector("#burrow-game")!.append(this.root);
    this.title = this.root.querySelector("[data-title]")!;
    this.mass = this.root.querySelector("[data-mass]")!;
    this.progress = this.root.querySelector("[data-progress]")!;
    this.goal = this.root.querySelector("[data-goal]")!;
    this.toast = this.root.querySelector(".burrow-toast")!;
    this.modal = this.root.querySelector(".burrow-modal")!;
    this.modal.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      const buttons = [...this.modal.querySelectorAll("button")];
      const first = buttons[0];
      const last = buttons.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    });
  }
  public destroy(): void { this.root.remove(); }
  public showToast(text: string, now: number): void {
    this.toast.textContent = text;
    this.toastUntil = now + 2400;
  }
  public update(run: BurrowRun, motion: BurrowMotion, now: number): void {
    const state = run.state;
    const build = run.build;
    const mutation = BURROW_MUTATIONS.find((entry) => entry.id === state.mutation);
    this.title.textContent = build.label + (mutation ? " · " + mutation.name : " · BURROW");
    this.mass.textContent = state.biomass + " / 240";
    this.progress.style.width = Math.min(100, state.biomass / GROWTH.surface * 100) + "%";
    this.progress.parentElement!.setAttribute("aria-valuenow", String(Math.min(240, state.biomass)));
    const objective = state.phase === "intro" ? "Grabe zu den grünen Sporen. Knollen brechen beim Graben, Brutkapseln im Burst." :
      state.phase === "surface" ? "Du bist bereit! Durchbrich die Oberfläche und friss die goldene Schlusskutsche." :
      state.phase === "complete" ? "Vom Keimling zum großen Jäger." :
      state.phase === "mutation" ? "Wähle deine Mutation. Der gesamte Run pausiert." :
      state.biomass < GROWTH.hunter ? "Sporen +1 · Fadenwurm +8 · Rennwurm +14. Bei 40 wirst du Jäger." :
      state.biomass < GROWTH.mutation ? "Panzerwurm: im Burst von Seite oder hinten. Bei 80 wählst du deine Mutation." :
      state.biomass < GROWTH.burrower ? "Beweise deine Mutation. Panzerwurm +22 und eine warme Markspur. Bei 180 wirst du Gräber." :
      state.largePreyEaten === 0 ? "Du bist übermächtig! Panzerwurm jetzt aus jeder Richtung fressbar." :
      "Wachse auf 240. Die Oberfläche wartet – du kannst schon jetzt hinauf.";
    this.goal.textContent = objective;
    this.toast.hidden = now >= this.toastUntil || state.phase === "mutation" || state.phase === "complete";
    if (this.previousPhase !== state.phase) {
      this.previousPhase = state.phase;
      this.showModal(run);
    }
    const announcement = build.label + ". Biomasse " + state.biomass + ". " + objective;
    const output = document.querySelector<HTMLOutputElement>("#burrow-live-status");
    if (output && announcement !== this.lastAnnouncement) {
      output.textContent = announcement;
      this.lastAnnouncement = announcement;
    }
    // Accessible spatial status also supports reading the live canvas without exposing internals.
    this.canvas.setAttribute("aria-label", "Burrow. Position " + Math.round(motion.state.position.x) +
      ", " + Math.round(motion.state.position.y) + ". " + announcement);
  }
  private showModal(run: BurrowRun): void {
    const phase = run.state.phase;
    this.modal.hidden = phase !== "mutation" && phase !== "complete";
    if (this.modal.hidden) {
      this.modal.replaceChildren();
      return;
    }
    const panel = document.createElement("section");
    panel.className = "burrow-modal-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "burrow-modal-title");
    const heading = document.createElement("h1");
    heading.id = "burrow-modal-title";
    heading.textContent = phase === "mutation" ? "Dein Hunger verändert dich." : "Klein angefangen. Groß rausgekommen.";
    const subtitle = document.createElement("p");
    subtitle.textContent = phase === "mutation" ? "Wähle eine Mutation für diesen Run. Alles pausiert. Tasten 1 · 2 · 3" :
      run.state.biomass + " Biomasse · " + run.build.bodyCount + " Körperabschnitte · " +
      run.state.preyEaten + " Würmer (" + run.state.largePreyEaten + " gepanzert) · " +
      formatTime(run.state.activeSteps / 60) + " aktive Spielzeit";
    const choices = document.createElement("div");
    choices.className = "burrow-mutation-choices";
    if (phase === "mutation") {
      BURROW_MUTATIONS.forEach((entry, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.style.setProperty("--mutation-color", "#" + entry.color.toString(16).padStart(6, "0"));
        const name = document.createElement("strong");
        name.textContent = (index + 1) + " · " + entry.name;
        const description = document.createElement("span");
        description.textContent = entry.description;
        button.append(name, description);
        button.addEventListener("click", () => { this.choose(entry.id); this.canvas.focus(); });
        choices.append(button);
      });
    } else {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Noch einmal wachsen";
      button.addEventListener("click", this.restart);
      choices.append(button);
    }
    panel.append(heading, subtitle, choices);
    this.modal.replaceChildren(panel);
    this.modal.querySelector("button")?.focus();
  }
}

function formatTime(seconds: number): string {
  return Math.floor(seconds / 60) + ":" + String(Math.floor(seconds % 60)).padStart(2, "0");
}
