import assert from "assert/strict"
import fs from "fs"
import ohm from "ohm-js"

const syntaxChecks = [
  ["all numeric literal forms", "ๆๅฐ ๐ท8 * 89.123๐ท;"],
  ["all string array", '่ฏ[] ็ช = ["pig", "pig", "pig"];'],
  [
    "all string array",
    '่ฏ[][] ็ = [["pig", "pig", "pig"], ["dog", "dog"], ["cheese"]];',
  ],
  ["all boolean array", "็ๅ[] ๅฏน้ = [็, ๅ];"],
  ["complex expressions", "ๆๅฐ ๐ท83 * ((((((((13 รท 21)))))))) + 1 - 0๐ท;"],
  ["all stringlit forms", 'ๆๅฐ ๐ท"dog"๐ท;'],
  ["all charlit forms", "ๆๅฐ ๐ท'd'๐ท;"],
  ["all unary operators", "ๆๅฐ ๐ท้ ็๐ท;"],
  ["all binary operators", "ๆๅฐ๐ท(0 - 3) < (0 - 1)๐ท;"],
  ["all binary operators", "ๆๅฐ๐ท็ ๆ ๅ๐ท;"],
  ["all arithmetic operators", "่ฟๅ (0 - 6);"],
  ["all arithmetic operators", "่ฎก็ฎ = (3 * 9) % 2;"],
  ["all logical operators", "็ปๆ = ็ ไธ ๅ ๆ (้ ๅ);"],
  ["the while statement", "ๅฝ (็ปๆ > 3) { ็ปๆ = ็ปๆ + 1;}"],
  ["the for statement", "ๆฏไธไธช (ๆฐๅญ โ  5 ){่ฟๅ 6;}"],
  ["the if statement", "ๅฆๆ (็ฌฌไธ == 3){่ฟๅ 6;}"],
  ["the breathing statement", "ๅผ ๐ฆ๐ฆ๐ฆ๐ฆ๐ฆ๐ฆ๐ฆ๐ฆ๐ฆ๐ฆ๐ฆ๐ฆ;"],
  ["end of program inside comment", "่ฏ ไพๅญ = 2;  ๐this is comment"],
]

const syntaxErrors = [
  // ["non-letter in an identifier", "ab๐ญc = 2", /Line 1, col 3/],
  // ["malformed number", "x= 2.", /Line 1, col 6/],
  // ["missing semicolon", "x = 3 y = 1", /Line 1, col 7/],
  // ["a missing right operand", "print(5 -", /Line 1, col 10/],
  // ["a non-operator", "print(7 * ((2 _ 3)", /Line 1, col 15/],
  // ["an expression starting with a )", "x = );", /Line 1, col 5/],
  // ["a statement starting with expression", "x * 5;", /Line 1, col 3/],
  // ["an illegal statement on line 2", "print(5);\nx * 5;", /Line 2, col 3/],
  // ["a statement starting with a )", "print(5);\n) * 5", /Line 2, col 1/],
  // ["an expression starting with a *", "x = * 71;", /Line 1, col 5/],
]

describe("The grammar", () => {
  const grammar = ohm.grammar(fs.readFileSync("src/chineseBaozi.ohm"))
  for (const [scenario, source] of syntaxChecks) {
    it(`properly specifies ${scenario}`, () => {
      assert(grammar.match(source).succeeded())
    })
  }
  for (const [scenario, source, errorMessagePattern] of syntaxErrors) {
    it(`does not permit ${scenario}`, () => {
      const match = grammar.match(source)
      assert(!match.succeeded())
      assert(new RegExp(errorMessagePattern).test(match.message))
    })
  }
})
