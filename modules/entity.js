import { Vector } from "./vector.js";

/** @abstract */
export class Entity {
  /** @type {string} */
  type;

  /** @type {number} */
  width;

  /** @type {number} */
  height;

  /** @type {number} */
  drag;

  /** @type number */
  blockHitboxScalar = 1;

  /** @type number */
  entityHitboxScalar = 1;

  /**
   * whether the entity will be deleted in deferred deletion process
   * @type {boolean}
   */
  deleteMe = false;

  /**
   * constructs an entity with all the relevant vectors
   * @param {Vector} pos
   * @param {Vector} vel
   * @param {Vector} acc
   */
  constructor(pos, vel = new Vector(0, 0), acc = new Vector(0, 0)) {
    this.pos = pos;
    this.vel = vel;
    this.acc = acc;
  }

  /**
   * draws the entity
   */
  draw() {}

  /**
   * steps the entity using position, velocity, acceleration and drag
   */
  step() {}

  /**
   * what to do when the entity is removed from the world
   */
  destroy() {}
}
