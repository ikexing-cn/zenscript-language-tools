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
  scopes: Record<string, 'function' | 'class' | 'global' | 'static'>
  errors: ASTError[]
}

export interface ASTNodeDeclare extends ASTNode { 
  type: 'global' | 'static' | 'var' | 'val';
  vName: string;
  vType: ASTNode;

  value?: ASTNode;
}

export interface ASTNodeGlobalStaticDeclare extends ASTNodeDeclare {
  type: 'global' | 'static';
}

export interface ASTNodeFunction extends ASTNode {
  type: 'function';
  fName: string;
  fPara: ASTNodeParameterList;
  fType: ASTNode;
}

export interface ASTNodeParameter extends ASTNode {
  type: 'parameter';
  pName: string;
  pType: ASTNode;
}

export interface ASTNodeParameterList extends ASTNode {
  type: 'parameter-list';
  pList: ASTNodeParameter[];
}

export interface ASTNodeZenClass extends ASTNode {
  type: 'class'
  cName: string
}