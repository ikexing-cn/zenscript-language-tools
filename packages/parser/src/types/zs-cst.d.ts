import type { CstNode, ICstVisitor, IToken } from "chevrotain";

export interface ProgramCstNode extends CstNode {
  name: "Program";
  children: ProgramCstChildren;
}

export type ProgramCstChildren = {
  ImportDeclaration?: ImportDeclarationCstNode[];
  FunctionDeclaration?: FunctionDeclarationCstNode[];
  DExpandFunctionDeclaration?: DExpandFunctionDeclarationCstNode[];
  ClassDeclaration?: ClassDeclarationCstNode[];
  Statement?: StatementCstNode[];
};

export interface ImportDeclarationCstNode extends CstNode {
  name: "ImportDeclaration";
  children: ImportDeclarationCstChildren;
}

export type ImportDeclarationCstChildren = {
  IMPORT: IToken[];
  QualifiedName: QualifiedNameCstNode[];
  AS?: IToken[];
  alias?: IdentifierCstNode[];
  SEMICOLON: IToken[];
};

export interface FunctionDeclarationCstNode extends CstNode {
  name: "FunctionDeclaration";
  children: FunctionDeclarationCstChildren;
}

export type FunctionDeclarationCstChildren = {
  STATIC?: IToken[];
  FUNCTION: IToken[];
  Identifier: IdentifierCstNode[];
  LPAREN: IToken[];
  ParameterList?: ParameterListCstNode[];
  RPAREN: IToken[];
  AS?: IToken[];
  returnType?: TypeLiteralCstNode[];
  FunctionBody: FunctionBodyCstNode[];
};

export interface DExpandFunctionDeclarationCstNode extends CstNode {
  name: "DExpandFunctionDeclaration";
  children: DExpandFunctionDeclarationCstChildren;
}

export type DExpandFunctionDeclarationCstChildren = {
  ZEN_D_Expand: IToken[];
  expand: TypeLiteralCstNode[];
  DOLLAR: IToken[];
  Identifier: IdentifierCstNode[];
  LPAREN: IToken[];
  ParameterList?: ParameterListCstNode[];
  RPAREN: IToken[];
  AS?: IToken[];
  returnType?: TypeLiteralCstNode[];
  FunctionBody: FunctionBodyCstNode[];
};

export interface FunctionBodyCstNode extends CstNode {
  name: "FunctionBody";
  children: FunctionBodyCstChildren;
}

export type FunctionBodyCstChildren = {
  LCURLY: IToken[];
  Statement?: StatementCstNode[];
  RCURLY: IToken[];
};

export interface ParameterListCstNode extends CstNode {
  name: "ParameterList";
  children: ParameterListCstChildren;
}

export type ParameterListCstChildren = {
  Parameter?: ParameterCstNode[];
  COMMA?: IToken[];
};

export interface ParameterCstNode extends CstNode {
  name: "Parameter";
  children: ParameterCstChildren;
}

export type ParameterCstChildren = {
  Identifier: IdentifierCstNode[];
  AS?: IToken[];
  TypeLiteral?: TypeLiteralCstNode[];
  ASSIGN?: IToken[];
  defaultValue?: ExpressionCstNode[];
};

export interface IdentifierCstNode extends CstNode {
  name: "Identifier";
  children: IdentifierCstChildren;
}

export type IdentifierCstChildren = {
  IDENTIFIER?: IToken[];
  TO?: IToken[];
};

export interface QualifiedNameCstNode extends CstNode {
  name: "QualifiedName";
  children: QualifiedNameCstChildren;
}

export type QualifiedNameCstChildren = {
  Identifier: IdentifierCstNode[];
  DOT?: IToken[];
};

export interface TypeLiteralCstNode extends CstNode {
  name: "TypeLiteral";
  children: TypeLiteralCstChildren;
}

export type TypeLiteralCstChildren = {
  ANY?: IToken[];
  BYTE?: IToken[];
  SHORT?: IToken[];
  INT?: IToken[];
  LONG?: IToken[];
  DOUBLE?: IToken[];
  BOOL?: IToken[];
  VOID?: IToken[];
  STRING?: IToken[];
  QualifiedName?: QualifiedNameCstNode[];
  FunctionType?: FunctionTypeCstNode[];
  ListType?: ListTypeCstNode[];
  ArrayType?: ArrayTypeCstNode[];
  MapType?: MapTypeCstNode[];
};

