import type { ASTNodeBlockStatement, ASTNodeClassDeclaration, ASTNodeDExpandFunctionDeclaration, ASTNodeForeachStatement, ASTNodeFunctionDeclaration, ASTNodeIfStatement, ASTNodeImportDeclaration, ASTNodeVariableDeclaration, ASTNodeWhileStatement, ASTProgram } from '@zenscript-language-tools/parser'

export type ScopeStatementNode = ASTNodeBlockStatement | ASTNodeWhileStatement | ASTNodeForeachStatement | ASTNodeIfStatement
export type TopLevelNode = ASTNodeClassDeclaration | ASTNodeFunctionDeclaration | ASTNodeDExpandFunctionDeclaration | ASTNodeImportDeclaration | ASTNodeVariableDeclaration
export interface ScopeStatement {
  parent?: ScopeStatement
  node: ScopeStatementNode
}

export class ASTHelper {
  private ast: ASTProgram
  public scopeStatementNodes: ScopeStatement[] = []
  public topLevelNodes: { name: string; node: TopLevelNode }[] = []
  public functionNodes: Omit<ASTNodeFunctionDeclaration, 'type'>[] = []

  constructor(ast: ASTProgram) {
    this.ast = ast
  }

  traverse() {
    for (const node of this.ast.body) {
      switch (node.type) {
        case 'import-declaration':
          this.putNameToTopLevelNodes(node.name.ids[node.name.ids.length - 1], node)
          break
        case 'variable-declaration':
          this.putNameToTopLevelNodes(node.id, node)
          break
        case 'class-declaration':
          this.putNameToTopLevelNodes(node.id, node)
          this.traverseClassDeclaration(node)
          break
        case 'function-declaration':
        case 'expand-function-declaration':
          this.functionNodes.push(node)
          this.putNameToTopLevelNodes(node.id, node)
          node.body && this.traverseBlockStatement(node.body)
          break
        default:
          this.traverseBlockStatement(node)
          break
      }
    }
  }

  private putNameToTopLevelNodes(name: string, node: TopLevelNode) {
    this.topLevelNodes.push({ name, node })
  }

  private traverseClassDeclaration(_classNode: ASTNodeClassDeclaration) {
    // TODO handle class
  }

  private traverseBlockStatement(
    statement: ScopeStatementNode,
    parent?: ScopeStatement,
  ) {
    const scopeStatement: ScopeStatement = {
      parent,
      node: statement,
    }
    switch (statement.type) {
      case 'foreach-statement':
        statement.body && this.traverseBlockStatement(statement.body, scopeStatement)
        break
      case 'if-statement':
        statement.consequent && this.traverseBlockStatement(statement.consequent, scopeStatement)
        break
      case 'while-statement':
        statement.body && this.traverseBlockStatement(statement.body, scopeStatement)
        break
      case 'block-statement': {
        statement.body.forEach((node) => {
          if (node.type === 'variable-declaration')
            return

          this.traverseBlockStatement(node, scopeStatement)
        })
        this.scopeStatementNodes.push(scopeStatement)
        break
      }
    }
  }
}
