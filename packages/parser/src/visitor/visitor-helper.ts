import type { IdentifierCstNode } from '../types/zs-cst'

export function handleIdentifier(identifier: IdentifierCstNode[]) {
  return identifier?.[0].children?.IDENTIFIER?.[0].image
      ?? identifier?.[0].children?.TO?.[0].image
      ?? 'unknown'
}
