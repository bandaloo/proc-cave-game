import { Entity } from "../modules/entity.js";
import { Vector } from "../modules/vector.js";
import { polygon, circle, splatter } from "./draw.js";
import { Particle, EffectEnum } from "./particle.js";
import { addParticle, cellToWorldPosition } from "../modules/gamemanager.js";
import { isColliding, calcCorners, getCell } from "../modules/collision.js";
import { destroyBlock } from "./block.js";
import { playSound } from "../modules/sound.js";

/**
 * This class represents a bomb that creatures can place in the game world,
 * which explodes (usually dealing damage within a radius but could have other
 * effects) after a certain amount of time
 */
export class Bomb extends Entity {
  /**
   * An array of objects, where each object has a name, which is the name of
   * the source of the function, a data, which is some number the function
   * takes, and a func, which is a funciton to execute when the bomb detonates
   * @type {{ name: string
   *        , data: number
   *        , func: (function(Bomb, number): void)
   *        }[]}
   */
  onDetonate;

  /**
   * An array of objects, where each object has a name, which is the name of
   * the source of the function, a data, which is some number the function
   * takes, and a func, which is a function to execute when a creature is
   * caught in the blast of the bomb
   * @type {{ name: string
   *        , data: number
   *        , func: function( Bomb
   *                        , number
   *                        , import("./creature.js").Creature
   *                        ): void
   *        }[]}
   */
  onBlastCreature;

  /**
   * @param {Vector} [pos]
   * @param {import("./creature.js").Creature} [owner] the creature that planted this bomb
   * @param {number} [hue] HSL hue for this bomb's color
   * @param {number} [fuseTime] number of game steps to detonation
   */
  constructor(
    pos = new Vector(0, 0),
    owner = undefined,
    hue = 0,
    fuseTime = 180
  ) {
    super(pos);
    this.good = (owner !== undefined && owner.type === "Hero");
    this.fuseTime = fuseTime;
    this.maxFuseTime = fuseTime;
    this.onDetonate = new Array();
    this.onBlastCreature = new Array();
    this.width = 56;
    this.height = 56;
    // amount of time (in game steps) it takes to animate exploding
    this.timeToExplode = 20;
    this.blastRadius = 300;
    this.hue = hue;
    this.speed = 0;
    /** @type {import("./creature.js").Creature} */
    this.owner = owner;
    this.creaturesHit = {};
    this.collisionType = "Circle";
  }

  /**
   * @override
   */
  action() {
    // tick down cooldowns
    this.fuseTime--;
    for (const key in this.creaturesHit) {
      if (this.creaturesHit[key]) {
        if (this.creaturesHit[key].cooldown === 0)
          this.creaturesHit[key] = undefined;
        else
          this.creaturesHit[key].cooldown--;
      }
    }
    if (this.fuseTime === 0) {
      this.detonate();
    } else if (this.fuseTime < 0 && this.fuseTime >= -1 * this.timeToExplode) {
      // currently exploding
      // make this entity bigger for the sake of collisions
      const radius =
        (Math.abs(this.fuseTime) / this.timeToExplode) * this.blastRadius;
      this.width = radius * 2;
      this.height = radius * 2;
      // create some particles
      const numParticles = 5;
      for (let i = 0; i < numParticles; ++i) {
        let particleHue = (this.hue - 30 + Math.random() * 30) % 360;
        let color = `hsl(${particleHue}, 100%, 50%)`;
        const xOffset = (Math.random() * this.width - this.width / 2) / 2;
        const yOffset = (Math.random() * this.height - this.height / 2) / 2;
        const p = new Particle(
          new Vector(this.drawPos.x + xOffset, this.drawPos.y + yOffset),
          color,
          EffectEnum.spark,
          5,
          5,
          0.04,
          80,
          40,
          new Vector(0, 0)
        );
        const diff = p.drawPos.sub(this.drawPos);
        let theta = Math.atan2(diff.y, diff.x);
        const r = 10 + 1 / diff.mag() + 0.2;
        p.vel = new Vector(r * Math.cos(theta), r * Math.sin(theta));
        p.strokeStyle = "white";
        p.lineWidth = 8;
        p.width = 20;
        p.height = 20;
        addParticle(p);
      }

      // iterate through all overlapping blocks and destroy them
      // this is necessary because interior blocks aren't checked for collision
      const { topLeft: topLeft, bottomRight: bottomRight } = calcCorners(
        this.getCollisionShape()
      );

      for (let i = topLeft.x; i < bottomRight.x + 1; i++) {
        for (let j = topLeft.y; j < bottomRight.y + 1; j++) {
          const cellVec = new Vector(i, j);
          if (
            cellToWorldPosition(cellVec).dist2(this.pos) <
            (this.width / 2) ** 2
          ) {
            destroyBlock(
              cellVec,
              this.owner !== undefined && this.owner.type === "Hero"
            );
          }
        }
      }
    } else if (this.fuseTime < -1 * this.timeToExplode) {
      // done exploding
      this.deleteMe = true;
    }
  }

  /**
   * @override
   */
  draw() {
    if (this.fuseTime > 0) {
      const blink =
        50 * Math.sin(0.007 * (this.maxFuseTime - this.fuseTime) ** 1.5) + 50;
      // draw bomb
      polygon(
        this.drawPos,
        6,
        this.width * 1.2,
        this.height * 1.2,
        0,
        `hsl(${this.hue}, ${blink}%, 25%`,
        "white",
        6
      );
    } else if (this.fuseTime >= -1 * this.timeToExplode) {
      // draw explosion
      const radius =
        (Math.abs(this.fuseTime) / this.timeToExplode) * this.blastRadius;
      const thickness = (radius / this.blastRadius) * 60;
      circle(
        this.drawPos,
        radius,
        undefined,
        thickness,
        `hsl(${this.hue}, 100%, 50%)`
      );
    }
  }

  /**
   * makes the bomb go kaboom
   */
  detonate() {
    // TODO make this play for the whole duration of the explosion
    if (this.onScreen()) playSound("bomb-explode");
    this.occludedByWalls = false;
    for (const od of this.onDetonate) {
      if (od) od.func(this, od.data);
    }
    this.collideMap.set(
      this.good ? "Enemy" : "Hero",
      /** @param {import("./creature.js").Creature} creature */ creature => {
        // rate limit dealing damage to creatures
        if (this.creaturesHit[creature.id] === undefined) {
          this.creaturesHit[creature.id] = { c: creature, cooldown: 25 };
          // impart momentum
          creature.vel = creature.vel.add(
            creature.pos.sub(this.pos).mult(10 / this.blastRadius)
          );
          this.onBlastCreature.map(obj => {
            if (obj.func) obj.func(this, obj.data, creature);
          });
        }
      }
    );
    const sizeScalar = 0.1;
    splatter(
      this.pos,
      "#222222dd",
      this.blastRadius * sizeScalar,
      "round",
      undefined,
      {
        splats: 20,
        offsetScalar: 7,
        velocityScalar: 0,
        sizeScalar: 1
      }
    );
  }
}