export interface FunctionTypeCstNode extends CstNode {
  name: "FunctionType";
  children: FunctionTypeCstChildren;
}

export type FunctionTypeCstChildren = {
  FUNCTION: IToken[];
  LPAREN: IToken[];
  TypeLiteral: TypeLiteralCstNode[];
  COMMA?: IToken[];
  RPAREN: IToken[];
  return: TypeLiteralCstNode[];
};

export interface ListTypeCstNode extends CstNode {
  name: "ListType";
  children: ListTypeCstChildren;
}

export type ListTypeCstChildren = {
  LBRACKET: IToken[];
  TypeLiteral: TypeLiteralCstNode[];
  RBRACKET: IToken[];
};

export interface ArrayTypeCstNode extends CstNode {
  name: "ArrayType";
  children: ArrayTypeCstChildren;
}

export type ArrayTypeCstChildren = {
  LBRACKET: IToken[];
  RBRACKET: IToken[];
};

export interface MapTypeCstNode extends CstNode {
  name: "MapType";
  children: MapTypeCstChildren;
}

export type MapTypeCstChildren = {
  LBRACKET: IToken[];
  key: TypeLiteralCstNode[];
  RBRACKET: IToken[];
};

export interface StatementCstNode extends CstNode {
  name: "Statement";
  children: StatementCstChildren;
}

export type StatementCstChildren = {
  BlockStatement?: BlockStatementCstNode[];
  ReturnStatement?: ReturnStatementCstNode[];
  BreakStatement?: BreakStatementCstNode[];
  ContinueStatement?: ContinueStatementCstNode[];
  IfStatement?: IfStatementCstNode[];
  ForeachStatement?: ForeachStatementCstNode[];
  WhileStatement?: WhileStatementCstNode[];
  ExpressionStatement?: ExpressionStatementCstNode[];
  VariableDeclaration?: VariableDeclarationCstNode[];
};

export interface BlockStatementCstNode extends CstNode {
  name: "BlockStatement";
  children: BlockStatementCstChildren;
}

export type BlockStatementCstChildren = {
  LCURLY: IToken[];
  Statement?: StatementCstNode[];
  COMMA?: IToken[];
  RCURLY: IToken[];
};

export interface ReturnStatementCstNode extends CstNode {
  name: "ReturnStatement";
  children: ReturnStatementCstChildren;
}

export type ReturnStatementCstChildren = {
  RETURN: IToken[];
  Expression?: ExpressionCstNode[];
  SEMICOLON: IToken[];
};

export interface BreakStatementCstNode extends CstNode {
  name: "BreakStatement";
  children: BreakStatementCstChildren;
}

export type BreakStatementCstChildren = {
  BREAK: IToken[];
  SEMICOLON: IToken[];
};

export interface ContinueStatementCstNode extends CstNode {
  name: "ContinueStatement";
  children: ContinueStatementCstChildren;
}

export type ContinueStatementCstChildren = {
  CONTINUE: IToken[];
  SEMICOLON: IToken[];
};

export interface IfStatementCstNode extends CstNode {
  name: "IfStatement";
  children: IfStatementCstChildren;
}

export type IfStatementCstChildren = {
  IF: IToken[];
  Expression: ExpressionCstNode[];
  then: StatementCstNode[];
  ELSE?: IToken[];
  else?: StatementCstNode[];
};

export interface ForeachStatementCstNode extends CstNode {
  name: "ForeachStatement";
  children: ForeachStatementCstChildren;
}

export type ForeachStatementCstChildren = {
  FOR: IToken[];
  LPAREN: IToken[];
  IDENTIFIER: IToken[];
  COMMA?: IToken[];
  IN: IToken[];
  Expression: ExpressionCstNode[];
  RPAREN: IToken[];
};

export interface WhileStatementCstNode extends CstNode {
  name: "WhileStatement";
  children: WhileStatementCstChildren;
}

export type WhileStatementCstChildren = {
  WHILE: IToken[];
  LPAREN: IToken[];
  Expression: ExpressionCstNode[];
  RPAREN: IToken[];
  Statement: StatementCstNode[];
};

export interface ExpressionStatementCstNode extends CstNode {
  name: "ExpressionStatement";
  children: ExpressionStatementCstChildren;
}

