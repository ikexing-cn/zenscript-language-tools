import type { Connection, InitializeParams, InitializeResult } from 'vscode-languageserver/node'
import { ProposedFeatures, createConnection } from 'vscode-languageserver/node'
import type { URI } from 'vscode-uri'
import HandleInitialized from '../services/initialized'
import type { ZsFile } from './file'

export class ZsServer {
  hasDZS = false
  isProject = false
  baseFolderUri: URI | null = null
  connection: Connection | null = null

  folders: Array<{ name?: string; uri: string }> = []
  files: Map<String, ZsFile> = new Map()

  constructor() {
    this.reset()
  }

  public init() {
    this.connection = createConnection(ProposedFeatures.all)
    this.connection.onInitialize(init => this.handleInitialize(init))
    this.connection.onInitialized(HandleInitialized)

    this.connection.listen()
  }

  private handleInitialize(init: InitializeParams): InitializeResult {
    const result: InitializeResult = {
      serverInfo: {
        name: 'ZenScript Language Tools Server',
        version: '0.0.1',
      },
      capabilities: {
        workspace: {
          workspaceFolders: {
            supported: true,
          },
        },
      },
    }

    if (init.workspaceFolders) {
      // TODO: let's ignore multi-root for now
      this.folders.push(init.workspaceFolders[0])
    }

    return result
  }

  private reset() {
    this.folders = []
    this.hasDZS = false
    this.isProject = false
    this.connection = null
    this.files = new Map()
  }
}

export const zServer = new ZsServer()
