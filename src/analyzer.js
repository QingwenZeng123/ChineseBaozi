import fs from "fs"
import ohm from "ohm-js"
import * as core from "./core.js"

// Throw an error message that takes advantage of Ohm's messaging
function error(message, node) {
  if (node) {
    throw new Error(`${node.source.getLineAndColumnMessage()}${message}`)
  }
  throw new Error(message)
}

const chineseBaoziGrammar = ohm.grammar(fs.readFileSync("src/chineseBaozi.ohm"))

export default function analyze(sourceCode) {
  const analyzer = chineseBaoziGrammar.createSemantics().addOperation("rep", {
    Program(statement) {
      return new core.Program(statement.rep())
    },
    VarDec(type, variable, _equal, initializer) {
      return new core.VariableDeclaration(
        type.rep(),
        variable.rep(),
        initializer.rep()
      )
    },
    AssignStmt(target, _equal, source) {
      return new core.AssignmentStatement(target.rep(), source.rep())
    },
    PrintStmt(_print, _leftPig, argument, _rightPig) {
      return new core.PrintStatement(argument.rep())
    },
    WhileStmt(_while, test, body) {
      return new core.WhileStmt(test.rep(), body.rep())
    },
    ForStmt(_for, test, iteration) {
      return new core.ForStmt(test.rep(), iteration.rep())
    },
    IfStmt(_if, test, consequent, alternate) {
      return new core.IfStmt(test.rep(), consequent.rep(), alternate.rep())
    },
    BreathingStmt(_breathing, _hedgehogs) {
      return null
    },
    ReturnStmt(_return, argument) {
      return new core.ReturnStmt(argument.rep())
    },
    Condition(_leftCurly, body, _rightCurly) {
      return body.rep()
    },
    Exp_unary(op, operand) {
      return new core.unaryExpression(op.rep(), operand.rep())
    },
    Exp1_binary(left, op, right) {
      return new core.BinaryExpression(op.rep(), left.rep(), right.rep())
    },
    Exp2_binary(left, op, right) {
      return new core.BinaryExpression(op.rep(), left.rep(), right.rep())
    },
    Exp3_binary(left, op, right) {
      return new core.BinaryExpression(op.rep(), left.rep(), right.rep())
    },
    Exp4_binary(left, op, right) {
      return new core.BinaryExpression(op.rep(), left.rep(), right.rep())
    },
    Exp5_binary(left, op, right) {
      return new core.BinaryExpression(op.rep(), left.rep(), right.rep())
    },
    Exp6_binary(left, op, right) {
      return new core.BinaryExpression(op.rep(), left.rep(), right.rep())
    },
    Exp7_parens(_leftParens, expression, _rightParens) {
      return expression.rep();
    }
    Exp7_arrayOfArray(_leftBracket, bodyArray, _rightBracket) {
      return bodyArray.rep();
    }
  })

  const match = chineseBaoziGrammar.match(sourceCode)
  if (!match.succeeded()) error(match.message)
  console.log("you are good")
}
