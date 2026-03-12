// aowuj.js - 完整解码版本
// 爬虫目标: aowu.tv (奥乌影视)
// 功能: 获取视频列表、播放线路、播放地址解析

const cheerio = createCheerio()
const CryptoJS = createCryptoJS()

// ==================== 配置部分 ====================
let $config = argsify($config_str)
const SITE = $config['site'] || 'https://www.aowu.tv'
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/604.1.14 (KHTML, like Gecko)'

const headers = {
    'Referer': SITE + '/',
    'Origin': SITE,
    'User-Agent': UA
}

let appConfig = {
    'ver': 1,
    'title': '奥乌',
    'site': SITE,
    'tabs': [
        { 'name': '新番', 'ext': { 'type': 'type=20' } },
        { 'name': '番剧', 'ext': { 'type': 'type=21' } },
        { 'name': '剧场', 'ext': { 'type': 'type=22' } }
    ]
}

// ==================== 核心函数 ====================

/**
 * 获取配置信息
 */
async function getConfig() {
    return jsonify(appConfig)
}

/**
 * 获取视频卡片列表
 * @param {Object} ext - 扩展参数，包含 page 和 type
 */
async function getCards(ext) {
    ext = argsify(ext)
    let cards = []
    let url = appConfig['site'] + '/api.php/provide/vod/?'
    let page = ext['page'] || 1
    let type = ext['type'] + '&class=&area=&year=&lang=&version=&state=&letter=&time=&level=0&weekday=&by=time&page=' + page

    // 发送 POST 请求获取数据
    const { data } = await $fetch.post(url, type, { 'headers': headers })

    // 解析返回的 JSON 数据
    argsify(data)['list'].forEach(item => {
        cards.push({
            'vod_id': item['vId'].trim(),
            'vod_name': item['vName'],
            'vod_pic': item['vPic'],
            'vod_remarks': item['remarks'],
            'ext': { 'url': appConfig['site'] + item['url'] }
        })
    })

    return jsonify({ 'list': cards })
}

/**
 * 获取播放线路和集数列表
 * @param {Object} ext - 扩展参数，包含 url
 */
async function getTracks(ext) {
    ext = argsify(ext)
    let tracks = []
    let url = ext['url']

    const { data } = await $fetch.get(url, { 'headers': headers })
    const $ = cheerio.load(data)

    let lineNames = []

    // 获取线路名称 - 从 .swiper-wrapper 中提取
    $('.swiper-wrapper').each((_, lineDiv) => {
        let lineName = $(lineDiv).text().trim().replace(/\s+/g, '').next().end().prev().text()
        if (lineName) {
            lineNames.push(lineName)
        }
    })

    // 获取每个线路的播放列表
    $('.module-items').each((lineIdx, playListDiv) => {
        let lineTracks = []

        $(playListDiv).find('li').each((_, itemLi) => {
            let name = $(itemLi).text().trim()
            let href = $(itemLi).attr('href')
            if (!href) return

            // 提取集数并格式化为两位数
            let match = name.match(/\d+/)
            if (match) {
                name = match[0].padStart(2, '0')
            }

            lineTracks.push({
                'name': name,
                'pan': '',
                'ext': { 'url': appConfig['site'] + href }
            })
        })

        if (lineTracks.length === 0) return

        // 按集数排序
        lineTracks.sort((a, b) => parseInt(a.name) - parseInt(b.name))

        tracks.push({
            'title': lineNames[lineIdx] || '线路' + (lineIdx + 1),
            'tracks': lineTracks
        })
    })

    return jsonify({ 'list': tracks })
}

/**
 * 获取播放地址
 * @param {Object} ext - 扩展参数，包含 url
 */
async function getPlayinfo(ext) {
    ext = argsify(ext)
    let url = ext['url']

    // 1. 获取详情页，提取 player_aaaa 数据
    let { data } = await $fetch.get(url, { 'headers': headers })
    let playerData = JSON.parse(data.match(/player_aaaa=(.+?)<\/script>/)[1])

    // 2. 根据加密类型解密 url
    if (playerData['encrypt'] == '1') {
        playerData['url'] = unescape(playerData['url'])
    } else if (playerData['encrypt'] == '2') {
        playerData['url'] = unescape(base64decode(playerData['url']))
    }

    // 3. 调用 encode.php 获取加密参数
    let plainData = 'plain=' + playerData['url']
    let { data: encodeData } = await $fetch.post(
        appConfig['site'] + '/player1/encode.php',
        plainData,
        { 'headers': headers }
    )
    encodeData = argsify(encodeData)

    // 4. 调用 parse.php 获取解密后的播放地址
    let playUrl = appConfig['site'] + '/player1/parse.php' +
        '?url=' + encodeURIComponent(encodeData['url']) +
        '&key=' + encodeURIComponent(encodeData['key']) +
        '&ts=' + encodeURIComponent(encodeData['ts']) +
        '&sig=' + encodeURIComponent(encodeData['sig'])

    let { data: parseData } = await $fetch.get(playUrl, { 'headers': headers })

    // 5. 从 parse.php 返回的页面中提取加密的 URL 和 sessionKey
    const encryptedUrl = parseData.match(/const\s+encryptedUrl\s*=\s*"([^"]+)"/)?.[1]
    const sessionKey = parseData.match(/const\s+sessionKey\s*=\s*"([^"]+)"/)?.[1]

    // 6. 使用 AES 解密获取最终播放地址
    let finalUrl = decryptAES(encryptedUrl, sessionKey)

    $print(finalUrl)
    return jsonify({ 'urls': [finalUrl] })
}

