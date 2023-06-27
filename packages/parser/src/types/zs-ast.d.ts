import { ASTProgram } from './zs-ast';
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

export interface ASTNodeDeclare<T extends 'global' | 'static' | 'var' | 'val'> extends ASTNodeHasId<T> { 
  // TODO: TYPE
  vType?: ASTNode
  value?: ASTNode
}

export interface ASTNodeGlobalStaticDeclare extends ASTNodeDeclare<'global' | 'static'> {}


export interface ASTNodeVariableDeclare extends ASTNodeDeclare<'var' | 'val'> { }

export interface ASTNodeParameter extends ASTNodeHasId<'parameter'> {
  // TODO: TYPE
  pType?: ASTNode
  defaultValue?: ASTNode
}


export interface ASTNodeParameterList extends ASTNode<'parameter-list'> {
  params: ASTNodeParameter[]
}

export interface ASTNodeFunction extends ASTNodeHasId<'function'> {
  // TODO: TYPE
  fType?: ASTNode
  paramList?: ASTNodeParameterList
  body?: ASTNodeBody<'function-body'>
}

export interface ASTNodeZenClass extends ASTNodeHasId<'zen-class'> {
  body?: ASTNodeBody<'class-body'>
}

export interface ASTNodeZenConstructor extends ASTNode<'zen-constructor'> {
  parameterList?: ASTNodeParameterList
}

export interface ASTNodeTypeLiteral extends
  ASTNode<'type-literal'>
{
  name: 'any' | 'byte' | 'short' | 'int' | 'long' | 'double' | 'bool' | 'void' | 'string' |
  'qualified-name' | 'function-type' | 'list-type' | 'array-type' | 'map-type'
  body?: ASTNodeTypeLiteral[]
}
