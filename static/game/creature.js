import { Entity } from "../modules/entity.js";
import { addToWorld } from "../modules/gamemanager.js";
import { clamp } from "../modules/helpers.js";
import { Vector } from "../modules/vector.js";
import { Bomb } from "./bomb.js";
import { Bullet } from "./bullet.js";
import { StatusEffect } from "./statuseffect.js";
import { circle } from "./draw.js";

/**
 * Reduces damage according to defense
 * @param {number} amt
 * @param {number} defense
 * @return {number}
 */
export const defenseFunc = (amt, defense) =>
  amt * (-1 * Math.atan(defense + 1 / Math.tan(1)) + Math.PI / 2);

/**
 * Class representing an entity that moves around and shoots, such as enemies
 * or the Hero
 * @abstract
 */
export class Creature extends Entity {
  /** @type {boolean} whether bullets bounce off walls */
  bulletReflectsOffWalls = false;

  /** @type {number} speed of bullets when they bounce off walls */
  bulletWallReflectSpeed = 0;

  /** @type {number} speed of bullets spawned by this */
  bulletSpeed = 1;

  /** @type {number} how long bullets spawned by this live */
  bulletLifetime = 100;

  /**
   * An array of objects, where each object has a name, which is the name of
   * the powerup the function came from, a data, which is some number the
   * function takes, and a func, which is a funciton to execute when the bullet
   * gets destroyed
   * @type {{ name: string
   *        , data: number
   *        , func: (function(Bullet, number): void)
   *        }[]}
   */
  bulletOnDestroy;

  /**
   * An array of objects, where each object has a name, which is the name of
   * the powerup or effect the function came from, a data, which is some number
   * the function takes, and a func, which is a function to execute when the
   * bullet hits an enemy
   * @type {{ name: string
   *        , data: number
   *        , func: (function(Bullet, number, Creature): void)
   *        }[]}
   */
  bulletOnHitEnemy;

  /** @type {string} */
  bulletColor = "white";

  /** @type {typeof import("./bullet.js").Beam | typeof Bullet} */
  bulletType = Bullet;

  /** @type {number} the number of game steps to wait between each shot */
  fireDelay = 30;

  /** @type {number} counter for fireDelay */
  fireCount = 0;

  /** @type {number} the number of game steps before bombs detonate */
  bombFuseTime = 180;

  /** @type {number} how long our bombs spend exploding */
  bombTimeToExplode = 20;

  /** @type {number} HSL hue of this creature's bombs */
  bombHue = 0;

  /**
   * An array of objects, where each object has a name, which is the name of
   * the source of the function, a data, which is some number the function
   * takes, and a func, which is a funciton to execute when the bomb detonates
   * @type {{ name: string
   *        , data: number
   *        , func: (function(Bomb, number): void)
   *        }[]}
   */
  bombOnDetonate;

  /**
   * An array of objects, where each object has a name, which is the name of
   * the source of the function, a data, which is some number the function
   * takes, and a func, which is a function to execute when a creature is
   * caught in the blast of the bomb
   * @type {{ name: string
   *        , data: number
   *        , func: function( Bomb
   *                        , number
   *                        , Creature
   *                        ): void
   *        }[]}
   */
  bombOnBlastCreature;

  /** @type {number} radius of bomb explosions */
  bombBlastRadius = 300;

  /** @type {number} speed of bombs placed by this creature */
  bombSpeed = 0;

  /** @type {number} the amount of damage this can take before dying */
  maxHealth = 20;

  /**
   * @type {number} this creature's current health. Don't directly get or set
   * this! Instead use `takeDamage()` or `gainHealth()`
   * @private
   */
  currentHealth = 20;

  /** @type {number} maximum number of bombs this creature can hold */
  maxBombs = 3;

  /**
   * @type {number} current number of bombs this creature is holding. Don't
   * directly set this! Instead use `changeNumBombs()`
   */
  currentBombs = 3;

  /** @type {number} the amount of damage each bullet deals */
  bulletDamage = 10;

  /** @type {number} size of bullets spawned by this */
  bulletSize = 24;

  /** @type {number} added to damage each left-facing bullet deals */
  leftBulletDamage = 0;

  /** @type {number} added to size of each left-facing bullet */
  leftBulletSize = 0;

  /** @type {number} added to damage each right-facing bullet deals */
  rightBulletDamage = 0;

  /** @type {number} added to size of each right-facing bullet */
  rightBulletSize = 0;

  /** @type {number} A multiplier for how fast the creature moves */
  movementMultiplier = 1;

