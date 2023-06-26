import { ASTProgram } from './zs-ast';
export interface Offset {
  start: number
  end?: number
}

export interface ASTNode extends Offset {
  type: string
}

export interface ASTError extends Offset {
  message: string
}

export interface ASTBasicProgram {
  scopes: Record<string, 'function' | 'zen-class' | 'global' | 'static'>
  errors: ASTError[]
}

export interface ASTProgram extends Offset {
  type: 'program'
  body: ASTNode[]
}

export interface ASTNodeDeclare extends ASTNode { 
  type: 'global' | 'static' | 'var' | 'val'
  vName: string
  vType: ASTNode

  value?: ASTNode
}

export interface ASTNodeGlobalStaticDeclare extends ASTNodeDeclare {
  type: 'global' | 'static'
}


export interface ASTNodeVariableDDeclare extends ASTNodeDeclare {
  type: 'var' | 'val' 
}

export interface ASTNodeFunction extends ASTNode {
  type: 'function'
  fName: string
  fPara: ASTNodeParameterList
  fType: ASTNode
}

export interface ASTNodeParameter extends ASTNode {
  type: 'parameter'
  pName: string
  pType: ASTNode
}

export interface ASTNodeParameterList extends ASTNode {
  type: 'parameter-list'
  pList: ASTNodeParameter[]
}

export interface ASTNodeZenClass extends ASTNode {
  type: 'zen-class'
  cName: string
}

export interface ASTNodeZenConstructor extends ASTNodeParameterList {
  type: 'zen-constructor'
}
