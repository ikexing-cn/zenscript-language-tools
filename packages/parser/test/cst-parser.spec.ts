import { expect, it } from 'vitest'
import { ZSLexer } from '../src/lexer'
import { ZSCstParser } from '../src/cst-parser'

it('import', () => {
  const lexResult = ZSLexer.tokenize('import xxx.xxx.xxx;')
  ZSCstParser.parse(lexResult.tokens)

  expect(ZSCstParser.errors.length).toBe(0)
})

it('static', () => {
  const lexResult = ZSLexer.tokenize('static a as string = 1;')

  ZSCstParser.parse(lexResult.tokens)

  expect(ZSCstParser.errors.length).toBe(0)
})
