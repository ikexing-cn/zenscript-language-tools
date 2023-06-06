import type { Connection, InitializeParams, InitializeResult } from 'vscode-languageserver/node'
import { ProposedFeatures, createConnection } from 'vscode-languageserver/node'
import type { URI } from 'vscode-uri'

export class ZsServer {
  hasDZS = false
  isProject = false
  baseFolderUri: URI | null = null
  connection: Connection | null = null

  folders: Array<{ name?: string; uri: string }> = [1]

  constructor() {
    this.reset()
  }

  public init() {
    this.connection = createConnection(ProposedFeatures.all)
    this.connection.onInitialize(this.handleInitialize)

    this.connection.listen()
  }

  private handleInitialized() {
    let folderUri: URI

    // for (const folder of this.folders) {
    //   const furi = folder.uri.match(/^(file:\/\/\/)?(.*)$/)
    //     ? URI.parse(folder.uri)
    //     : URI.file(folder.uri)
    //   const fbase = furi.path

    //   if (folder.name === 'scripts' || fbase === 'scrtips')
    //     folderUri = furi

    //   console.log({ folder })
    // }
  }

  private handleInitialize(init: InitializeParams): InitializeResult {
    const result: InitializeResult = {
      serverInfo: {
        name: 'ZenScript Language Tools Server',
        version: '0.0.1',
      },
      capabilities: {
        // todo
      },
    }

    console.log({
      folders: this.folders,
    })

    // if (init.rootPath) {
    //   this.folders.push({
    //     name: init.rootPath.split('/').pop(),
    //     uri: init.rootPath,
    //   })
    // }

    // if (init.rootUri) {
    //   this.folders.push({
    //     name: init.rootUri.split('/').pop(),
    //     uri: init.rootUri,
    //   })
    // }

    // if (init.workspaceFolders)
    //   this.folders.push(...init.workspaceFolders)

    return result
  }

  private reset() {
    // todo
  }
}

export const zServer = new ZsServer()
