import pico from 'picocolors'
import figures from 'figures'

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
