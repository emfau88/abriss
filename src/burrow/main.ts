import Phaser from "phaser";

import { createBurrowGameConfig } from "./config";
import { parseTerrainVariant } from "./simulation/BurrowTerrainVariant";
import "./style.css";

const terrainVariant = parseTerrainVariant(new URLSearchParams(window.location.search).get("terrain"));
const game = new Phaser.Game(createBurrowGameConfig(terrainVariant));
document.querySelector(`[data-terrain="${terrainVariant}"]`)?.setAttribute("aria-current", "page");
const restartButton = document.querySelector<HTMLButtonElement>("#burrow-restart");
function restartTest(): void {
  if (game.scene.isActive("BurrowGameScene")) game.scene.getScene("BurrowGameScene").scene.restart();
}
restartButton?.addEventListener("click", restartTest);
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
    restartButton?.removeEventListener("click", restartTest);
    fullscreenButton?.removeEventListener("click", toggleFullscreen);
    document.removeEventListener("fullscreenchange", updateFullscreenButton);
    game.destroy(true);
  });
}
