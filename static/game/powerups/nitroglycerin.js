import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";

const MAX_BOMB_DAMAGE = 1000;
const DAMAGE_FACTOR = 1;

export class Nitroglycerin extends PowerUp {
  /**
   * Increases your bomb damage
   * @param {Vector} pos
   * @param {number} magnitude how much to increase bomb damage, 1-5
   */
  constructor(pos, magnitude = 1) {
    super(pos, magnitude, "Nitroglycerin");
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    if (!this.isAtMax(creature)) {
      super.apply(creature);
      creature.setBombDamage(
        this.existingBombDamage + this.magnitude * DAMAGE_FACTOR
      );
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
    // creature bomb damage is already at or over the limit
    this.existingBombDamage = creature.getBombDamage();
    if (this.existingBombDamage >= MAX_BOMB_DAMAGE) {
      return true;
    }

    // see if we need to trim magnitude
    const availMag = Math.floor(
      (MAX_BOMB_DAMAGE - this.existingBombDamage) / DAMAGE_FACTOR
    );
    if (availMag < 1) return true;

    this.magnitude = Math.min(availMag, this.magnitude);
    return false;
  }
}
