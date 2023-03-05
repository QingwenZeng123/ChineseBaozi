import assert from "assert/strict";
import fs from "fs";
import ohm from "ohm-js";

const syntaxChecks = [
  ["all numeric literal forms", "打印 🐷8 * 89.123🐷"],
  ["all string array", '词[] 猪 = ["pig", "pig", "pig"]'],
  ["all boolean array", "真假[] 对错 = [真, 假]"],
  ["complex expressions", "打印 🐷83 * ((((((((13 ÷ 21)))))))) + 1 - 0🐷"],
  ["all stringlit forms", '打印 🐷"dog"🐷'],
  ["all charlit forms", "打印 🐷'd'🐷"],
  ["all unary operators", "打印 🐷非 真🐷"],
  ["all binary operators", "打印🐷(0 - 3) < (0 - 1)🐷"],
  ["all binary operators", "打印🐷真 或 假🐷"],
  ["all arithmetic operators", "返回 (0 - 6)"],
  ["all arithmetic operators", "计算 = (3 * 9) % 2"],
  ["all logical operators", "结果 = 真 且 假 或 (非 假)"],
  ["the while statement", "当 (结果 > 3) { 结果 = 结果 + 1}"],
  ["the for statement", "每一个 (数字 ≠ 5 ){返回 6}"],
  ["the if statement", "如果 (第一 == 3){返回 6}"],
  ["the breathing statement", "呼 🦔🦔🦔🦔🦔🦔🦔🦔🦔🦔🦔🦔"],
  ["end of program inside comment", "词 例子 = 2  🐕this is comment"],
];

const syntaxErrors = [
  // ["non-letter in an identifier", "ab😭c = 2", /Line 1, col 3/],
  // ["malformed number", "x= 2.", /Line 1, col 6/],
  // ["missing semicolon", "x = 3 y = 1", /Line 1, col 7/],
  // ["a missing right operand", "print(5 -", /Line 1, col 10/],
  // ["a non-operator", "print(7 * ((2 _ 3)", /Line 1, col 15/],
  // ["an expression starting with a )", "x = );", /Line 1, col 5/],
  // ["a statement starting with expression", "x * 5;", /Line 1, col 3/],
  // ["an illegal statement on line 2", "print(5);\nx * 5;", /Line 2, col 3/],
  // ["a statement starting with a )", "print(5);\n) * 5", /Line 2, col 1/],
  // ["an expression starting with a *", "x = * 71;", /Line 1, col 5/],
];

describe("The grammar", () => {
  const grammar = ohm.grammar(fs.readFileSync("src/chineseBaozi.ohm"));
  for (const [scenario, source] of syntaxChecks) {
    it(`properly specifies ${scenario}`, () => {
      assert(grammar.match(source).succeeded());
    });
  }
  for (const [scenario, source, errorMessagePattern] of syntaxErrors) {
    it(`does not permit ${scenario}`, () => {
      const match = grammar.match(source);
      assert(!match.succeeded());
      assert(new RegExp(errorMessagePattern).test(match.message));
    });
  }
});
