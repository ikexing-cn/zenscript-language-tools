import type { ASTNodeTypeLiteral, PrimitiveType } from '../types/zs-ast'
import type { IdentifierCstNode, TypeLiteralCstChildren } from '../types/zs-cst'

export function handleIdentifier(identifier: IdentifierCstNode[]) {
  return identifier?.[0].children?.IDENTIFIER?.[0].image
      ?? identifier?.[0].children?.TO?.[0].image
      ?? 'unknown'
}

export function isPrimitiveType(type: ASTNodeTypeLiteral['name']): type is PrimitiveType {
  return ['any', 'byte', 'short', 'int', 'long', 'double', 'bool', 'void', 'string'].includes(type)
}

export function getLastBody(body: ASTNodeTypeLiteral) {
  let cur = body
  while (true) {
    if (cur.value === undefined)
      break
    cur = cur.value
  }
  return cur
}

export function getTypeLiteral(ctx: TypeLiteralCstChildren): ASTNodeTypeLiteral['name'][] {
  const types: ASTNodeTypeLiteral['name'][] = []

  if (ctx.primitiveType)
    types.push(ctx.primitiveType[0].image as PrimitiveType)
  if (ctx.listType)
    types.push(...ctx.listType.map(() => 'list-type') as 'list-type'[])
  if (ctx.functionType)
    types.push(...ctx.functionType.map(() => 'function-type') as 'function-type'[])
  if (ctx.classType)
    types.push(...ctx.classType.map(() => 'class-type') as 'class-type'[])
  if (ctx.mapType)
    types.push(...ctx.mapType.map(() => 'map-type') as 'map-type'[])
  if (ctx.arrayType)
    types.push(...ctx.arrayType.map(() => 'array-type') as 'array-type'[])

  return types.reverse()
}
