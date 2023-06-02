import { expect, it } from 'vitest'
import { ZSLexer } from '../src/lexer'
import { ZSCstParser } from '../src/cst-parser'

it('ImportDeclaration', () => {
  const lexResult = ZSLexer.tokenize('import xxx.xxx.xxx;')
  ZSCstParser.parse(lexResult.tokens)

  expect(ZSCstParser.errors.length).toBe(0)
})

it('VariableDeclaration', () => {
  const lexResult = ZSLexer.tokenize('var a as bool = true;')
  ZSCstParser.parse(lexResult.tokens)

  expect(ZSCstParser.errors.length).toBe(0)
})

it('FunctionDeclaration', () => {
  const lexResult = ZSLexer.tokenize('function a() {}')
  ZSCstParser.parse(lexResult.tokens)

  expect(ZSCstParser.errors.length).toBe(0)
})

it('DExpandFunctionDeclaration', () => {
  const lexResult = ZSLexer.tokenize('$expand string $toUpper(a as string) as string {}')
  ZSCstParser.parse(lexResult.tokens)

  expect(ZSCstParser.errors.length).toBe(0)
})

it('ClassDeclaration / ConstructorDeclaration', () => {
  const lexResult = ZSLexer.tokenize('zenClass A {}')
  ZSCstParser.parse(lexResult.tokens)
  expect(ZSCstParser.errors.length).toBe(0)

  const lexResult2 = ZSLexer.tokenize(`
    zenClass A {
      zenConstructor() {}
    }
  `)
  ZSCstParser.parse(lexResult2.tokens)
  expect(ZSCstParser.errors.length).toBe(0)
})

it('LambdaFunctionDeclaration', () => {
  const lexResult = ZSLexer.tokenize('function(a as string) as string {};')
  ZSCstParser.parse(lexResult.tokens)

  expect(ZSCstParser.errors.length).toBe(0)
})

it('MapInitializerExpression', () => {
  const lexResult = ZSLexer.tokenize('{a: 1};')
  ZSCstParser.parse(lexResult.tokens)

  expect(ZSCstParser.errors.length).toBe(0)
})

it('ArrayInitializerExpression', () => {
  const lexResult = ZSLexer.tokenize('[1,3,4,5];')
  ZSCstParser.parse(lexResult.tokens)

  expect(ZSCstParser.errors.length).toBe(0)
})

it('BracketHandlerExpression', () => {
  const lexResult = ZSLexer.tokenize('<minecraft:apple:1>;')
  ZSCstParser.parse(lexResult.tokens)

  expect(ZSCstParser.errors.length).toBe(0)
})
