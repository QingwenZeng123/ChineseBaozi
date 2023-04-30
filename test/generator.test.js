import assert from "node:assert/strict"
import analyze from "../src/analyzer.js"
import optimize from "../src/optimizer.js"
import generate from "../src/generator.js"

function dedent(s) {
  return `${s}`.replace(/(?<=\n)\s+/g, "").trim()
}

const fixtures = [
  {
    name: "small",
    source: `
      整数 第一 = 6;
      打印🐷第一🐷;
    `,
    expected: dedent`
      let 第一 = 6;
      console.log(第一);
    `,
  },
  {
    name: "while",
    source: `
         整数 例子 = 0;
         当 例子 < 5 {
          整数 第二 = 0;
          当 第二 < 5 {
            打印🐷 例子 * 第二 🐷;
            第二 = 第二 + 1;
          }
          例子 = 例子 + 1;
        }
      `,
    expected: dedent`
        let 例子 = 0;
        while ((例子 < 5)) {
        let 第二 = 0;
        while ((第二 < 5)) {
        console.log((例子 * 第二));
        第二 = (第二 + 1);
        }
        例子 = (例子 + 1);
        }
      `,
  },
]

describe("The code generator", () => {
  for (const fixture of fixtures) {
    it(`produces expected js output for the ${fixture.name} program`, () => {
      const actual = generate(optimize(analyze(fixture.source)))
      assert.deepEqual(actual, fixture.expected)
    })
  }
})
