import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { generateCstDts } from 'chevrotain'
import { ZSCstParser } from '../cst-parser'

const productions = ZSCstParser.getGAstProductions()
const dtsString = generateCstDts(productions)
const dtsPath = resolve(__dirname, '../types/zs-cst.d.ts')

writeFileSync(dtsPath, dtsString)
