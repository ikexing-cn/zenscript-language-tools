import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    './src/main',
  ],
  outDir: './out',
  declaration: true,
  rollup: {
    emitCJS: true,
  },
})
