import { CstParser } from 'chevrotain'
import {
  AS, ASSIGN, BREAK, COMMA, CONTINUE, DOLLAR,
  DOT, ELSE, EQUAL, FOR, FUNCTION, GLOBAL, IDENTIFIER, IF, IMPORT,
  IN, L_BRACKET, L_CURLY, L_PAREN, RETURN, R_BRACKET, R_CURLY, R_PAREN,
  SEMICOLON, STATIC, TO, VAL, VAR, WHILE, ZEN_D_Expand, ZS_ALL_TOKENS, ZS_PRIMITIVE_TYPE_TOKENS,
} from './lexer'

export class ZenScriptParser extends CstParser {
  constructor() {
    super(ZS_ALL_TOKENS, {
      maxLookahead: 2,
      recoveryEnabled: true,
      nodeLocationTracking: 'full',
    })

    this.parser()
    this.performSelfAnalysis()
  }

  private parser() {
  }

  private Progment = this.RULE('Program', () => {
    this.MANY(() => {
      this.SUBRULE(this.ImportDeclaration)
    })

    this.MANY2(() => {
      this.OR([
        { ALT: () => this.SUBRULE(this.FunctionDeclaration) },
        { ALT: () => this.SUBRULE(this.DExpandFunctionDeclaration) },
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
    this.OPTION(() => {
      this.SUBRULE(this.ParameterList)
    })
    this.CONSUME(R_PAREN)
    this.OPTION2(() => {
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
      this.SUBRULE(this.TypeLiteral, { LABEL: 'returnType' })
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
    this.AT_LEAST_ONE_SEP({
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
    this.OPTION(() => {
      this.CONSUME(ASSIGN)
      // default value -> expression
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
      { ALT: () => this.SUBRULE(this.ArrayType) },
      { ALT: () => this.SUBRULE(this.ListType) },
      { ALT: () => this.SUBRULE(this.MapType) },
    ])
  })

  private FunctionType = this.RULE('FunctionType', () => {
    this.CONSUME(FUNCTION)
    this.CONSUME(L_PAREN)
    this.AT_LEAST_ONE_SEP({
      SEP: COMMA,
      DEF: () => this.SUBRULE(this.TypeLiteral),
    })
    this.CONSUME(R_PAREN)
    this.SUBRULE(this.TypeLiteral, { LABEL: 'return' })
  })

  private ArrayType = this.RULE('ArrayType', () => {
    this.SUBRULE(this.TypeLiteral)
    this.CONSUME(L_BRACKET)
    this.CONSUME(R_BRACKET)
  })

  private ListType = this.RULE('ListType', () => {
    this.CONSUME(L_BRACKET)
    this.SUBRULE(this.TypeLiteral)
    this.CONSUME(R_BRACKET)
  })

  private MapType = this.RULE('MapType', () => {
    this.SUBRULE(this.TypeLiteral, { LABEL: 'value' })
    this.CONSUME(L_BRACKET)
    this.SUBRULE(this.TypeLiteral, { LABEL: 'key' })
    this.CONSUME(R_BRACKET)
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
    // expression?
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
    //  expression
    this.SUBRULE(this.Statement, { LABEL: 'then' })
    this.OPTION(() => {
      this.CONSUME(ELSE)
      this.SUBRULE(this.Statement, { LABEL: 'else' })
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
    // expression
    this.CONSUME(R_PAREN)
  })

  private WhileStatement = this.RULE('WhileStatement', () => {
    this.CONSUME(WHILE)
    this.CONSUME(L_PAREN)
    // expression
    this.CONSUME(R_PAREN)
    this.SUBRULE(this.Statement)
  })

  private ExpressionStatement = this.RULE('ExpressionStatement', () => {
    // expression
    this.CONSUME(COMMA)
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
    this.OPTION(() => {
      this.CONSUME(EQUAL)
      // expression initializer
    })
    this.CONSUME(SEMICOLON, { ERR_MSG: '; expected' })
  })

  // ============================================================
}
