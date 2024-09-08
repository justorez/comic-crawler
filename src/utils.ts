import pico from 'picocolors'
import figures from 'figures'

/**
 * @param input `all` or `1,3,5-20`
 */
export function selectChapters(input: string, chapters: TChapter[]) {
    input = input.trim()

    if (['all', '全部', '所有'].includes(input)) {
        return chapters
    }

    const idx = input
        .split(/[,，]/)
        .reduce((pre: number[], cur: string) => {
            if (!cur) return pre
            if (cur.includes('-')) {
                const index = cur.split('-').map((s) => Number(s))
                for (let i = index[0]; i <= index[1]; i++) {
                    pre.push(i)
                }
            } else {
                pre.push(Number(cur))
            }
            return pre
        }, [])
        .filter((n) => Number.isInteger(n))

    return idx.length !== 0
        ? chapters.filter((_, index) => idx.includes(index + 1))
        : chapters
}

export const log = {
    log: (...msg: unknown[]) => console.log(...msg),
    info: (...msg: unknown[]) => console.log(pico.cyan('→'), ...msg),
    warn: (...msg: unknown[]) =>
        console.log(pico.yellow(`${figures.warning} ${msg.join(' ')}`)),
    error: (...msg: unknown[]) =>
        console.log(pico.red(`${figures.cross} ${msg.join(' ')}`)),
    success: (...msg: unknown[]) =>
        console.log(pico.green(`✓ ${msg.join(' ')}`))
}
