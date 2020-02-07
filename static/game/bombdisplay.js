import { GuiElement } from "../modules/guielement.js";
import { Creature } from "./creature.js";
import { getImportantEntity } from "../modules/gamemanager.js";
import { Vector } from "../modules/vector.js";
import { centeredText, rect } from "./draw.js";
export class BombDisplay extends GuiElement {
  /** @type {Vector} */
  borderVec;
  /** @type {Creature} */
  hero;
  /** @type {Number} */
  currentBombs;
  /** @type {Number} */
  maxBombs;

  /**
   * @param {Vector} position on screen
   */
  constructor(pos) {
    super(pos);
    this.borderVec = new Vector(8, 8);
  }

  action() {
    this.hero = getImportantEntity("hero");
    this.currentBombs = /** @type {Creature} */ (this.hero).currentBombs;
    this.maxBombs = /** @type {Creature} */ (this.hero).maxBombs;
  }

  draw() {
    centeredText(
      `${this.currentBombs} / ${this.maxBombs}`,
      this.pos.add(this.borderVec),
      "bold 60px sans-serif",
      "left",
      "middle",
      "white"
    );
  }
}
