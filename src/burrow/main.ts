import Phaser from "phaser";

import { createBurrowGameConfig } from "./config";
import "./style.css";

const game = new Phaser.Game(createBurrowGameConfig());
const restartButton = document.querySelector<HTMLButtonElement>("#burrow-restart");
function restartRun(): void {
  if (game.scene.isActive("BurrowGameScene")) game.scene.getScene("BurrowGameScene").scene.restart();
}
restartButton?.addEventListener("click", restartRun);
const fullscreenButton = document.querySelector<HTMLButtonElement>("#burrow-fullscreen");

function canUseFullscreen(): boolean {
  return document.fullscreenEnabled && typeof document.documentElement.requestFullscreen === "function";
}

function updateFullscreenButton(): void {
  if (!fullscreenButton) return;
  fullscreenButton.hidden = !canUseFullscreen();
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
    restartButton?.removeEventListener("click", restartRun);
    fullscreenButton?.removeEventListener("click", toggleFullscreen);
    document.removeEventListener("fullscreenchange", updateFullscreenButton);
    game.destroy(true);
  });
}