export type ExpressionStatementCstChildren = {
  Expression: ExpressionCstNode[];
  COMMA: IToken[];
};

export interface VariableDeclarationCstNode extends CstNode {
  name: "VariableDeclaration";
  children: VariableDeclarationCstChildren;
}

export type VariableDeclarationCstChildren = {
  VAR?: IToken[];
  VAL?: IToken[];
  STATIC?: IToken[];
  GLOBAL?: IToken[];
  Identifier: IdentifierCstNode[];
  AS?: IToken[];
  TypeLiteral?: TypeLiteralCstNode[];
  EQUAL?: IToken[];
  initializer?: ExpressionCstNode[];
  SEMICOLON: IToken[];
};

export interface ExpressionCstNode extends CstNode {
  name: "Expression";
  children: ExpressionCstChildren;
}

export type ExpressionCstChildren = {
  FunctionExpression?: FunctionExpressionCstNode[];
  CallExpression?: CallExpressionCstNode[];
  MemberAccessExpression?: MemberAccessExpressionCstNode[];
  ArrayIndexExpression?: ArrayIndexExpressionCstNode[];
  TypeCastExpression?: TypeCastExpressionCstNode[];
  UnaryExpression?: UnaryExpressionCstNode[];
  BinaryExpression?: BinaryExpressionCstNode[];
  TernaryExpression?: TernaryExpressionCstNode[];
  AssignmentExpression?: AssignmentExpressionCstNode[];
  BrackHandlerExpression?: BrackHandlerExpressionCstNode[];
  IntRangeExpression?: IntRangeExpressionCstNode[];
  ArrayInitializerExpression?: ArrayInitializerExpressionCstNode[];
  MapInitializerExpression?: MapInitializerExpressionCstNode[];
  ParensExpression?: ParensExpressionCstNode[];
  ThisExpression?: ThisExpressionCstNode[];
  SuperExpression?: SuperExpressionCstNode[];
  IntLiteralExpression?: IToken[];
  LongLiteralExpression?: IToken[];
  FloatLiteralExpression?: IToken[];
  DoubleLiteralExpression?: IToken[];
  StringLiteralExpression?: IToken[];
  TrueLiteralExpression?: IToken[];
  FalseLiteralExpression?: IToken[];
  NullLiteralExpression?: IToken[];
  LocalAccessExpress?: IdentifierCstNode[];
};

export interface FunctionExpressionCstNode extends CstNode {
  name: "FunctionExpression";
  children: FunctionExpressionCstChildren;
}

export type FunctionExpressionCstChildren = {
  FUNCTION: IToken[];
  LPAREN: IToken[];
  ParameterList: ParameterListCstNode[];
  RPAREN: IToken[];
  AS?: IToken[];
  TypeLiteral?: TypeLiteralCstNode[];
  FunctionBody: FunctionBodyCstNode[];
};

export interface CallExpressionCstNode extends CstNode {
  name: "CallExpression";
  children: CallExpressionCstChildren;
}

export type CallExpressionCstChildren = {
  left: ExpressionCstNode[];
  LPAREN: IToken[];
  Expression?: ExpressionCstNode[];
  COMMA?: IToken[];
  RPAREN: IToken[];
};

export interface MemberAccessExpressionCstNode extends CstNode {
  name: "MemberAccessExpression";
  children: MemberAccessExpressionCstChildren;
}

export type MemberAccessExpressionCstChildren = {
  left: ExpressionCstNode[];
  DOT: IToken[];
  Identifier: IdentifierCstNode[];
};

export interface ArrayIndexExpressionCstNode extends CstNode {
  name: "ArrayIndexExpression";
  children: ArrayIndexExpressionCstChildren;
}

export type ArrayIndexExpressionCstChildren = {
  left: ExpressionCstNode[];
  LBRACKET: IToken[];
  index: ExpressionCstNode[];
  RBRACKET: IToken[];
};

export interface TypeCastExpressionCstNode extends CstNode {
  name: "TypeCastExpression";
  children: TypeCastExpressionCstChildren;
}

export type TypeCastExpressionCstChildren = {
  Expression: ExpressionCstNode[];
  AS: IToken[];
  TypeLiteral: TypeLiteralCstNode[];
};

