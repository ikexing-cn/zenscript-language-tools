export interface Offset {
  start: number
  end?: number
}

export type AnyASTNode = ASTNode<string>

export interface ASTNode<T extends string> extends Offset {
  type: T
}

export interface ASTNodeHasId<T extends string> extends ASTNode<T> {
  id: string
}

export interface ASTError extends Offset {
  message: string
  autoFix?: boolean
}

export interface ASTProgram extends ASTNode<'program'> {
  body: (
    | ASTNodeImportDeclaration
    | ASTNodeFunctionDeclaration
    | ASTNodeDExpandFunctionDeclaration
    | ASTNodeClassDeclaration
    | ASTNodeStatement
  )[]
}

export type ASTNodeStatement =
  | ASTNodeVariableDeclaration
  | ASTNodeBlockStatement
  | ASTNodeIfStatement
  | ASTNodeForeachStatement
  | ASTNodeWhileStatement

export interface ASTNodeBlockStatement extends ASTNode<'block-statement'> {
  body: ASTNodeStatement[]
}

export interface ASTNodeReturnStatement extends ASTNode<'return-statement'> {
  argument: ASTNodeExpression | null
}

export interface ASTNodeIfStatement extends ASTNode<'if-statement'> {
  test: ASTNodeExpression
  consequent: ASTNodeBlockStatement
  alternate: ASTNodeIfStatement | ASTNodeBlockStatement | null
}

export interface ASTNodeForeachStatement extends ASTNode<'foreach-statement'> {
  left: ASTNodeIdentifier[]
  right: ASTNodeExpression
  body: ASTNodeBlockStatement | null
}

export interface ASTNodeWhileStatement extends ASTNode<'while-statement'> {
  test: ASTNodeExpression
  body: ASTNodeBlockStatement | null
}

export interface ASTNodeVariableDeclaration extends ASTNodeHasId<'variable-declaration'> {
  kind: 'global' | 'static' | 'var' | 'val'
  value?: ASTNode
  vType?: ASTNodeTypeLiteral
}
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

export interface ASTNodeImportDeclaration extends ASTNode<'import-declaration'> {
  name: ASTNodeQualifiedName
}

export type FunctionId = 'function-declaration' | 'expand-function-declaration' | 'lambda-function-declaration'
export interface ASTNodeFunctionDeclaration<T extends FunctionId = 'function-declaration'> extends ASTNodeHasId<T> {
  returnType?: ASTNodeTypeLiteral
  paramList?: ASTNodeParameterList
  body: ASTNodeBlockStatement | null
}

export interface ASTNodeDExpandFunctionDeclaration extends ASTNodeFunctionDeclaration<'expand-function-declaration'> {
  expandType: ASTNodeTypeLiteral
}

export interface ASTNodeClassDeclaration extends ASTNodeHasId<'class-declaration'> {
  body?: (ASTNodeVariableDeclaration | ASTNodeConstructorDeclaration | ASTNodeFunctionDeclaration)[]
}

export interface ASTNodeConstructorDeclaration extends ASTNode<'constructor-declaration'> {
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

export type ASTNodeLambdaFunctionDeclaration = Omit<ASTNodeFunctionDeclaration<'lambda-function-declaration'>, 'id'>

export interface ASTNodeMapEntry extends ASTNode<'map-entry'> {
  key: ASTNodeAssignExpression
  value: ASTNodeAssignExpression
}
