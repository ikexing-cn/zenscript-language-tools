import { expect, it } from 'vitest'
import { ZSLexer } from '../src/lexer'
import { ZSCstParser } from '../src/cst-parser'
import { ZenScriptVisitor } from '../src/visitor/visitor'

it('Visitor', () => {
  const lexResult = ZSLexer.tokenize(`
    global a as bool = true;
    static b as string = 'false';

    zenClass To {}

    function fun() as string {}

    zenClass TheClass {
      zenConstructor(a as string, b as int) {}
      var b as string = 'true';
    }
  `)
  const cst = ZSCstParser.parse(lexResult.tokens)
  expect(ZSCstParser.errors.length).toBe(0)
  const res = new ZenScriptVisitor().visit(cst)

  expect(res).toMatchSnapshot()
})
