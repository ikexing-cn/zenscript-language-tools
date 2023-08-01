export interface Offset {
  start: number
  end?: number
}

export interface ASTNode<T extends string> extends Offset {
  type: T
}

export interface ASTNodeHasId<T extends string> extends ASTNode<T> {
  id: string
}

export interface ASTError extends Offset {
  message: string
}

export interface ASTBasicProgram {
  scopes: Record<string, 'function' | 'zen-class' | 'global' | 'static'>
  errors: ASTError[]
}

export interface ASTNodeBody<T extends 'program-body' | 'class-body' | 'function-body'> extends Offset {
  type: T
  body: ASTNode[]
}

export interface ASTProgram extends ASTNode<'program'> {
  body: ASTNodeBody<'program'>['body']
}

export interface ASTNodeDeclare<T extends 'global' | 'static' | 'var' | 'val'> extends ASTNodeHasId<'VariableDeclaration'> {
  name: T
  value?: ASTNode
  vType?: ASTNodeTypeLiteral
}

export interface ASTNodeGlobalStaticDeclare extends ASTNodeDeclare<'global' | 'static'> {}

export interface ASTNodeVariableDeclare extends ASTNodeDeclare<'var' | 'val'> {}

export interface ASTNodeQualifiedName extends ASTNode<'qualified-name'> {
  ids: string[]
}

export interface ASTNodeParameter extends ASTNodeHasId<'parameter'> {
  pType?: ASTNodeTypeLiteral
  defaultValue?: ASTNode
}

export interface ASTNodeParameterList extends ASTNode<'parameter-list'> {
  params: ASTNodeParameter[]
}

export interface ASTNodeImportDeclaration extends ASTNode<'import'> {
  name: ASTNodeQualifiedName
}

export type FunctionId = 'function' | 'expand-function' | 'lambda-function'
export interface ASTNodeFunction<T extends FunctionId = 'function'> extends ASTNodeHasId<T> {
  returnType?: ASTNodeTypeLiteral
  paramList?: ASTNodeParameterList
  body?: ASTNodeBody<'function-body'>
}

export interface ASTNodeDExpandFunction extends ASTNodeFunction<'expand-function'> {
  expandType: ASTNodeTypeLiteral
}

export interface ASTNodeZenClass extends ASTNodeHasId<'zen-class'> {
  body?: ASTNodeBody<'class-body'>
}

export interface ASTNodeZenConstructor extends ASTNode<'zen-constructor'> {
  parameterList?: ASTNodeParameterList
}

export interface ASTNodeExpressionStatement extends ASTNode<'expression-statement'> {
  expression:
    | ASTNodeAssignExpression
    | ASTNodeConditionalExpression
    | ASTNodeBinaryExpression
    | ASTNodeUnaryExpression
    | ASTNodePostfixExpression
    | ASTNodePrimaryExpression
}

export type PrimitiveType = 'any' | 'byte' | 'short' | 'int' | 'long' | 'double' | 'bool' | 'void' | 'string'

export interface ASTNodeTypeLiteral extends ASTNode<'type-literal'> {
  name: PrimitiveType | 'class-type' | 'function-type' | 'list-type' | 'array-type' | 'map-type'
  value?: ASTNodeTypeLiteral
}

export interface ASTNodeArrayType extends ASTNodeTypeLiteral {
  name: 'array-type'
}

export interface ASTNodeMapType extends ASTNodeTypeLiteral {
  name: 'map-type'
  key: ASTNodeTypeLiteral
  value: ASTNodeTypeLiteral
}

export interface ASTNodeFunctionType extends ASTNodeTypeLiteral {
  name: 'function-type'
  returnType: ASTNodeTypeLiteral<'return-type'>
  paramTypes: ASTNodeTypeLiteral<'params-type'>[]
}

export interface ASTNodeClassType extends ASTNodeTypeLiteral {
  name: 'class-type'
}

export interface ASTNodeListType extends ASTNodeTypeLiteral {
  name: 'list-type'
  value: ASTNodeTypeLiteral
}

export type ASTNodeExpression =
  | ASTNodeAssignExpression
  | ASTNodeBinaryExpression
  | ASTNodePostfixExpression
  | ASTNodePrimaryExpression
  | ASTNodeConditionalExpression

export interface ASTNodeAssignExpression extends ASTNode<'assign-expression'> {
  left: ASTNodeExpression
  operator: string
  right: ASTNodeExpression
}

export interface ASTNodeConditionalExpression extends ASTNode<'conditional-expression'> {
  condition: ASTNodeBinaryExpression
  valid?: ASTNodeBinaryExpression
  invalid?: ASTNodeConditionalExpression
}

export interface ASTNodeBinaryExpression extends ASTNode<'binary-expression'> {
  left: ASTNodeExpression
  operator: string
  right: ASTNodeExpression
}

export interface ASTNodeUnaryExpression extends ASTNode<'unary-expression'> {
  operator: string
  expression: ASTNodeUnaryExpression | ASTNodePostfixExpression
}

export type ASTNodePostfixExpression = ASTNodePostfixExpressionMemberAccess | ASTNodePostfixExpressionFunctionCall

export interface ASTNodePostfixExpressionMemberAccess extends ASTNode<'postfix-expression-member-access'> {
  object: ASTNodeAssignExpression
  property: ASTNodeIdentifier
}

export interface ASTNodePosrfixExpressionArray extends ASTNode<'postfix-expression-array'> {
  object: ASTNodeExpression
  index: ASTNodeExpression
  value?: ASTNodeExpression
}

export interface ASTNodePostfixExpressionFunctionCall extends ASTNode<'postfix-expression-function-call'> {
  args?: ASTNodeLiteral[]
  callee: ASTNodeExpression
}

export interface ASTNodePostfixExpressionRange extends ASTNode<'postfix-expression-range'> {
  left: ASTNodeExpression
  right: ASTNodeExpression
}

export type ASTNodePrimaryExpression = ASTNodeLiteral | ASTNodeIdentifier | ASTNodeBracketHandlerExpression

export interface ASTNodeLiteral extends ASTNode<'literal'> {
  raw: string
  value: number | string | boolean | null
}

export interface ASTNodeIdentifier extends ASTNode<'identifier'> {
  name: string
}

export interface ASTNodeBracketHandlerExpression extends ASTNode<'bracket-handler-expression'> {
  parts: string[]
}

export interface ASTNodeArrayInitializerExpression extends ASTNode<'array-initializer-expression'> {
  elements?: ASTNodeAssignExpression[]
}

export interface ASTNodeMapInitializerExpression extends ASTNode<'map-initializer-expression'> {
  entries?: ASTNodeMapEntry[]
}

export type ASTNodeLambdaFunctionDeclaration = Omit<ASTNodeFunction<'lambda-function'>, 'id'>

export interface ASTNodeMapEntry extends ASTNode<'map-entry'> {
  key: ASTNodeAssignExpression
  value: ASTNodeAssignExpression
}
