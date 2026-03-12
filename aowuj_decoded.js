const cheerio = createCheerio()
const CryptoJS = createCryptoJS()

let $config = argsify($config_str)
const SITE = $config['site'] || 'https://www.aowu.tv'
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/604.1.14 (KHTML, like Gecko)'

const headers = {
    'Referer': SITE + '/',
    'Origin': '' + SITE,
    'User-Agent': UA
}

let appConfig = {
    'ver': 1,
    'title': '奥乌影视',
    'site': SITE,
    'tabs': [
        { 'name': '新番', 'ext': { 'type': 'type=20' } },
        { 'name': '番剧', 'ext': { 'type': 'type=21' } },
        { 'name': '剧场', 'ext': { 'type': 'type=22' } }
    ]
}

async function getConfig() {
    return jsonify(appConfig)
}

async function getCards(ext) {
    ext = argsify(ext)
    let cards = []
    let url = appConfig['site'] + '/api.php/provide/vod/'
    let page = ext['page'] || 1
    let type = ext['type'] + '&class=&area=&year=&lang=&version=&state=&letter=&time=&level=0&weekday=&by=time&page=' + page

    const { data: responseData } = await $fetch['get'](url, type, {
        'headers': headers
    })

    argsify(responseData)['list']['forEach']((item) => {
        cards['push']({
            'vod_id': item['vod_id']['toString'](),
            'vod_name': item['vod_name'],
            'vod_pic': item['vod_pic'],
            'vod_remarks': item['vod_remarks'],
            'ext': {
                'url': '' + appConfig['site'] + item['url']
            }
        })
    })

    return jsonify({
        'list': cards
    })
}

async function getTracks(ext) {
    ext = argsify(ext)
    let tracks = []
    let url = ext['url']

    const { data: htmlData } = await $fetch['get'](url, {
        'headers': headers
    })
    const $ = cheerio['load'](htmlData)

    let groupNames = []

    // 获取分组名称
    $('.module-tab-item')['each']((_, element) => {
        let groupName = $(element)['text']()['trim']()['split']('\n')['join']('')
        if (groupName) {
            groupNames['push'](groupName)
        }
    })

    // 处理播放列表
    $('.module-play-list')['each']((index, element) => {
        let trackList = []

        $(element)['find']('.scroll-content')['li']['each']((_, li) => {
            let name = $(li)['text']()['trim']()
            let href = $(li)['find']('a')['attr']('href')
            if (!href) return

            let match = name['match'](/\d+/)
            if (match) {
                name = match[0]['padStart'](2, '0')
            }

            trackList['push']({
                'name': name,
                'pan': '',
                'ext': {
                    'url': appConfig['site'] + href
                }
            })
        })

        if (trackList['length'] === 0) return

        trackList['sort']((a, b) => parseInt(a['name']) - parseInt(b['name']))

        tracks['push']({
            'title': groupNames[index] || '线路' + (index + 1),
            'tracks': trackList
        })
    })

    return jsonify({
        'list': tracks
    })
}

async function getPlayinfo(ext) {
    ext = argsify(ext)
    let url = ext['url']

    let { data } = await $fetch['get'](url, {
        'headers': headers
    })

    // 从页面中提取 player_aaaa 数据
    let playerData = JSON['parse'](data['match'](/player_aaaa=(.+?)<\/script>/)[1])

    // 处理不同类型的加密
    if (playerData['encrypt'] == '1') {
        playerData['url'] = unescape(playerData['url'])
    } else if (playerData['encrypt'] == '2') {
        playerData['url'] = unescape(base64decode(playerData['url']))
    }

    // 构造 encode.php 请求
    let postData = 'plain=' + playerData['url']

    let response = await $fetch['post'](appConfig['site'] + '/player1/encode.php', postData, {
        'headers': headers
    })
    data = response.data

    // 构造最终的解密请求
    var parsedData = argsify(data)
    var decryptUrl = appConfig['site'] + '/player1/parse.php?url=' + encodeURIComponent(parsedData['url']) + '&ts=' + encodeURIComponent(parsedData['ts']) + '&key=' + encodeURIComponent(parsedData['sig'])

    let result = await $fetch['get'](decryptUrl, {
        'headers': headers
    })
    data = result.data

    // 提取加密 URL 和 session key
    const encryptedUrl = data['match'](/const\s+encryptedUrl\s*=\s*"([^"]+)"/)?.[1]
    const sessionKey = data['match'](/const\s+sessionKey\s*=\s*"([^"]+)"/)?.[1]

    // 解密获取最终播放地址
    let playUrl = decryptAES(encryptedUrl, sessionKey)

    $print(playUrl)

    return jsonify({
        'urls': [playUrl]
    })
}

