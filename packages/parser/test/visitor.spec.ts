/* eslint-disable no-console */
import { describe, expect, it } from 'vitest'
import { ZSLexer } from '../src/lexer'
import { ZSCstParser } from '../src/cst-parser'
import { ZenScriptVisitor } from '../src/visitor/visitor'
import type { ASTProgram } from '../src/types/zs-ast'

function parser(code: string, debug?: boolean) {
  const lexResult = ZSLexer.tokenize(code)
  const cst = ZSCstParser.parse(lexResult.tokens)
  if (debug) {
    console.log(lexResult.tokens)
    console.log(ZSCstParser.errors)
  }

  expect(ZSCstParser.errors.length).toBe(0)

  const visitor = new ZenScriptVisitor()
  const ast = visitor.visit(cst) as ASTProgram

  return ast.body[0]
}

describe('AST Parser', () => {
  it('ImportDeclaration', () => expect(parser('import xxx.xxx.xxx;')).toMatchSnapshot())

  it('GlobalStaticDeclaration', () => {
    expect(parser('global a as bool = false;')).toMatchSnapshot()
    expect(parser('static b as string = \'\';')).toMatchSnapshot()
  })

  it('ClassDeclaration', () => {
    expect(parser('zenClass To {}')).toMatchSnapshot()
    expect(parser(`
    zenClass TheClass {
      zenConstructor(a as int) {}
      val b as string = '';
      function c(c as bool) {}
    }`)).toMatchSnapshot()
  })

  it('FunctionDeclaration', () => {
    expect(parser('function fun() as string {}')).toMatchSnapshot()
    expect(parser('$expand string $createArray() as void {}')).toMatchSnapshot()
  })

  it('TypeLiteral', () => {
    expect(parser('a as string[int][string][]')).toMatchSnapshot()
    expect(parser('b as [function(string)void[]];')).toMatchSnapshot()
    expect(parser('c as a.b.C[];')).toMatchSnapshot()
    expect(parser('c as C[];')).toMatchSnapshot()
    expect(parser('c as [[string]][];')).toMatchSnapshot()
  })

  // Expression

  it('AssignExpression', () => expect(parser('a = 1;')).toMatchSnapshot())

  it('BinaryExpression', () => {
    expect(parser('a + 1;')).toMatchSnapshot()
    expect(parser('a - 1 + 1;')).toMatchSnapshot()
    expect(parser('a + (1 - 1);')).toMatchSnapshot()
  })

  it('CallExpression', () => expect(parser('a.b.c.d()(2,3)(1);')).toMatchSnapshot())

  it('ConditionalExpression', () => expect(parser('a ? true : false;')).toMatchSnapshot())

  describe('PostFixExpression', () => {
    it('PostfixExpressionMemberAccess', () => expect(parser('a.b.c.d;')).toMatchSnapshot())
    it('PostfixExpressionRange', () => expect(parser('1 .. 10;')).toMatchSnapshot())
    it('PostfixExpressionArray', () => expect(parser('a[1][2][3];')).toMatchSnapshot())
    it('PostfixExpressionFunctionCall', () => expect(parser('a(1,2)(3)();')).toMatchSnapshot())
    it('PostfixExpressionAsType', () => expect(parser('a as string;')).toMatchSnapshot())
    it('PostfixExpressionInstanceofType', () => expect(parser('a instanceof string;')).toMatchSnapshot())
  })

  describe('PrimaryExpression', () => {
    it('literal case', () => expect(parser('1;')).toMatchSnapshot())
    it('identifier case', () => expect(parser('abc;')).toMatchSnapshot())
    it('bracket handler expr case', () => expect(parser('<minecraft:apple:*>;')).toMatchSnapshot())
    it('lambda function expr case', () => expect(parser('function(a,b,c) as void {};')).toMatchSnapshot())
    it('array init expr case', () => expect(parser('[1,3,4,5];')).toMatchSnapshot())
    it('map init expr case', () => expect(parser('val map = {a : 1, b : 2};')).toMatchSnapshot())
  })

  describe('Statement', () => {
    it('block statement', () => expect(parser('{a = 1;}')).toMatchSnapshot())
    it('break or continue statement', () => {
      expect(parser('break;')).toMatchSnapshot()
      expect(parser('continue;')).toMatchSnapshot()
    })
    it('return statement', () => {
      expect(parser('return;')).toMatchSnapshot()
      expect(parser('return null;')).toMatchSnapshot()
    })
    it('foreach statement', () => {
      expect(parser('for a in b {}')).toMatchSnapshot()
      expect(parser('for a in 0 to 10 {}')).toMatchSnapshot()
    })
    it('while statement', () => {
      expect(parser('while(true) {}')).toMatchSnapshot()
      expect(parser('while(a > b) {}')).toMatchSnapshot()
    })
  })
})
