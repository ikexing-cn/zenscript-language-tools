import { ZSCstParser } from '../cst-parser'
import type { ProgramCstNode } from '../types/zs-cst'

const BasicCstVisitor = ZSCstParser.getBaseCstVisitorConstructorWithDefaults()

class ZenScriptBasicVisitor extends BasicCstVisitor {
  constructor() {
    super()
    this.validateVisitor()
  }

  protected Program(ctx: ProgramCstNode) {
    console.log(ctx)
  }
}

export const ZSBasicVisitor = new ZenScriptBasicVisitor()
