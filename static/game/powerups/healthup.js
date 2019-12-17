import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";

const MAX_MAX_HEALTH = 1000;
const HEALTH_FACTOR = 10;

export class HealthUp extends PowerUp {
  /**
   * Increases your max health
   * @param {Vector} pos
   * @param {number} magnitude how much this increases you max health by, 1-5
   */
  constructor(pos, magnitude = 1) {
    super(pos, magnitude, "Health Up");
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    if (!this.isAtMax(creature)) {
      super.apply(creature);
      creature.maxHealth += this.magnitude * HEALTH_FACTOR;
      creature.gainHealth(this.magnitude * HEALTH_FACTOR);
    } else {
      this.overflowAction(creature);
    }
  }

  /**
   * returns true if the creature is at the max level for this powerup.
   * trims magnitude it if would push the creature over the limit
   * @param {Creature} creature
   * @override
   */
  isAtMax(creature) {
    // creature is just too big
    if (creature.maxHealth >= MAX_MAX_HEALTH) {
      return true;
    }

    // see if we need to trim magnitude
    const availMag = Math.floor(
      (MAX_MAX_HEALTH - creature.maxHealth) / HEALTH_FACTOR
    );
    if (availMag < 1) return true;

    this.magnitude = Math.min(availMag, this.magnitude);
    return false;
  }
}
