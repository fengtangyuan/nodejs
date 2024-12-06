/*
以上是可以調用的第三方庫，使用方法自行查閱文檔
內置方法有:
$print: 等同於 console.log
$fetch: http client，可發送 get 及 post 請求
    get: $fetch.get(url,options)
    post: $fetch.post(url,postData,options)
argsify, jsonify: 等同於 JSON 的 parse 及 stringify
$html: 內置的 html 解析方法，建議用 cheerio 替代
$cache: 可將數據存入緩存
    set: $cache.set(key, value)
    get: $cache.get(key)
$utils.openSafari(url, ua)打开浏览器
$fetch.download(url, options) data 返回的是二进制字符串
*/

const cheerio = createCheerio()
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

let appConfig = {
    ver: 1,
    title: 'jav',
    site: 'https://jable.tv',
    tabs: [{
        name: '热度优先',
        ext: {
            url: 'https://jable.tv/hot/'
        }
    },
    {
        name: '新片优先',
        ext: {
            url: 'https://jable.tv/latest-updates/'
        }
    }]
}

async function getConfig() {
    let config = appConfig
    await $utils.openSafari(config.site, UA)
    return jsonify(config)
}

async function getCards(ext) {
    ext = argsify(ext)
    let cards = []
    let { page = 1, url } = ext

    if (page > 1) {
        url += `/page/${page}`
    }

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })
    $print(data)
    const $ = cheerio.load(data)

    $('.pb-3.pb-e-lg-40 div > div').each((_, element) => {
        const href = $(element).find('a').attr('href')
        const title = $(element).find('.title a').text()
        const cover = $(element).find('img').attr('src')
        const subTitle = $(element).find('.sub-title').text()
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


