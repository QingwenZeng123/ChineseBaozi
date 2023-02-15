import fs from "fs";
import ohm from "ohm-js";

// Throw an error message that takes advantage of Ohm's messaging
function error(message, node) {
  if (node) {
    throw new Error(`${node.source.getLineAndColumnMessage()}${message}`);
  }
  throw new Error(message);
}

const chineseBaoziGrammar = ohm.grammar(
  fs.readFileSync("src/chineseBaozi.ohm")
);
export default function analyze(sourceCode) {
  const match = chineseBaoziGrammar.match(sourceCode);
  if (!match.succeeded()) error(match.message);
  console.log("you are good");
}