export interface UnaryExpressionCstNode extends CstNode {
  name: "UnaryExpression";
  children: UnaryExpressionCstChildren;
}

export type UnaryExpressionCstChildren = {
  operator?: (IToken)[];
  Expression: ExpressionCstNode[];
};

export interface BinaryExpressionCstNode extends CstNode {
  name: "BinaryExpression";
  children: BinaryExpressionCstChildren;
}

export type BinaryExpressionCstChildren = {
  left: ExpressionCstNode[];
  operator?: (IToken)[];
  right: ExpressionCstNode[];
};

export interface TernaryExpressionCstNode extends CstNode {
  name: "TernaryExpression";
  children: TernaryExpressionCstChildren;
}

export type TernaryExpressionCstChildren = {
  condition: ExpressionCstNode[];
  QUESTION: IToken[];
  truePart: ExpressionCstNode[];
  COLON: IToken[];
  falsePart: ExpressionCstNode[];
};

export interface AssignmentExpressionCstNode extends CstNode {
  name: "AssignmentExpression";
  children: AssignmentExpressionCstChildren;
}

export type AssignmentExpressionCstChildren = {
  left: ExpressionCstNode[];
  operator?: (IToken)[];
  right: ExpressionCstNode[];
};

export interface BrackHandlerExpressionCstNode extends CstNode {
  name: "BrackHandlerExpression";
  children: BrackHandlerExpressionCstChildren;
}

export type BrackHandlerExpressionCstChildren = {
  LBRACKET: IToken[];
  Identifier: IdentifierCstNode[];
  RBRACKET: IToken[];
};

export interface IntRangeExpressionCstNode extends CstNode {
  name: "IntRangeExpression";
  children: IntRangeExpressionCstChildren;
}

export type IntRangeExpressionCstChildren = {
  from: ExpressionCstNode[];
  DOT_DOT?: IToken[];
  TO?: IToken[];
  to: ExpressionCstNode[];
};

export interface ArrayInitializerExpressionCstNode extends CstNode {
  name: "ArrayInitializerExpression";
  children: ArrayInitializerExpressionCstChildren;
}

export type ArrayInitializerExpressionCstChildren = {
  LBRACKET: IToken[];
  Expression?: ExpressionCstNode[];
  COMMA?: IToken[];
  RBRACKET: IToken[];
};

export interface MapInitializerExpressionCstNode extends CstNode {
  name: "MapInitializerExpression";
  children: MapInitializerExpressionCstChildren;
}

export type MapInitializerExpressionCstChildren = {
  LCURLY: IToken[];
  MapEntry?: MapEntryCstNode[];
  COMMA?: IToken[];
  RCURLY: IToken[];
};

export interface ParensExpressionCstNode extends CstNode {
  name: "ParensExpression";
  children: ParensExpressionCstChildren;
}

export type ParensExpressionCstChildren = {
  LPAREN: IToken[];
  Expression: ExpressionCstNode[];
  RPAREN: IToken[];
};

export interface ThisExpressionCstNode extends CstNode {
  name: "ThisExpression";
  children: ThisExpressionCstChildren;
}

export type ThisExpressionCstChildren = {
  THIS: IToken[];
};

export interface SuperExpressionCstNode extends CstNode {
  name: "SuperExpression";
  children: SuperExpressionCstChildren;
}

export type SuperExpressionCstChildren = {
  SUPER: IToken[];
};

export interface MapEntryCstNode extends CstNode {
  name: "MapEntry";
  children: MapEntryCstChildren;
}

export type MapEntryCstChildren = {
  key: ExpressionCstNode[];
  COLON: IToken[];
  value: ExpressionCstNode[];
};

export interface ClassDeclarationCstNode extends CstNode {
  name: "ClassDeclaration";
  children: ClassDeclarationCstChildren;
}

export type ClassDeclarationCstChildren = {
  ZEN_CLASS: IToken[];
  QualifiedName: QualifiedNameCstNode[];
  LCURLY: IToken[];
  VariableDeclaration?: VariableDeclarationCstNode[];
  ConstructorDeclaration?: ConstructorDeclarationCstNode[];
  FunctionDeclaration?: FunctionDeclarationCstNode[];
  RCURLY: IToken[];
};

export interface ConstructorDeclarationCstNode extends CstNode {
  name: "ConstructorDeclaration";
  children: ConstructorDeclarationCstChildren;
}

