import { info } from 'node:console'
import type { InitializeResult } from 'vscode-languageserver/node'
import { ProposedFeatures, createConnection } from 'vscode-languageserver/node'

const connection = createConnection(ProposedFeatures.all)

connection.onInitialize(() => {
  info('initialize')

  const result: InitializeResult = {
    capabilities: {},
  }

  return result
})

connection.onInitialized(() => {
  info('initialized')
})

connection.listen()