  /** @type {Map<string, number>} */
  powerUps = new Map();

  /** @type {StatusEffect[]} */
  statusEffects = new Array();

  /** @type {number} number of bullets per shot, spread into a cone */
  bulletsPerShot = 1;

  /** @type {number} scalar that determines how much knockback bullets apply */
  bulletKnockback = 3;

  /** @type {Array<(arg0: Entity) => void>} */
  bulletVisualEffects = new Array();

  /**
   * An array of objects, where each object has a name, which is the name of
   * the source of the function, a data, which is some number the function
   * takes, and a func, which is a function to execute when this creature
   * touches an enemy
   * @type {{ name: string
   *        , data: number
   *        , func: (num: number, other: Creature) => void
   *        }[]}
   */
  onTouchEnemy;

  /**
   * @type {number}
   * Higher defense decreases the amount of damage dealt. It will never be
   * reduced all the way to zero because y=0 is an asymptote of the damage
   * calculation function.
   *
   * A defense of 1.2 reduces damage by about half, 3.25 reduces damage by
   * about 75%
   *
   * Technically negative defense is possible, but it shouldn't happen since it
   * will make damage taken tend toward multiplying by pi.
   *
   * Damage taken = dmg_received * -1 * arctan(defense + cot(1)) + (pi / 2)
   */
  defense = 0;

  /** @type {Vector} unit vector in the direction this creature is facing */
  facing = new Vector(0, 1);

  /**
   * @param {Vector} [pos] initial position
   * @param {Vector} [vel] initial velocity
   * @param {Vector} [acc] initial acceleration
   */
  constructor(pos, vel = new Vector(0, 0), acc = new Vector(0, 0)) {
    super(pos, vel, acc);
    this.bulletOnDestroy = new Array();
    this.bulletOnHitEnemy = new Array();
    this.bombOnDetonate = new Array();
    this.bombOnBlastCreature = new Array();
    this.onTouchEnemy = new Array();
    // unique identifier for this creature, so it can be indexed in objects
    this.id = ""; // TODO better way to do this? why not keep direct reference
    for (let i = 0; i < 6; ++i) {
      this.id += Math.floor(Math.random() * 16).toString(16);
    }
    this.maxSpeed = 24;
    this.maxAccMag = 24;

    // bombs deal basic damage
    this.bombOnBlastCreature.push({
      name: "Basic Damage",
      data: 12,
      func: (bomb, num, creature) => {
        creature.takeDamage(num, bomb.pos.add(creature.pos).norm2());
      }
    });
  }

  /**
   * An action, e.g. shoot, that a creature does every step. Sub-classes should
   * call `super.action()` in their own action methods to apply status effects
   * each step
   */
  action() {
    for (const se of this.statusEffects) {
      if (se) se.action(this);
    }
  }

  /**
   * Draw this creature. Sub-classes should call `super.draw()` in their action
   * methods to draw status effects each step
   */
  draw() {
    super.draw();

    for (const se of this.statusEffects) {
      if (se) se.draw(this);
    }
  }

  /**
   * Gets this creature's bullet.
   *
   * You should always use this method instead of calling `new Bullet' directly
   * @param {Vector} dir
   * @return {Bullet}
   */
  getBullet(dir) {
    /** @type {number} */
    let dmg = this.bulletDamage;
    /** @type {number} */
    let size = this.bulletSize;
    const angle = dir.getAngle();
    dmg += this.rightBulletDamage * Math.max(0, Math.cos(angle));
    dmg += this.leftBulletDamage * Math.max(0, -Math.cos(angle));
    size += this.rightBulletSize * Math.max(0, Math.cos(angle));
    size += this.leftBulletSize * Math.max(0, -Math.cos(angle));
    const b = new this.bulletType(
      this.pos.add(dir.mult(Math.min(this.width, this.height) / 4)),
      dir.norm2().mult(this.bulletSpeed),
      new Vector(0, 0),
      this,
      this.bulletColor,
      this.bulletLifetime,
      dmg
    );
    b.reflectsOffWalls = this.bulletReflectsOffWalls;
    b.wallReflectSpeed = this.bulletWallReflectSpeed;
    b.onDestroy = this.bulletOnDestroy;
    b.onHitEnemy = this.bulletOnHitEnemy;
    b.width = size;
    b.height = size;
    b.knockback = this.bulletKnockback;
    return b;
  }

