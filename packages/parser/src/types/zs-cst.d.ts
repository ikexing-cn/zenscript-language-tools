import type { CstNode, ICstVisitor, IToken } from "chevrotain";

export interface ProgramCstNode extends CstNode {
  name: "Program";
  children: ProgramCstChildren;
}

export type ProgramCstChildren = {
  ImportDeclaration?: ImportDeclarationCstNode[];
  GlobalStaticDeclaration?: GlobalStaticDeclarationCstNode[];
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
  functionBody: BlockStatementCstNode[];
};

export interface DExpandFunctionDeclarationCstNode extends CstNode {
  name: "DExpandFunctionDeclaration";
  children: DExpandFunctionDeclarationCstChildren;
}

export type DExpandFunctionDeclarationCstChildren = {
  ZEN_D_Expand: IToken[];
  expandType: TypeLiteralCstNode[];
  DOLLAR: IToken[];
  Identifier: IdentifierCstNode[];
  LPAREN: IToken[];
  ParameterList?: ParameterListCstNode[];
  RPAREN: IToken[];
  AS?: IToken[];
  returnType?: TypeLiteralCstNode[];
  functionBody: BlockStatementCstNode[];
};

export interface ParameterListCstNode extends CstNode {
  name: "ParameterList";
  children: ParameterListCstChildren;
}

export type ParameterListCstChildren = {
  Parameter: ParameterCstNode[];
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
  primitiveType?: (IToken)[];
  listType?: ListTypeCstNode[];
  classType?: QualifiedNameCstNode[];
  functionType?: FunctionTypeCstNode[];
  mapType?: MapTypeCstNode[];
  arrayType?: ArrayTypeCstNode[];
};

export interface ArrayTypeCstNode extends CstNode {
  name: "ArrayType";
  children: ArrayTypeCstChildren;
}

export type ArrayTypeCstChildren = {
  LBRACKET: IToken[];
  RBRACKET: IToken[];
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
  returnType: TypeLiteralCstNode[];
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
  statement?: (BlockStatementCstNode | VariableDeclarationCstNode | ReturnStatementCstNode | BreakStatementCstNode | ContinueStatementCstNode | IfStatementCstNode | ForeachStatementCstNode | WhileStatementCstNode | ExpressionStatementCstNode)[];
};

export interface BlockStatementCstNode extends CstNode {
  name: "BlockStatement";
  children: BlockStatementCstChildren;
}

export type BlockStatementCstChildren = {
  LCURLY: IToken[];
  Statement?: StatementCstNode[];
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
  test: ExpressionCstNode[];
  consequent: BlockStatementCstNode[];
  ELSE?: IToken[];
  alternate?: (IfStatementCstNode | BlockStatementCstNode)[];
};

export interface ForeachStatementCstNode extends CstNode {
  name: "ForeachStatement";
  children: ForeachStatementCstChildren;
}

export type ForeachStatementCstChildren = {
  FOR: IToken[];
  LPAREN?: IToken[];
  Identifier: IdentifierCstNode[];
  COMMA?: IToken[];
  IN: IToken[];
  Expression: ExpressionCstNode[];
  RPAREN?: IToken[];
  BlockStatement: BlockStatementCstNode[];
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
  BlockStatement: BlockStatementCstNode[];
};

export interface ExpressionStatementCstNode extends CstNode {
  name: "ExpressionStatement";
  children: ExpressionStatementCstChildren;
}

export type ExpressionStatementCstChildren = {
  Expression: ExpressionCstNode[];
  SEMICOLON?: IToken[];
};

export interface GlobalStaticDeclarationCstNode extends CstNode {
  name: "GlobalStaticDeclaration";
  children: GlobalStaticDeclarationCstChildren;
}

export type GlobalStaticDeclarationCstChildren = {
  GLOBAL?: IToken[];
  STATIC?: IToken[];
  Identifier: IdentifierCstNode[];
  AS?: IToken[];
  TypeLiteral?: TypeLiteralCstNode[];
  ASSIGN: IToken[];
  value: ExpressionCstNode[];
  SEMICOLON: IToken[];
};

export interface VariableDeclarationCstNode extends CstNode {
  name: "VariableDeclaration";
  children: VariableDeclarationCstChildren;
}

