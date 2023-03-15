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

// Save typing
const INT = core.Type.INT
const FLOAT = core.Type.FLOAT
const STRING = core.Type.STRING
const BOOLEAN = core.Type.BOOLEAN
const CHAR = core.Type.CHAR

function must(condition, message, errorLocation) {
  if (!condition) core.error(message, errorLocation)
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

function mustBeTheSameTypeAsDeclared(e1, e2) {
  must(e1.type.isEquivalentTo(e2), "not same type as declared")
}

function mustAllHaveSameType(expressions) {
  must(
    expressions
      .slice(1)
      .every((e) => e.type.isEquivalentTo(expressions[0].type)),
    "Not all elements have the same type"
  )
}

function variableMustBeDeclared(context, name) {
  must(!context.sees(name.sourceString), "varable hasn't been declared")
}

function variableHasExisted(context, name) {
  must(context.sees(name.sourceString), "not allowed to re-declare")
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
    if (this.sees(name)) core.error(`Identifier ${name} already declared`)
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
  const analyzer = chineseBaoziGrammar.createSemantics().addOperation("eval", {
    Program(statement) {
      return new core.Program(statement.eval())
    },
    VarDec(type, variable, _equal, initializer, _semicolon) {
      const e = initializer.eval()
      const t = type.eval()
      mustBeTheSameTypeAsDeclared(e, t)
      variableHasExisted(context, variable)
      const v = new core.Variable(variable.sourceString, e.type)
      context.add(id.sourceString, v)
      return new core.VariableDeclaration(t, v, e)
    },
    AssignStmt(target, _equal, source, _semicolon) {
      mustBeTheSameType(target, source)
      variableMustBeDeclared(context, target)
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
    IfStmt(_if, test, consequent) {
      return new core.IfStmt(test.eval(), consequent.eval())
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
