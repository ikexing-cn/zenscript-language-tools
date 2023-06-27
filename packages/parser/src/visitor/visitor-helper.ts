import type { ASTNodeTypeLiteral } from '../types/zs-ast'
import type { IdentifierCstNode, TypeLiteralCstChildren } from '../types/zs-cst'

export function handleIdentifier(identifier: IdentifierCstNode[]) {
  return identifier?.[0].children?.IDENTIFIER?.[0].image
      ?? identifier?.[0].children?.TO?.[0].image
      ?? 'unknown'
}

export function getTypeLiteral(ctx: TypeLiteralCstChildren): ASTNodeTypeLiteral['name'] {
  if (ctx.ANY)
    return 'any'
  if (ctx.BOOL)
    return 'bool'
  if (ctx.BYTE)
    return 'byte'
  if (ctx.DOUBLE)
    return 'double'
  if (ctx.SHORT)
    return 'short'
  if (ctx.LONG)
    return 'long'
  if (ctx.STRING)
    return 'string'
  if (ctx.VOID)
    return 'void'
  if (ctx.INT)
    return 'int'
  if (ctx.ArrayType)
    return 'array-type'
  if (ctx.ListType)
    return 'list-type'
  if (ctx.MapType)
    return 'map-type'
  if (ctx.QualifiedName)
    return 'qualified-name'
  if (ctx.FunctionType)
    return 'function-type'

  return 'any'
}

export function inferType(value: string): ASTNodeTypeLiteral['name'] {
  // TODO: infer type
  return 'any'
}
