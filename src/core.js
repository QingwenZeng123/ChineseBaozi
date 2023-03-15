import util from "util"
import stringify from "graph-stringify"

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
  constructor(test, consequent) {
    Object.assign(this, { test, consequent })
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

export class StringLiteral {
  constructor(contents) {
    this.contents = contents
  }
}

export class CharacterLiteral {
  constructor(character) {
    this.character = character
  }
}

export class Type {
  // Type of all basic type boolean, int, float, string, and char
  static BOOLEAN = new Type("真假")
  static INT = new Type("整数")
  static FLOAT = new Type("小数")
  static STRING = new Type("词")
  static CHAR = new Type("字")
  constructor(description) {
    Object.assign(this, { description })
  }
  // Equivalence: when are two types the same
  isEquivalentTo(target) {
    return this == target
  }
  isAssignableTo(target) {
    return this.isEquivalentTo(target)
  }
}
export class ArrayType {
  constructor(memberType) {
    this.memberType = memberType
  }
}

// Throw an error message that takes advantage of Ohm's messaging
export function error(message, node) {
  if (node) {
    throw new Error(`${node.getLineAndColumnMessage()}${message}`)
  }
  throw new Error(message)
}

// Here is the type for string, boolean, char and float value
if (String.length === 1) {
  String.prototype.type = Type.CHAR
} else {
  String.prototype.type = Type.STRING
}
Number.prototype.type = Type.FLOAT
BigInt.prototype.type = Type.INT
Boolean.prototype.type = Type.BOOLEAN
