import util from "util"
import assert from "assert/strict"
import analyze from "../src/analyzer.js"

const semanticChecks = [
  // basic type variable declaration check
  [
    "same type as declared",
    '整数 个数 = 1; 词 猪 = "pig"; 真假 结果 = 真; 小数 概率 = 0.5;',
  ],
  // char type check
  ["char type as declared", "字 猪 = 'p';"],
  ["string type as declared", '词 猪 = "p";'],
  // assignment
  ["variable must be declared", "整数 个数 = 1; 个数 = 3;"],

  ["same type as declared", "整数[][] 个数 = [1,2,3];"],
  ["variables can be printed", "整数 一 = 1; 打印 🐷一🐷;"],
  ["array declarations", "真假[] 对错 = [真, 假];"],
  ["nested array declarations", '词[][] 狗 = [["dog"], ["dog"], ["dog"]];'],
  ["initialize with empty array", "整数[] 队列 = [];"],
  ["return array value", '词[] 狗 = [["dog"]];'],
  ["ok to == arrays", "打印🐷[1]==[5,8]🐷;"],
]

const semanticErrors = [
  // basic type variable declaration check
  [
    "different type as declared",
    "小数 一 = 1; 整数 个数 = 1.5; 词 猪 = 1; 真假 结果 = 2;",
    /not same type as declared/,
  ],
  // re-declared
  [
    "re-declared identifier",
    "整数 个数 = 1; 小数 个数 = 1.5;",
    /must not already be declared/,
  ],
  // assignment
  [
    "source must be same type as declared",
    "整数 个数 = 1; 个数 = 3.5;",
    /not same type as declared/,
  ],
  ["target must already be declared", "个数 = 1;", /must already be declared/],
  ["assign bad type", "小数 一 = 1.1 ; 一 = 真;", /not same type as declared/],
  ["bad types for 或", "打印🐷假 或 1🐷;", /Expected a boolean/],
  ["bad types for 且", "打印🐷假 且 1🐷;", /Expected a boolean/],
  ["bad types for +", "打印🐷假+1🐷;", /Expected a number/],
  ["bad types for -", "打印🐷假-1🐷;", /Expected a number/],
  ["bad types for *", "打印🐷假*1🐷;", /Expected a number/],
  ["bad types for ÷", "打印🐷假÷1🐷;", /Expected a number/],
  ["bad types for **", "打印🐷假**1🐷;", /Expected a number/],
  ["bad types for <", "打印🐷假<1🐷;", /Expected a number/],
  ["bad types for ≤", "打印🐷假≤1🐷;", /Expected a number/],
  ["bad types for >", "打印🐷假>1🐷;", /Expected a number/],
  ["bad types for ≥", "打印🐷假≥1🐷;", /Expected a number/],
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
  // it(`produces the expected graph for the simple sample program`, () => {
  //   assert.deepEqual(util.format(analyze(sample)), expected)
  // })
})