  /**
   * Shoots in the given direction, returning true if bullet was actually shot
   * @param {Vector} dir the direction to shoot in
   * @param {Vector} [additionalVelocity]
   * @param {number} [angle] the angle of the cone of bullets
   * @param {number} [offset] set this to zero when calling manually
   * @returns {boolean}
   */
  shoot(dir, additionalVelocity = new Vector(0, 0), angle = 30, offset = 0) {
    dir = dir.norm2();
    // Conditional is so fire count doesn't roll over before shooting
    if (this.fireCount < this.fireDelay) {
      this.fireCount++;
    }
    if (dir.isZeroVec()) {
      // can't shoot without a direction
      return false;
    }
    // shoot a bullet
    if (this.fireCount >= this.fireDelay) {
      for (let i = 0; i < this.bulletsPerShot; ++i) {
        // calculate a new direction so bullets are spread evenly across a cone
        let newDir = dir;
        let radiansToAdd = 0;
        if (this.bulletsPerShot > 1) {
          let theta = Math.atan2(dir.y, dir.x);
          const r = dir.mag();
          radiansToAdd =
            ((i / (this.bulletsPerShot - 1)) * angle - angle / 2 + offset) *
            (Math.PI / 180);
          theta += radiansToAdd;
          newDir = new Vector(r * Math.cos(theta), r * Math.sin(theta));
        }
        const b = this.getBullet(newDir);
        b.extraDrawFuncs = this.bulletVisualEffects;
        b.vel = b.vel.add(additionalVelocity);
        b.angle = radiansToAdd;
        addToWorld(b);
        this.fireCount = 0;
      }
      return true;
    }
    return false;
  }

  /**
   * Places a bomb into the world
   * @param {Vector} pos the position to place the bomb, by default the
   * creature's position
   */
  placeBomb(pos = this.pos) {
    if (this.currentBombs > 0) {
      const b = this.getBomb(pos);
      addToWorld(b);
      this.addBombs(-1);
    }
  }

  /**
   * Gets this creature's bomb.
   *
   * You should always use this method instead of calling `new Bomb' directly
   * @param {Vector} pos
   * @return {Bomb}
   */
  getBomb(pos) {
    const b = new Bomb(
      pos,
      this,
      this.bombHue,
      this.bombFuseTime
    );
    b.onDetonate = this.bombOnDetonate;
    b.onBlastCreature = this.bombOnBlastCreature;
    b.blastRadius = this.bombBlastRadius;
    b.speed = this.bombSpeed;
    b.timeToExplode = this.bombTimeToExplode;
    b.owner = this;
    if (this.vel.mag() > 1) {
      b.vel = this.vel.norm2().mult(b.speed);
    }
    b.reflectsOffWalls = true;
    b.wallReflectSpeed = this.bombSpeed;
    return b;
  }

  /**
   * Decreases the creature's current health by the given amount, killing it if
   * necessary
   * @param {number} amt the amount of damage dealt
   * @param {Vector} [dir] the direction the damage came from
   */
  takeDamage(amt, dir = this.vel.norm2()) {
    const damageToTake = defenseFunc(amt, this.defense);
    // convert overkill damage into velocity
    if (damageToTake > this.currentHealth) {
      this.vel = this.vel.add(
        dir.norm2().mult((damageToTake - this.currentHealth) * 0.75)
      );
    }
    this.currentHealth -= damageToTake;
    if (this.currentHealth < 0.01) {
      this.deleteMe = true;
      this.currentHealth = 0;
    }
  }

  /**
   * Increases current health by amt, up to a cap of maxHealth
   * @param {number} amt the amount of health to gain
   */
  gainHealth(amt) {
    this.currentHealth = Math.min(this.currentHealth + amt, this.maxHealth);
  }

  /**
   * Returns this creature's current health
   * @return {number}
   */
  getCurrentHealth() {
    return this.currentHealth;
  }

  /**
   * @return {number} the amount of basic damage this creature's bombs deal
   */
  getBombDamage() {
    for (const obj of this.bombOnBlastCreature) {
      if (obj.name === "Basic Damage") {
        return obj.data;
      }
    }
  }

  /**
   * @param {number} newBombDamage new damage dealt by this creature's bombs
   */
  setBombDamage(newBombDamage) {
    for (const obj of this.bombOnBlastCreature) {
      if (obj.name === "Basic Damage") {
        obj.data = newBombDamage;
        return;
      }
    }
    return false;
  }

  /**
   * add or subtract bombs from this creature
   * @param {number} amt amount of bombs, can be negative
   */
  addBombs(amt) {
    this.currentBombs = clamp(this.currentBombs + amt, 0, this.maxBombs);
  }
}
