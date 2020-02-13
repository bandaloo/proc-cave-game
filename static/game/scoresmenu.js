import {
  getCanvasWidth,
  getCanvasHeight,
  getScreenDimensions,
  toggleGuiElement
} from "../modules/gamemanager.js";
import { Menu } from "./menu.js";
import { rect } from "./draw.js";
import { Vector } from "../modules/vector.js";

export class ScoresMenu extends Menu {
  /**
   * undefined = not yet started
   * 0 = in progress
   * 200 = success
   * otherwise = error
   * @type {number | undefined}
   */
  scoresStatus;

  constructor() {
    super(new Vector(0, 0), getCanvasWidth(), getCanvasHeight());
    this.scoresStatus = undefined;
    this.itemWidth = 1500;
    this.itemFillStyle = "rgba(0, 0, 0, 0)";
    this.selectedFillStyle = "rgba(20, 20, 255, 1)";
    this.itemStrokeStyle = "rgba(0, 0, 0, 0)";
    this.textAlign = "left";
    this.textStyle = "50px sans-serif";
  }

  /**
   * @override because canvas doesn't draw tabs. This is a dumb hack
   */
  drawText(x, y, text) {
    const tabs = text.split("\t");
    super.drawText(x, y, tabs[0]);
    if (tabs[1] !== undefined) super.drawText(x + 250, y, tabs[1]);
  }

  action() {
    if (this.scoresStatus === undefined) {
      fetch("/scores", { method: "GET" })
        .then(response => response.json())
        .then((/** @type {{ status: number, message: string }} */ obj) => {
          this.scoresStatus = obj.status;
          if (this.scoresStatus !== 200) {
            throw new Error();
          }
          this.items = JSON.parse(obj.message)
            .scores.sort((a, b) => b.score - a.score)
            .map(val => {
              return { text: val.score + "\t" + val.username, func: undefined };
            });
        })
        .catch(reason => {
          this.scoresStatus = 500;
          console.error(reason);
        });
    }

    if (this.scoresStatus === 0) {
      this.items = [{ text: "Fetching scores...", func: undefined }];
    } else if (this.scoresStatus !== 200) {
      this.items = [{ text: "Failed to get scores", func: undefined }];
    }
    super.action();
  }

  /**
   * @override
   */
  draw() {
    const screenDimensions = getScreenDimensions();
    rect(
      new Vector(0, 0),
      screenDimensions.width,
      screenDimensions.height,
      "rgba(0,0,0,.9)"
    );
    super.draw();
  }

  /**
   * @override
   */
  onBack() {
    super.onBack();
    toggleGuiElement("deathscreen");
  }
}