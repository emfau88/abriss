import Phaser from "phaser";

import "./style.css";
import { createGameConfig } from "./game/config";

const game = new Phaser.Game(createGameConfig());
const fullscreenButton = document.querySelector<HTMLButtonElement>(
  "#fullscreen-toggle",
);

function updateFullscreenButton(): void {
  if (!fullscreenButton) {
    return;
  }

  fullscreenButton.hidden = !document.fullscreenEnabled;
  fullscreenButton.classList.toggle("is-active", Boolean(document.fullscreenElement));
  const label = fullscreenButton.querySelector<HTMLElement>(".fullscreen-label");
  const isFullscreen = Boolean(document.fullscreenElement);
  if (label) {
    label.textContent = isFullscreen ? "Verlassen" : "Vollbild";
  }
  fullscreenButton.setAttribute("aria-pressed", String(isFullscreen));
}

async function toggleFullscreen(): Promise<void> {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen({ navigationUI: "hide" });
    }
  } catch {
    // Fullscreen can be rejected by browser or embedding policy; the game remains usable.
  }
}

fullscreenButton?.addEventListener("click", toggleFullscreen);
document.addEventListener("fullscreenchange", updateFullscreenButton);
updateFullscreenButton();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    fullscreenButton?.removeEventListener("click", toggleFullscreen);
    document.removeEventListener("fullscreenchange", updateFullscreenButton);
    game.destroy(true);
  });
}
