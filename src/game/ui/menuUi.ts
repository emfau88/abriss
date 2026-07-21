import Phaser from "phaser";

export interface MenuButton {
  readonly background: Phaser.GameObjects.Rectangle;
  readonly label: Phaser.GameObjects.Text;
  setEnabled(enabled: boolean): void;
}
export function createMenuButton(
  scene: Phaser.Scene,
  options: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly label: string;
    readonly accent?: number;
    readonly onClick: () => void;
  },
): MenuButton {
  const accent = options.accent ?? 0xffcd5d;
  const background = scene.add
    .rectangle(options.x, options.y, options.width, options.height, accent, 1)
    .setStrokeStyle(3, 0x142c33, 0.8)
    .setInteractive({ useHandCursor: true });
  const label = scene.add
    .text(options.x, options.y, options.label, {
      fontFamily: "Segoe UI, Arial, sans-serif",
      fontSize: "20px",
      fontStyle: "bold",
      color: "#142c33",
      align: "center",
    })
    .setOrigin(0.5);
  let enabled = true;

  background.on("pointerover", () => {
    if (enabled) background.setScale(1.025);
  });
  background.on("pointerout", () => background.setScale(1));
  background.on("pointerdown", () => {
    if (enabled) options.onClick();
  });

  return {
    background,
    label,
    setEnabled(nextEnabled: boolean): void {
      enabled = nextEnabled;
      background.setAlpha(enabled ? 1 : 0.42).setScale(1);
      label.setAlpha(enabled ? 1 : 0.55);
      if (enabled) {
        background.setInteractive({ useHandCursor: true });
      } else {
        background.disableInteractive();
      }
    },
  };
}

export function drawMenuBackdrop(
  scene: Phaser.Scene,
  width: number,
  height: number,
  textureKey = "good-mood-background",
): void {
  scene.add
    .image(width / 2, height / 2, textureKey)
    .setDisplaySize(width, height)
    .setTint(0x8ac9d0);
  scene.add.rectangle(width / 2, height / 2, width, height, 0x102a36, 0.38);
}
