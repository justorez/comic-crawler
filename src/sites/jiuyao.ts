import { main } from '../utils'

export const run = () =>
  main(
    ($) => {
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
    },
    ($) => {
      return $('#txtbox > img')
        .map((_, el) => $(el).attr('data-original'))
        .get()
    }
  )
