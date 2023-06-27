import { expect, it } from 'vitest'
import { ZSLexer } from '../src/lexer'
import { ZSCstParser } from '../src/cst-parser'
import { ZenScriptBasicVisitor } from '../src/visitor/basic-visitor'

it('Basic Visitor', () => {
  const lexResult = ZSLexer.tokenize(`
    global a as bool = true;
    static b as string = 'false';

    zenClass To {}

    function fun(a as string, b as int = 1) as string {}

    static b as string = 'true';

    function errorFunc(a as string, a as int) as void {}

    zenClass ErrorClass {
      zenConstructor() {}
      zenConstructor(c as string, c as int) {}

      var b as string = 'true';
      val b as string = 'false';
      function b() {}
    }
  `)
  const cst = ZSCstParser.parse(lexResult.tokens)
  expect(ZSCstParser.errors.length).toBe(0)
  const res = new ZenScriptBasicVisitor().visit(cst)

  expect(res).toMatchInlineSnapshot(`
    {
      "errors": [
        {
          "end": 174,
          "message": "Duplicate static variable of b",
          "start": 147,
        },
        {
          "end": 220,
          "message": "Duplicate parameter of a",
          "start": 213,
        },
        {
          "end": 328,
          "message": "Duplicate parameter of c",
          "start": 321,
        },
        {
          "end": 332,
          "message": "Duplicate constructor of ErrorClass",
          "start": 293,
        },
        {
          "end": 398,
          "message": "Duplicate field or method of b",
          "start": 373,
        },
        {
          "end": 420,
          "message": "Duplicate field or method of b",
          "start": 406,
        },
      ],
      "scopes": {
        "ErrorClass": "zen-class",
        "To": "zen-class",
        "a": "global",
        "b": "static",
        "errorFunc": "function",
        "fun": "function",
      },
    }
  `)
})