/**
 * AES 解密函数
 * @param {string} encryptedUrl - Base64 编码的加密数据 (包含 IV 和密文)
 * @param {string} sessionKey - 十六进制格式的密钥
 * @returns {string|null} - 解密后的 URL
 */
function decryptAES(encryptedUrl, sessionKey) {
    try {
        // 解析 Base64 编码的加密数据
        const decodedData = CryptoJS.enc.Base64.parse(encryptedUrl)

        // AES CBC 模式使用 16 字节 (128位) 的 IV
        // CryptoJS WordArray 中每个 word 是 4 字节，所以 4 个 words = 16 字节
        const iv = CryptoJS.lib.WordArray.create(decodedData.words.slice(0, 4))

        // 密文是剩余部分
        const ciphertext = CryptoJS.lib.WordArray.create(
            decodedData.words.slice(4),
            decodedData.sigBytes - 16
        )

        // 将十六进制格式的 sessionKey 转换为 WordArray
        const key = CryptoJS.enc.Hex.parse(sessionKey)

        // 使用 AES CBC 模式解密
        const decrypted = CryptoJS.AES.decrypt(
            { 'ciphertext': ciphertext },
            key,
            {
                'iv': iv,
                'mode': CryptoJS.mode.CBC,
                'padding': CryptoJS.pad.Pkcs7
            }
        )

        return decrypted.toString(CryptoJS.enc.Utf8)
    } catch (error) {
        console.error('decrypt error', error)
        return null
    }
}

/**
 * 搜索功能
 * @param {Object} ext - 扩展参数，包含 text (搜索关键词) 和 page
 */
async function search(ext) {
    ext = argsify(ext)
    let cards = []

    let text = encodeURIComponent(ext['text'])
    let page = ext['page'] || 1
    let url = appConfig['site'] + '?page=' + page + '&text=' + text

    let { data } = await $fetch.get(url, { 'headers': headers })
    const $ = cheerio.load(data)

    $('.module-item').each((_, item) => {
        const $item = $(item)
        const href = $item.find('.module-item-cover').attr('href') || ''
        const $img = $item.find('.module-item-titlebox')
        const pic = $img.attr('data-src') || $img.attr('src') || ''

        cards.push({
            'vod_id': href,
            'vod_name': $item.find('.module-item-title').text().trim(),
            'vod_pic': pic,
            'vod_remarks': $item.find('.module-item-text').first().text().trim(),
            'ext': { 'url': appConfig['site'] + href }
        })
    })

    return jsonify({ 'list': cards })
}

/**
 * Base64 解码函数
 * 不使用内置的 atob，而是手动实现以兼容不同环境
 * @param {string} str - Base64 编码的字符串
 * @returns {string} - 解码后的字符串
 */
function base64decode(str) {
    // Base64 字符映射表
    const base64Chars = new Array(
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1,
        -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1,
        -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
        13, 14, 15, 16, 17, 18, 19, -1, -1, -1, -1, -1, -1, -1,
        26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
        42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1
    )

    var c1, c2, c3, c4
    var strLen = str.length
    var i = 0
    var result = ''

    while (i < strLen) {
        // 查找第一个有效字符
        for (; c1 = base64Chars[0xff & str.charCodeAt(i++)], i < strLen && c1 == -1;);
        if (c1 == -1) break

        // 查找第二个有效字符
        for (; c2 = base64Chars[0xff & str.charCodeAt(i++)], i < strLen && c2 == -1;);
        if (c2 == -1) break

        // 解码第一个字节: (c1 << 2) | ((c2 & 0x30) >> 4)
        result += String.fromCharCode((c1 << 2) | ((0x30 & c2) >> 4))

        // 查找第三个有效字符
        do {
            if (c3 = 0xff & str.charCodeAt(i++), c3 == 61) return result  // 遇到 '=' 表示结束
        } while (c3 = base64Chars[c3], i < strLen && c3 == -1)

        if (c3 == -1) break

        // 解码第二个字节: ((c2 & 0x0F) << 4) | ((c3 & 0x3C) >> 2)
        result += String.fromCharCode(((0xf & c2) << 4) | ((0x3c & c3) >> 2))

        // 查找第四个有效字符
        do {
            if (c4 = 0xff & str.charCodeAt(i++), c4 == 61) return result  // 遇到 '=' 表示结束
        } while (c4 = base64Chars[c4], i < strLen && c4 == -1)

        if (c4 == -1) break

        // 解码第三个字节: ((c3 & 0x03) << 6) | c4
        result += String.fromCharCode(((0x3 & c3) << 6) | c4)
    }

    return result
}

// ==================== 代码结构说明 ====================
/*
本代码是一个完整的视频站点爬虫，包含以下主要功能:

1. getConfig() - 返回站点配置信息
2. getCards(ext) - 获取视频卡片列表 (分页)
3. getTracks(ext) - 获取播放线路和集数
4. getPlayinfo(ext) - 获取实际播放地址
   - 包含多步解密过程:
     a. 从页面提取 player_aaaa 数据
     b. 根据 encrypt 类型解密 (unescape 或 base64)
     c. 调用 encode.php 获取加密参数
     d. 调用 parse.php 获取加密的 URL 和 sessionKey
     e. 使用 AES CBC 模式解密得到最终播放地址
5. search(ext) - 搜索视频
6. base64decode(str) - Base64 解码辅助函数
7. decryptAES(encryptedUrl, sessionKey) - AES 解密函数

混淆分析:
- 原始代码使用 jsjiami.com.v7 混淆器
- 混淆技术包括:
  * 字符串数组 + RC4 加密
  * 变量名混淆 (_0x 开头的随机名称)
  * 控制流混淆 (冗余的条件判断)
  * 函数调用间接化
*/
