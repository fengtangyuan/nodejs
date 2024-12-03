import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

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
    url: "https://www.czzyvideo.com/movie_bt/movie_bt_series/dyy"
})

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

let appConfig = {
    ver: 1,
    title: '廠長',
    site: 'https://www.czzyvideo.com',
}

async function getTabs() {
    let list = []
    let ignore = ['关于', '公告', '官方', '备用', '群', '地址', '求片']
    function isIgnoreClassName(className) {
        return ignore.some((element) => className.includes(element))
    }

    const { data } = await $fetch.get(appConfig.site, {
        headers: {
            'User-Agent': UA,
        },
    })
    const $ = cheerio.load(data)

    let $allClass = $('ul.submenu_mi > li > a')
    $allClass.each((i, e) => {
        const name = $(e).text()
        const href = $(e).attr('href')
        const isIgnore = isIgnoreClassName(name)
        if (isIgnore) return

        list.push({
            name,
            ext: {
                url: appConfig.site + href,
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
        url += `/page/${page}`
    }

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })

    const $ = cheerio.load(data)

    $('.bt_img.mi_ne_kd.mrb ul > li').each((_, element) => {
        const href = $(element).find('a').attr('href')
        const title = $(element).find('img').attr('alt')
        const cover = $(element).find('img').attr('data-original')
        const subTitle = $(element).find('.jidi span').text()
        const hdinfo = $(element).find('.hdinfo span').text()
        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_remarks: subTitle || hdinfo,
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
    const list = await getTabs();
    $print(list);
})();