function decryptAES(encryptedUrl, sessionKey) {
    try {
        // 解析 Base64 编码的加密数据
        const encryptedData = CryptoJS['enc']['Base64']['parse'](encryptedUrl)

        // 前 4 字节是 IV
        const iv = CryptoJS['enc']['Hex']['parse'](encryptedData['ciphertext']['toString'](0, 4))

        // 剩余的是实际密文
        const ciphertext = encryptedData['ciphertext']['clone']()
        ciphertext['words'] = ciphertext['words']['slice'](1) // 跳过前 4 字节
        ciphertext['sigBytes'] -= 4

        // 使用 sessionKey 作为密钥解密
        const decrypted = CryptoJS['AES']['decrypt']({
            'ciphertext': ciphertext
        }, CryptoJS['enc']['Utf8']['parse'](sessionKey), {
            'iv': iv,
            'mode': CryptoJS['mode']['CBC'],
            'padding': CryptoJS['pad']['Pkcs7']
        })

        return decrypted['toString'](CryptoJS['enc']['Utf8'])
    } catch (error) {
        console['log']('解密错误', error)
        return null
    }
}

async function search(ext) {
    ext = argsify(ext)
    let cards = []

    let text = encodeURIComponent(ext['text'])
    let page = ext['page'] || 1
    let url = appConfig['site'] + '/search?page=' + page + '&text=' + text

    const { data: htmlData } = await $fetch['get'](url, {
        'headers': headers
    })
    const $ = cheerio['load'](htmlData)

    $('.detail-info > a')['each']((_, element) => {
        let $elem = $(element)
        let href = $elem['find']('.detail-url')['attr']('href') || ''
        let $imgElem = $elem['find']('img')
        let cover = $imgElem['attr']('data-src') || $imgElem['attr']('src') || ''

        cards['push']({
            'vod_id': href,
            'vod_name': $elem['find']('.detail-title')['text']()['trim'](),
            'vod_pic': cover,
            'vod_remarks': $elem['find']('.detail-tags')['first']()['text']()['trim'](),
            'ext': {
                'url': appConfig['site'] + href
            }
        })
    })

    return jsonify({
        'list': cards
    })
}

function base64decode(str) {
    // Base64 解码实现
    var base64Chars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0x3e, -1, -1, -1, 0x3f, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x3b, 0x3c, 0x3d, -1, -1, -1, -1, -1, -1, -1, 0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, -1, -1, -1, -1, -1, -1, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f, 0x20, 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x2b, 0x2c, 0x2d, 0x2e, 0x2f, 0x30, 0x31, 0x32, 0x33, -1, -1, -1, -1, -1)

    var c1, c2, c3, c4
    var i = 0
    var len = str['length']
    var out = ''

    while (i < len) {
        do {
            c1 = base64Chars[0xff & str['charCodeAt'](i++)]
        } while (i < len && c1 == -1)
        if (c1 == -1) break

        do {
            c2 = base64Chars[0xff & str['charCodeAt'](i++)]
        } while (i < len && c2 == -1)
        if (c2 == -1) break

        out += String['fromCharCode']((c1 << 2) | ((0x30 & c2) >> 4))

        do {
            c3 = str['charCodeAt'](i++)
            if (c3 == 0x3d) return out
            c3 = base64Chars[0xff & c3]
        } while (i < len && c3 == -1)
        if (c3 == -1) break

        out += String['fromCharCode'](((0xf & c2) << 4) | ((0x3c & c3) >> 2))

        do {
            c4 = str['charCodeAt'](i++)
            if (c4 == 0x3d) return out
            c4 = base64Chars[0xff & c4]
        } while (i < len && c4 == -1)
        if (c4 == -1) break

        out += String['fromCharCode'](((0x3 & c3) << 6) | c4)
    }

    return out
}
