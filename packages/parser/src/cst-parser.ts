import type { CstNode, IToken } from 'chevrotain'
import { CstParser } from 'chevrotain'
import {
  AND, AND_AND, AND_ASSIGN, AS, ASSIGN, BREAK, CAT, CAT_ASSIGN, COLON, COMMA, CONTINUE, DIV, DIV_ASSIGN,
  DOLLAR, DOT, DOT_DOT, DOUBLE_LITERAL, ELSE, EQUAL, FALSE_LITERAL, FLOAT_LITERAL, FOR, FUNCTION, GLOBAL, GREATER_EQUAL, GT, HAS, IDENTIFIER, IF, IMPORT, IN,
  INSTANCEOF, INT_LITERAL, LESS_EQUAL, LONG_LITERAL, LT, L_BRACKET, L_CURLY, L_PAREN, MINUS, MINUS_ASSIGN, MOD, MOD_ASSIGN, MUL,
  MUL_ASSIGN, NOT, NOT_EQUAL, NULL_LITERAL, OR, OR_ASSIGN, OR_OR, PLUS, PLUS_ASSIGN, QUESTION, RETURN, R_BRACKET, R_CURLY,
  R_PAREN, SEMICOLON, STATIC, STRING_LITERAL, SUPER, THIS, TO, TRUE_LITERAL, VAL, VAR, WHILE, XOR, XOR_ASSIGN, ZEN_CLASS, ZEN_CONSTRUCTOR, ZEN_D_Expand, ZS_ALL_TOKENS, ZS_PRIMITIVE_TYPE_TOKENS,
} from './lexer'

export class ZenScriptParser extends CstParser {
  constructor() {
    super(ZS_ALL_TOKENS, {
      maxLookahead: 2,
      recoveryEnabled: true,
      nodeLocationTracking: 'full',
    })

    this.performSelfAnalysis()
  }

  parse(input: IToken[]): CstNode {
    this.input = input
    return this.Program()
  }

  private Program = this.RULE('Program', () => {
    this.MANY(() => {
      this.SUBRULE(this.ImportDeclaration)
    })

    this.MANY2(() => {
      this.OR([
        { ALT: () => this.SUBRULE(this.FunctionDeclaration) },
        { ALT: () => this.SUBRULE(this.DExpandFunctionDeclaration) },
        { ALT: () => this.SUBRULE(this.ClassDeclaration) },
        { ALT: () => this.SUBRULE(this.Statement) },
      ])
    })
  })

  private ImportDeclaration = this.RULE('ImportDeclaration', () => {
    this.CONSUME(IMPORT)
    this.SUBRULE(this.QualifiedName)
    this.OPTION(() => {
      this.CONSUME(AS)
      this.SUBRULE(this.Identifier, { LABEL: 'alias' })
    })
    this.CONSUME(SEMICOLON, { ERR_MSG: '; expected' })
  })

  // ============================================================

  private FunctionDeclaration = this.RULE('FunctionDeclaration', () => {
    this.OPTION(() => this.CONSUME(STATIC))
    this.CONSUME(FUNCTION)
    this.SUBRULE(this.Identifier)
    this.CONSUME(L_PAREN)
    this.OPTION2(() => {
      this.SUBRULE(this.ParameterList)
    })
    this.CONSUME(R_PAREN)
    this.OPTION3(() => {
      this.CONSUME(AS)
      this.SUBRULE(this.TypeLiteral, { LABEL: 'returnType' })
    })
    this.SUBRULE(this.FunctionBody)
  })

  private DExpandFunctionDeclaration = this.RULE('DExpandFunctionDeclaration', () => {
    this.CONSUME(ZEN_D_Expand)
    this.SUBRULE(this.TypeLiteral, { LABEL: 'expand' })
    this.CONSUME(DOLLAR)
    this.SUBRULE(this.Identifier)
    this.CONSUME(L_PAREN)
    this.OPTION(() => {
      this.SUBRULE(this.ParameterList)
    })
    this.CONSUME(R_PAREN)
    this.OPTION2(() => {
      this.CONSUME(AS)
      this.SUBRULE2(this.TypeLiteral, { LABEL: 'returnType' })
    })
    this.SUBRULE(this.FunctionBody)
  })

  private FunctionBody = this.RULE('FunctionBody', () => {
    this.CONSUME(L_CURLY)
    this.MANY(() => {
      this.SUBRULE(this.Statement)
    })
    this.CONSUME(R_CURLY)
  })

