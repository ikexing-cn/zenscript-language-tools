import { extname, join } from 'node:path'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { URI } from 'vscode-uri'
import { objectOmit } from '@zenscript-language-tools/shared'
import type { Packages } from '../api/server'
import { zServer } from '../api/server'
import { ZsFile } from '../api/file'
import { getLocalPkg } from '../utils/file'

type InputPackages = Omit<Packages, 'scripts'> & { scripts: string }

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

function searchDefaultScripts(folderUri: URI) {
  // when the folder is a file then search `scripts`
  if (folderUri.scheme === 'file') {
    if (['scripts', 'zenscript-example'].includes(zServer.folders[0].name!))
      return folderUri

    else if (existsSync(join(folderUri.path, 'scripts'))
      && (folderUri.path.endsWith('/minecraft')
        || folderUri.path.endsWith('/.minecraft')))
      return folderUri
  }
  return null
}

function parseZenPackages(folderUri: URI, zenPackages: string) {
  const defaultPackage: Packages = {
    dzs: true,
    scripts: searchDefaultScripts(folderUri),
  }

  const inputPackages: InputPackages = JSON.parse(readFileSync(zenPackages, 'utf-8'))
  if (inputPackages == null)
    return

  if (inputPackages.scripts && existsSync(join(zServer.folders[0].uri, inputPackages.scripts)))
    defaultPackage.scripts = URI.file(join(zServer.folders[0].uri, inputPackages.scripts))

  const packages: Packages = {
    ...defaultPackage,
    ...objectOmit(inputPackages, ['scripts']),
  }

  if (packages.scripts == null)
    return

  zServer.isProject = true
  zServer.packages = packages
  zServer.scriptsFolderUri = packages.scripts
}

export default async function () {
  if (zServer.folders.length <= 0) {
    const result = zServer.connection?.window
      .showInformationMessage(
        'ZenScript Languages Plugin can\'t enable all features. If you require full support, please follow this guide.',
        { title: 'Open Guide' },
        { title: 'Never remind me again' },
      )

    if ((await result)!.title === 'Open Guide') {
      // TODO
      // zServer.connection?.sendNotification('open-url', 'http://baidu.com')
    }
    else {
      // TODO
      // zServer.connection?.sendNotification('set-config', { key: 'zenScript.showInitialGuide', value: false })
    }

    return
  }

  const folderUri: URI = URI.parse(zServer.folders[0].uri)

  const zenPackages = join(folderUri.path, 'zen-packages.json')

  if (!existsSync(zenPackages)) {
    const scriptsFoldUri = searchDefaultScripts(folderUri)
    scriptsFoldUri && (zServer.scriptsFolderUri = scriptsFoldUri)
  }
  else {
    parseZenPackages(folderUri, zenPackages)
  }

  // check if the folder is a project
  const dzs = typeof zServer.packages?.dzs === 'boolean'
    ? zServer.packages.dzs === true ? '.d.zs' : ''
    : zServer.packages?.dzs ?? '.d.zs'

  if (existsSync(join(zServer.folders[0].uri, dzs)))
    zServer.hasDZS = true

  if (!zServer.scriptsFolderUri)
    return

  // load all files

  zServer.bus.revoke('all-zs-parsed')
  const files = await traverseDirectory(zServer.scriptsFolderUri)
  for (const [pkg, file] of files) {
    const zsFile = new ZsFile(file, file.path, pkg, zServer.connection!)
    zServer.files.set(file.path, zsFile)
    zsFile.load()
    zsFile.parse()
  }
  zServer.bus.finish('all-zs-parsed')
}
