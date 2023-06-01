import { resolve } from 'node:path'
import { writeFileSync } from 'node:fs'

import * as chevrotain from 'chevrotain'
import { ZSCstParser } from './cst-parser'

const serializedGrammar = ZSCstParser.getSerializedGastProductions()
const htmlText = chevrotain.createSyntaxDiagramsCode(serializedGrammar)

const outPath = resolve(__dirname, '../generated_diagrams.html')
writeFileSync(`${outPath}`, htmlText)
