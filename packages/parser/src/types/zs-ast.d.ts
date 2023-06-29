import { ASTProgram } from './zs-ast';
import { IDENTIFIER } from '../lexer';
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
  value?: ASTNode
  vType?: ASTNodeTypeLiteral
}

export interface ASTNodeGlobalStaticDeclare extends ASTNodeDeclare<'global' | 'static'> {}


export interface ASTNodeVariableDeclare extends ASTNodeDeclare<'var' | 'val'> { }

export interface ASTNodeQualifiedName extends ASTNode<'qualified-name'> {
  value: string[]
}

export interface ASTNodeParameter extends ASTNodeHasId<'parameter'> {
  pType?: ASTNodeTypeLiteral
  defaultValue?: ASTNode
}


export interface ASTNodeParameterList extends ASTNode<'parameter-list'> {
  params: ASTNodeParameter[]
}

export interface ASTNodeImport extends ASTNode<'import'> {
  name: ASTNodeQualifiedName
}

export interface ASTNodeFunction extends ASTNodeHasId<'function'> {
  returnType?: ASTNodeTypeLiteral
  paramList?: ASTNodeParameterList
  body?: ASTNodeBody<'function-body'>
}

export interface ASTNodeZenClass extends ASTNodeHasId<'zen-class'> {
  body?: ASTNodeBody<'class-body'>
}

export interface ASTNodeZenConstructor extends ASTNode<'zen-constructor'> {
  parameterList?: ASTNodeParameterList
}

export type PrimitiveType = 'any' | 'byte' | 'short' | 'int' | 'long' | 'double' | 'bool' | 'void' | 'string'

export interface ASTNodeTypeLiteral extends ASTNode<'type-literal'> {
  name: PrimitiveType | 'class-type' | 'function-type' | 'list-type' | 'array-type' | 'map-type'
  value?: ASTNodeTypeLiteral
}

export interface ASTNodeArrayType extends ASTNodeTypeLiteral { name: 'array-type' }

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
  value: IDENTIFIER
}

export interface ASTNodeListType extends ASTNodeTypeLiteral {
  name: 'list-type'
  value: ASTNodeTypeLiteral
}