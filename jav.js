import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

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
*/
const $fetch = {
    get: async function (url, headers) {
        const response = await fetch(url, headers);
        const html = await response.text();

        return { data: html }
    },
}
const $print = console.log
const jsonify = JSON.stringify
const argsify = JSON.parse

/*ext格式为之前获取的json数据中的ext属性内的数据，格式如下：
jsonify({
url: "https://www.czzyvideo.com/movie_bt/movie_bt_series/dyy"
})
*/

const ext = jsonify({
    page: 1,
    url: "https://jable.tv/hot/"

})


const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

let appConfig = {
    ver: 1,
    title: 'jable',
    site: 'https://jable.tv',
    tabs: [
        {
            name: '热度优先',
            ext: {
                id: 0,
                url: 'https://jable.tv/hot/',
            },
        },
        {
            name: '新片优先',
            ext: {
                id: 1,
                url: 'https://jable.tv/latest-updates/',
            },
        },
    ]
}

async function getConfig() {
    let config = appConfig
    return jsonify(config)
}

//返回所有视频列表，以json格式添加到cards中
async function getCards(ext) {
    ext = argsify(ext)
    let cards = []
    let { page = 1, url } = ext

    if (page > 1) {
        url += `${page}/`
    }

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })

    const $ = cheerio.load(data)
    const script = $('script')
    if (script.length > 0) {
        let code = script.eq(0).text()
        let group = code.match(/window.*appendChild\(cpo\)/)
        const result = eval(group[0])
        $print(result)
    }

    $('.pb-e-lg-40 div > div').each((_, element) => {
        const href = $(element).find('.img-box.cover-md a').attr('href')
        const title = $(element).find('.title a').text()
        const cover = $(element).find('img').attr('data-src')
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

(async () => {
    const list = await getCards(ext);
    $print(list);
})();
