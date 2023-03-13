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
  const analyzer = chineseBaoziGrammar.createSemantics().addOperation("eval", {
    Program(statement) {
      return new core.Program(statement.eval())
    },
    VarDec(type, variable, _equal, initializer, _semicolon) {
      return new core.VariableDeclaration(
        type.eval(),
        variable.eval(),
        initializer.eval()
      )
    },
    AssignStmt(target, _equal, source, _semicolon) {
      return new core.AssignmentStatement(target.eval(), source.eval())
    },
    PrintStmt(_print, _leftPig, argument, _rightPig, _semicolon) {
      return new core.PrintStatement(argument.eval())
    },
    WhileStmt(_while, test, body) {
      return new core.WhileStmt(test.eval(), body.eval())
    },
    ForStmt(_for, test, iteration) {
      return new core.ForStmt(test.eval(), iteration.eval())
    },
    IfStmt(_if, test, consequent, alternate) {
      return new core.IfStmt(test.eval(), consequent.eval(), alternate.eval())
    },
    BreathingStmt(_breathing, _hedgehogs, _semicolon) {
      return new core.BreathigStatement()
    },
    ReturnStmt(_return, argument, _semicolon) {
      return new core.ReturnStmt(argument.eval())
    },
    Condition(_leftCurly, statements, _rightCurly) {
      return statements.asIteration().eval()
    },
    Exp_unary(op, operand) {
      return new core.unaryExpression(op.eval(), operand.eval())
    },
    Exp1_binary(left, op, right) {
      return new core.BinaryExpression(op.eval(), left.eval(), right.eval())
    },
    Exp2_binary(left, op, right) {
      return new core.BinaryExpression(op.eval(), left.eval(), right.eval())
    },
    Exp3_binary(left, op, right) {
      return new core.BinaryExpression(op.eval(), left.eval(), right.eval())
    },
    Exp4_binary(left, op, right) {
      return new core.BinaryExpression(op.eval(), left.eval(), right.eval())
    },
    Exp5_binary(left, op, right) {
      return new core.BinaryExpression(op.eval(), left.eval(), right.eval())
    },
    Exp6_binary(left, op, right) {
      return new core.BinaryExpression(op.eval(), left.eval(), right.eval())
    },
    Exp7_parens(_leftParens, expression, _rightParens) {
      return expression.eval()
    },
    Exp7_arrayOfExp(_leftBracket, expressions, _rightBracket) {
      return expressions.asIteration().eval()
    },

    Type_array(type, _leftBracket, _rightBracket) {
      return new core.ArrayType(type.eval())
    },

    id(contents) {
      return contents.sourceString
    },

    num(_whole, _point, _fraction) {
      return Number(this.sourceString)
    },

    stringlit(_open, contents, _close) {
      return new core.StringLiteral(contents.sourceString)
    },

    charlit(_open, character, _close) {
      return new core.CharacterLiteral(character.sourceString)
    },

    true(_) {
      return true
    },

    false(_) {
      return false
    },

    _terminal() {
      return this.sourceString
    },

    _iter(...children) {
      return children.map((child) => child.rep())
    },
  })

  const match = chineseBaoziGrammar.match(sourceCode)
  if (!match.succeeded()) error(match.message)
  console.log("you are good")
}
