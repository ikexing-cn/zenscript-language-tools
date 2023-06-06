import { ZSCstParser } from '../cst-parser'
import type { ProgramCstChildren } from '../types/zs-cst'

const BasicCstVisitor = ZSCstParser.getBaseCstVisitorConstructorWithDefaults()

class ZenScriptBasicVisitor extends BasicCstVisitor {
  constructor() {
    super()
    this.validateVisitor()
  }

  protected Program(ctx: ProgramCstChildren) {
    // TODO
  }
}

export const ZSBasicVisitor = new ZenScriptBasicVisitor()
