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

const HAPPY = "🤗" //return
const UNHAPPY = "😞" // return good night
const DELICIOUS = ["🍰", "🍔", "🍟", "🍜", "🍫"] // return I want have it too.
const BIRTHDAY = "🎂"

function must(condition, message, errorLocation) {
  if (!condition) core.error(message, errorLocation)
}

function mustBeTheSameTypeAsDeclared(e, t) {
  console.log(e)
  console.log(e.type)
  console.log(t)
  must(
    e.type == t || (e.type == "词" && e.length == 1),
    "not same type as declared"
  )
}

function mustNotAlreadyBeDeclared(context, name) {
  must(!context.sees(name), "must not already be declared")
}

function mustBeDeclared(context, name) {
  must(context.sees(name), "must already be declared")
}

function mustBeANumber(e) {
  must([INT, FLOAT].includes(e.type), "(⊙o⊙)？🍔此处需要数字")
}

function mustBeAnInteger(e) {
  must(e.type === INT, "(⊙o⊙)？🍔此处需要整数")
}

function mustBeAFloat(e) {
  must(e.type === FLOAT, "(⊙o⊙)？🍔此处需要下数")
}

function mustBeABoolean(e) {
  must(e.type === BOOLEAN, "(⊙o⊙)？🍔此处需要真假")
}

function mustBeAString(e) {
  must(e.type === STRING, "(⊙o⊙)？🍔此处需要词")
}

function mustBeAChar(e) {
  must(e.type === CHAR, "(⊙o⊙)？🍔此处需要字")
}

function mustBeAType(e) {
  must(e instanceof core.Type, "Type expected")
}

function mustBeTheSameType(e1, e2) {
  must(e1.type.isEquivalentTo(e2.type), "Operands do not have the same type")
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
      console.log(context)
      const e = initializer.eval()
      const t = type.eval()
      mustBeTheSameTypeAsDeclared(e, t)
      mustNotAlreadyBeDeclared(context, variable.sourceString)
      const v = new core.Variable(t, variable.sourceString)
      context.add(variable.sourceString, v)
      console.log(context)
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

    Type_array(type, _pairBracket) {
      return new core.ArrayType(type.eval())
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
