declare global {
    type ChapterType = {
        url: string
        title: string
    }

    type ChapterList = {
        title: string
        chapters: ChapterType[]
    }

    type GetChapters = ($: import('cheerio').CheerioAPI, url: string) => Promise<ChapterList> | ChapterList
    type GetPictures = ($: import('cheerio').CheerioAPI) => Promise<string[]> | string[]
}

export default global
