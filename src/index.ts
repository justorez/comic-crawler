import axios from 'axios'
import * as cheerio from 'cheerio'
import fs from 'fs/promises'
import path from 'path'
import { log, selectChapters } from './utils'
import pico from 'picocolors'
import ora from 'ora'
import ProgressBar from 'progress'
import pLimit from 'p-limit'

const service = axios.create({
    headers: {
        'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0'
    },
    responseType: 'document'
})

async function parseChapters(url: string) {
    const response = await service.get(url)

    const $ = cheerio.load(response.data)

    const title = $('#yuedu > h2').text()
    const chapters = $('#yuedu ul li > a')
        .map((_, el) => {
            return {
                title: $(el).attr('title') || '',
                url: $(el).attr('href') || ''
            }
        })
        .toArray()
    return {
        title,
        chapters
    }
}

async function downloadChapter(chapter: TChapter, comicTitle: string) {
    const spinner = ora(
        `正在获取章节 ${pico.cyan(chapter.title)} 的图片列表`
    ).start()
    const response = await service.get(chapter.url)

    const $ = cheerio.load(response.data)

    const title = $('.info-title > h1').text()
    const pictures = $('#txtbox > img')
        .map((_, el) => $(el).attr('data-original'))
        .get()

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
            const res = await axios.get(pic, {
                responseType: 'arraybuffer'
            })

            const dir = path.resolve(process.cwd(), 'comics', comicTitle, title)
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

async function main() {
    const { COMIC_URL, COMIC_CHAPTER } = process.env

    const url = COMIC_URL || process.argv[2]
    if (!url) return

    const { chapters, title } = await parseChapters(url)
    const selectedChapters = selectChapters(COMIC_CHAPTER || '', chapters)

    log.info(
        `${title} 查询到 ${pico.cyan(selectedChapters.length)} 个待下载章节`
    )

    for (const ch of selectedChapters) {
        await downloadChapter(ch, title)
    }
}

main()
