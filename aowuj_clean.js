const cheerio = createCheerio()
const CryptoJS = createCryptoJS()

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'

let appConfig = {
    ver: 1,
    title: '嗷呜动漫',
    site: 'https://www.aowu.tv',
}

async function getConfig() {
    let config = appConfig
    return jsonify(config)
}

async function getCards(ext) {
    ext = argsify(ext)
    let cards = []
    let { page = 1, type } = ext

    let url = appConfig.site + '/index.php/ds_api/vod'
    let body = type + '&class=&area=&year=&lang=&version=&state=&letter=&time=&level=0&weekday=&by=time&page=' + page

    const { data } = await $fetch.post(url, body, {
        headers: {
            'User-Agent': UA,
            'Referer': appConfig.site + '/',
            'Origin': appConfig.site,
        },
    })

    const json = argsify(data)
    json.list.forEach((item) => {
        cards.push({
            vod_id: item.vod_id.toString(),
            vod_name: item.vod_name,
            vod_pic: item.vod_pic,
            vod_remarks: item.vod_remarks,
            ext: {
                url: appConfig.site + item.url,
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
            'Referer': appConfig.site + '/',
            'Origin': appConfig.site,
        },
    })

    const $ = cheerio.load(data)
    let lineNames = []

    // 获取线路名称
    $('a.swiper-slide').each((_, element) => {
        let name = $(element).clone().children().remove().end().text().trim()
        if (name) {
            lineNames.push(name)
        }
    })

    // 获取每集的播放链接
    $('div.anthology-list-box').each((lineIndex, lineElement) => {
        let trackList = []
        $(lineElement).find('ul.anthology-list-play li a').each((_, element) => {
            let name = $(element).text().trim()
            let href = $(element).attr('href')
            if (!href) return

            // 格式化集数名称
            let numMatch = name.match(/\d+/)
            if (numMatch) {
                name = numMatch[0].padStart(2, '0')
            }

            trackList.push({
                name: name,
                pan: '',
                ext: {
                    url: appConfig.site + href,
                },
            })
        })

        if (trackList.length === 0) return

        // 按集数排序
        trackList.sort((a, b) => parseInt(a.name) - parseInt(b.name))

        tracks.push({
            title: lineNames[lineIndex] || '线路' + (lineIndex + 1),
            tracks: trackList,
        })
    })

    return jsonify({
        list: tracks,
    })
}

async function getPlayinfo(ext) {
    ext = argsify(ext)
    const url = ext.url

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
            'Referer': appConfig.site + '/',
            'Origin': appConfig.site,
        },
    })

    // 解析播放器配置
    let playerConfig = JSON.parse(data.match(/player_aaaa=(.+?)<\/script>/)[1])

    // 处理加密的播放链接
    if (playerConfig.encrypt == '1') {
        playerConfig.url = unescape(playerConfig.url)
    } else if (playerConfig.encrypt == '2') {
        playerConfig.url = unescape(base64decode(playerConfig.url))
    }

    // 请求 encode.php 获取加密数据
    let encodeBody = 'plain=' + playerConfig.url
    const { data: encodeData } = await $fetch.post(
        appConfig.site + '/player1/encode.php',
        encodeBody,
        {
            headers: {
                'User-Agent': UA,
                'Referer': appConfig.site + '/',
                'Origin': appConfig.site,
            },
        }
    )

    // 解析加密响应
    let encodeJson = argsify(encodeData)
    let playerUrl =
        appConfig.site +
        '/player1/?url=' +
        encodeURIComponent(encodeJson.url) +
        '&ts=' +
        encodeURIComponent(encodeJson.ts) +
        '&sig=' +
        encodeURIComponent(encodeJson.sig)

    // 获取最终播放页面
    const { data: playerData } = await $fetch.get(playerUrl, {
        headers: {
            'User-Agent': UA,
            'Referer': appConfig.site + '/',
            'Origin': appConfig.site,
        },
    })

    // 提取加密URL和密钥
    const encryptedUrl = playerData.match(/const\s+encryptedUrl\s*=\s*"([^"]+)"/)?.[1]
    const sessionKey = playerData.match(/const\s+sessionKey\s*=\s*"([^"]+)"/)?.[1]

    // AES解密
    let playUrl = decryptAES(encryptedUrl, sessionKey)
    $print(playUrl)

    return jsonify({
        urls: [playUrl],
        headers: [{ 'User-Agent': UA }],
    })
}

function decryptAES(encryptedData, key) {
    try {
        // Base64解码
        const parsed = CryptoJS.enc.Base64.parse(encryptedData)
        
        // 提取IV (前4个words) 和密文
        const iv = CryptoJS.lib.WordArray.create(parsed.words.slice(0, 4))
        const ciphertext = CryptoJS.lib.WordArray.create(parsed.words.slice(4))

        // AES解密
        const decrypted = CryptoJS.AES.decrypt(
            { ciphertext: ciphertext },
            CryptoJS.enc.Utf8.parse(key),
            {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7,
            }
        )

        return decrypted.toString(CryptoJS.enc.Utf8)
    } catch (error) {
        console.error('URL解密失败', error)
        return null
    }
}

async function search(ext) {
    ext = argsify(ext)
    let cards = []

    let text = encodeURIComponent(ext.text)
    let page = ext.page || 1
    let url = `${appConfig.site}/vods/page/${page}/wd/${text}`

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
            'Referer': appConfig.site + '/',
            'Origin': appConfig.site,
        },
    })

    const $ = cheerio.load(data)

    $('div.vod-detail').each((_, element) => {
        const $item = $(element)
        const vodId = $item.find('.detail-info > a').attr('href') || ''
        const $img = $item.find('.detail-pic img')
        const cover =
            $img.attr('data-src') ||
            $img.attr('data-original') ||
            $img.attr('src') ||
            ''

        cards.push({
            vod_id: vodId,
            vod_name: $item.find('h3.slide-info-title').text().trim(),
            vod_pic: cover,
            vod_remarks: $item.find('span.slide-info-remarks').first().text().trim(),
            ext: {
                url: appConfig.site + vodId,
            },
        })
    })

    return jsonify({
        list: cards,
    })
}

// 自定义Base64解码函数
function base64decode(str) {
    var base64DecodeChars = new Array(
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
        52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
        -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
        15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
        -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
        41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1
    )

    var c1, c2, c3, c4
    var i, len, out
    var strLength = str.length
    i = 0
    out = ''

    while (i < strLength) {
        do {
            c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff]
        } while (i < strLength && c1 == -1)
        if (c1 == -1) break

        do {
            c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff]
        } while (i < strLength && c2 == -1)
        if (c2 == -1) break

        out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4))

        do {
            c3 = str.charCodeAt(i++) & 0xff
            if (c3 == 61) return out
            c3 = base64DecodeChars[c3]
        } while (i < strLength && c3 == -1)
        if (c3 == -1) break

        out += String.fromCharCode(((c2 & 0xf) << 4) | ((c3 & 0x3c) >> 2))

        do {
            c4 = str.charCodeAt(i++) & 0xff
            if (c4 == 61) return out
            c4 = base64DecodeChars[c4]
        } while (i < strLength && c4 == -1)
        if (c4 == -1) break

        out += String.fromCharCode(((c3 & 0x3) << 6) | c4)
    }
    return out
}
