import {
  getScreenDimensions,
  setPause,
  toggleGuiElement,
  toggleFullscreen
} from "../modules/gamemanager.js";
import { Menu } from "./menu.js";
import { Vector } from "../modules/vector.js";
import { centeredText, rect } from "./draw.js";
import { resetDemo } from "../main.js";

export class PauseScreen extends Menu {
  constructor() {
    const screenDimensions = getScreenDimensions();
    super(new Vector(0, 0), screenDimensions.width, screenDimensions.height);
    this.items = [
      { text: "Resume", func: this.onBack.bind(this) },
      {
        text: "Codex",
        func: () => {
          this.active = false;
          toggleGuiElement("codex");
        }
      },
      {
        text: "Enter fullscreen",
        func: toggleFullscreen
      },
      { text: "Start over", func: resetDemo }
    ];
    this.itemWidth = 600;
  }

  action() {
    if (document.fullscreenElement === null) {
      this.items[2].text = "Enter fullscreen";
    } else {
      this.items[2].text = "Exit fullscreen";
    }
    super.action();
  }

  draw() {
    const screenDimensions = getScreenDimensions();
    rect(
      new Vector(0, 0),
      screenDimensions.width,
      screenDimensions.height,
      "rgba(0,0,0,.9)"
    );
    super.draw();
    centeredText(
      "Paused!",
      this.pos.add(new Vector(screenDimensions.width / 2, 100)),
      "bold 100px sans-serif",
      undefined,
      undefined,
      "red"
    );
  }

  /**
   * unpause when we press 'back'
   * @override
   */
  onBack() {
    setPause(false);
    super.onBack();
  }
}
