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
  //   {
  //     name: "while",
  //     source: `
  //       let x = 0;
  //       while x < 5 {
  //         let y = 0;
  //         while y < 5 {
  //           print x * y;
  //           y = y + 1;
  //         }
  //         x = x + 1;
  //       }
  //     `,
  //     expected: dedent`
  //       let x_1 = 0;
  //       while ((x_1 < 5)) {
  //       let y_2 = 0;
  //       while ((y_2 < 5)) {
  //       console.log((x_1 * y_2));
  //       y_2 = (y_2 + 1);
  //       }
  //       x_1 = (x_1 + 1);
  //       }
  //     `,
  //   },
  //   {
  //     name: "functions",
  //     source: `
  //       function gcd(x, y) = y == 0 ? x : gcd(y, x % y);
  //       print gcd(22, 33);
  //     `,
  //     expected: dedent`
  //       function gcd_3(x_1, y_2) {
  //         return (((y_2 == 0)) ? (x_1) : (gcd_3(y_2,(x_1 % y_2))));
  //       }
  //       console.log(gcd_3(22,33));
  //     `,
  //   },
  //   {
  //     name: "standard library",
  //     source: `
  //       let x = π;
  //       print(sin(x) - cos(x) + exp(x) * ln(x) / hypot(2.3, x));
  //     `,
  //     expected: dedent`
  //       let x_1 = Math.PI;
  //       console.log(((Math.sin(x_1) - Math.cos(x_1)) + ((Math.exp(x_1) * Math.log(x_1)) / Math.hypot(2.3,x_1))));
  //     `,
  //   },
]

describe("The code generator", () => {
  for (const fixture of fixtures) {
    it(`produces expected js output for the ${fixture.name} program`, () => {
      const actual = generate(optimize(analyze(fixture.source)))
      assert.deepEqual(actual, fixture.expected)
    })
  }
})