  private ParameterList = this.RULE('ParameterList', () => {
    this.MANY_SEP({
      SEP: COMMA,
      DEF: () => this.SUBRULE(this.Parameter),
    })
  })

  private Parameter = this.RULE('Parameter', () => {
    this.SUBRULE(this.Identifier)
    this.OPTION(() => {
      this.CONSUME(AS)
      this.SUBRULE(this.TypeLiteral)
    })
    this.OPTION2(() => {
      this.CONSUME(ASSIGN)
      this.SUBRULE(this.Expression, { LABEL: 'defaultValue' })
    })
  })

  private Identifier = this.RULE('Identifier', () => {
    this.OR([
      { ALT: () => this.CONSUME(IDENTIFIER) },
      { ALT: () => this.CONSUME(TO) },
    ])
  })

  private QualifiedName = this.RULE('QualifiedName', () => {
    this.AT_LEAST_ONE_SEP({
      SEP: DOT,
      DEF: () => this.SUBRULE(this.Identifier),
    })
  })

  // ============================================================

  private TypeLiteral = this.RULE('TypeLiteral', () => {
    this.OR([
      ...ZS_PRIMITIVE_TYPE_TOKENS.map((type) => {
        return { ALT: () => this.CONSUME(type) }
      }),
      { ALT: () => this.SUBRULE(this.QualifiedName) },
      { ALT: () => this.SUBRULE(this.FunctionType) },
      { ALT: () => this.SUBRULE(this.ListType) },
    ])
    this.MANY(() => {
      this.OR2([
        { ALT: () => this.SUBRULE(this.ArrayType) },
        { ALT: () => this.SUBRULE(this.MapType) },
      ])
    })
  })

  private FunctionType = this.RULE('FunctionType', () => {
    this.CONSUME(FUNCTION)
    this.CONSUME(L_PAREN)
    this.AT_LEAST_ONE_SEP({
      SEP: COMMA,
      DEF: () => this.SUBRULE(this.TypeLiteral),
    })
    this.CONSUME(R_PAREN)
    this.SUBRULE2(this.TypeLiteral, { LABEL: 'return' })
  })

  private ListType = this.RULE('ListType', () => {
    this.CONSUME(L_BRACKET)
    this.SUBRULE(this.TypeLiteral)
    this.CONSUME(R_BRACKET)
  })

  private ArrayType = this.RULE('ArrayType', () => {
    this.CONSUME(L_BRACKET)
    this.CONSUME(R_BRACKET)
  })

  private MapType = this.RULE('MapType', () => {
    this.AT_LEAST_ONE(() => {
      this.CONSUME(L_BRACKET)
      this.SUBRULE(this.TypeLiteral, { LABEL: 'key' })
      this.CONSUME(R_BRACKET)
    })
  })

  // ============================================================

