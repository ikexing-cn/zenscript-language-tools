import { expect, it } from 'vitest'
import { ZSLexer } from '../src/lexer'
import { ZSCstParser } from '../src/cst-parser'
import { ZenScriptVisitor } from '../src/visitor/visitor'

it('Visitor Program without Expression', () => {
  const lexResult = ZSLexer.tokenize(`
    import a.b.C;
    
    global a as bool = false;
    static b as string = '';

    zenClass To {}

    function fun() as string {}

    $expand string $createArray() as void {}

    zenClass TheClass {
      zenConstructor(a as string[int][string][]) {}
      var b as string;
      var funTypeCase as [function(string)void[]];'
      var classTypeCase as a.b.C[];
      var classTypeCase2 as C[];
      var listTypeCase as [[string]][];
      function c(c as string) {}
    }
  `)
  const cst = ZSCstParser.parse(lexResult.tokens)
  expect(ZSCstParser.errors.length).toBe(0)
  const res = new ZenScriptVisitor().visit(cst)

  expect(res).toMatchSnapshot()
})

it('Visitor Expression', () => {
  const lexResult = ZSLexer.tokenize(`
    a ? true : false;

    // expression
    1 + 1;
    abc;

    // breaket handler
    <minecraft:apple:*>;
    1 + (1 + 1);

    {a : 1, b : 2};
    {};

    [1,3,4,5];
    [];

    function(a,b,c){};

    a.b.c.d()(2,3)(1);

    0 to 10;
    10 .. 20;

    a[1][2][3] = 233;

    a as string;
    a instanceof int;
  `)
  const cst = ZSCstParser.parse(lexResult.tokens)
  expect(ZSCstParser.errors.length).toBe(0)
  const res = new ZenScriptVisitor().visit(cst)

  expect(res).toMatchSnapshot()
})
