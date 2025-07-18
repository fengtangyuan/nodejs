const cheerio = createCheerio()
const CryptoJS = createCryptoJS()

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0'


let $config = argsify($config_str)
if (!$config) {
    $config = {
        tabs: [
            {
                name: '电影',
                ui: 1,
                ext: {
                    id: '/vodshow/1--time------p---',
                },
            },
            {
                name: '电视剧',
                ui: 1,
                ext: {
                    id: '/vodshow/2--time------p---',
                },
            },
            {
                name: '综艺',
                ui: 1,
                ext: {
                    id: '/vodshow/3--time------p---',
                },
            },
            {
                name: '动漫',
                ui: 1,
                ext: {
                    id: '/vodshow/4--time------p---',
                },
            },
        ]
    }
}

let appConfig = {
    ver: 1,
    title: '大师兄',
    site: 'https://dsxys.com',
    tabs: $config.tabs
}

async function getConfig() {
    let config = appConfig
    return jsonify(config)
}


async function getCards(ext) {
    ext = argsify(ext)
    let cards = []
    let { page = 1, id } = ext
    //将id中的p替换为当前页码
    const url = appConfig.site + id.replace('p', page)

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })

    const $ = cheerio.load(data)

    $('.module > a').each((_, element) => {
        const href = $(element).attr('href')
        const title = $(element).find('img').attr('alt')
        const cover = $(element).find('img').attr('data-original')
        const subTitle = $(element).find('.module-item-note').text()
        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_remarks: subTitle,
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
    let list = []
    let url = appConfig.site + ext.url

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        }
    })

    const $ = cheerio.load(data)

    $('.module-play-list').each((i, element) => {
        let temp = []
        $(element).find('a').each((_, e) => {
            const name = $(e).find('span').text()
            const href = $(e).attr('href')
            temp.push({
                name: name,
                pan: '',
                ext: {
                    url: `${appConfig.site}${href}`,
                },
            })
        })
        list.push({
            title: '播放源' + (i + 1),
            tracks: temp,
        })
    })
    return jsonify({
        list: list,
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
    const match = typeof data === 'string' && data.match(/"url"\s*:\s*"(JT[^"]+)"/)
    $utils.toastError(`${match[1]}`);
    let urls = CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(match[1]));
    let urlx = decodeURIComponent(urls);
    return jsonify({
        urls: [urlx],
    })
}

async function search(ext) {
    ext = argsify(ext)
    let cards = []

    let text = encodeURIComponent(ext.text)
    let page = ext.page || 1
    let url = `${appConfig.site}/sb/kemksmaksdl7nhZe3c1${text}-/page/${page}.html`
    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })
    const $ = cheerio.load(data)

    $('.module-card-item-poster').each((_, element) => {
        const href = $(element).attr('href')
        const title = $(element).find('img').attr('alt')
        const cover = $(element).find('img').attr('data-original')
        const subTitle = $(element).find('.module-item-note').text()
        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_remarks: subTitle,
            ext: {
                url: href,
            },
        })
    })

    return jsonify({
        list: cards,
    })
}
