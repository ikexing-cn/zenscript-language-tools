import { expect, it } from 'vitest'
import { ZSLexer } from '../src/lexer'
import { ZSCstParser } from '../src/cst-parser'
import { ZenScriptVisitor } from '../src/visitor/visitor'

it('Visitor', () => {
  const lexResult = ZSLexer.tokenize(`
    // TODO: handle variable expression and type
    // TODO: global or static variable must to be initialized
    var a as bool;
    val b as string;

    zenClass To {}

    function fun() as string {}

    zenClass TheClass {
      zenConstructor(a as string, b as int) {}
      var b as string;
      function c(c as string) {}
    }
  `)
  const cst = ZSCstParser.parse(lexResult.tokens)
  expect(ZSCstParser.errors.length).toBe(0)
  const res = new ZenScriptVisitor().visit(cst)

  expect(res).toMatchSnapshot()
})
