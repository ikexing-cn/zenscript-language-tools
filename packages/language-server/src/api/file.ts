import { readFileSync } from 'node:fs'
import type { Connection } from 'vscode-languageserver'
import type { URI } from 'vscode-uri'
import { ZSCstParser, ZSLexer, ZenScriptBasicVisitor } from '@zenscript-language-tools/parser'
import type { IRecognitionException, IToken } from 'chevrotain'
import type { ASTBasicProgram, ASTError } from '@zenscript-language-tools/parser/src/types/zs-ast'
import { zServer } from './server'

type ParseStep = 'NotLoaded' | 'Loaded' | 'Preprocessed' | 'Parsed'

export class ZsFile {
  uri: URI
  pkg: string
  name: string
  private connection: Connection

  priority = 0
  content?: string

  parseErrors: IRecognitionException[] = []
  basicVisitError: ASTError[] = []
  tokens: IToken[] = []

  private step: ParseStep = 'NotLoaded'

  constructor(uri: URI, name: string, pkg: string, connection: Connection) {
    this.uri = uri
    this.pkg = pkg
    this.name = name
    this.connection = connection
  }

  public load() {
    this.content = readFileSync(this.uri.fsPath, 'utf-8')
    this.step = 'Parsed'
  }

  public text(content: string) {
    this.reset()
    this.content = content
    return this
  }

  public parse() {
    const lexResult = ZSLexer.tokenize(this.content!)
    const comments = lexResult.groups.COMMENT
    this.tokens = lexResult.tokens.filter(token => !comments.includes(token))

    // TODO: Preprocess

    const cst = ZSCstParser.parse(this.tokens)
    this.parseErrors = ZSCstParser.errors

    if (this.parseErrors.length === 0) {
      const basicVisitor = new ZenScriptBasicVisitor()
      const basicAst = basicVisitor.visit(cst) as ASTBasicProgram
      this.basicVisitError = basicAst.errors

      if (this.basicVisitError.length === 0) {
        for (const scope in basicAst.scopes) {
          const scopeNode = basicAst.scopes[scope]
          zServer.scopes.set(this.pkg, [scope, scopeNode])
        }
      }
    }

    return this
  }

  public findPrevToken(token: IToken) {
    const index = this.tokens.indexOf(token)
    return this.tokens[index - 1]
  }

  private reset() {
    this.tokens = []
    this.parseErrors = []
    this.basicVisitError = []
    zServer.scopes.delete(this.pkg)
  }

  public get isParsed() {
    return this.step === 'Parsed'
  }
}
