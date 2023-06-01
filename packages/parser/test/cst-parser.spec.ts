import { expect, it } from 'vitest'
import { ZSLexer } from '../src/lexer'
import { ZSCstParser } from '../src/cst-parser'

it('should not throw any error', () => {
  const lexResult = ZSLexer.tokenize('import xxx.xxx.xxx;')
  ZSCstParser.parse(lexResult.tokens)
  expect(ZSCstParser.errors.length).toBe(0)
})
