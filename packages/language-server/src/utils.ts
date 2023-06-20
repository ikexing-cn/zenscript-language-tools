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
