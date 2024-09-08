import { dirname } from 'path'
import { fileURLToPath } from 'url'

export const fileURL = import.meta.url
const __dirname = dirname(fileURLToPath(import.meta.url))

export function hi(...args: string[]) {
    console.log('Hello', ...args)
}

hi(__dirname, 'Justorez')
