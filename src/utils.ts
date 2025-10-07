import pico from 'picocolors'
import figures from 'figures'
import axios from 'axios'
import * as cheerio from 'cheerio'
import fs from 'fs/promises'
import path from 'path'
import ora from 'ora'
import ProgressBar from 'progress'
import pLimit from 'p-limit'

/**
 * @param input `all` or `1,3,5-20`
 */
export function selectChapters(input: string, chapters: ChapterType[]) {
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

/**
 * 将 Windows 文件和文件夹名称不允许的特殊字符替换为合法字符。
 *
 * 超长目录名会在 Linux 上创建失败，这里限制最长 85
 */
export function normalizeName(s: string) {
  return s
    .trim()
    .replace(/\//g, '／')
    .replace(/\\/g, '＼')
    .replace(/\?/g, '？')
    .replace(/\|/g, '︱')
    .replace(/"/g, '＂')
    .replace(/\*/g, '＊')
    .replace(/</g, '＜')
    .replace(/>/g, '＞')
    .replace(/:/g, '-')
    .slice(0, 85)
}

export const log = {
  log: (...msg: unknown[]) => console.log(...msg),
  info: (...msg: unknown[]) => console.log(pico.cyan('→'), ...msg),
  warn: (...msg: unknown[]) =>
    console.log(pico.yellow(`${figures.warning} ${msg.join(' ')}`)),
  error: (...msg: unknown[]) =>
    console.log(pico.red(`${figures.cross} ${msg.join(' ')}`)),
  success: (...msg: unknown[]) => console.log(pico.green(`✓ ${msg.join(' ')}`))
}

export const service = axios.create({
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0'
  },
  responseType: 'document'
})

export async function parseChapters(url: string, getChapters: GetChapters) {
  const response = await service.get(url)
  const $ = cheerio.load(response.data)
  return getChapters($, url)
}

export async function downloadChapter(
  chapter: ChapterType,
  comicTitle: string,
  getPictures: GetPictures
) {
  const spinner = ora(
    `正在获取章节 ${pico.cyan(chapter.title)} 的图片列表`
  ).start()
  const response = await service.get(chapter.url)
  const $ = cheerio.load(response.data)
  const pictures = await getPictures($)

  spinner.stop()

  const maxPad = String(pictures.length).length

  const bar = new ProgressBar(
    `${pico.cyan('→')} ${comicTitle} ${chapter.title} [:bar] :current/:total`,
    {
      incomplete: ' ',
      width: 20,
      total: pictures.length
    }
  )

  const limit = pLimit(5)
  const tasks = pictures.map((pic, i) => {
    return limit(async () => {
      if (!pic) {
        return bar.tick()
      }

      const res = await axios.get(pic, {
        responseType: 'arraybuffer'
      })

      const dir = path.resolve(
        process.cwd(),
        'comics',
        comicTitle,
        normalizeName(chapter.title)
      )
      await fs.mkdir(dir, { recursive: true })

      const index = String(i + 1).padStart(maxPad, '0')
      const ext = path.parse(pic).ext

      const file = path.resolve(dir, `${index}${ext}`)
      fs.writeFile(file, res.data)
      return bar.tick()
    })
  })
  return Promise.all(tasks)
}

export async function main(getChapters: GetChapters, getPictures: GetPictures) {
  const { COMIC_URL, COMIC_CHAPTER } = process.env

  const url = COMIC_URL || process.argv[2]
  if (!url) return

  const chapterRange = COMIC_CHAPTER || process.argv[3] || 'all'

  const { chapters, title } = await parseChapters(url, getChapters)
  const selectedChapters = selectChapters(chapterRange, chapters)

  log.info(`${title} 查询到 ${pico.cyan(selectedChapters.length)} 个待下载章节`)

  for (const ch of selectedChapters) {
    await downloadChapter(ch, title, getPictures)
  }
}
