import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    './src/server',
  ],
  outDir: './out',
  declaration: true,
  rollup: {
    emitCJS: true,
  },
})
