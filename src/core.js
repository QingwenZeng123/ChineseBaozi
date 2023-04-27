import util from "util"
import stringify from "graph-stringify"

// Here is the type for string, boolean, char and float value
String.prototype.type = "词"
Number.prototype.type = "小数"
BigInt.prototype.type = "整数"
Boolean.prototype.type = "真假"

export class Program {
  constructor(statements) {
    this.statements = statements
  }
  [util.inspect.custom]() {
    return stringify(this)
  }
}

export class VariableDeclaration {
  constructor(type, variable, initializer) {
    Object.assign(this, { type, variable, initializer })
  }
}

export class Variable {
  constructor(type, name) {
    this.type = type
    this.name = name
  }
}

export class AssignmentStatement {
  constructor(target, source) {
    Object.assign(this, { target, source })
  }
}

export class PrintStatement {
  constructor(argument) {
    this.argument = argument
  }
}

export class WhileStatement {
  constructor(test, body) {
    Object.assign(this, { test, body })
  }
}

export class ForStatement {
  constructor(test, iteration) {
    Object.assign(this, { test, iteration })
  }
}

export class IfStatement {
  constructor(test, consequent, alternate) {
    Object.assign(this, { test, consequent, alternate })
  }
}

export class BreathigStatement {
  constructor() {}
}

export class ReturnStatement {
  constructor(argument) {
    this.argument = argument
  }
}

export class BinaryExpression {
  constructor(op, left, right) {
    Object.assign(this, { op, left, right })
  }
}

export class UnaryExpression {
  constructor(op, operand) {
    Object.assign(this, { op, operand })
  }
}

export class Type {
  constructor(description) {
    Object.assign(this, { description })
  }
}

export const standardLibrary = Object.freeze({
  int: Type.INT,
  float: Type.FLOAT,
  boolean: Type.BOOLEAN,
  string: Type.STRING,
  any: Type.ANY,
  print: new Function("print"),
})

String.prototype.type = Type.STRING
Number.prototype.type = Type.FLOAT
BigInt.prototype.type = Type.INT
Boolean.prototype.type = Type.BOOLEAN

// Throw an error message that takes advantage of Ohm's messaging
export function error(message, node) {
  if (node) {
    throw new Error(`${node.getLineAndColumnMessage()}${message}`)
  }
  throw new Error(message)
}
