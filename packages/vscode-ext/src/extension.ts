import { join } from 'node:path'
import { workspace } from 'vscode'
import { LanguageClient, TransportKind } from 'vscode-languageclient/node'

import type { ExtensionContext } from 'vscode'
import type { LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node'

let client: LanguageClient

export function activate(context: ExtensionContext) {
  const serverModule = context.asAbsolutePath(
    join('../', 'language-server', 'out', 'main.cjs'),
  )
  const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] }

  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions,
    },
  }

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'plaintext' }],
    synchronize: {
      fileEvents: workspace.createFileSystemWatcher('**/.clientrc'),
    },
  }

  client = new LanguageClient(
    'zenscript_language_server',
    'ZenScript Language Server',
    serverOptions,
    clientOptions,
  )

  client.start()
}

export function deactivate(): Thenable<void> | undefined {
  if (!client)
    return undefined

  return client.stop()
}
