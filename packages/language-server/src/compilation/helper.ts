import type { ASTNodeClassDeclaration, ASTNodeFunctionDeclaration, ASTProgram, AstNodeTopLevelNode } from '@zenscript-language-tools/parser'

export class ASTHelper {
  private ast: ASTProgram

  public funcNodes: Omit<ASTNodeFunctionDeclaration, 'type'>[] = []
  public topLevelNodes: { name: string; node: AstNodeTopLevelNode }[] = []

  constructor(ast: ASTProgram) {
    this.ast = ast
  }

  public traverse() {
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
          this.funcNodes.push(node)
          this.putNameToTopLevelNodes(node.id, node)
          break
      }
    }
  }

  private putNameToTopLevelNodes(name: string, node: AstNodeTopLevelNode) {
    this.topLevelNodes.push({ name, node })
  }

  private traverseClassDeclaration(_classNode: ASTNodeClassDeclaration) {
    // TODO handle class
  }
}
