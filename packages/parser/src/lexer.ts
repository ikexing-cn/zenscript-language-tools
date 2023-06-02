import * as chevrotain from 'chevrotain'

const createToken = chevrotain.createToken

// Skip
export const EOL = createToken({
  name: 'EOL',
  pattern: /\r?\n/,
  group: chevrotain.Lexer.SKIPPED,
})
export const WHITE_SPACE = createToken({
  name: 'WHITE_SPACE',
  pattern: /\s+/,
  group: chevrotain.Lexer.SKIPPED,
})

// Comment
export const LINE_COMMENT = createToken({
  name: 'LINE_COMMENT',
  pattern: /\/\/.*/,
  group: 'COMMENT',
})

export const LINE_COMMENT_PREPROCESSOR = createToken({
  name: 'LINE_COMMENT_PREPROCESSOR',
  pattern: /#.*/,
  group: 'COMMENT',
})

export const BLOCK_COMMENT = createToken({
  name: 'BLOCK_COMMENT',
  pattern: /\/\*([^*]|\*+[^*/])*(\*+\/)?/,
  group: 'COMMENT',
})

export const IDENTIFIER = createToken({
  name: 'IDENTIFIER',
  pattern: /[a-zA-Z_][a-zA-Z_0-9]*/,
})

// Keywords
// var val global static import function as to in has instanceof this super
export const VAR = createToken({ name: 'VAR', pattern: /var/, longer_alt: IDENTIFIER })
export const VAL = createToken({ name: 'VAL', pattern: /val/, longer_alt: IDENTIFIER })
export const GLOBAL = createToken({ name: 'GLOBAL', pattern: /global/, longer_alt: IDENTIFIER })
export const STATIC = createToken({ name: 'STATIC', pattern: /static/, longer_alt: IDENTIFIER })
export const IMPORT = createToken({ name: 'IMPORT', pattern: /import/, longer_alt: IDENTIFIER })
export const FUNCTION = createToken({ name: 'FUNCTION', pattern: /function/, longer_alt: IDENTIFIER })
export const AS = createToken({ name: 'AS', pattern: /as/, longer_alt: IDENTIFIER })
export const TO = createToken({ name: 'TO', pattern: /to/, longer_alt: IDENTIFIER })
export const IN = createToken({ name: 'IN', pattern: /in/, longer_alt: IDENTIFIER })
export const HAS = createToken({ name: 'HAS', pattern: /has/, longer_alt: IDENTIFIER })
export const INSTANCEOF = createToken({ name: 'INSTANCEOF', pattern: /instanceof/, longer_alt: IDENTIFIER })
export const THIS = createToken({ name: 'THIS', pattern: /this/, longer_alt: IDENTIFIER })
export const SUPER = createToken({ name: 'SUPER', pattern: /super/, longer_alt: IDENTIFIER })

// if else for do while break continue return
export const IF = createToken({ name: 'IF', pattern: /if/, longer_alt: IDENTIFIER })
export const ELSE = createToken({ name: 'ELSE', pattern: /else/, longer_alt: IDENTIFIER })
export const FOR = createToken({ name: 'FOR', pattern: /for/, longer_alt: IDENTIFIER })
export const DO = createToken({ name: 'DO', pattern: /do/, longer_alt: IDENTIFIER })
export const WHILE = createToken({ name: 'WHILE', pattern: /while/, longer_alt: IDENTIFIER })
export const BREAK = createToken({ name: 'BREAK', pattern: /break/, longer_alt: IDENTIFIER })
export const CONTINUE = createToken({ name: 'CONTINUE', pattern: /continue/, longer_alt: IDENTIFIER })
export const RETURN = createToken({ name: 'RETURN', pattern: /return/, longer_alt: IDENTIFIER })

// any byte short int long float double bool void string
export const ANY = createToken({ name: 'ANY', pattern: /any/, longer_alt: IDENTIFIER })
export const BYTE = createToken({ name: 'BYTE', pattern: /byte/, longer_alt: IDENTIFIER })
export const SHORT = createToken({ name: 'SHORT', pattern: /short/, longer_alt: IDENTIFIER })
export const INT = createToken({ name: 'INT', pattern: /int/, longer_alt: IDENTIFIER })
export const LONG = createToken({ name: 'LONG', pattern: /long/, longer_alt: IDENTIFIER })
export const FLOAT = createToken({ name: 'FLOAT', pattern: /float/, longer_alt: IDENTIFIER })
export const DOUBLE = createToken({ name: 'DOUBLE', pattern: /double/, longer_alt: IDENTIFIER })
export const BOOL = createToken({ name: 'BOOL', pattern: /bool/, longer_alt: IDENTIFIER })
export const VOID = createToken({ name: 'VOID', pattern: /void/, longer_alt: IDENTIFIER })
export const STRING = createToken({ name: 'STRING', pattern: /string/, longer_alt: IDENTIFIER })

