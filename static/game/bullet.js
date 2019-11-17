import { Vector } from "../modules/vector.js";
import { Entity } from "../modules/entity.js";
import { centeredOutlineCircle } from "./draw.js";
import { getCell } from "../modules/collision.js";
import { setBlock, addParticle } from "../modules/gamemanager.js";
import { SquareParticle } from "./squareparticle.js";

export class Bullet extends Entity {
  /**
   * constructs a new bullet
   * @param {Vector} pos
   * @param {Vector} vel
   * @param {Vector} acc
   * @param {boolean} good
   */
  constructor(pos, vel, acc = new Vector(0, 0), good) {
    super(pos, vel, acc);
    this.good = good;
    this.lifetime = 100;
    this.drag = 0;
    this.width = 24;
    this.height = 24;
    this.bounciness = 0.5;
    good ? (this.type = "PlayerBullet") : (this.type = "EnemyBullet");
  }

  action() {}

  draw() {
    centeredOutlineCircle(this.drawPos, this.width / 2, 4, "white", "black");
  }

  destroy() {}

  collideWithBlock(entity) {
    const cellVec = getCell(entity.pos);
    if (setBlock(cellVec.x, cellVec.y, 0)) {
      for (let i = 0; i < 15; i++) {
        addParticle(new SquareParticle(entity.pos, "black", 5, 3, undefined));
      }
    }
  }
}