export type VariableDeclarationCstChildren = {
  VAR?: IToken[];
  VAL?: IToken[];
  Identifier: IdentifierCstNode[];
  AS?: IToken[];
  TypeLiteral?: TypeLiteralCstNode[];
  ASSIGN?: IToken[];
  initializer?: ExpressionCstNode[];
  SEMICOLON: IToken[];
};

export interface ExpressionCstNode extends CstNode {
  name: "Expression";
  children: ExpressionCstChildren;
}

export type ExpressionCstChildren = {
  expression: AssignExpressionCstNode[];
};

export interface AssignExpressionCstNode extends CstNode {
  name: "AssignExpression";
  children: AssignExpressionCstChildren;
}

export type AssignExpressionCstChildren = {
  expression: ConditionalExpressionCstNode[];
  operator?: (IToken)[];
  rightExpression?: AssignExpressionCstNode[];
};

export interface ConditionalExpressionCstNode extends CstNode {
  name: "ConditionalExpression";
  children: ConditionalExpressionCstChildren;
}

export type ConditionalExpressionCstChildren = {
  conditionExpression: OrOrExpressionCstNode[];
  QUESTION?: IToken[];
  validExpression?: OrOrExpressionCstNode[];
  COLON?: IToken[];
  invalidExpression?: ConditionalExpressionCstNode[];
};

export interface OrOrExpressionCstNode extends CstNode {
  name: "OrOrExpression";
  children: OrOrExpressionCstChildren;
}

export type OrOrExpressionCstChildren = {
  AndAndExpression: (AndAndExpressionCstNode)[];
  operator?: IToken[];
};

export interface AndAndExpressionCstNode extends CstNode {
  name: "AndAndExpression";
  children: AndAndExpressionCstChildren;
}

export type AndAndExpressionCstChildren = {
  OrExpression: (OrExpressionCstNode)[];
  operator?: IToken[];
};

export interface OrExpressionCstNode extends CstNode {
  name: "OrExpression";
  children: OrExpressionCstChildren;
}

export type OrExpressionCstChildren = {
  XorExpression: (XorExpressionCstNode)[];
  operator?: IToken[];
};

export interface XorExpressionCstNode extends CstNode {
  name: "XorExpression";
  children: XorExpressionCstChildren;
}

export type XorExpressionCstChildren = {
  AndExpression: (AndExpressionCstNode)[];
  operator?: IToken[];
};

export interface AndExpressionCstNode extends CstNode {
  name: "AndExpression";
  children: AndExpressionCstChildren;
}

export type AndExpressionCstChildren = {
  CompareExpression: (CompareExpressionCstNode)[];
  operator?: IToken[];
};

export interface CompareExpressionCstNode extends CstNode {
  name: "CompareExpression";
  children: CompareExpressionCstChildren;
}

export type CompareExpressionCstChildren = {
  AddExpression: (AddExpressionCstNode)[];
  operator?: (IToken)[];
};

export interface AddExpressionCstNode extends CstNode {
  name: "AddExpression";
  children: AddExpressionCstChildren;
}

export type AddExpressionCstChildren = {
  MultiplyExpression: (MultiplyExpressionCstNode)[];
  operator?: (IToken)[];
};

export interface MultiplyExpressionCstNode extends CstNode {
  name: "MultiplyExpression";
  children: MultiplyExpressionCstChildren;
}

export type MultiplyExpressionCstChildren = {
  UnaryExpression: (UnaryExpressionCstNode)[];
  operator?: (IToken)[];
};

export interface UnaryExpressionCstNode extends CstNode {
  name: "UnaryExpression";
  children: UnaryExpressionCstChildren;
}

export type UnaryExpressionCstChildren = {
  operator?: (IToken)[];
  expression?: (UnaryExpressionCstNode | PostfixExpressionCstNode)[];
};

export interface PostfixExpressionCstNode extends CstNode {
  name: "PostfixExpression";
  children: PostfixExpressionCstChildren;
}

export type PostfixExpressionCstChildren = {
  PrimaryExpression: PrimaryExpressionCstNode[];
  PostfixExpressionMemberAccess?: PostfixExpressionMemberAccessCstNode[];
  PostfixExpressionRange?: PostfixExpressionRangeCstNode[];
  PostfixExpressionArray?: PostfixExpressionArrayCstNode[];
  PostfixExpressionFunctionCall?: PostfixExpressionFunctionCallCstNode[];
  AS?: IToken[];
  asType?: TypeLiteralCstNode[];
  INSTANCEOF?: IToken[];
  instanceofType?: TypeLiteralCstNode[];
};

