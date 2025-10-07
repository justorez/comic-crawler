export type ChapterType = {
  url: string
  title: string
}

export type ChapterList = {
  title: string
  chapters: ChapterType[]
}

export type GetChapters = (
  $: import('cheerio').CheerioAPI,
  url: string
) => Promise<ChapterList> | ChapterList

export type GetPictures = (
  $: import('cheerio').CheerioAPI
) => Promise<string[]> | string[]
