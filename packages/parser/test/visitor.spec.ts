import { expect, it } from 'vitest'
import { ZSLexer } from '../src/lexer'
import { ZSCstParser } from '../src/cst-parser'
import { ZenScriptVisitor } from '../src/visitor/visitor'

it('Visitor', () => {
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
  const res = new ZenScriptVisitor().visit(cst)

  expect(res).toMatchInlineSnapshot(`
    {
      "body": [],
      "start": 0,
      "type": "program",
    }
  `)
})
