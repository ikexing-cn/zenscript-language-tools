import { it } from 'vitest'
import { ZSBasicVisitor } from '../src/visitor/basic-visitor'
import { ZSLexer } from '../src/lexer'
import { ZSCstParser } from '../src/cst-parser'

it('ImportDeclaration', () => {
  const lexResult = ZSLexer.tokenize('import xxx.xxx.xxx;import xxx.xxx.xxx;')
  const cst = ZSCstParser.parse(lexResult.tokens)

  const ast = ZSBasicVisitor.visit(cst)
})
