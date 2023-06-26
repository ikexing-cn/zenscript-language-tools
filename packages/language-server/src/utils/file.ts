import { zServer } from '../api/server'

export function getLocalPkg(filePath: string) {
  return `scripts.${filePath.replace(zServer.scriptsFolderUri!.path, '')
    .replace(/\//g, '.').substring(1)}`
    .replace('.zs', '')
}