export interface PostfixExpressionMemberAccessCstNode extends CstNode {
  name: "PostfixExpressionMemberAccess";
  children: PostfixExpressionMemberAccessCstChildren;
}

export type PostfixExpressionMemberAccessCstChildren = {
  DOT: IToken[];
  Identifier: IdentifierCstNode[];
};

export interface PostfixExpressionRangeCstNode extends CstNode {
  name: "PostfixExpressionRange";
  children: PostfixExpressionRangeCstChildren;
}

export type PostfixExpressionRangeCstChildren = {
  rangeOperator?: (IToken)[];
  AssignExpression: AssignExpressionCstNode[];
};

export interface PostfixExpressionArrayCstNode extends CstNode {
  name: "PostfixExpressionArray";
  children: PostfixExpressionArrayCstChildren;
}

export type PostfixExpressionArrayCstChildren = {
  LBRACKET: IToken[];
  index: AssignExpressionCstNode[];
  RBRACKET: IToken[];
  ASSIGN?: IToken[];
  value?: AssignExpressionCstNode[];
};

export interface PostfixExpressionFunctionCallCstNode extends CstNode {
  name: "PostfixExpressionFunctionCall";
  children: PostfixExpressionFunctionCallCstChildren;
}

export type PostfixExpressionFunctionCallCstChildren = {
  LPAREN: IToken[];
  argument?: AssignExpressionCstNode[];
  COMMA?: IToken[];
  RPAREN: IToken[];
};

export interface PrimaryExpressionCstNode extends CstNode {
  name: "PrimaryExpression";
  children: PrimaryExpressionCstChildren;
}

export type PrimaryExpressionCstChildren = {
  literal?: (IToken)[];
  Identifier?: IdentifierCstNode[];
  BracketHandlerExpression?: BracketHandlerExpressionCstNode[];
  LambdaFunctionDeclaration?: LambdaFunctionDeclarationCstNode[];
  ArrayInitializerExpression?: ArrayInitializerExpressionCstNode[];
  MapInitializerExpression?: MapInitializerExpressionCstNode[];
  LPAREN?: IToken[];
  AssignExpression?: AssignExpressionCstNode[];
  RPAREN?: IToken[];
};

export interface BracketHandlerExpressionCstNode extends CstNode {
  name: "BracketHandlerExpression";
  children: BracketHandlerExpressionCstChildren;
}

export type BracketHandlerExpressionCstChildren = {
  LT: IToken[];
  part?: (IToken | IdentifierCstNode)[];
  COLON?: IToken[];
  GT: IToken[];
};

export interface ArrayInitializerExpressionCstNode extends CstNode {
  name: "ArrayInitializerExpression";
  children: ArrayInitializerExpressionCstChildren;
}

export type ArrayInitializerExpressionCstChildren = {
  LBRACKET: IToken[];
  AssignExpression?: (AssignExpressionCstNode)[];
  COMMA?: (IToken)[];
  RBRACKET: IToken[];
};

export interface MapInitializerExpressionCstNode extends CstNode {
  name: "MapInitializerExpression";
  children: MapInitializerExpressionCstChildren;
}

export type MapInitializerExpressionCstChildren = {
  LCURLY: IToken[];
  MapEntry?: (MapEntryCstNode)[];
  COMMA?: (IToken)[];
  RCURLY: IToken[];
};

export interface MapEntryCstNode extends CstNode {
  name: "MapEntry";
  children: MapEntryCstChildren;
}

export type MapEntryCstChildren = {
  key: AssignExpressionCstNode[];
  COLON: IToken[];
  value: AssignExpressionCstNode[];
};

export interface LambdaFunctionDeclarationCstNode extends CstNode {
  name: "LambdaFunctionDeclaration";
  children: LambdaFunctionDeclarationCstChildren;
}

export type LambdaFunctionDeclarationCstChildren = {
  FUNCTION: IToken[];
  LPAREN: IToken[];
  ParameterList?: ParameterListCstNode[];
  RPAREN: IToken[];
  AS?: IToken[];
  returnType?: TypeLiteralCstNode[];
  functionBody: BlockStatementCstNode[];
};

export interface ClassDeclarationCstNode extends CstNode {
  name: "ClassDeclaration";
  children: ClassDeclarationCstChildren;
}