export type ConstructorDeclarationCstChildren = {
  ZEN_CONSTRUCTOR: IToken[];
  LPAREN: IToken[];
  ParameterList: ParameterListCstNode[];
  RPAREN: IToken[];
  constructorBody: BlockStatementCstNode[];
};

export interface ICstNodeVisitor<IN, OUT> extends ICstVisitor<IN, OUT> {
  Program(children: ProgramCstChildren, param?: IN): OUT;
  ImportDeclaration(children: ImportDeclarationCstChildren, param?: IN): OUT;
  FunctionDeclaration(children: FunctionDeclarationCstChildren, param?: IN): OUT;
  DExpandFunctionDeclaration(children: DExpandFunctionDeclarationCstChildren, param?: IN): OUT;
  FunctionBody(children: FunctionBodyCstChildren, param?: IN): OUT;
  ParameterList(children: ParameterListCstChildren, param?: IN): OUT;
  Parameter(children: ParameterCstChildren, param?: IN): OUT;
  Identifier(children: IdentifierCstChildren, param?: IN): OUT;
  QualifiedName(children: QualifiedNameCstChildren, param?: IN): OUT;
  TypeLiteral(children: TypeLiteralCstChildren, param?: IN): OUT;
  FunctionType(children: FunctionTypeCstChildren, param?: IN): OUT;
  ListType(children: ListTypeCstChildren, param?: IN): OUT;
  ArrayType(children: ArrayTypeCstChildren, param?: IN): OUT;
  MapType(children: MapTypeCstChildren, param?: IN): OUT;
  Statement(children: StatementCstChildren, param?: IN): OUT;
  BlockStatement(children: BlockStatementCstChildren, param?: IN): OUT;
  ReturnStatement(children: ReturnStatementCstChildren, param?: IN): OUT;
  BreakStatement(children: BreakStatementCstChildren, param?: IN): OUT;
  ContinueStatement(children: ContinueStatementCstChildren, param?: IN): OUT;
  IfStatement(children: IfStatementCstChildren, param?: IN): OUT;
  ForeachStatement(children: ForeachStatementCstChildren, param?: IN): OUT;
  WhileStatement(children: WhileStatementCstChildren, param?: IN): OUT;
  ExpressionStatement(children: ExpressionStatementCstChildren, param?: IN): OUT;
  VariableDeclaration(children: VariableDeclarationCstChildren, param?: IN): OUT;
  Expression(children: ExpressionCstChildren, param?: IN): OUT;
  FunctionExpression(children: FunctionExpressionCstChildren, param?: IN): OUT;
  CallExpression(children: CallExpressionCstChildren, param?: IN): OUT;
  MemberAccessExpression(children: MemberAccessExpressionCstChildren, param?: IN): OUT;
  ArrayIndexExpression(children: ArrayIndexExpressionCstChildren, param?: IN): OUT;
  TypeCastExpression(children: TypeCastExpressionCstChildren, param?: IN): OUT;
  UnaryExpression(children: UnaryExpressionCstChildren, param?: IN): OUT;
  BinaryExpression(children: BinaryExpressionCstChildren, param?: IN): OUT;
  TernaryExpression(children: TernaryExpressionCstChildren, param?: IN): OUT;
  AssignmentExpression(children: AssignmentExpressionCstChildren, param?: IN): OUT;
  BrackHandlerExpression(children: BrackHandlerExpressionCstChildren, param?: IN): OUT;
  IntRangeExpression(children: IntRangeExpressionCstChildren, param?: IN): OUT;
  ArrayInitializerExpression(children: ArrayInitializerExpressionCstChildren, param?: IN): OUT;
  MapInitializerExpression(children: MapInitializerExpressionCstChildren, param?: IN): OUT;
  ParensExpression(children: ParensExpressionCstChildren, param?: IN): OUT;
  ThisExpression(children: ThisExpressionCstChildren, param?: IN): OUT;
  SuperExpression(children: SuperExpressionCstChildren, param?: IN): OUT;
  MapEntry(children: MapEntryCstChildren, param?: IN): OUT;
  ClassDeclaration(children: ClassDeclarationCstChildren, param?: IN): OUT;
  ConstructorDeclaration(children: ConstructorDeclarationCstChildren, param?: IN): OUT;
}
