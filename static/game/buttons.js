import { Vector } from "../modules/vector.js";
import { numSign } from "../modules/helpers.js";

const noisy = false;

/**
 * @typedef {Object} Status
 * @property {boolean} held
 * @property {boolean} pressed
 * @property {boolean} released
 */

/**
 * @typedef {Object} Button
 * @property {string} key
 * @property {Status} status
 */

/**
 * @typedef {Object} Directional
 * @property {Button} up
 * @property {Button} right
 * @property {Button} down
 * @property {Button} left
 * @property {Vector} vec
 */

/**
 * Initializes a sub-object for buttons
 * @return {Status}
 */
function initBut() {
  return {
    held: false,
    pressed: false,
    released: false
  };
}

/**
 * object with sub-objects with booleans for each button we care about that say
 * whether it was just held, pressed, or released
 */
export const buttons = {
  /** @type {Directional} */
  move: {
    up: { key: "W", status: initBut() },
    right: { key: "D", status: initBut() },
    down: { key: "S", status: initBut() },
    left: { key: "A", status: initBut() },
    vec: new Vector(0, 0)
  },

  /** @type {Directional} */
  shoot: {
    up: { key: "&", status: initBut() },
    right: { key: "'", status: initBut() },
    down: { key: "(", status: initBut() },
    left: { key: "%", status: initBut() },
    vec: new Vector(0, 0)
  },

  /** @type {Button} */
  primary: { key: " ", status: initBut() },
  /** @type {Button} */
  secondary: { key: "E", status: initBut() }
};

/**
 * Sets the vec for a directional based on holds and releases
 * @param {Directional} directional
 */
function calcDirVec(directional) {
  // make directional vec all 1s and 0s
  directional.vec.x = numSign(directional.vec.x);
  directional.vec.y = numSign(directional.vec.y);
  if (directional.right.status.pressed) {
    directional.vec.x = 1;
  }
  if (directional.left.status.pressed) {
    directional.vec.x = -1;
  }
  if (directional.down.status.pressed) {
    directional.vec.y = 1;
  }
  if (directional.up.status.pressed) {
    directional.vec.y = -1;
  }

  // release should stop if the opposite is not held
  if (directional.right.status.released) {
    if (directional.left.status.held) {
      directional.vec.x = -1;
    } else {
      directional.vec.x = 0;
    }
  }
  if (directional.left.status.released) {
    if (directional.right.status.held) {
      directional.vec.x = 1;
    } else {
      directional.vec.x = 0;
    }
  }
  if (directional.down.status.released) {
    if (directional.up.status.held) {
      directional.vec.y = -1;
    } else {
      directional.vec.y = 0;
    }
  }
  if (directional.up.status.released) {
    if (directional.down.status.held) {
      directional.vec.y = 1;
    } else {
      directional.vec.y = 0;
    }
  }
  if (!directional.vec.isZeroVec()) {
    directional.vec = directional.vec.norm();
  }
}

/**
 * makes all presses and releases false
 */
export function cleanButtons() {
  // set directional button presses and releases to false
  const directionals = [buttons.move, buttons.shoot];
  for (let i = 0; i < directionals.length; i++) {
    const directional = directionals[i];
    for (const dir in directional) {
      if (dir !== "vec") {
        directional[dir].status.pressed = false;
        directional[dir].status.released = false;
      }
    }
  }
  // set normal button presses and releases to false
  buttons.primary.status.pressed = false;
  buttons.primary.status.released = false;
  buttons.secondary.status.pressed = false;
  buttons.secondary.status.released = false;
}

/**
 * function for dealing with keydown events
 * @param {KeyboardEvent} e the keydown keyboard event
 */
export function controlKeydownListener(e) {
  const code = e.keyCode;
  const key = String.fromCharCode(code);

  // movement keys
  for (const dir in buttons.move) {
    if (dir !== "vec" && key === buttons.move[dir].key) {
      e.preventDefault();
      if (!buttons.move[dir].status.held) {
        buttons.move[dir].status.pressed = true;
        if (noisy) {
          console.log(`move button ${buttons.move[dir].key} pressed`);
        }
      }
      buttons.move[dir].status.held = true;
      calcDirVec(buttons.move);
      return;
    }
  }

  // shooting keys
  for (const dir in buttons.shoot) {
    if (dir !== "vec" && key === buttons.shoot[dir].key) {
      e.preventDefault();
      if (!buttons.shoot[dir].status.held) {
        buttons.shoot[dir].status.pressed = true;
        if (noisy) {
          console.log(`shoot button ${buttons.shoot[dir].key} pressed`);
        }
      }
      buttons.shoot[dir].status.held = true;
      calcDirVec(buttons.shoot);
      return;
    }
  }

  // primary and secondary keys
  if (key === buttons.primary.key) {
    e.preventDefault();
    if (!buttons.primary.status.held) {
      buttons.primary.status.pressed = true;
      if (noisy) {
        console.log(`primary button ${buttons.primary.key} pressed`);
      }
    }
    buttons.primary.status.held = true;
    return;
  }
  if (key === buttons.secondary.key) {
    e.preventDefault();
    if (!buttons.secondary.status.held) {
      buttons.secondary.status.pressed = true;
      if (noisy) {
        console.log(`secondary button ${buttons.primary.key} pressed`);
      }
    }
    buttons.secondary.status.held = true;
    return;
  }
}

/**
 * function for dealing with keyup events
 * @param {KeyboardEvent} e the keyup keyboard event
 */
export function controlKeyupListener(e) {
  const code = e.keyCode;
  const key = String.fromCharCode(code);

  // movement keys
  for (const dir in buttons.move) {
    e.preventDefault();
    if (key === buttons.move[dir].key) {
      buttons.move[dir].status.pressed = false;
      buttons.move[dir].status.held = false;
      buttons.move[dir].status.released = true;
      if (noisy) {
        console.log(`move button ${buttons.move[dir].key} released`);
      }
      calcDirVec(buttons.move);
      return;
    }
  }

  // shooting keys
  for (const dir in buttons.shoot) {
    e.preventDefault();
    if (key === buttons.shoot[dir].key) {
      buttons.shoot[dir].status.pressed = false;
      buttons.shoot[dir].status.held = false;
      buttons.shoot[dir].status.released = true;
      if (noisy) {
        console.log(`shoot button ${buttons.shoot[dir].key} released`);
      }
      calcDirVec(buttons.shoot);
      return;
    }
  }

  // primary and secondary keys
  if (key === buttons.primary.key) {
    e.preventDefault();
    buttons.primary.status.pressed = false;
    buttons.primary.status.held = false;
    buttons.primary.status.released = true;
    if (noisy) {
      console.log(`primary button ${buttons.primary.key} released`);
    }
    return;
  }
  if (key === buttons.secondary.key) {
    e.preventDefault();
    buttons.secondary.status.pressed = false;
    buttons.secondary.status.held = false;
    buttons.secondary.status.released = true;
    if (noisy) {
      console.log(`secondary button ${buttons.secondary.key} released`);
    }
    return;
  }
}