export type ClassDeclarationCstChildren = {
  ZEN_CLASS: IToken[];
  Identifier: IdentifierCstNode[];
  LCURLY: IToken[];
  classBody?: (VariableDeclarationCstNode | ConstructorDeclarationCstNode | FunctionDeclarationCstNode)[];
  RCURLY: IToken[];
};

export interface ConstructorDeclarationCstNode extends CstNode {
  name: "ConstructorDeclaration";
  children: ConstructorDeclarationCstChildren;
}

export type ConstructorDeclarationCstChildren = {
  ZEN_CONSTRUCTOR: IToken[];
  LPAREN: IToken[];
  ParameterList?: ParameterListCstNode[];
  RPAREN: IToken[];
  constructorBody: BlockStatementCstNode[];
};

export interface ICstNodeVisitor<IN, OUT> extends ICstVisitor<IN, OUT> {
  Program(children: ProgramCstChildren, param?: IN): OUT;
  ImportDeclaration(children: ImportDeclarationCstChildren, param?: IN): OUT;
  FunctionDeclaration(children: FunctionDeclarationCstChildren, param?: IN): OUT;
  DExpandFunctionDeclaration(children: DExpandFunctionDeclarationCstChildren, param?: IN): OUT;
  ParameterList(children: ParameterListCstChildren, param?: IN): OUT;
  Parameter(children: ParameterCstChildren, param?: IN): OUT;
  Identifier(children: IdentifierCstChildren, param?: IN): OUT;
  QualifiedName(children: QualifiedNameCstChildren, param?: IN): OUT;
  TypeLiteral(children: TypeLiteralCstChildren, param?: IN): OUT;
  ArrayType(children: ArrayTypeCstChildren, param?: IN): OUT;
  FunctionType(children: FunctionTypeCstChildren, param?: IN): OUT;
  ListType(children: ListTypeCstChildren, param?: IN): OUT;
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
  GlobalStaticDeclaration(children: GlobalStaticDeclarationCstChildren, param?: IN): OUT;
  VariableDeclaration(children: VariableDeclarationCstChildren, param?: IN): OUT;
  Expression(children: ExpressionCstChildren, param?: IN): OUT;
  AssignExpression(children: AssignExpressionCstChildren, param?: IN): OUT;
  ConditionalExpression(children: ConditionalExpressionCstChildren, param?: IN): OUT;
  OrOrExpression(children: OrOrExpressionCstChildren, param?: IN): OUT;
  AndAndExpression(children: AndAndExpressionCstChildren, param?: IN): OUT;
  OrExpression(children: OrExpressionCstChildren, param?: IN): OUT;
  XorExpression(children: XorExpressionCstChildren, param?: IN): OUT;
  AndExpression(children: AndExpressionCstChildren, param?: IN): OUT;
  CompareExpression(children: CompareExpressionCstChildren, param?: IN): OUT;
  AddExpression(children: AddExpressionCstChildren, param?: IN): OUT;
  MultiplyExpression(children: MultiplyExpressionCstChildren, param?: IN): OUT;
  UnaryExpression(children: UnaryExpressionCstChildren, param?: IN): OUT;
  PostfixExpression(children: PostfixExpressionCstChildren, param?: IN): OUT;
  PostfixExpressionMemberAccess(children: PostfixExpressionMemberAccessCstChildren, param?: IN): OUT;
  PostfixExpressionRange(children: PostfixExpressionRangeCstChildren, param?: IN): OUT;
  PostfixExpressionArray(children: PostfixExpressionArrayCstChildren, param?: IN): OUT;
  PostfixExpressionFunctionCall(children: PostfixExpressionFunctionCallCstChildren, param?: IN): OUT;
  PrimaryExpression(children: PrimaryExpressionCstChildren, param?: IN): OUT;
  BracketHandlerExpression(children: BracketHandlerExpressionCstChildren, param?: IN): OUT;
  ArrayInitializerExpression(children: ArrayInitializerExpressionCstChildren, param?: IN): OUT;
  MapInitializerExpression(children: MapInitializerExpressionCstChildren, param?: IN): OUT;
  MapEntry(children: MapEntryCstChildren, param?: IN): OUT;
  LambdaFunctionDeclaration(children: LambdaFunctionDeclarationCstChildren, param?: IN): OUT;
  ClassDeclaration(children: ClassDeclarationCstChildren, param?: IN): OUT;
  ConstructorDeclaration(children: ConstructorDeclarationCstChildren, param?: IN): OUT;
}
