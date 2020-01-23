import { Vector } from "../modules/vector.js";
import { Entity, FarEnum } from "../modules/entity.js";
import { circle } from "./draw.js";
import { getCell } from "../modules/collision.js";
import { setBlock, addParticle, inbounds } from "../modules/gamemanager.js";
import { Particle, EffectEnum } from "./particle.js";
import { blockField } from "./generator.js";

export class Bullet extends Entity {
  /**
   * constructs a new bullet
   * @param {Vector} [pos]
   * @param {Vector} [vel]
   * @param {Vector} [acc]
   * @param {boolean} [good] false by default
   * @param {string} [color] default "white",
   * @param {number} [lifetime] how long this bullet survives, in game steps
   * @param {number} [damage] how much damage this bullet deals
   */
  constructor(
    pos = new Vector(0, 0),
    vel = new Vector(0, 0),
    acc = new Vector(0, 0),
    good = false,
    color = "white",
    lifetime = 100,
    damage = 1
  ) {
    super(pos, vel, acc);
    this.good = good;
    this.lifetime = lifetime;
    this.drag = 0.003;
    this.width = 24;
    this.height = 24;
    this.reflectsOffWalls = false;
    this.color = color;
    this.damage = damage;
    this.knockback = 3;
    /**
     * @type {{ name: string, data: number, func: (function(Bullet, number): void) }[]}
     */
    this.onDestroy = new Array();

    /**
     * @type {{ name: string
     *        , data: number
     *        , func: (function( Bullet
     *                         , number
     *                         , import("./creature.js").Creature
     *                         ): void
     *                )
     *        }[]}
     */
    this.onHitEnemy = new Array();
    this.damage = damage;
    this.farType = FarEnum.delete;
    this.type = good ? "PlayerBullet" : "EnemyBullet";
    // set function for when we hit enemies
    this.collideMap.set(
      this.good ? "Enemy" : "Hero",
      /** @param {import ("./creature.js").Creature} c */ c => {
        // deal basic damage
        c.takeDamage(this.damage);
        // impart momentum
        const size = (c.width * c.height) / 300;
        c.vel = c.vel.add(this.vel.mult(this.knockback / size));
        // call onHitEnemy functions
        for (const ohe of this.onHitEnemy) {
          if (ohe.func) ohe.func(this, ohe.data, c);
        }
        this.deleteMe = true;
      }
    );
  }

  action() {}

  draw() {
    circle(this.drawPos, this.width / 2, "black", 4, this.color);
  }

  destroy() {
    // execute all on-destroy functions
    for (const od of this.onDestroy) {
      if (od["func"]) od["func"](this, od["data"]);
    }

    // show sparks
    for (let i = 0; i < 3; i++) {
      const spark = new Particle(
        this.pos,
        this.color,
        EffectEnum.spark,
        8,
        5,
        0.12
      );
      spark.lineWidth = 5;
      addParticle(spark);
    }
  }

  /**
   * what to do when hitting a block
   * @param {Entity} entity
   */
  collideWithBlock(entity) {
    const cellVec = getCell(entity.pos);
    if (
      inbounds(cellVec.x, cellVec.y) &&
      blockField[cellVec.x][cellVec.y].durability !== Infinity
    ) {
      if (setBlock(cellVec.x, cellVec.y, 0)) {
        for (let i = 0; i < 15; i++) {
          const p = new Particle(entity.pos, "black", EffectEnum.square, 5, 3);
          p.lineWidth = 1;
          p.strokeStyle = "white";
          addParticle(p);
        }
      }
    }
    // remove the bullet if it's not supposed to bounce
    if (!this.reflectsOffWalls) {
      this.deleteMe = true;
    }
  }
}