  private Statement = this.RULE('Statement', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.BlockStatement) },
      { ALT: () => this.SUBRULE(this.ReturnStatement) },
      { ALT: () => this.SUBRULE(this.BreakStatement) },
      { ALT: () => this.SUBRULE(this.ContinueStatement) },
      { ALT: () => this.SUBRULE(this.IfStatement) },
      { ALT: () => this.SUBRULE(this.ForeachStatement) },
      { ALT: () => this.SUBRULE(this.WhileStatement) },
      { ALT: () => this.SUBRULE(this.ExpressionStatement) },
      { ALT: () => this.SUBRULE(this.VariableDeclaration) },
    ])
  })

  private BlockStatement = this.RULE('BlockStatement', () => {
    this.CONSUME(L_CURLY)
    this.MANY_SEP({
      SEP: COMMA,
      DEF: () => this.SUBRULE(this.Statement),
    })
    this.CONSUME(R_CURLY)
  })

  private ReturnStatement = this.RULE('ReturnStatement', () => {
    this.CONSUME(RETURN)
    this.OPTION(() => {
      this.SUBRULE(this.Expression)
    })
    this.CONSUME(SEMICOLON)
  })

  private BreakStatement = this.RULE('BreakStatement', () => {
    this.CONSUME(BREAK)
    this.CONSUME(SEMICOLON)
  })

  private ContinueStatement = this.RULE('ContinueStatement', () => {
    this.CONSUME(CONTINUE)
    this.CONSUME(SEMICOLON)
  })

  private IfStatement = this.RULE('IfStatement', () => {
    this.CONSUME(IF)
    this.SUBRULE(this.Expression)
    this.SUBRULE(this.Statement, { LABEL: 'then' })
    this.OPTION(() => {
      this.CONSUME(ELSE)
      this.SUBRULE2(this.Statement, { LABEL: 'else' })
    })
  })

  private ForeachStatement = this.RULE('ForeachStatement', () => {
    this.CONSUME(FOR)
    this.CONSUME(L_PAREN)
    this.AT_LEAST_ONE_SEP({
      SEP: COMMA,
      DEF: () => this.CONSUME(IDENTIFIER),
    })
    this.CONSUME(IN)
    this.SUBRULE(this.Expression)
    this.CONSUME(R_PAREN)
  })

  private WhileStatement = this.RULE('WhileStatement', () => {
    this.CONSUME(WHILE)
    this.CONSUME(L_PAREN)
    this.SUBRULE(this.Expression)
    this.CONSUME(R_PAREN)
    this.SUBRULE(this.Statement)
  })

  private ExpressionStatement = this.RULE('ExpressionStatement', () => {
    this.SUBRULE(this.Expression)
    this.CONSUME(SEMICOLON)
  })

  private VariableDeclaration = this.RULE('VariableDeclaration', () => {
    this.OR([
      { ALT: () => this.CONSUME(VAR) },
      { ALT: () => this.CONSUME(VAL) },
      { ALT: () => this.CONSUME(STATIC) },
      { ALT: () => this.CONSUME(GLOBAL) },
    ])
    this.SUBRULE(this.Identifier)
    this.OPTION(() => {
      this.CONSUME(AS)
      this.SUBRULE(this.TypeLiteral)
    })
    this.OPTION2(() => {
      this.CONSUME(ASSIGN)
      this.SUBRULE(this.Expression, { LABEL: 'initializer' })
    })
    // this.CONSUME(SEMICOLON, { ERR_MSG: '; expected' })
  })

  // ============================================================

  private Expression = this.RULE('Expression', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.FunctionExpression) },
      { ALT: () => this.SUBRULE(this.CallExpression) },
      { ALT: () => this.SUBRULE(this.MemberAccessExpression) },
      { ALT: () => this.SUBRULE(this.ArrayIndexExpression) },
      { ALT: () => this.SUBRULE(this.TypeCastExpression) },
      { ALT: () => this.SUBRULE(this.UnaryExpression) },
      { ALT: () => this.SUBRULE(this.BinaryExpression) },
      { ALT: () => this.SUBRULE(this.TernaryExpression) },
      { ALT: () => this.SUBRULE(this.AssignmentExpression) },
      { ALT: () => this.SUBRULE(this.BrackHandlerExpression) },
      { ALT: () => this.SUBRULE(this.IntRangeExpression) },
      { ALT: () => this.SUBRULE(this.ArrayInitializerExpression) },
      { ALT: () => this.SUBRULE(this.MapInitializerExpression) },
      { ALT: () => this.SUBRULE(this.ParensExpression) },
      { ALT: () => this.SUBRULE(this.ThisExpression) },
      { ALT: () => this.SUBRULE(this.SuperExpression) },
      { ALT: () => this.CONSUME(INT_LITERAL, { LABEL: 'IntLiteralExpression' }) },
      { ALT: () => this.CONSUME(LONG_LITERAL, { LABEL: 'LongLiteralExpression' }) },
      { ALT: () => this.CONSUME(FLOAT_LITERAL, { LABEL: 'FloatLiteralExpression' }) },
      { ALT: () => this.CONSUME(DOUBLE_LITERAL, { LABEL: 'DoubleLiteralExpression' }) },
      { ALT: () => this.CONSUME(STRING_LITERAL, { LABEL: 'StringLiteralExpression' }) },
      { ALT: () => this.CONSUME(TRUE_LITERAL, { LABEL: 'TrueLiteralExpression' }) },
      { ALT: () => this.CONSUME(FALSE_LITERAL, { LABEL: 'FalseLiteralExpression' }) },
      { ALT: () => this.CONSUME(NULL_LITERAL, { LABEL: 'NullLiteralExpression' }) },
      { ALT: () => this.SUBRULE(this.Identifier, { LABEL: 'LocalAccessExpress' }) },
    ])
  })

  private FunctionExpression = this.RULE('FunctionExpression', () => {
    this.CONSUME(FUNCTION)
    this.CONSUME(L_PAREN)
    this.SUBRULE(this.ParameterList)
    this.CONSUME(R_PAREN)
    this.OPTION(() => {
      this.CONSUME(AS)
      this.SUBRULE(this.TypeLiteral)
    })
    this.SUBRULE(this.FunctionBody)
  })

  private CallExpression = this.RULE('CallExpression', () => {
    this.SUBRULE(this.Expression, { LABEL: 'left' })
    this.CONSUME(L_PAREN)
    this.MANY_SEP({
      SEP: COMMA,
      DEF: () => this.SUBRULE2(this.Expression),
    })
    this.CONSUME(R_PAREN)
  })

  private MemberAccessExpression = this.RULE('MemberAccessExpression', () => {
    this.SUBRULE(this.Expression, { LABEL: 'left' })
    this.CONSUME(DOT)
    this.SUBRULE(this.Identifier)
  })

  private ArrayIndexExpression = this.RULE('ArrayIndexExpression', () => {
    this.SUBRULE(this.Expression, { LABEL: 'left' })
    this.CONSUME(L_BRACKET)
    this.SUBRULE2(this.Expression, { LABEL: 'index' })
    this.CONSUME(R_BRACKET)
  })

  private TypeCastExpression = this.RULE('TypeCastExpression', () => {
    this.SUBRULE(this.Expression)
    this.CONSUME(AS)
    this.SUBRULE(this.TypeLiteral)
  })

  private UnaryExpression = this.RULE('UnaryExpression', () => {
    this.OR([
      { ALT: () => this.CONSUME(NOT, { LABEL: 'operator' }) },
      { ALT: () => this.CONSUME(MINUS, { LABEL: 'operator' }) },
      { ALT: () => this.CONSUME(PLUS, { LABEL: 'operator' }) },
    ])
    this.SUBRULE(this.Expression)
  })

  private BinaryExpression = this.RULE('BinaryExpression', () => {
    this.SUBRULE(this.Expression, { LABEL: 'left' })
    this.OR([
      {
        ALT: () => this.OR2([
          { ALT: () => this.CONSUME(MUL, { LABEL: 'operator' }) },
          { ALT: () => this.CONSUME(DIV, { LABEL: 'operator' }) },
          { ALT: () => this.CONSUME(MOD, { LABEL: 'operator' }) },
        ]),
      },
      {
        ALT: () => this.OR3([
          { ALT: () => this.CONSUME(PLUS, { LABEL: 'operator' }) },
          { ALT: () => this.CONSUME(MINUS, { LABEL: 'operator' }) },
        ]),
      },
      { ALT: () => this.CONSUME(CAT, { LABEL: 'operator' }) },
      {
        ALT: () => this.OR4([
          { ALT: () => this.CONSUME(EQUAL, { LABEL: 'operator' }) },
          { ALT: () => this.CONSUME(NOT_EQUAL, { LABEL: 'operator' }) },
        ]),
      },
      {
        ALT: () => this.OR5([
          { ALT: () => this.CONSUME(LT, { LABEL: 'operator' }) },
          { ALT: () => this.CONSUME(LESS_EQUAL, { LABEL: 'operator' }) },
          { ALT: () => this.CONSUME(GT, { LABEL: 'operator' }) },
          { ALT: () => this.CONSUME(GREATER_EQUAL, { LABEL: 'operator' }) },
          { ALT: () => this.CONSUME(INSTANCEOF, { LABEL: 'operator' }) },
        ]),
      },
      {
        ALT: () => this.OR6([
          { ALT: () => this.CONSUME(IN, { LABEL: 'operator' }) },
          { ALT: () => this.CONSUME(HAS, { LABEL: 'operator' }) },
        ])
        ,
      },
      { ALT: () => this.CONSUME(AND, { LABEL: 'operator' }) },
      { ALT: () => this.CONSUME(OR, { LABEL: 'operator' }) },
      { ALT: () => this.CONSUME(XOR, { LABEL: 'operator' }) },
      { ALT: () => this.CONSUME(AND_AND, { LABEL: 'operator' }) },
      { ALT: () => this.CONSUME(OR_OR, { LABEL: 'operator' }) },
    ])
    this.SUBRULE2(this.Expression, { LABEL: 'right' })
  })

  private TernaryExpression = this.RULE('TernaryExpression', () => {
    this.SUBRULE(this.Expression, { LABEL: 'condition' })
    this.CONSUME(QUESTION)
    this.SUBRULE2(this.Expression, { LABEL: 'truePart' })
    this.CONSUME(COLON)
    this.SUBRULE3(this.Expression, { LABEL: 'falsePart' })
  })

  private AssignmentExpression = this.RULE('AssignmentExpression', () => {
    this.SUBRULE(this.Expression, { LABEL: 'left' })
    this.OR([
      { ALT: () => this.CONSUME(ASSIGN, { LABEL: 'operator' }) },
      { ALT: () => this.CONSUME(PLUS_ASSIGN, { LABEL: 'operator' }) },
      { ALT: () => this.CONSUME(MINUS_ASSIGN, { LABEL: 'operator' }) },
      { ALT: () => this.CONSUME(MUL_ASSIGN, { LABEL: 'operator' }) },
      { ALT: () => this.CONSUME(DIV_ASSIGN, { LABEL: 'operator' }) },
      { ALT: () => this.CONSUME(MOD_ASSIGN, { LABEL: 'operator' }) },
      { ALT: () => this.CONSUME(CAT_ASSIGN, { LABEL: 'operator' }) },
      { ALT: () => this.CONSUME(AND_ASSIGN, { LABEL: 'operator' }) },
      { ALT: () => this.CONSUME(OR_ASSIGN, { LABEL: 'operator' }) },
      { ALT: () => this.CONSUME(XOR_ASSIGN, { LABEL: 'operator' }) },
    ])
    this.SUBRULE2(this.Expression, { LABEL: 'right' })
  })

  private BrackHandlerExpression = this.RULE('BrackHandlerExpression', () => {
    this.CONSUME(L_BRACKET)
    this.SUBRULE(this.Identifier)
    this.CONSUME(R_BRACKET)
  })

  private IntRangeExpression = this.RULE('IntRangeExpression', () => {
    this.SUBRULE(this.Expression, { LABEL: 'from' })
    this.OR([
      { ALT: () => this.CONSUME(DOT_DOT) },
      { ALT: () => this.CONSUME(TO) },
    ])
    this.SUBRULE2(this.Expression, { LABEL: 'to' })
  })

  private ArrayInitializerExpression = this.RULE('ArrayInitializerExpression', () => {
    this.CONSUME(L_BRACKET)
    this.MANY_SEP({
      SEP: COMMA,
      DEF: () => this.SUBRULE(this.Expression),
    })
    this.CONSUME2(R_BRACKET)
  })

  private MapInitializerExpression = this.RULE('MapInitializerExpression', () => {
    this.CONSUME(L_CURLY)
    this.MANY_SEP({
      SEP: COMMA,
      DEF: () => this.SUBRULE(this.MapEntry),
    })
    this.CONSUME(R_CURLY)
  })

  private ParensExpression = this.RULE('ParensExpression', () => {
    this.CONSUME(L_PAREN)
    this.SUBRULE(this.Expression)
    this.CONSUME(R_PAREN)
  })

  private ThisExpression = this.RULE('ThisExpression', () => {
    this.CONSUME(THIS)
  })

  private SuperExpression = this.RULE('SuperExpression', () => {
    this.CONSUME(SUPER)
  })

  private MapEntry = this.RULE('MapEntry', () => {
    this.SUBRULE(this.Expression, { LABEL: 'key' })
    this.CONSUME(COLON)
    this.SUBRULE2(this.Expression, { LABEL: 'value' })
  })

  // ============================================================

  private ClassDeclaration = this.RULE('ClassDeclaration', () => {
    this.CONSUME(ZEN_CLASS)
    this.SUBRULE(this.QualifiedName)
    this.CONSUME(L_CURLY)
    this.MANY(() => {
      this.SUBRULE(this.VariableDeclaration)
      this.SUBRULE(this.ConstructorDeclaration)
      this.SUBRULE(this.FunctionDeclaration)
    })
    this.CONSUME(R_CURLY)
  })

  private ConstructorDeclaration = this.RULE('ConstructorDeclaration', () => {
    this.CONSUME(ZEN_CONSTRUCTOR)
    this.CONSUME(L_PAREN)
    this.SUBRULE(this.ParameterList)
    this.CONSUME(R_PAREN)
    this.SUBRULE(this.BlockStatement, { LABEL: 'constructorBody' })
  })
}

export const ZSCstParser = new ZenScriptParser()
