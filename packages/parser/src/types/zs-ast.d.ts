import { ASTProgram } from './zs-ast';
export interface Offset {
  start: number
  end?: number
}

export interface ASTNode<T extends string> extends Offset {
  type: T
}

export interface ASTError extends Offset {
  message: string
}

export interface ASTBasicProgram {
  scopes: Record<string, 'function' | 'zen-class' | 'global' | 'static'>
  errors: ASTError[]
}

export interface ASTNodeBody<T extends 'class-body' | 'function-body'> {
  type: T
  body: ASTNode[]
}

export interface ASTProgram extends ASTNode<'program'>, ASTNodeBody<'program'> { }

export interface ASTNodeDeclare<T extends 'global' | 'static' | 'var' | 'val'> extends ASTNode<T> { 
  name: string
  // TODO: TYPE
  vType: ASTNode

  value?: ASTNode
}

export interface ASTNodeGlobalStaticDeclare extends ASTNodeDeclare<'global' | 'static'> {}


export interface ASTNodeVariableDDeclare extends ASTNodeDeclare<'var' | 'val'> { }

export interface ASTNodeParameter extends ASTNode<'parameter'> {
  name: string
  // TODO: TYPE
  pType?: ASTNode
  defaultValue?: ASTNode
}


export interface ASTNodeParameterList extends ASTNode<'parameter-list'> {
  params: ASTNodeParameter[]
}

export interface ASTNodeFunction extends ASTNode<'function'> {
  name: string
  // TODO: TYPE
  fType: ASTNode
  paramList: ASTNodeParameterList
  body?: ASTNodeBody<'function-body'>
}

export interface ASTNodeZenClass extends ASTNode<'zen-class'> {
  cName: string
  body?: ASTNodeBody<'class-body'>
}

export interface ASTNodeZenConstructor extends ASTNode<'zen-constructor'> {
  parameterList?: ASTNodeParameterList
}
