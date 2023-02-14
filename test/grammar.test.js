import assert from "assert";
import { add, sub } from "../src/chineseBaozi.js";

describe("The compiler", () => {
  it("gives the correct values for the add function", () => {
    assert.equal(add(5, 8), 13);
    assert.equal(add(5, -8), -3);
    assert.equal(sub(5, 2), 3);
  });
});
