const cheerio = createCheerio()

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

//返回视频详细信息
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

    //播放列表
    $('.paly_list_btn a').each((_, e) => {
        const name = $(e).text()
        const href = $(e).attr('href')
        tracks.push({
            name: `${name}`,
            pan: '',
            ext: {
                url: href,
            },
        })
    })

    //云盘列表
    const panlist = $('.ypbt_down_list')
    if (panlist) {
        panlist.find('ul li').each((_, e) => {
            const name = $(e).find('a').text().trim()
            const href = $(e).find('a').attr('href')
            if (!/ali|quark|115|uc/.test(href)) return
            tracks.push({
                name: name,
                pan: href,
            })
        })
    }

    return jsonify({
        list: [
            {
                title: '默认分组',
                tracks,
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
    let playurl

    try {
        const $ = cheerio.load(data)

        // 1
        const jsurl = $('iframe').attr('src')
        if (jsurl) {
            let headers = {
                'user-agent': UA,
            }
            if (jsurl.includes('player-v2')) {
                headers['sec-fetch-dest'] = 'iframe'
                headers['sec-fetch-mode'] = 'navigate'
                headers['referer'] = `${appConfig.site}/`
            }

            const jsres = await $fetch.get(jsurl, { headers: headers })
            const $2 = cheerio.load(jsres.data)
            const scripts = $2('script')
            if (scripts.length - 2 > 0) {
                let code = scripts.eq(scripts.length - 2).text()

                if (code.includes('var player')) {
                    let player = code.match(/var player = "(.*?)"/)
                    let rand = code.match(/var rand = "(.*?)"/)

                    function decrypt(text, key, iv, type) {
                        let key_value = CryptoJS.enc.Utf8.parse(key || 'PBfAUnTdMjNDe6pL')
                        let iv_value = CryptoJS.enc.Utf8.parse(iv || 'sENS6bVbwSfvnXrj')
                        let content
                        if (type) {
                            content = CryptoJS.AES.encrypt(text, key_value, {
                                iv: iv_value,
                                mode: CryptoJS.mode.CBC,
                                padding: CryptoJS.pad.Pkcs7,
                            })
                        } else {
                            content = CryptoJS.AES.decrypt(text, key_value, {
                                iv: iv_value,
                                padding: CryptoJS.pad.Pkcs7,
                            }).toString(CryptoJS.enc.Utf8)
                        }
                        return content
                    }

                    let content = JSON.parse(decrypt(player[1], 'VFBTzdujpR9FWBhe', rand[1]))
                    $print(JSON.stringify(content))
                    playurl = content.url
                } else {
                    let data = code.split('"data":"')[1].split('"')[0]
                    let encrypted = data.split('').reverse().join('')
                    let temp = ''
                    for (let i = 0x0; i < encrypted.length; i = i + 0x2) {
                        temp += String.fromCharCode(parseInt(encrypted[i] + encrypted[i + 0x1], 0x10))
                    }
                    playurl = temp.substring(0x0, (temp.length - 0x7) / 0x2) + temp.substring((temp.length - 0x7) / 0x2 + 0x7)
                }
            }
        } else {
            // 2
            const script = $('script:contains(window.wp_nonce)')
            if (script.length > 0) {
                let code = script.eq(0).text()
                let group = code.match(/(var.*)eval\((\w*\(\w*\))\)/)
                const md5 = CryptoJS
                const result = eval(group[1] + group[2])
                playurl = result.match(/url:.*?['"](.*?)['"]/)[1]
            }
        }
    } catch (error) {
        $print(error)
    }

    return jsonify({ urls: [playurl], headers: [{ 'User-Agent': UA }] })
}

async function search(ext) {
    ext = argsify(ext)
    let cards = []

    let text = encodeURIComponent(ext.text)
    let page = ext.page || 1
    let url = `${appConfig.site}/daoyongjiek0shibushiyoubing?q=${text}$f=_all&p=${page}`

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })

    const $ = cheerio.load(data)

    $('div.bt_img > ul li').each((_, element) => {
        const href = $(element).find('a').attr('href')
        const title = $(element).find('img.thumb').attr('alt')
        const cover = $(element).find('img.thumb').attr('data-original')
        const subTitle = $(element).find('.jidi span').text()
        const hdinfo = $(element).find('.hdinfo .qb').text()
        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_remarks: subTitle || hdinfo,
            url: href,
            ext: {
                url: href,
            },
        })
    })

    return jsonify({
        list: cards,
    })
}