// frigginClass frigginConstructor zenClass zenConstructor
export const ZEN_CLASS = createToken({
  name: 'ZEN_CLASS',
  pattern: /frigginClass|zenClass/,
  longer_alt: IDENTIFIER,
})

export const ZEN_CONSTRUCTOR = createToken({
  name: 'ZEN_CONSTRUCTOR',
  pattern: /frigginConstructor|zenConstructor/,
  longer_alt: IDENTIFIER,
})

// $expand
export const ZEN_D_Expand = createToken({
  name: 'ZEN_D_Expand',
  pattern: /\$expand/,
  longer_alt: IDENTIFIER,
})

// ( ) [ ] { } , . ;
export const L_PAREN = createToken({ name: 'LPAREN', pattern: /\(/ })
export const R_PAREN = createToken({ name: 'RPAREN', pattern: /\)/ })
export const L_BRACKET = createToken({ name: 'LBRACKET', pattern: /\[/ })
export const R_BRACKET = createToken({ name: 'RBRACKET', pattern: /\]/ })
export const L_CURLY = createToken({ name: 'LCURLY', pattern: /\{/ })
export const R_CURLY = createToken({ name: 'RCURLY', pattern: /\}/ })
export const COMMA = createToken({ name: 'COMMA', pattern: /,/ })
export const DOT = createToken({ name: 'DOT', pattern: /\./ })
export const SEMICOLON = createToken({ name: 'SEMICOLON', pattern: /;/ })

