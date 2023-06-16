import { expect, it } from 'vitest'
import { ZSLexer } from '../src/lexer'
import { ZSCstParser } from '../src/cst-parser'
import { ZSBasicVisitor } from '../src/visitor/basic-visitor'

it('Basic Visitor', () => {
  const lexResult = ZSLexer.tokenize(`
    global a as bool = true;
    static b as string = 'false';

    zenClass To {}

    function fun(a as string, b as int = 1) as string {}

    static b as string = 'true';
  `)
  const cst = ZSCstParser.parse(lexResult.tokens)
  const res = ZSBasicVisitor.visit(cst)

  expect(res).toMatchInlineSnapshot(`
    {
      "errors": [
        {
          "end": 174,
          "message": "Duplicate static variable of b",
          "start": 147,
        },
      ],
      "scopes": {
        "To": "class",
        "a": "global",
        "b": "static",
        "fun": "function",
      },
    }
  `)
})
