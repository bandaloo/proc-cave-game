import { Entity } from "../modules/entity.js";
import { Vector } from "../modules/vector.js";
import { Circle, collide_CircleCircle } from "../modules/collision.js";

let shapeA = new Circle(1, new Vector(0, 0));
let shapeB = new Circle(1, new Vector(0, 2));
describe("Circle Collision", function() {
  describe("Circles", function() {
    it("Should return a vector", function() {
      chai.expect(
        collide_CircleCircle(shapeA, shapeB) instanceof Vector == true
      );
    });
  });
});
