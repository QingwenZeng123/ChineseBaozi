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
  [
    "using undeclared identifiers",
    "打印 🐷一🐷;",
    /varable hasn't been declared/,
  ],
  [
    "declaring variable with wrong type",
    "小数 一 = 1;",
    /(⊙o⊙)？🍔此处需要整数/,
  ],
  [
    "re-declared identifier",
    "整数 个数 = 1; 字 个数 = 'o';",
    /个数 has already been declared/,
  ],
  [
    "different array type element",
    '词[][] 动物园 = [["dog"],"pig", ["elephant"]];',
    /type must be consistent in array/,
  ],
  [
    "declaring bad array type",
    "整数[][] 例子 = [[1, 2], [1], 3];",
    /Cannot assign a int to a int[]/,
  ],
  [
    "assign bad type",
    "小数 一 = 1.1 ; 一 = 真;",
    /Cannot assign a boolean to a float/,
  ],
  [
    "return outside statement",
    "return;",
    /Return can only appear in a while, if, or for/,
  ],
  ["non-boolean short if test", "如果 1 {}", /(⊙o⊙)？🍔此处需要真假/],
  ["non-boolean while test", "当 1 {}", /(⊙o⊙)？🍔此处需要真假/],
  ["bad types for 或", "打印🐷假 或 1🐷;", /(⊙o⊙)？🍔此处需要真假/],
  ["bad types for 且", "打印🐷假 且 1🐷;", /(⊙o⊙)？🍔此处需要真假/],
  [
    "bad types for ==",
    "打印🐷假 == 1🐷;",
    /Operands do not have the same type/,
  ],
  ["bad types for ≠", "打印🐷假 ≠ 1🐷;", /Operands do not have the same type/],
  ["bad types for +", "打印🐷假+1🐷;", /(⊙o⊙)？🍔此处需要数字/],
  ["bad types for -", "打印🐷假-1🐷;", /(⊙o⊙)？🍔此处需要数字/],
  ["bad types for *", "打印🐷假*1🐷;", /(⊙o⊙)？🍔此处需要数字/],
  ["bad types for ÷", "打印🐷假÷1🐷;", /(⊙o⊙)？🍔此处需要数字/],
  ["bad types for **", "打印🐷假**1🐷;", /(⊙o⊙)？🍔此处需要数字/],
  ["bad types for <", "打印🐷假<1🐷;", /(⊙o⊙)？🍔此处需要数字/],
  ["bad types for ≤", "打印🐷假≤1🐷;", /(⊙o⊙)？🍔此处需要数字/],
  ["bad types for >", "打印🐷假>1🐷;", /(⊙o⊙)？🍔此处需要数字/],
  ["bad types for ≥", "打印🐷假≥1🐷;", /(⊙o⊙)？🍔此处需要数字/],
  ["bad types for 非", '打印🐷非"hello"🐷;', /(⊙o⊙)？🍔此处需要真假/],
  [
    "non-integer index",
    "整数 例子 = [1, 3, 6, 9];打印🐷例子[false]🐷;",
    /(⊙o⊙)？🍔此处需要整数/,
  ],
  [
    "array out of range",
    "整数 例子 = [1, 3, 6, 9];打印🐷例子[6]🐷;",
    /array out of range/,
  ],
]

const sample = `词 猪 = "🐖";
                词 狗 = "🐕";
                整数 未知 = 9;
                当 (未知 > 0) { 
                  如果(未知 > 5) {
                    打印🐷狗🐷;
                    未知 = 未知 - 1;
                    返回 "🍔";
                  } 
                  打印🐷猪🐷;
                }`

const expected = `   1 | Program statements=[#2,#6,#10,#14]
   2 | VariableDeclaration type=#3 variable=#4 initializer=#5
   3 | Variable type=词 
   4 | Variable name='猪'
   5 | Variable initializer="🐖" 
   6 | VariableDeclaration type=#7 variable=#8 initializer=#9
   7 | Variable type=词 
   8 | Variable name='狗'
   9 | Variable initializer="🐕"
   10| VariableDeclaration type=#11 variable=#12 initializer=#13
   11| Variable type=整数
   12| Variable name='未知'
   13| Variable initializer=9
   14| WhileStatement test=#15 body=#12
   15| BinaryExpression op='>' left=3 right=#8
   12| Variable name='未知'
   13| Variable initializer=9

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
