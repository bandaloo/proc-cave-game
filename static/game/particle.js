import { Entity } from "../modules/entity.js";
import { randomInt, randomNormalVec } from "../modules/helpers.js";
import { Vector } from "../modules/vector.js";
import { centeredRoundedRect, line } from "./draw.js";
import { addParticle } from "../modules/gamemanager.js";

/**
 * an enum for allowed shapes of enemies
 * @enum {number}
 */
export const EffectEnum = Object.freeze({ square: 1, spark: 2 });

export class Particle extends Entity {
  /**
   * constructs a particle
   * @param {Vector} pos
   * @param {string} fillStyle
   * @param {EffectEnum} effect
   * @param {number} [baseSpeed]
   * @param {number} [randSpeed]
   * @param {number} [drag]
   * @param {number} [baseLifetime]
   * @param {number} [randLifetime]
   * @param {Vector} [acc]
   */
  constructor(
    pos,
    fillStyle,
    effect,
    baseSpeed = 10,
    randSpeed = 3,
    drag = 0.08,
    baseLifetime = 20,
    randLifetime = 30,
    acc = new Vector(0, 0)
  ) {
    const vel = randomNormalVec().mult(baseSpeed + randSpeed * Math.random());
    super(pos, vel, acc);
    this.vel = vel;
    this.effect = effect;
    this.lifetime = baseLifetime + randomInt(randLifetime);
    this.width = 16;
    this.height = 16;
    this.fillStyle = fillStyle;
    this.drag = drag;
    this.strokeStyle = "white";
    this.lineWidth = 1;
    this.multiplier = 5;
  }

  draw() {
    if (this.effect === EffectEnum.square) {
      centeredRoundedRect(
        this.drawPos,
        this.width,
        this.height,
        this.fillStyle,
        this.strokeStyle,
        this.lineWidth
      );
    } else if (this.effect === EffectEnum.spark) {
      line(
        this.drawPos,
        this.drawPos.add(this.vel.mult(this.multiplier)),
        this.fillStyle,
        this.lineWidth
      );
    }
  }
}

/**
 * create rainbow particle explosion used for pickups
 * @param {Vector} pos
 */
export function rainbowParticle(
  pos,
  amount = 30,
  saturation = 100,
  value = 50
) {
  for (let i = 0; i < amount; i++) {
    let randColor =
      "hsl(" +
      Math.floor(Math.random() * 360) +
      ", " +
      saturation +
      "%, " +
      value +
      "%)";
    const spark = new Particle(pos, randColor, EffectEnum.spark);
    spark.lineWidth = 15;
    spark.multiplier = 8;
    addParticle(spark);
  }
}
