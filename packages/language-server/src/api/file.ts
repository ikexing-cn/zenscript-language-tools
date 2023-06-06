import type { Connection, URI } from 'vscode-languageserver'

type ParseStep = 'NotLoaded' | 'Loaded' | 'Preprocessed' | 'Parsed'

export class ZsFile {
  uri: URI
  pkg: string
  name: string
  private connection: Connection

  priority = 0
  content?: string

  private step: ParseStep = 'NotLoaded'

  constructor(uri: URI, name: string, pkg: string, connection: Connection) {
    this.uri = uri
    this.name = name
    this.pkg = pkg
    this.connection = connection
  }

  public get isParsed() {
    return this.step === 'Parsed'
  }
}
