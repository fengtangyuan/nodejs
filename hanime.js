const cheerio = createCheerio()

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0'

let appConfig = {
    ver: 1,
    title: 'hanime',
    site: 'https://hanime1.me',
    tabs: [
        {
            name: '里番',
            ui: 1,
            ext: {
                url: 'https://hanime1.me/search?genre=%E8%A3%8F%E7%95%AA',
            },
        },
        {
            name: '泡面番',
            ui: 1,
            ext: {
                url: 'https://hanime1.me/search?genre=%E6%B3%A1%E9%BA%B5%E7%95%AA',
            },
        },
        {
            name: 'Motion Anime',
            ui: 1,
            ext: {
                url: 'https://hanime1.me/search?genre=Motion%20Anime',
            },
        },
        {
            name: '3D動畫',
            ui: 1,
            ext: {
                url: 'https://hanime1.me/search?genre=3D%E5%8B%95%E7%95%AB',
            },
        },
        {
            name: '同人',
            ui: 1,
            ext: {
                url: 'https://hanime1.me/search?genre=%E5%90%8C%E4%BA%BA%E4%BD%9C%E5%93%81',
            },
        },
        {
            name: 'MMD',
            ui: 1,
            ext: {
                url: 'https://hanime1.me/search?genre=MMD',
            },
        },
    ],
}

async function getConfig() {
    let config = appConfig
    return jsonify(config)
}

async function getCards(ext) {
    ext = argsify(ext)
    let cards = []
    let { page = 1, url } = ext

    if (page > 1) {
        url += `&page=${page}`
    }

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })

    const $ = cheerio.load(data)
    let videolist = $('.home-rows-videos-wrapper > a')
    if (videolist.length === 0) videolist = $('.content-padding-new > .row > .search-doujin-videos.col-xs-6')

    videolist.each((_, element) => {
        if ($(element).attr('target') === '_blank' || $(element).find('.overlay').attr('target') === '_blank') return
        const href = $(element).attr('href') || $(element).find('.overlay').attr('href')
        const title = $(element).find('.home-rows-videos-title').text() || $(element).find('.card-mobile-title').text()
        let cover = $(element).find('img').attr('src')
        if (cover.includes('background')) cover = $(element).find('img').eq(1).attr('src')
        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_remarks: '',
            ext: {
                url: href,
            },
        })
    })

    return jsonify({
        list: cards,
    })
}

async function getTracks(ext) {
    ext = argsify(ext)
    let tracks = []
    let url = ext.url

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })
    const $ = cheerio.load(data)
    const playlist = $('.hover-video-playlist:first > div')
    playlist.each((_, e) => {
        const name = $(e).find('.card-mobile-title').text()
        const href = $(e).find('a.overlay').attr('href')
        tracks.unshift({
            name: name,
            pan: '',
            ext: {
                url: href,
            },
        })
    })
    tracks.unshift({
        name: '播放',
        pan: '',
        ext: {
            url: url,
        },
    })
    return jsonify({
        list: [
            {
                title: '默认分组',
                tracks
            },
        ],
    })
}

async function getPlayinfo(ext) {
    ext = argsify(ext)
    const url = ext.url

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })

    const $ = cheerio.load(data)
    const json = $('script[type=application/ld+json]').text()

    let playUrl = json.match(/contentUrl":\s?"(.*?)",/)[1]

    return jsonify({ urls: [playUrl] })
}

async function search(ext) {
    ext = argsify(ext)
    let cards = []

    let text = encodeURIComponent(ext.text)
    let page = ext.page || 1
    let url = `${appConfig.site}/search?query=${text}&page=${page}`

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })
    const $ = cheerio.load(data)

    $('.col-xs-6').each((_, element) => {
        if ($(element).find('.overlay').attr('target') === '_blank') return
        const href = $(element).find('.overlay').attr('href')
        const title = $(element).find('.card-mobile-title').text()
        const cover = $(element).find('img').eq(1).attr('src')
        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_remarks: '',
            ext: {
                url: href,
            },
        })
    })

    return jsonify({
        list: cards,
    })
}
