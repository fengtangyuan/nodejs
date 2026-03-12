/**
 * aowuj.js 解密还原脚本
 * 分析加密逻辑并还原可读代码
 */

const cheerio = require('cheerio'); // 假设环境中有 cheerio
const CryptoJS = require('crypto-js');

// ============================================================
// 还原后的代码结构 (参考 czzy.js 的风格)
// ============================================================

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/604.1.14 (KHTML, like Gecko)';

const SITE = 'https://www.aowu.tv';

const headers = {
    'Referer': SITE + '/',
    'Origin': SITE,
    'User-Agent': UA
};

let appConfig = {
    ver: 1,
    title: '傲物',
    site: SITE,
    tabs: [
        { name: '新番', ext: { type: 'type=20' } },
        { name: '番剧', ext: { type: 'type=25' } },
        { name: '剧场', ext: { type: 'type=21' } }
    ]
};

// ============================================================
// getConfig - 获取配置
// ============================================================
async function getConfig() {
    return jsonify(appConfig);
}

// ============================================================
// getCards - 获取卡片列表
// ============================================================
async function getCards(ext) {
    ext = argsify(ext);
    let cards = [];

    let url = appConfig.site + '/api.php/provide/vod/';
    let page = ext.page || 1;
    let params = ext.type + '&class=&area=&year=&lang=&version=&state=&letter=&time=&level=0&weekday=&by=time&page=' + page;

    const { data } = await $fetch.post(url, params, { headers: headers });

    argsify(data).list.forEach(item => {
        cards.push({
            vod_id: item.vod_id.toString(),
            vod_name: item.vod_name,
            vod_pic: item.vod_pic,
            vod_remarks: item.vod_remarks,
            ext: {
                url: appConfig.site + item.url
            }
        });
    });

    return jsonify({ list: cards });
}

// ============================================================
// getTracks - 获取播放轨道
// ============================================================
async function getTracks(ext) {
    ext = argsify(ext);
    let tracks = [];
    let url = ext.url;

    const { data } = await $fetch.get(url, { headers: headers });
    const $ = cheerio.load(data);

    let lineTitles = [];

    // 获取线路标题
    $('.module-tab-item').each((_, e) => {
        let title = $(e).text().trim().split('\n')[0];
        if (title) lineTitles.push(title);
    });

    // 处理每个播放列表
    $('.module-play-list').each((index, e) => {
        let lineTracks = [];

        $(e).find('.module-play-list-link').each((_, link) => {
            let name = $(link).text().trim();
            let href = $(link).attr('href');

            if (!href) return;

            // 提取集数
            let match = name.match(/\d+/);
            if (match) {
                name = match[0].padStart(2, '0');
            }

            lineTracks.push({
                name: name,
                pan: '',
                ext: { url: appConfig.site + href }
            });
        });

        if (lineTracks.length === 0) return;

        // 按集数排序
        lineTracks.sort((a, b) => parseInt(a.name) - parseInt(b.name));

        tracks.push({
            title: lineTitles[index] || '线路' + (index + 1),
            tracks: lineTracks
        });
    });

    return jsonify({ list: tracks });
}

// ============================================================
// getPlayinfo - 获取播放信息
// ============================================================
async function getPlayinfo(ext) {
    ext = argsify(ext);
    let url = ext.url;

    // 获取播放页面
    let { data } = await $fetch.get(url, { headers: headers });

    // 提取 player_aaaa 配置
    let playerConfig = JSON.parse(data.match(/player_aaaa=(.+?)<\/script>/)[1]);

    // 根据加密类型解密 URL
    if (playerConfig.encrypt == '1') {
        playerConfig.url = unescape(playerConfig.url);
    } else if (playerConfig.encrypt == '2') {
        playerConfig.url = unescape(base64decode(playerConfig.url));
    }

    // 请求 encode.php
    let postData = 'plain=' + playerConfig.url;
    let { data: encodeData } = await $fetch.post(
        appConfig.site + '/player1/encode.php',
        postData,
        { headers: headers }
    );

    // 构造播放器请求 URL
    encodeData = argsify(encodeData);
    let playerUrl = appConfig.site + '/player1/index.php?data=' +
        encodeURIComponent(encodeData.url) +
        '&ts=' + encodeURIComponent(encodeData.ts) +
        '&sign=' + encodeURIComponent(encodeData.sig);

    // 请求播放器页面
    let { data: playerData } = await $fetch.get(playerUrl, { headers: headers });

    // 提取加密 URL 和会话密钥
    const encryptedUrl = playerData.match(/const\s+encryptedUrl\s*=\s*"([^"]+)"/)?.[1];
    const sessionKey = playerData.match(/const\s+sessionKey\s*=\s*"([^"]+)"/)?.[1];

    // AES 解密
    let playUrl = decryptAES(encryptedUrl, sessionKey);

    $print(playUrl);

    return jsonify({ urls: [playUrl] });
}

