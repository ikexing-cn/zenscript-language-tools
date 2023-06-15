import { extname, join } from 'node:path'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { URI } from 'vscode-uri'
import { zServer } from '../api/server'
import { ZsFile } from '../api/file'

function parseZenPackages() {
  // TODO
  zServer.isProject = true
}

function getLocalPkg(filePath: string) {
  return `scripts.${filePath.replace(zServer.baseFolderUri!.path, '').replace(/\//g, '.').substring(1)}`.replace('.zs', '')
}

async function traverseDirectory(dirUri: URI, _files: [string, URI][] = []) {
  const dirPath = dirUri.path

  return new Promise<[string, URI][]>((resolve, reject) => {
    try {
      const files = readdirSync(dirPath)
      for (const file of files) {
        // TODO: ignore hidden files for now
        if (file.includes('.history'))
          continue

        const filePath = join(dirPath, file)

        const fileStat = statSync(filePath)
        if (fileStat.isDirectory()) {
          const fileUri = URI.file(filePath)
          traverseDirectory(fileUri, _files)
        }
        else if (extname(file) === '.zs') {
          const fileUri = URI.file(filePath)
          _files.push([getLocalPkg(filePath), fileUri])
        }
      }
      resolve(_files)
    }
    catch (error) {
      reject(error)
    }
  })
}

export default async function () {
  const folderUri: URI = URI.parse(zServer.folders[0].uri)
  // when the folder is a file then search `scripts`
  if (folderUri.scheme === 'file') {
    if (['scripts', 'zenscript-example'].includes(zServer.folders[0].name!))
      zServer.baseFolderUri = folderUri
    else if (existsSync(join(folderUri.path, 'scripts')))
      zServer.baseFolderUri = folderUri
  }

  if (zServer.baseFolderUri) {
    const zenPackages = join(zServer.baseFolderUri.path, 'zen-packages.json')
    // when the `zen-packages.json` is exist
    if (!existsSync(zenPackages))
      return
    parseZenPackages()

    // load all files
    const files = await traverseDirectory(zServer.baseFolderUri)
    for (const [pkg, file] of files)
      zServer.files.set(file.path, new ZsFile(file, file.path, pkg, zServer.connection!))

    console.log(zServer.files)
  }

  // load file
}
