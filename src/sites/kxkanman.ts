import { main } from '../utils'

export const run = () =>
  main(
    ($, url) => {
      const origin = new URL(url).origin
      const title = $('.anime__details__title > h3').text()
      const chapters = $('.chapter_list > a')
        .map((_, el) => {
          const u = new URL($(el).attr('href') || '', origin)
          return {
            title: $(el).text() || '',
            url: u.href,
            code: Number($(el).attr('href')?.split('/').slice(-1)[0]) || -1
          }
        })
        .toArray()
        .sort((a, b) => a.code - b.code)
      return {
        title,
        chapters
      }
    },
    ($) => {
      return $('.blog__details__content > img')
        .map((_, el) => $(el).attr('src'))
        .get()
    }
  )
