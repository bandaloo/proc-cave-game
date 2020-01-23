import { distanceBoard } from "./generator.js";
import { Shooter } from "./shooter.js";
import { Chase } from "./chase.js";
import { Scatter } from "./scatter.js";
import { randomLook, randomStats } from "./enemy.js";
import { Vector } from "../modules/vector.js";
import { createNumberGrid } from "./life.js";
import { randomInt, shuffle, randomPop } from "../modules/helpers.js";
import {
  addToWorld,
  cellToWorldPosition,
  getImportantEntity
} from "../modules/gamemanager.js";
import { Boss } from "./boss.js";
import { Elastic } from "./powerups/elastic.js";
import { DamageUp } from "./powerups/damageup.js";
import { MachineGun } from "./powerups/machinegun.js";
import { Xplode } from "./powerups/xplode.js";
import { Zoom } from "./powerups/zoom.js";

/**
 * @param {number[][]} board
 * @param {number} numEnemies
 */
export function populateLevel(board, numEnemies) {
  // board containing distances from nearest solid block
  const { board: distBoard, cells: distCells } = distanceBoard(board);

  // randomize the distance cells
  /*
  for (let i = 0; i < distCells.length; i++) {
    if (distCells[i] !== undefined) {
      distCells[i] = shuffle(distCells[i]);
    }
  }
  */

  const creatureClasses = [Chase, Scatter, Shooter];

  const enemyLooks = [];
  const enemyStats = [];

  for (let i = 0; i < creatureClasses.length; i++) {
    enemyLooks.push(randomLook());
    // TODO make these stats do something, or remove them
    enemyStats.push(randomStats(i * 3 + 3));
  }

  for (let i = 0; i < numEnemies; i++) {
    const randomChoice = randomInt(creatureClasses.length);
    // TODO randomly choose this position correctly
    const size = randomInt(3);
    if (distCells[size + 1] === undefined) {
      console.log("undefined? " + size);
      continue;
    }
    const safetyDistance = 1000;
    const easyDistance = 8000;
    const easyRespawns = 3;

    let cellPosition;
    let position;
    let respawns = 0;

    let positionOkay = false;

    while (!positionOkay) {
      cellPosition = randomPop(distCells[size + 1]);
      position = cellToWorldPosition(cellPosition);

      const distanceToHero2 = position.dist2(getImportantEntity("hero").pos);

      if (distanceToHero2 < safetyDistance ** 2) {
        // too close, not okay to spawn
        continue;
      }

      // choose another spot if spawning in the easy zone
      if (respawns < easyRespawns && distanceToHero2 < easyDistance ** 2) {
        respawns++;
        // calculate respawn chance based on distance from hero
        const easyRespawnChance =
          (easyDistance - Math.sqrt(distanceToHero2)) / easyDistance;
        if (Math.random() < easyRespawnChance) {
          console.log("easy respawning");
          continue;
        }
      }
      positionOkay = true;
    }
    // TODO catch the situation where enemy is too large to spawn anywhere
    const enemy = new creatureClasses[randomChoice](
      position,
      enemyLooks[randomChoice],
      enemyStats[randomChoice],
      undefined,
      undefined,
      { size: size, speed: 0, explode: 0 }
    );

    //Apply random effects
    // TODO update this with the newly added powerups
    const enemyPowerUpTypes = [DamageUp, Elastic, MachineGun, Xplode, Zoom];
    for (let k = 0; k < enemyPowerUpTypes.length; k++) {
      if (Math.random() > 0.75) {
        const p = new enemyPowerUpTypes[
          Math.floor(Math.random() * enemyPowerUpTypes.length)
        ](new Vector(0, 0), Math.floor(Math.random() * 5));
        p.apply(enemy);
      }
    }

    addToWorld(enemy);
  }

  /*
  const boss = new Boss(
    cellToWorldPosition(distCells[2].pop()),
    enemyLooks[randomInt(4)],
    enemyStats[randomInt(4)],
    undefined,
    undefined,
    { size: randomInt(3), speed: 0, explode: 0 }
  );
  addToWorld(boss);
  */
}
