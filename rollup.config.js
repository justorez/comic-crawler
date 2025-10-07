// @ts-check
import { readJsonSync } from 'fs-extra/esm'
import { builtinModules } from 'node:module'
import { defineConfig } from 'rollup'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import esbuild from 'rollup-plugin-esbuild'
import { visualizer } from 'rollup-plugin-visualizer'

const pkg = readJsonSync('./package.json')

// more faster than microbundle
export default defineConfig({
  input: {
    index: 'src/index.ts',
    zip: 'src/zip.ts'
  },
  output: [
    {
      dir: 'dist',
      entryFileNames: '[name].mjs',
      format: 'es',
      sourcemap: true
    }
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...builtinModules,
    /node:/
  ],
  plugins: [
    json(),
    esbuild({
      platform: 'node',
      minify: true
    }),
    nodeResolve(),
    commonjs(),
    visualizer({
      filename: '.stats/stats.html'
    })
  ]
})
