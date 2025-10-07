// @ts-check
import { existsSync } from 'node:fs'
import dts from 'rollup-plugin-dts'
import { defineConfig } from 'rollup'

if (!existsSync('temp')) {
  console.warn(
    'no temp dts files found. run `tsc -p tsconfig.build.json` first.'
  )
  process.exit(1)
}

export default defineConfig({
  input: `./temp/src/index.d.ts`,
  output: {
    file: `./dist/index.d.ts`,
    format: 'es'
  },
  plugins: [dts()]
})
