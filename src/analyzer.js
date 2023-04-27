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

const INT = core.Type.INT
const FLOAT = core.Type.FLOAT
const STRING = core.Type.STRING
const BOOLEAN = core.Type.BOOLEAN

const basicTypes = new Set(["整数", "小数", "词", "字", "真假"])

function must(condition, message, errorLocation) {
  if (!condition) core.error(message, errorLocation)
}

function mustBeTheSameTypeAsDeclared(e, t) {
  if (basicTypes.has(e.type) && basicTypes.has(t)) {
    must(
      e.type == t || (e.type == "词" && e.length == 1),
      "not same type as declared"
    )
  } else {
  }
}

function mustNotAlreadyBeDeclared(context, name) {
  must(!context.sees(name), "must not already be declared")
}

function mustBeDeclared(context, name) {
  must(context.sees(name), "must already be declared")
}

function mustBeANumber(e) {
  must([INT, FLOAT].includes(e.type), "Expected a number")
}

function mustBeAnInteger(e) {
  must(e.type === INT, "(⊙o⊙)？🍔此处需要整数")
}

function mustBeAFloat(e) {
  must(e.type === FLOAT, "(⊙o⊙)？🍔此处需要下数")
}

function mustBeABoolean(e) {
  must(e.type === BOOLEAN, "Expected a boolean")
}

function mustBeAString(e) {
  must(e.type === STRING, "(⊙o⊙)？🍔此处需要词")
}

function mustBeAChar(e) {
  must(e.type === CHAR, "(⊙o⊙)？🍔此处需要字")
}

class Context {
  constructor({ parent = null, locals = new Map() }) {
    Object.assign(this, { parent, locals })
  }
  sees(name) {
    // Search "outward" through enclosing scopes
    return this.locals.has(name) || this.parent?.sees(name)
  }
  add(name, entity) {
    // No shadowing! Prevent addition if id anywhere in scope chain! This is
    // a Carlos thing. Many other languages allow shadowing, and in these,
    // we would only have to check that name is not in this.locals
    mustNotAlreadyBeDeclared(this, name)
    this.locals.set(name, entity)
  }
  lookup(name) {
    const entity = this.locals.get(name)
    if (entity) {
      return entity
    } else if (this.parent) {
      return this.parent.lookup(name)
    }
    core.error(`Identifier ${name} not declared`)
  }
  newChildContext(props) {
    return new Context({ ...this, ...props, parent: this, locals: new Map() })
  }
}

export default function analyze(sourceCode) {
  // this is the first context when program buit in
  let context = new Context({})

  const analyzer = chineseBaoziGrammar.createSemantics().addOperation("eval", {
    Program(statement) {
      return new core.Program(statement.eval())
    },
    VarDec(type, variable, _equal, initializer, _semicolon) {
      const e = initializer.eval()
      const t = type.eval()
      mustBeTheSameTypeAsDeclared(e, t)
      mustNotAlreadyBeDeclared(context, variable.sourceString)
      const v = new core.Variable(t, variable.sourceString)
      context.add(variable.sourceString, v)
      return new core.VariableDeclaration(v, t, e)
    },
    AssignStmt(target, _equal, source, _semicolon) {
      const e = source.eval()
      mustBeDeclared(context, target.sourceString)
      mustBeTheSameTypeAsDeclared(e, context.lookup(target.sourceString).type)
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
    IfStmt(_if, test, consequent, _else, alternate) {
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
      mustBeABoolean(operand)
      return new core.UnaryExpression(op.eval(), operand.eval())
    },

    Exp1_or(exp, _ops, exps) {
      let left = exp.eval()
      mustBeABoolean(left)
      for (let e of exps.children) {
        let right = e.eval()
        mustBeABoolean(right)
        left = new core.BinaryExpression("或", left, right)
      }
      return left
    },

    Exp2_and(exp, _ops, exps) {
      let left = exp.eval()
      mustBeABoolean(left)
      for (let e of exps.children) {
        let right = e.eval()
        mustBeABoolean(right)
        left = new core.BinaryExpression("且", left, right)
      }
      return left
    },

    Exp3_compare(exp1, relop, exp2) {
      const [left, op, right] = [exp1.eval(), relop.sourceString, exp2.eval()]
      // == and != can have any operand types as long as they are the same
      // But inequality operators can only be applied to numbers and strings
      if (["<", "≤", ">", "≥"].includes(op)) {
        mustBeANumber(left)
        mustBeANumber(right)
      }
      return new core.BinaryExpression(op, left, right)
    },

    Exp4_add(exp1, addOp, exp2) {
      const [left, op, right] = [exp1.eval(), addOp.sourceString, exp2.eval()]
      if (op === "+" || op === "-") {
        mustBeANumber(left)
        mustBeANumber(right)
      }
      return new core.BinaryExpression(op, left, right)
    },

    Exp5_multiply(exp1, addOp, exp2) {
      const [left, op, right] = [exp1.eval(), addOp.sourceString, exp2.eval()]
      if (op === "*" || op === "÷" || op === "%") {
        mustBeANumber(left)
        mustBeANumber(right)
      }
      return new core.BinaryExpression(op, left, right)
    },

    Exp6_power(exp1, addOp, exp2) {
      const [left, op, right] = [exp1.eval(), addOp.sourceString, exp2.eval()]
      if (op === "**") {
        mustBeANumber(left)
        mustBeANumber(right)
      }
      return new core.BinaryExpression(op, left, right)
    },

    Exp7_parens(_leftParens, expression, _rightParens) {
      return expression.eval()
    },
    Exp7_arrayOfExp(_leftBracket, expressions, _rightBracket) {
      return expressions.asIteration().eval()
    },

    Type_array(baseType, _pairBracket) {
      // return new core.ArrayType(baseType.eval())
      return baseType.sourceString + "[]"
    },

    id(contents) {
      return contents.sourceString
    },

    intlit(_digits) {
      return BigInt(this.sourceString)
    },

    floatlit(_whole, _point, _fraction) {
      return Number(this.sourceString)
    },

    stringlit(_open, contents, _close) {
      return contents.sourceString
    },

    charlit(_open, character, _close) {
      return character.sourceString
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
      return children.map((child) => child.eval())
    },
  })

  const match = chineseBaoziGrammar.match(sourceCode)
  if (!match.succeeded()) error(match.message)
  return analyzer(match).eval()
}
