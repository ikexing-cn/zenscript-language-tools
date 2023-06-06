export interface Offset {
  start: number
  end: number
}

export interface ASTNode extends Offset {
  type: string
}