export function objectOmit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = {} as unknown as Omit<T, K>
  for (const key in obj) {
    if (!keys.includes(key as unknown as K)) {
      // @ts-expect-error ikwid
      result[key] = obj[key]
    }
  }

  return result
}

export function objectAssign<T extends object>(obj: T, obj2: Partial<T>): T {
  const _obj = {} as any satisfies T

  for (const key in obj2) {
    if (obj2[key] !== undefined
      && obj2[key] !== null)
      _obj[key] = obj2[key]
  }

  return Object.assign(obj, _obj)
}
