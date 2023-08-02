import type { TextDocument } from 'vscode-languageserver-textdocument'
import { type Diagnostic, DiagnosticSeverity } from 'vscode-languageserver/node'
import { URI } from 'vscode-uri'
import { zServer } from '../api/server'
import { ZsFile } from '../api/file'
import { getLocalPkg } from '../utils/file'

function isIncludedInScriptsFolder(document: TextDocument) {
  return document.uri.includes(zServer.scriptsFolderUri!.path)
}

export default async function (document: TextDocument) {
  if (!isIncludedInScriptsFolder(document))
    return

  // waiting for all zs files to be parsed
  await zServer.bus.wait('all-zs-parsed')

  // TODO: parser dzs
  // if (zServer.hasDZS) {
  // waiting for `.d.zs` file to be parsed
  // await zServer.bus.wait('dzs-parsed')
  // }

  const diagnostics: Diagnostic[] = []
  const documentUri = URI.parse(document.uri)

  // If the file is not exist in the server, then it's new file
  if (!zServer.files.has(documentUri.path)) {
    const file = new ZsFile(documentUri, documentUri.path, getLocalPkg(documentUri.path), zServer.connection!)
    zServer.files.set(documentUri.path, file)
  }

  // when the file is not loaded or is new, don't parse
  if (document.getText().replace(/\b/g, '') === '')
    return

  const file = zServer.files
    .get(documentUri.path)!
    .text(document.getText())
    .parse()

  file.parseErrors.forEach((error) => {
    const errorToken = file.findPrevToken(error.token) ?? error.token

    diagnostics.push({
      severity: DiagnosticSeverity.Error,
      range: {
        start: document.positionAt(errorToken.startOffset),
        end: document.positionAt((errorToken.endOffset ?? errorToken.startOffset) + 1),
      },
      message: error.message,
    })
  })

  file.helper?.errors.forEach((error) => {
    diagnostics.push({
      severity: DiagnosticSeverity.Error,
      range: {
        start: document.positionAt(error.start),
        end: document.positionAt((error.end ?? error.start) + 1),
      },
      message: error.message,
    })
  })

  zServer.connection?.sendDiagnostics({ uri: document.uri, diagnostics })
}
