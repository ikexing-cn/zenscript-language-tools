import type { ASTError, ASTNodeVariableDeclaration } from '@zenscript-language-tools/parser'
import type { ASTHelper } from './helper'

export class ASTErrorChecker {
  private astHelper: ASTHelper
  private visitError: ASTError[] = []

  public get errors() {
    return this.visitError
  }

  public set errors(visitError: ASTError[]) {
    this.visitError = visitError
  }

  constructor(astHelper: ASTHelper) {
    this.astHelper = astHelper
  }

  execute() {
    this.duplicateChecker()
  }

  private duplicateChecker() {
    const variableNames: string[] = []

    for (const topLevelNode of this.astHelper.topLevelNodes) {
      if (topLevelNode.node.type === 'variable-declaration')
        this.variableInitializerChecker(topLevelNode.node)
      if (variableNames.includes(topLevelNode.name)) {
        this.visitError.push({
          end: topLevelNode.node.end,
          start: topLevelNode.node.start,
          message: `Variable '${topLevelNode.name}' is already defined`,
        })
        continue
      }
      variableNames.push(topLevelNode.name)
    }

    // TODO: fix this
    // for (const scopeStatementNode of this.astHelper.scopeParentMap) {
    //   variableNames.length = 0
    //   if (scopeStatementNode.node.type !== 'block-statement')
    //     continue

    //   for (const node of scopeStatementNode.node.body) {
    //     if (node.type === 'variable-declaration') {
    //       if (variableNames.includes(node.id)) {
    //         this.visitError.push({
    //           end: node.end,
    //           start: node.start,
    //           message: `Variable '${node.id}' is already defined`,
    //         })
    //         continue
    //       }
    //       variableNames.push(node.id)
    //       this.variableInitializerChecker(node)
    //     }
    //     else if (node.type === 'foreach-statement') {
    //       const foreachLeftNames: string[] = []
    //       for (const name of node.left.map(id => id.name)) {
    //         if (foreachLeftNames.includes(name)) {
    //           this.visitError.push({
    //             end: node.end,
    //             start: node.start,
    //             message: `Foreach identifier '${name}' is already defined`,
    //           })
    //           continue
    //         }
    //         foreachLeftNames.push(name)
    //       }
    //     }
    //   }
    // }

    const functionParamsNames: string[] = []
    for (const functionNode of this.astHelper.funcNodes) {
      functionParamsNames.length = 0
      if (!functionNode.paramList)
        return

      for (const param of functionNode.paramList.params) {
        if (functionParamsNames.includes(param.id)) {
          this.visitError.push({
            end: param.end,
            start: param.start,
            message: `Function parameter '${param.id}' is already defined`,
          })
          continue
        }
        functionParamsNames.push(param.id)
      }
    }
  }

  private variableInitializerChecker(node: ASTNodeVariableDeclaration) {
    if (node.kind === 'var')
      return

    if (!node.value) {
      this.visitError.push({
        end: node.end,
        start: node.start,
        message: `Variable '${node.id}' must be initialized`,
      })
    }
  }
}
