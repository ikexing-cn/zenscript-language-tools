import { ZSCstParser } from '../cst-parser'
import type { ASTError, ASTProgram } from '../types/zs-ast'
import type { ProgramCstChildren } from '../types/zs-cst'

const BasicCstVisitor = ZSCstParser.getBaseCstVisitorConstructor()

export class ZenScriptVisitor extends BasicCstVisitor {
  Program(ctx: ProgramCstChildren, err: ASTError[]): ASTProgram {
    const program: ASTProgram = {
      body: [],
      start: 0,
      type: 'program',
    }

    return program
  }
}