// ============================================================
// search - 搜索功能
// ============================================================
async function search(ext) {
    ext = argsify(ext);
    let cards = [];

    let text = encodeURIComponent(ext.text);
    let page = ext.page || 1;
    let url = appConfig.site + '/vodsearch/' + page + '.html?wd=' + text;

    const { data } = await $fetch.get(url, { headers: headers });
    const $ = cheerio.load(data);

    $('.detail-info > a').each((_, e) => {
        const item = $(e);
        const href = item.find('.module-item-pic').attr('href') || '';
        const img = item.find('.module-item-pic');
        const pic = img.attr('data-src') || img.attr('src') || '';

        cards.push({
            vod_id: href,
            vod_name: item.find('.module-card-item-title').text().trim(),
            vod_pic: pic,
            vod_remarks: item.find('.module-card-item-status').first().text().trim(),
            ext: {
                url: appConfig.site + href
            }
        });
    });

    return jsonify({ list: cards });
}

// ============================================================
// decryptAES - AES 解密函数
// ============================================================
function decryptAES(encryptedUrl, sessionKey) {
    try {
        // Base64 解码
        const ciphertext = CryptoJS.enc.Base64.parse(encryptedUrl);

        // 从 sessionKey 提取 IV (前4个字符)
        const iv = CryptoJS.enc.Hex.parse(sessionKey.slice(0, 4));

        // sessionKey 作为密钥
        const key = CryptoJS.enc.Utf8.parse(sessionKey.slice(4));

        // AES 解密
        const decrypted = CryptoJS.AES.decrypt(
            { ciphertext: ciphertext },
            key,
            {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }
        );

        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.log('解密错误:', error);
        return null;
    }
}

// ============================================================
// base64decode - Base64 解码函数
// ============================================================
function base64decode(str) {
    var buffer = new Array(
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
        52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
        -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
        15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
        -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
        41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1
    );

    var c1, c2, c3, c4;
    var i = 0;
    var len = str.length;
    var out = '';

    while (i < len) {
        do {
            c1 = buffer[0xff & str.charCodeAt(i++)];
        } while (i < len && c1 === -1);
        if (c1 === -1) break;

        do {
            c2 = buffer[0xff & str.charCodeAt(i++)];
        } while (i < len && c2 === -1);
        if (c2 === -1) break;

        out += String.fromCharCode((c1 << 2) | ((0x30 & c2) >> 4));

        do {
            c3 = str.charCodeAt(i++);
            if (c3 === 61) return out;
            c3 = buffer[c3];
        } while (i < len && c3 === -1);
        if (c3 === -1) break;

        out += String.fromCharCode(((0x0f & c2) << 4) | ((0x3c & c3) >> 2));

        do {
            c4 = str.charCodeAt(i++);
            if (c4 === 61) return out;
            c4 = buffer[c4];
        } while (i < len && c4 === -1);
        if (c4 === -1) break;

        out += String.fromCharCode(((0x03 & c3) << 6) | c4);
    }

    return out;
}

// ============================================================
// 导出模块
// ============================================================
module.exports = {
    getConfig,
    getCards,
    getTracks,
    getPlayinfo,
    search,
    decryptAES,
    base64decode
};

// ============================================================
// 分析报告
// ============================================================
console.log(`
============================================================
aowuj.js 解密还原分析报告
============================================================

1. 代码结构分析:
   - 原始代码使用 jsjiami.com.v7 加密
   - 包含字符串混淆 + RC4 加密
   - 核心逻辑与 czzy.js 类似

2. 还原的 API 接口:
   - getConfig()      : 获取站点配置
   - getCards(ext)    : 获取视频列表 (POST /api.php/provide/vod/)
   - getTracks(ext)   : 获取播放轨道 (解析 HTML 页面)
   - getPlayinfo(ext) : 获取真实播放地址 (多层解密)
   - search(ext)      : 搜索功能 (/vodsearch/{page}.html?wd=)

3. 关键解密逻辑:
   a) getPlayinfo 的解密流程:
      - 从页面提取 player_aaaa JSON 配置
      - 根据 encrypt 字段进行不同解密:
        * encrypt=1: unescape 解码
        * encrypt=2: base64decode + unescape
      - 请求 /player1/encode.php 获取编码数据
      - 请求 /player1/index.php 获取播放器页面
      - AES-256-CBC 解密最终 URL

   b) AES 解密参数:
      - Key: sessionKey[4:] (UTF8)
      - IV: sessionKey[:4] (Hex 解析)
      - Mode: CBC
      - Padding: PKCS7

4. 与 czzy.js 的主要区别:
   - aowuj 使用 API 接口获取列表
   - czzy 使用 HTML 解析获取列表
   - 播放地址解密方式不同 (aowuj: AES, czzy: 自定义/eval)

5. 站点信息:
   - SITE: https://www.aowu.tv
   - 分类: 新番(type=20), 番剧(type=25), 剧场(type=21)

============================================================
`);
