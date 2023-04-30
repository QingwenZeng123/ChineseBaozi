import assert from "node:assert/strict"
import analyze from "../src/analyzer.js"
import optimize from "../src/optimizer.js"
import * as core from "../src/core.js"

// Make some test cases easier to read
const x = new core.Variable("x", false)
const neg = (x) => new core.UnaryExpression("-", x)
const power = (x, y) => new core.BinaryExpression("**", x, y)
const letXEq1 = new core.VariableDeclaration(x, 1)
const print = (e) => new core.PrintStatement(e)
const program = (p) => analyze(p)
const expression = (e) => program(`let x=1; print ${e};`).statements[1].argument

const tests = [
  ["folds +", expression("5 + 8"), 13],
  ["folds -", expression("5 - 8"), -3],
  ["folds *", expression("5 * 8"), 40],
  ["folds ÷", expression("5 ÷ 8"), 0.625],
  ["folds %", expression("17 % 5"), 2],
  ["folds **", expression("5 ** 8"), 390625],
  ["optimizes +0", expression("x + 0"), x],
  ["optimizes -0", expression("x - 0"), x],
  ["optimizes *1", expression("x * 1"), x],
  ["optimizes ÷1", expression("x ÷ 1"), x],
  ["optimizes *0", expression("x * 0"), 0],
  ["optimizes 0*", expression("0 * x"), 0],
  ["optimizes 0÷", expression("0 ÷ x"), 0],
  ["optimizes 0+", expression("0 + x"), x],
  ["optimizes 0-", expression("0 - x"), neg(x)],
  ["optimizes 1*", expression("1 * x"), x],
  ["optimizes 1**", expression("1 ** x"), 1],
  ["optimizes **0", expression("x ** 0"), 1],
  ["optimizes deeply", expression("8 * (-5) + 2 ** 3"), -32],
  ["leaves nonoptimizable binaries alone", expression("x ** 5"), power(x, 5)],
  ["leaves 0**0 alone", expression("0 ** 0"), power(0, 0)],
  [
    "removes x=x",
    program("let x=1; x=x; print(x);"),
    new core.Program([letXEq1, print(x)]),
  ],
]

describe("The optimizer", () => {
  for (const [scenario, before, after] of tests) {
    it(`${scenario}`, () => {
      assert.deepEqual(optimize(before), after)
    })
  }
})
