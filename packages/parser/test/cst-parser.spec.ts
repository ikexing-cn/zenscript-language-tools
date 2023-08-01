import { describe, expect, it } from 'vitest'
import { ZSLexer } from '../src/lexer'
import { ZSCstParser } from '../src/cst-parser'

describe('CST Parser', () => {
  function parser(code: string, debug?: boolean) {
    const lexResult = ZSLexer.tokenize(code)
    ZSCstParser.parse(lexResult.tokens)

    /* eslint-disable no-console */
    if (debug) {
      console.log(lexResult.tokens)
      console.log(ZSCstParser.errors)
    }

    return ZSCstParser.errors.length
  }

  it('ImportDeclaration', () => expect(parser('import xxx.xxx.xxx;')).toBe(0))

  it('VariableDeclaration', () => expect(parser('var a as bool = true;')).toBe(0))

  it('FunctionDeclaration', () => expect(parser('function a() {}')).toBe(0))

  it('DExpandFunctionDeclaration', () => {
    expect(parser('$expand string $toUpper(a as string) as string {}')).toBe(0)
  })

  it('ClassDeclaration / ConstructorDeclaration', () => {
    expect(parser('zenClass A {}')).toBe(0)
    expect(parser('zenClass A { zenConstructor() {} }')).toBe(0)
  })

  it('LambdaFunctionDeclaration', () => {
    expect(parser('function(a as string) as string {};')).toBe(0)
  })

  it('MapInitializerExpression', () => expect(parser('val map = {a: 1};')).toBe(0))

  it('ArrayInitializerExpression', () => expect(parser('[1,3,4,5];')).toBe(0))

  it('BracketHandlerExpression', () => expect(parser('<minecraft:apple:*>;')).toBe(0))

  it('PostfixExpressionRange', () => {
    expect(parser('0 to 10;')).toBe(0)
    expect(parser('0 ..10;')).toBe(0)
  })

  it('ComplexType', () => expect(parser('val typeCase as int[[list]][int][];')).toBe(0))
})