// + - * / % ~ ! < > ^ : ? ` $ & | =
export const PLUS = createToken({ name: 'PLUS', pattern: /\+/ })
export const MINUS = createToken({ name: 'MINUS', pattern: /-/ })
export const MUL = createToken({ name: 'MUL', pattern: /\*/ })
export const DIV = createToken({ name: 'DIV', pattern: /\// })
export const MOD = createToken({ name: 'MOD', pattern: /%/ })
export const CAT = createToken({ name: 'CAT', pattern: /~/ })
export const NOT = createToken({ name: 'NOT', pattern: /!/ })
export const LT = createToken({ name: 'LT', pattern: /</ })
export const GT = createToken({ name: 'GT', pattern: />/ })
export const XOR = createToken({ name: 'XOR', pattern: /\^/ })
export const COLON = createToken({ name: 'COLON', pattern: /:/ })
export const QUESTION = createToken({ name: 'QUESTION', pattern: /\?/ })
export const BACKTICK = createToken({ name: 'BACKTICK', pattern: /`/ })
export const DOLLAR = createToken({ name: 'DOLLAR', pattern: /\$/ })
export const AND = createToken({ name: 'AND', pattern: /&/ })
export const OR = createToken({ name: 'OR', pattern: /\|/ })
export const ASSIGN = createToken({ name: 'ASSIGN', pattern: /=/ })

// && || == != <= >= += -= *= /= %= ^= &= |= ~= ..
export const AND_AND = createToken({ name: 'AND_AND', pattern: /&&/ })
export const OR_OR = createToken({ name: 'OR_OR', pattern: /\|\|/ })
export const EQUAL = createToken({ name: 'EQUAL', pattern: /==/ })
export const NOT_EQUAL = createToken({ name: 'NOT_EQUAL', pattern: /!=/ })
export const LESS_EQUAL = createToken({ name: 'LESS_EQUAL', pattern: /<=/ })
export const GREATER_EQUAL = createToken({ name: 'GREATER_EQUAL', pattern: />=/ })
export const PLUS_ASSIGN = createToken({ name: 'PLUS_ASSIGN', pattern: /\+=/ })
export const MINUS_ASSIGN = createToken({ name: 'MINUS_ASSIGN', pattern: /-=/ })
export const MUL_ASSIGN = createToken({ name: 'MUL_ASSIGN', pattern: /\*=/ })
export const DIV_ASSIGN = createToken({ name: 'DIV_ASSIGN', pattern: /\/=/ })
export const MOD_ASSIGN = createToken({ name: 'MOD_ASSIGN', pattern: /%=/ })
export const XOR_ASSIGN = createToken({ name: 'XOR_ASSIGN', pattern: /\^=/ })
export const AND_ASSIGN = createToken({ name: 'AND_ASSIGN', pattern: /&=/ })
export const OR_ASSIGN = createToken({ name: 'OR_ASSIGN', pattern: /\|=/ })
export const CAT_ASSIGN = createToken({ name: 'CAT_ASSIGN', pattern: /~=/ })
export const DOT_DOT = createToken({ name: 'DOT_DOT', pattern: /\.\./ })

// Literal
export const INT_LITERAL = createToken({
  name: 'INT_LITERAL',
  pattern: /(?:0x[A-Fa-f0-9]*)|(?:\-?(0|[1-9][0-9]*))/,
})
export const FLOAT_LITERAL = createToken({
  name: 'FLOAT_VALUE',
  pattern: /\-?(0|[1-9][0-9]*)\.[0-9]+([eE][\+\-]?[0-9]+)?[fF]?/,
})
export const DOUBLE_LITERAL = createToken({
  name: 'DOUBLE_LITERAL',
  pattern: /\-?(0|[1-9][0-9]*)\.[0-9]+([eE][\+\-]?[0-9]+)?[dD]?/,
})
export const LONG_LITERAL = createToken({
  name: 'LONG_LITERAL',
  pattern: /(?:\-?(0|[1-9][0-9]*[lL]?))/,
})
export const NULL_LITERAL = createToken({
  name: 'NULL_LITERAL',
  pattern: /null/,
  longer_alt: IDENTIFIER,
})
export const TRUE_LITERAL = createToken({
  name: 'TRUE_LITERAL',
  pattern: /true/,
  longer_alt: IDENTIFIER,
})
export const FALSE_LITERAL = createToken({
  name: 'FALSE_LITERAL',
  pattern: /false/,
  longer_alt: IDENTIFIER,
})
export const STRING_LITERAL = createToken({
  name: 'STRING_LITERAL',
  pattern: chevrotain.Lexer.NA,
})
export const DOUBLE_QUOTED_STRING = createToken({
  name: 'DOUBLE_QUOTED_STRING',
  pattern: /\"([^\"\\]|\\([\'\"\\/bfnrt]|u[0-9a-fA-F]{4}))*\"/,
  categories: [STRING_LITERAL],
})
export const SINGLE_QUOTED_STRING = createToken({
  name: 'SINGLE_QUOTED_STRING',
  pattern: /\'([^\'\\]|\\([\'\"\\/bfnrt]|u[0-9a-fA-F]{4}))*\'/,
  categories: [STRING_LITERAL],
})

export const ZS_PRIMITIVE_TYPE_TOKENS = [
  ANY, BYTE, SHORT, INT, LONG, DOUBLE, BOOL, VOID, STRING,
]

export const ZS_ALL_TOKENS = [
  ...ZS_PRIMITIVE_TYPE_TOKENS,
  VAR, VAL, GLOBAL, STATIC, IMPORT, FUNCTION, AS, TO, INSTANCEOF, IN, HAS, THIS, SUPER,
  IF, ELSE, FOR, DO, WHILE, BREAK, CONTINUE, RETURN,
  ZEN_CLASS, ZEN_CONSTRUCTOR,
  ZEN_D_Expand,
  EOL, WHITE_SPACE, LINE_COMMENT, BLOCK_COMMENT, LINE_COMMENT_PREPROCESSOR,
  L_BRACKET, R_BRACKET, L_CURLY, R_CURLY, L_PAREN, R_PAREN, COMMA, DOT, SEMICOLON,
  AND_AND, OR_OR, EQUAL, NOT_EQUAL, LESS_EQUAL, GREATER_EQUAL, PLUS_ASSIGN, MINUS_ASSIGN, DIV_ASSIGN, MOD_ASSIGN, CAT_ASSIGN, XOR_ASSIGN, AND_ASSIGN, OR_ASSIGN, DOT_DOT,
  PLUS, MINUS, MUL, DIV, MOD, CAT, NOT, LT, GT, XOR, QUESTION, BACKTICK, AND, OR, ASSIGN,
  INT_LITERAL, LONG_LITERAL, FLOAT_LITERAL, DOUBLE_LITERAL, NULL_LITERAL, TRUE_LITERAL, FALSE_LITERAL, STRING_LITERAL, DOUBLE_QUOTED_STRING, SINGLE_QUOTED_STRING,
  DOLLAR, IDENTIFIER,
]

export const ZSLexer = new chevrotain.Lexer(ZS_ALL_TOKENS)
