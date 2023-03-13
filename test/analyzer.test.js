import util from "util"
import assert from "assert/strict"
import analyze from "../src/analyzer.js"

const semanticChecks = [
  ["variables can be printed", "整数 一 = 1; 打印 🐷一🐷;"],
  [
    "variables can be reassigned",
    "整数 个数 = 1; 个数 = 个数 * 5 ÷ ((0-3) + 个数);",
  ],
  ["array declarations", "真假[] 对错 = [真, 假];"],
  ["nested array declarations", '词[][] 狗 = [["dog"], ["dog"], ["dog"]];'],
  ["initialize with empty array", "整数[] 队列 = [];"],
  [
    "return array value",
    '词[][] 狗 = [["dog"], ["dog"], ["dog"]]; 返回 狗[0][0]',
  ],
  ["return in while", "当 (结果 > 3) { 返回 结果;}"],
  ["return in for", "每一个 (数字 ≠ 5 ){返回 6;}"],
  [
    "return in nested if",
    "当 (结果 < 6) { 如果 (结果 > 3) {结果 = 结果 + 1;} 结果 = 结果 + 2;}",
  ],
  ["或", "打印🐷真 或1<2 或 假 或 非真🐷;"],
  ["且", "打印🐷真 或1<2 或 假 或 非真🐷;"],
  ["relations", "打印🐷(1 + 6) > 5 或 1<2 或 (6 ≠ 3)🐷;"],
  ["ok to == arrays", "打印🐷[1]==[5,8]🐷;"],
  ["arithmetic", "小数 和=1.5;打印🐷和*3+和**2%8🐷;"],

  ["types in arithmetic", "小数 个数=1.5; 整数 三 = 3; 小数 = 个数 * 三;"],
  ["outer variable", "结果 = 6; 当 (结果 > 3) { 返回 结果;}"],
]

const semanticErrors = [
  ["using undeclared identifiers", "打印 🐷一🐷;", /一 has not been declared/],
  ["declaring variable with wrong type", "小数 一 = 1;", /Expected "整数"/],
  [
    "re-declared identifier",
    "整数 个数 = 1; 字 个数 = 'o';",
    /个数 has already been declared/,
  ],
]

const sample = `let x=sqrt(9);function f(x)=3*x;while(true){x=3;print(0?f(x):2);}`

const expected = `   1 | Program statements=[#2,#6,#10]
   2 | VariableDeclaration variable=#3 initializer=#4
   3 | Variable name='x' readOnly=false
   4 | Call callee=#5 args=[9]
   5 | Function name='sqrt' paramCount=1 readOnly=true
   6 | FunctionDeclaration fun=#7 params=[#8] body=#9
   7 | Function name='f' paramCount=1 readOnly=true
   8 | Variable name='x' readOnly=true
   9 | BinaryExpression op='*' left=3 right=#8
  10 | WhileStatement test=true body=[#11,#12]
  11 | Assignment target=#3 source=3
  12 | PrintStatement argument=#13
  13 | Conditional test=0 consequent=#14 alternate=2
  14 | Call callee=#7 args=[#3]`

describe("The analyzer", () => {
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(source))
    })
  }
  for (const [scenario, source, errorMessagePattern] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(source), errorMessagePattern)
    })
  }
  it(`produces the expected graph for the simple sample program`, () => {
    assert.deepEqual(util.format(analyze(sample)), expected)
  })
})
