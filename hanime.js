const { all } = require("axios")

const cheerio = createCheerio()

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/604.1.14 (KHTML, like Gecko)'

let appConfig = {
    ver: 1,
    title: 'hanime',
    site: 'https://hanime1.me',
}

async function getConfig() {
    let config = appConfig
    config.tabs = await getTabs()
    return jsonify(config)
}

async function getTabs() {
    let list = []
    let ignore = ['新番預告', 'H漫畫']
    function isIgnoreClassName(className) {
        return ignore.some((element) => className.includes(element))
    }

    const { data } = await $fetch.get(appConfig.site, {
        headers: {
            'User-Agent': UA,
        },
    })
    const $ = cheerio.load(data)
    let allClass = $('#main-nav-home > a.nav-item')

    if (allClass.length === 0) {
        $utils.openSafari(appConfig.site, UA)
    }

    allClass.each((i, e) => {
        const name = $(e).text()
        const href = $(e).attr('href')
        const isIgnore = isIgnoreClassName(name)
        if (isIgnore) return

        list.push({
            name,
            ext: {
                url: encodeURI(href),
            },
        })
    })

    return list
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
