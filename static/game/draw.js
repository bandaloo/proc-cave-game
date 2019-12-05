import {
  getContext,
  getCanvasWidth,
  getCanvasHeight,
  getTotalTime,
  getCameraOffset,
  getScreenDimensions
} from "../modules/gamemanager.js";
import { griderate, clamp } from "../modules/helpers.js";
import { Vector } from "../modules/vector.js";
import { blockField, GemEnum } from "./generator.js";
import { getCell } from "../modules/collision.js";

// this is to get rid of weird lines when moving the camera
const overDraw = 0.5;

// TODO some of these are more generic drawing functions that could be moved to
// the engine

/**
 * draw a centered rectangle with border at position
 * @param {Vector} centerVec
 * @param {number} width
 * @param {number} height
 * @param {number} borderThickness
 * @param {string} centerColor
 * @param {string} [borderColor]
 */
export function centeredOutlineRectFill(
  centerVec,
  width,
  height,
  borderThickness,
  centerColor,
  borderColor = "black"
) {
  let context = getContext();

  centerVec = centerVec.add(getCameraOffset());

  // draw the outline rect
  context.fillStyle = borderColor;
  context.fillRect(
    centerVec.x - width / 2 - borderThickness,
    centerVec.y - height / 2 - borderThickness,
    width + borderThickness * 2,
    height + borderThickness * 2
  );

  // draw the center rect
  context.fillStyle = centerColor;
  context.fillRect(
    centerVec.x - width / 2,
    centerVec.y - height / 2,
    width,
    height
  );
}

/**
 *
 * @param {Vector} centerVec
 * @param {number} width
 * @param {number} height
 * @param {number} strokeWidth
 * @param {string} strokeStyle usually this will just be a color string
 * @param {string} [fillStyle]
 */
export function centeredOutlineRect(
  centerVec,
  width,
  height,
  strokeWidth,
  strokeStyle,
  fillStyle
) {
  centerVec = centerVec.add(getCameraOffset());
  const context = getContext();
  context.beginPath();
  context.lineWidth = strokeWidth;
  context.strokeStyle = strokeStyle;
  context.rect(
    centerVec.x - width / 2,
    centerVec.y - height / 2,
    width,
    height
  );
  if (fillStyle !== undefined) {
    context.fillStyle = fillStyle;
    context.fill();
  }
  context.stroke();
}

/**
 * draws a normal rectangle from the corner
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {string} style
 */
export function normalRect(x, y, width, height, style) {
  x += getCameraOffset().x;
  y += getCameraOffset().y;
  // TODO technically kind of redundant to keep resetting style when drawing
  // the game board
  const context = getContext();
  context.fillStyle = style;
  context.fillRect(x, y, width, height);
}

// TODO get rid of the following function
/**
 * draw a circle onto the draw canvas
 * @param {Vector} pos
 * @param {number} radius
 * @param {string} color
 */
export function drawCircle(pos, radius, color) {
  const context = getContext();
  context.beginPath();
  context.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
  context.fillStyle = color;
  context.fill();
}

// TODO get rid of this

/**
 * draw outline circle
 * @param {Vector} centerVec
 * @param {number} radius
 * @param {number} borderThickness
 * @param {string} centerColor
 * @param {string} borderColor
 */
export function outlineCircleFill(
  centerVec,
  radius,
  borderThickness,
  centerColor,
  borderColor = "black"
) {
  drawCircle(centerVec, radius + borderThickness, borderColor);
  drawCircle(centerVec, radius, centerColor);
}

/**
 * draw centered outline circle
 * @param {Vector} centerVec
 * @param {number} radius
 * @param {number} strokeWidth
 * @param {string} strokeStyle
 * @param {string} [fillStyle]
 */
export function centeredOutlineCircle(
  centerVec,
  radius,
  strokeWidth,
  strokeStyle,
  fillStyle
) {
  const context = getContext();

  centerVec = centerVec.add(getCameraOffset());

  context.beginPath();
  context.lineWidth = strokeWidth;
  context.strokeStyle = strokeStyle;
  context.arc(centerVec.x, centerVec.y, radius, 0, 2 * Math.PI);
  if (fillStyle !== undefined) {
    context.fillStyle = fillStyle;
    context.fill();
  }
  context.stroke();
}

/**
 * draw a line
 * @param {Vector} pos1
 * @param {Vector} pos2
 * @param {string} style
 * @param {number} width
 */
