import { ZSCstParser } from '../cst-parser'

const BasicCstVisitor = ZSCstParser.getBaseCstVisitorConstructorWithDefaults()

class ZenScriptBasicCstVisitor extends BasicCstVisitor {
  constructor() {
    super()
    this.validateVisitor()
  }

  protected Progment(ctx) {

  }
}
