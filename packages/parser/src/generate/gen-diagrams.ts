import { dirname, resolve } from 'node:path'
import { writeFileSync } from 'node:fs'

import { fileURLToPath } from 'node:url'
import * as chevrotain from 'chevrotain'
import { ZSCstParser } from '../cst-parser'

const __dirname = dirname(fileURLToPath(import.meta.url))

const serializedGrammar = ZSCstParser.getSerializedGastProductions()
const htmlText = chevrotain.createSyntaxDiagramsCode(serializedGrammar)

const outPath = resolve(__dirname, '../../generated_diagrams.html')
writeFileSync(`${outPath}`, htmlText)
