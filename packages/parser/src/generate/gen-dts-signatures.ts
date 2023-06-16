import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateCstDts } from 'chevrotain'
import { ZSCstParser } from '../cst-parser'

const __dirname = dirname(fileURLToPath(import.meta.url))

const productions = ZSCstParser.getGAstProductions()
const dtsString = generateCstDts(productions)
const dtsPath = resolve(__dirname, '../types/zs-cst.d.ts')

writeFileSync(dtsPath, dtsString)
