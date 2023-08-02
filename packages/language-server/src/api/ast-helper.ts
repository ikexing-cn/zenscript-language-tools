import type { ASTError, ASTNode, ASTNodeBlockStatement, ASTNodeForeachStatement, ASTNodeFunctionDeclaration, ASTNodeParameterList, ASTProgram } from '@zenscript-language-tools/parser'

export class ASTHelper {
  private ast: ASTProgram
  private visitError: ASTError[] = []
  private functionNode: Omit<ASTNodeFunctionDeclaration, 'type'>[] = []

  public get errors() {
    return this.visitError
  }

  public set errors(visitError: ASTError[]) {
    this.visitError = visitError
  }

  constructor(ast: ASTProgram) {
    this.ast = ast
  }

  execute() {
    this.duplicateChecker()
  }

  private duplicateChecker() {
    let names = {} as Record<string, ASTNode<string>>

    const resetNames = () => names = {} as Record<string, ASTNode<string>>

    const checkForDuplicateNames = (options: {
      name: string
      node: ASTNode<string>
    }) => {
      const { name, node } = options

      if (name in names) {
        this.visitError.push({
          end: node.end,
          start: node.start,
          message: `Duplicate ${node.type} name '${name}'`,
        })
      }
      else {
        names[name] = node
      }
    }

    const checkForeachStatementNames = (node: ASTNodeForeachStatement) => {
      const ids = node.left
      for (const id of ids) {
        checkForDuplicateNames({
          node: id,
          name: id.name,
        })
      }
    }

    const checkBlockStatementNames = (statement: ASTNodeBlockStatement) => {
      resetNames()
      for (const node of statement.body) {
        if (node.type === 'variable-declaration') {
          checkForDuplicateNames({
            node,
            name: node.id,
          })
        }
        else if (node.type === 'foreach-statement') {
          checkForeachStatementNames(node)
        }
        else if (node.type === 'block-statement') {
          checkBlockStatementNames(node)
        }
      }
    }

    const checkTopLevelNames = () => {
      resetNames()
      for (const node of this.ast.body) {
        switch (node.type) {
          case 'import-declaration': {
            checkForDuplicateNames({
              node,
              name: node.name.ids[node.name.ids.length - 1],
            })
            break
          }
          case 'class-declaration':
          case 'function-declaration':
          case 'variable-declaration':
          case 'expand-function-declaration': {
            checkForDuplicateNames({
              node,
              name: node.id,
            })

            if (node.type === 'function-declaration' || node.type === 'expand-function-declaration')
              this.functionNode.push(node)
            break
          }
          case 'block-statement': {
            checkBlockStatementNames(node)
            break
          }
          case 'foreach-statement': {
            checkForeachStatementNames(node)
            break
          }
          default:
            break
        }
      }
    }

    const checkPramsNames = (paramList: ASTNodeParameterList) => {
      resetNames()
      if (!paramList)
        return

      for (const param of paramList.params) {
        checkForDuplicateNames({
          name: param.id,
          node: param,
        })
      }
    }

    const checkFunction = () => {
      for (const node of this.functionNode) {
        node.paramList && checkPramsNames(node.paramList)
        node.body && checkBlockStatementNames(node.body)
      }
    }

    checkTopLevelNames()
    checkFunction()
  }
}