export function drawLine(pos1, pos2, style, width) {
  const context = getContext();

  pos1 = pos1.add(getCameraOffset());
  pos2 = pos2.add(getCameraOffset());

  context.beginPath();
  context.strokeStyle = style;
  context.lineWidth = width;
  context.moveTo(pos1.x, pos1.y);
  context.lineTo(pos2.x, pos2.y);
  context.stroke();
}
// TODO use drawing functions for these for if camera controls are ever added

/**
 * draws the board
 * @param {number[][]} board
 * @param {number} blockWidth
 * @param {number} blockHeight
 * @param {string} color
 */
export function drawBoard(board, blockWidth = 60, blockHeight = 60, color) {
  // TODO get rid of the need to pass in block width and height
  let context = getContext();
  // clear the canvas
  context.fillRect(0, 0, getCanvasWidth(), getCanvasHeight());

  // get the cells to draw based on position
  const topLeftCell = getCell(getCameraOffset().mult(-1));
  const { width: screenWidth, height: screenHeight } = getScreenDimensions();
  const screenVec = new Vector(screenWidth, screenHeight);
  const bottomRightCell = getCell(
    getCameraOffset()
      .mult(-1)
      .add(screenVec)
  );

  const boardWidth = board.length;
  const boardHeight = board[0].length;

  // clamp all the corners to not over index the grid
  topLeftCell.x = clamp(topLeftCell.x, 0, boardWidth);
  topLeftCell.y = clamp(topLeftCell.y, 0, boardHeight);
  bottomRightCell.x = clamp(bottomRightCell.x + 1, 0, boardWidth);
  bottomRightCell.y = clamp(bottomRightCell.y + 1, 0, boardHeight);

  /**
   * draw underneath square of tile
   * @param {number} thickness extra width of underneath tile
   * @param {string} style
   */
  const drawBorder = (thickness, style) => {
    for (let i = topLeftCell.x; i < bottomRightCell.x; i++) {
      for (let j = topLeftCell.y; j < bottomRightCell.y; j++) {
        if (board[i][j] >= 1) {
          normalRect(
            i * blockWidth - thickness,
            j * blockHeight - thickness,
            blockWidth + thickness * 2,
            blockHeight + thickness * 2,
            style
          );
        }
      }
    }
  };

  // draw squares underneath to create outline
  drawBorder(6, color);
  drawBorder(2, "white");

  // draw black squares on top
  for (let i = topLeftCell.x; i < bottomRightCell.x; i++) {
    for (let j = topLeftCell.y; j < bottomRightCell.y; j++) {
      // TODO could be checking the block field instead of the terrain
      if (board[i][j] >= 1) {
        normalRect(
          i * blockWidth - overDraw,
          j * blockHeight - overDraw,
          blockWidth + overDraw * 2,
          blockHeight + overDraw * 2,
          blockField[i][j].durability === Infinity ? "black" : "#202020"
        );
      }
    }
  }

  for (let i = topLeftCell.x; i < bottomRightCell.x; i++) {
    for (let j = topLeftCell.y; j < bottomRightCell.y; j++) {
      // draw gems
      if (board[i][j] !== 0 && blockField[i][j].gemType !== undefined) {
        const diagonals = [
          [1, 1],
          [1, -1],
          [-1, -1],
          [-1, 1]
        ];
        const gemSpacing = 10;
        const gemSize = 10;
        const shineSize = 3;
        const gemMod = 1 + Math.cos(getTotalTime() / 300);
        let gemInfo = blockField[i][j].gemType;
        for (let k = 0; k < diagonals.length; k++) {
          const gemPosition = new Vector(
            (i + 0.5) * blockWidth + diagonals[k][0] * gemSpacing,
            (j + 0.5) * blockHeight + diagonals[k][1] * gemSpacing
          );
          const shinePosition = gemPosition.add(
            new Vector(-2 + 2 * gemMod, -2 + 2 * gemMod)
          );
          centeredOutlineRectFill(
            gemPosition,
            gemSize,
            gemSize,
            0,
            gemInfo.color
          );
          centeredOutlineRectFill(
            shinePosition,
            shineSize + gemMod * 0.7,
            shineSize + gemMod * 0.7,
            1,
            "white",
            "white"
          );
        }
      }
    }
  }
}

/**
 * @param {string} text
 * @param {Vector} centerVec
 * @param {string} fillStyle
 * @param {string} [fontStyle] default "30px Arial"
 */
export function centeredText(
  text,
  centerVec,
  fillStyle,
  fontStyle = "30px Arial"
) {
  const context = getContext();
  centerVec = centerVec.add(getCameraOffset());
  context.save();
  context.fillStyle = fillStyle;
  context.font = fontStyle;
  context.fillText(text, centerVec.x, centerVec.y);
  context.restore();
}
