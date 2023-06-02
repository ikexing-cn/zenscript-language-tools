import type { CstNode, IToken } from 'chevrotain'
import { CstParser } from 'chevrotain'
import {
  AND, AND_ASSIGN, AS, ASSIGN, BREAK, CAT, CAT_ASSIGN, COLON, COMMA, CONTINUE, DIV,
  DIV_ASSIGN, DOLLAR, DOT, DOT_DOT, DOUBLE_LITERAL, ELSE, EQUAL, FALSE_LITERAL, FLOAT_LITERAL,
  FOR, FUNCTION, GLOBAL, GREATER_EQUAL, GT, IDENTIFIER, IF, IMPORT, IN,
  INSTANCEOF, INT_LITERAL, LESS_EQUAL, LONG_LITERAL, LT, L_BRACKET, L_CURLY, L_PAREN,
  MINUS, MINUS_ASSIGN, MOD, MOD_ASSIGN, MUL, MUL_ASSIGN, NOT, NOT_EQUAL,
  NULL_LITERAL, OR, OR_ASSIGN, PLUS, PLUS_ASSIGN, QUESTION, RETURN, R_BRACKET, R_CURLY, R_PAREN, SEMICOLON,
  STATIC, STRING, STRING_LITERAL, TO, TRUE_LITERAL, VAL, VAR, WHILE, XOR, XOR_ASSIGN, ZEN_CLASS,
  ZEN_CONSTRUCTOR, ZEN_D_Expand, ZS_ALL_TOKENS, ZS_PRIMITIVE_TYPE_TOKENS,
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
      {
        GATE: () => this.LA(1).tokenType === L_PAREN,
        ALT: () => this.SUBRULE(this.BlockStatement),
      },
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
    this.MANY(() => {
      this.SUBRULE(this.Statement)
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

  protected GlobalStaticDeclaration = this.RULE(
    'GlobalStaticDeclaration',
    () => {
      this.OR([
        { ALT: () => this.CONSUME(GLOBAL) },
        { ALT: () => this.CONSUME(STATIC) },
      ])
      this.CONSUME(IDENTIFIER, {
        LABEL: 'vName',
        ERR_MSG: 'Identifier expected.',
      })
      this.OPTION(() => {
        this.CONSUME(AS)
        this.SUBRULE(this.TypeLiteral)
      })
      this.CONSUME(ASSIGN, {
        ERR_MSG: 'Global or Static variables must be initialized.',
      })
      this.SUBRULE(this.Expression, { LABEL: 'value' })
      this.CONSUME(SEMICOLON, { ERR_MSG: '; expected' })
    },
  )

  private VariableDeclaration = this.RULE('VariableDeclaration', () => {
    this.OR([
      { ALT: () => this.CONSUME(VAR) },
      { ALT: () => this.CONSUME(VAL) },
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
    this.CONSUME(SEMICOLON, { ERR_MSG: '; expected' })
  })

  // ============================================================
  // Code refrence:
  // https://github.com/Yesterday17/ZenScript/blob/master/server/parser/zenscript/zsParser.ts#L385

  private Expression = this.RULE('Expression', () => {
    this.SUBRULE(this.AssignExpression, { LABEL: 'expression' })
  })

  private AssignExpression = this.RULE('AssignExpression', () => {
    this.SUBRULE(this.ConditionalExpression, { LABEL: 'expression' })
    this.OPTION(() => {
      this.OR([
        { ALT: () => this.CONSUME(ASSIGN, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(PLUS_ASSIGN, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(MINUS_ASSIGN, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(CAT_ASSIGN, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(MUL_ASSIGN, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(DIV_ASSIGN, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(MOD_ASSIGN, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(OR_ASSIGN, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(AND_ASSIGN, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(XOR_ASSIGN, { LABEL: 'operator' }) },
      ])
      this.SUBRULE(this.AssignExpression, { LABEL: 'rightExpression' })
    })
  })

  private ConditionalExpression = this.RULE('ConditionalExpression', () => {
    this.SUBRULE(this.OrOrExpression)
    this.OPTION(() => {
      this.CONSUME(QUESTION)
      this.SUBRULE2(this.OrOrExpression)
      this.CONSUME(COLON)
      this.SUBRULE(this.ConditionalExpression)
    })
  })

  private OrOrExpression = this.RULE('OrOrExpression', () => {
    this.SUBRULE(this.AndAndExpression)
    this.MANY(() => {
      this.CONSUME(OR_ASSIGN)
      this.SUBRULE2(this.AndAndExpression)
    })
  })

  private AndAndExpression = this.RULE('AndAndExpression', () => {
    this.SUBRULE(this.OrExpression)
    this.MANY(() => {
      this.CONSUME(AND_ASSIGN)
      this.SUBRULE2(this.OrExpression)
    })
  })

  private OrExpression = this.RULE('OrExpression', () => {
    this.SUBRULE(this.XorExpression)
    this.MANY(() => {
      this.CONSUME(OR, { LABEL: 'operator' })
      this.SUBRULE2(this.XorExpression)
    })
  })

  private XorExpression = this.RULE('XorExpression', () => {
    this.SUBRULE(this.AndExpression)
    this.MANY(() => {
      this.CONSUME(XOR, { LABEL: 'operator' })
      this.SUBRULE2(this.AndExpression)
    })
  })

  private AndExpression = this.RULE('AndExpression', () => {
    this.SUBRULE(this.CompareExpression)
    this.MANY(() => {
      this.CONSUME(AND, { LABEL: 'operator' })
      this.SUBRULE2(this.CompareExpression)
    })
  })

  private CompareExpression = this.RULE('CompareExpression', () => {
    this.SUBRULE(this.AddExpression)
    this.OPTION(() => {
      this.OR([
        { ALT: () => this.CONSUME(EQUAL, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(NOT_EQUAL, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(LT, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(LESS_EQUAL, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(GT, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(GREATER_EQUAL, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(IN, { LABEL: 'operator' }) },
      ])
      this.SUBRULE2(this.AddExpression)
    })
  })

  private AddExpression = this.RULE('AddExpression', () => {
    this.SUBRULE(this.MultiplyExpression)
    this.MANY(() => {
      this.OR([
        { ALT: () => this.CONSUME(PLUS, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(MINUS, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(CAT, { LABEL: 'operator' }) }, // TILDE can be used to concat strings
      ])
      this.SUBRULE2(this.MultiplyExpression)
    })
  })

  private MultiplyExpression = this.RULE('MultiplyExpression', () => {
    this.SUBRULE(this.UnaryExpression)
    this.MANY(() => {
      this.OR([
        { ALT: () => this.CONSUME(MUL, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(DIV, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(MOD, { LABEL: 'operator' }) },
      ])
      this.SUBRULE2(this.UnaryExpression)
    })
  })

  private UnaryExpression = this.RULE('UnaryExpression', () => {
    this.OR([
      {
        ALT: () => {
          this.OR2([
            { ALT: () => this.CONSUME(NOT, { LABEL: 'operator' }) },
            { ALT: () => this.CONSUME(MINUS, { LABEL: 'operator' }) },
          ])
          this.SUBRULE(this.UnaryExpression, { LABEL: 'expression' })
        },
      },
      {
        ALT: () => {
          this.SUBRULE(this.PostfixExpression, { LABEL: 'expression' })
        },
      },
    ])
  })

  private PostfixExpression = this.RULE('PostfixExpression', () => {
    this.SUBRULE(this.PrimaryExpression)
    this.MANY(() => {
      this.OR([
        {
          ALT: () => {
            this.SUBRULE(this.PostfixExpressionMemberCall)
          },
        },
        {
          GATE: () =>
            this.LA(1).tokenType === IDENTIFIER && this.LA(1).image === 'to',
          ALT: () => {
            this.SUBRULE(this.PostfixExpressionTo)
          },
        },
        {
          ALT: () => {
            this.SUBRULE(this.PostfixExpressionDotDot)
          },
        },
        {
          ALT: () => {
            this.SUBRULE(this.PostfixExpressionArray)
          },
        },
        {
          ALT: () => {
            this.SUBRULE(this.PostfixExpressionFunctionCall)
          },
        },
        {
          ALT: () => {
            this.CONSUME(AS)
            this.SUBRULE2(this.TypeLiteral)
          },
        },
        {
          ALT: () => {
            this.CONSUME(INSTANCEOF)
            this.SUBRULE(this.TypeLiteral, { LABEL: 'instanceof' })
          },
        },
      ])
    })
  })

  private PostfixExpressionMemberCall = this.RULE(
    'PostfixExpressionMemberCall',
    () => {
      this.CONSUME(DOT)
      this.OR([
        { ALT: () => this.CONSUME(IDENTIFIER, { LABEL: 'property' }) },
        // { ALT: () => this.CONSUME(VERSION, { LABEL: 'property' }) },
        { ALT: () => this.CONSUME(STRING, { LABEL: 'property' }) },
      ])
    },
  )

  private PostfixExpressionTo = this.RULE('PostfixExpressionTo', () => {
    this.CONSUME(IDENTIFIER)
    this.SUBRULE(this.AssignExpression, { LABEL: 'to' })
  })

  private PostfixExpressionDotDot = this.RULE(
    'PostfixExpressionDotDot',
    () => {
      this.CONSUME(DOT_DOT)
      this.SUBRULE(this.AssignExpression, { LABEL: 'dotdot' })
    },
  )

  private PostfixExpressionArray = this.RULE('PostfixExpressionArray', () => {
    this.CONSUME(L_BRACKET)
    this.SUBRULE(this.AssignExpression, { LABEL: 'index' })
    this.CONSUME(R_BRACKET)
    this.OPTION(() => {
      this.CONSUME(ASSIGN)
      this.SUBRULE2(this.AssignExpression, { LABEL: 'value' })
    })
  })

  private PostfixExpressionFunctionCall = this.RULE(
    'PostfixExpressionFunctionCall',
    () => {
      this.CONSUME(L_PAREN)
      this.MANY_SEP({
        SEP: COMMA,
        DEF: () => {
          this.SUBRULE(this.AssignExpression, {
            LABEL: 'argument',
          })
        },
      })
      this.CONSUME(R_PAREN)
    },
  )

  private PrimaryExpression = this.RULE('PrimaryExpression', () => {
    this.OR([
      { ALT: () => this.CONSUME(INT_LITERAL, { LABEL: 'literal' }) },
      { ALT: () => this.CONSUME(LONG_LITERAL, { LABEL: 'literal' }) },
      { ALT: () => this.CONSUME(FLOAT_LITERAL, { LABEL: 'literal' }) },
      { ALT: () => this.CONSUME(DOUBLE_LITERAL, { LABEL: 'literal' }) },
      { ALT: () => this.CONSUME(STRING_LITERAL, { LABEL: 'literal' }) },
      { ALT: () => this.SUBRULE(this.Identifier, { LABEL: 'identifier' }) },

      { ALT: () => this.SUBRULE(this.BracketHandlerExpression) },
      { ALT: () => this.SUBRULE(this.LambdaFunctionDeclaration) },
      { ALT: () => this.SUBRULE(this.ArrayInitializerExpression) },
      { ALT: () => this.SUBRULE(this.MapInitializerExpression) },

      { ALT: () => this.CONSUME(TRUE_LITERAL, { LABEL: 'literal' }) },
      { ALT: () => this.CONSUME(FALSE_LITERAL, { LABEL: 'literal' }) },
      { ALT: () => this.CONSUME(NULL_LITERAL, { LABEL: 'literal' }) },
      {
        ALT: () => {
          this.CONSUME(L_PAREN)
          this.SUBRULE(this.AssignExpression)
          this.CONSUME(R_PAREN)
        },
      },
    ])
  })

  private BracketHandlerExpression = this.RULE('BracketHandlerExpression', () => {
    this.CONSUME(LT)
    this.MANY(() => {
      this.OR([
        { ALT: () => this.CONSUME(DOT) },
        { ALT: () => this.CONSUME(COLON) },
        { ALT: () => this.SUBRULE(this.Identifier) },
        { ALT: () => this.CONSUME(INT_LITERAL, { LABEL: 'literal' }) },
        ...ZS_PRIMITIVE_TYPE_TOKENS.map((type) => {
          return { ALT: () => this.CONSUME(type) }
        }),
      ])
    })
    this.CONSUME(GT)
  })

  private ArrayInitializerExpression = this.RULE('ArrayInitializerExpression', () => {
    this.CONSUME(L_BRACKET)
    this.OPTION(() => {
      this.SUBRULE(this.AssignExpression)
      this.MANY(() => {
        this.CONSUME(COMMA)
        this.SUBRULE2(this.AssignExpression)
      })
      this.OPTION2(() => {
        this.CONSUME2(COMMA)
      })
    })
    this.CONSUME(R_BRACKET)
  })

  private MapInitializerExpression = this.RULE('MapInitializerExpression', () => {
    this.CONSUME(L_CURLY)
    this.OPTION(() => {
      this.SUBRULE(this.MapEntry)
      this.MANY(() => {
        this.CONSUME(COMMA)
        this.SUBRULE2(this.MapEntry)
      })
      this.OPTION2(() => {
        this.CONSUME2(COMMA)
      })
    })
    this.CONSUME(R_CURLY)
  })

  private MapEntry = this.RULE('MapEntry', () => {
    this.SUBRULE(this.AssignExpression, { LABEL: 'key' })
    this.CONSUME(COLON)
    this.SUBRULE2(this.AssignExpression, { LABEL: 'value' })
  })

  private LambdaFunctionDeclaration = this.RULE('LambdaFunctionDeclaration', () => {
    this.CONSUME(FUNCTION)
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

  // ============================================================

  private ClassDeclaration = this.RULE('ClassDeclaration', () => {
    this.CONSUME(ZEN_CLASS)
    this.SUBRULE(this.QualifiedName)
    this.CONSUME(L_CURLY)
    this.MANY(() => {
      this.OR([
        { ALT: () => this.SUBRULE(this.VariableDeclaration) },
        { ALT: () => this.SUBRULE(this.ConstructorDeclaration) },
        { ALT: () => this.SUBRULE(this.FunctionDeclaration) },
      ])
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
