import Phaser from "phaser";

import { createBurrowGameConfig } from "./config";
import "./style.css";

const game = new Phaser.Game(createBurrowGameConfig());
const fullscreenButton = document.querySelector<HTMLButtonElement>("#burrow-fullscreen");

function updateFullscreenButton(): void {
  if (!fullscreenButton) return;
  fullscreenButton.hidden = !document.fullscreenEnabled;
  fullscreenButton.setAttribute("aria-pressed", String(Boolean(document.fullscreenElement)));
  const label = fullscreenButton.querySelector("span");
  if (label) {
    label.textContent = document.fullscreenElement ? "Verlassen" : "Vollbild";
  }
}

async function toggleFullscreen(): Promise<void> {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen({ navigationUI: "hide" });
    }
  } catch {
    // Das Labor bleibt auch nutzbar, wenn Browser oder Embed Vollbild ablehnen.
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
