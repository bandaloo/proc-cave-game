import { clamp } from "./helpers.js";

class Vector {
  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * @param {Vector} v
   * @returns {number}
   */
  dist2(v) {
    return Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2);
  }

  /**
   * Returns the magnitude of this vector
   * @return {number}
   */
  mag() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * @param {Vector} v
   * @returns {number}
   */
  dist(v) {
    return Math.sqrt(this.dist2(v));
  }

  /**
   * @param {number} sx
   * @param {number} sy
   * @returns {Vector}
   */
  mult(sx, sy = sx) {
    return new Vector(this.x * sx, this.y * sy);
  }

  /**
   * @param {Vector} v
   * @returns {Vector}
   */
  add(v) {
    return new Vector(this.x + v.x, this.y + v.y);
  }

  /**
   * @param {Vector} v
   * @returns {Vector}
   */
  sub(v) {
    return new Vector(this.x - v.x, this.y - v.y);
  }

  /**
   * @param {Vector} v
   * @returns {number}
   */
  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  /**
   * @returns {Vector}
   */
  norm() {
    if (this.x === 0 && this.y === 0) {
      throw new Error("can't normalize the zero vector");
    }
    return this.mult(1 / this.dist(new Vector(0, 0)));
  }

  /**
   * normalizes but returns zero vector if given zero vector
   * @returns {Vector}
   */
  norm2() {
    if (this.x === 0 && this.y === 0) {
      return this;
    }
    return this.mult(1 / this.dist(new Vector(0, 0)));
  }

  /**
   * @param {Vector} v
   */
  midpoint(v) {
    return new Vector((this.x + v.x) / 2, (this.y + v.y) / 2);
  }

  /**
   * @param {Vector} v
   * @param {number} s
   */
  partway(v, s) {
    return this.add(v.sub(this).mult(s));
  }

  /**
   * @param {Vector} a
   * @param {Vector} b
   * @returns {Vector}
   */
  closestVecToSeg(a, b) {
    let length2 = a.dist2(b);
    if (length2 === 0) {
      return a;
    }
    const t = clamp(this.sub(a).dot(b.sub(a)) / length2, 0, 1);
    const c = b
      .sub(a)
      .mult(t)
      .add(a);
    return c;
  }

  /**
   * @param {Vector} a
   * @param {Vector} b
   * @returns {number}
   */
  distToSeg(a, b) {
    return this.dist(this.closestVecToSeg(a, b));
  }

  /**
   * @param {number} radians
   */
  rotate(radians) {
    const angle = Math.atan2(this.y, this.x) + radians;
    const mag = this.mag();
    return new Vector(Math.cos(angle), Math.sin(angle)).mult(mag);
  }

  isZeroVec() {
    return this.x === 0 && this.y === 0;
  }

  toString() {
    return `[${this.x}, ${this.y}]`;
  }

  getAngle() {
    return Math.atan2(this.y, this.x);
  }

  /**
   * gets the clockwise angle between this vector and another
   * @param {Vector} other
   */
  angleBetween(other) {
    return Math.atan2(other.y, other.x) - Math.atan2(this.y, this.x);
  }

  /**
   * returns a 2d vector cross product analog
   * @param {Vector} other
   */
  cross(other) {
    return this.x * other.y - this.y * other.x;
  }

  /** gets a unit vector perpendicular to this one */
  perpendicular() {
    if (this.x !== 0)
      return new Vector(-this.y / this.x, 1).norm2();
    else
      return new Vector(1, -this.x / this.y).norm2();
  }
}

export { Vector };
