/**
 * ============================================================
 * aowuj.js 解密还原脚本 (参考 czzy.js 风格)
 * ============================================================
 * 站点: https://www.aowu.tv
 * 加密方式: jsjiami.com.v7 (字符串混淆 + RC4)
 * ============================================================
 */

const cheerio = createCheerio();
const CryptoJS = createCryptoJS();

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/604.1.14 (KHTML, like Gecko)';

const SITE = 'https://www.aowu.tv';

const headers = {
    'Referer': SITE + '/',
    'Origin': SITE,
    'User-Agent': UA
};

let appConfig = {
    ver: 1,
    title: '嗷呜动漫',
    site: SITE,
    tabs: [
        { name: '新番', ext: { type: 'type=20' } },
        { name: '番剧', ext: { type: 'type=21' } },
        { name: '剧场', ext: { type: 'type=22' } }
    ]
};

// ============================================================
// getConfig - 获取站点配置
// ============================================================
async function getConfig() {
    return jsonify(appConfig);
}

// ============================================================
// getCards - 获取视频卡片列表
// ============================================================
async function getCards(ext) {
    ext = argsify(ext);
    let cards = [];

    let url = appConfig.site + '/index.php/ds_api/vod';
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
// getTracks - 获取播放轨道 (解析详情页)
// ============================================================
async function getTracks(ext) {
    ext = argsify(ext);
    let tracks = [];
    let url = ext.url;

    const { data } = await $fetch.get(url, { headers: headers });
    const $ = cheerio.load(data);

    let lineTitles = [];

    // 获取线路标题 - 尝试多种可能的选择器
    const titleSelectors = [
        '.module-tab-item',
        '.module-blocklist-head',
        '.module-item-title',
        '.play_title'
    ];

    let titleSelector = null;
    for (const selector of titleSelectors) {
        if ($(selector).length > 0) {
            titleSelector = selector;
            break;
        }
    }

    if (titleSelector) {
        $(titleSelector).each((_, e) => {
            let title = $(e).text().trim().split('\n')[0];
            if (title) lineTitles.push(title);
        });
    }

    // 处理每个播放列表 - 尝试多种可能的选择器
    const listSelectors = [
        '.module-play-list',
        '.module-blocklist',
        '.play_list',
        '.module-list'
    ];

    let listSelector = null;
    for (const selector of listSelectors) {
        if ($(selector).length > 0) {
            listSelector = selector;
            break;
        }
    }

    if (listSelector) {
        $(listSelector).each((index, e) => {
            let lineTracks = [];

            // 查找播放链接 - 尝试多种可能的选择器
            const linkSelectors = [
                '.module-play-list-link',
                'a',
                '.module-blocklist-item',
                '.module-list-item'
            ];

            for (const linkSel of linkSelectors) {
                const links = $(e).find(linkSel);
                if (links.length > 0) {
                    links.each((_, link) => {
                        let name = $(link).text().trim();
                        let href = $(link).attr('href');

                        if (!href) return;

                        // 提取集数，如 "第1集" -> "01"
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
                    break;
                }
            }

            if (lineTracks.length === 0) return;

            // 按集数排序
            lineTracks.sort((a, b) => parseInt(a.name) - parseInt(b.name));

            tracks.push({
                title: lineTitles[index] || '线路' + (index + 1),
                tracks: lineTracks
            });
        });
    }

    return jsonify({ list: tracks });
}

// ============================================================
// getPlayinfo - 获取真实播放地址 (多层解密)
// ============================================================
async function getPlayinfo(ext) {
    ext = argsify(ext);
    let url = ext.url;

    // 1. 获取播放页面
    let { data } = await $fetch.get(url, { headers: headers });

    // 2. 提取 player_aaaa JSON 配置
    let playerConfig = JSON.parse(data.match(/player_aaaa=(.+?)<\/script>/)[1]);

    // 3. 根据 encrypt 类型解密 URL
    if (playerConfig.encrypt == '1') {
        playerConfig.url = unescape(playerConfig.url);
    } else if (playerConfig.encrypt == '2') {
        playerConfig.url = unescape(base64decode(playerConfig.url));
    }

    // 4. 请求 encode.php 获取加密参数
    let postData = 'plain=' + playerConfig.url;
    let { data: encodeData } = await $fetch.post(
        appConfig.site + '/player1/encode.php',
        postData,
        { headers: headers }
    );

    // 5. 构造播放器请求 URL
    encodeData = argsify(encodeData);
    let playerUrl = appConfig.site + '/player1/index.php?data=' +
        encodeURIComponent(encodeData.url) +
        '&ts=' + encodeURIComponent(encodeData.ts) +
        '&sign=' + encodeURIComponent(encodeData.sig);

    // 6. 请求播放器页面
    let { data: playerData } = await $fetch.get(playerUrl, { headers: headers });

    // 7. 提取加密 URL 和会话密钥
    const encryptedUrl = playerData.match(/const\s+encryptedUrl\s*=\s*"([^"]+)"/)?.[1];
    const sessionKey = playerData.match(/const\s+sessionKey\s*=\s*"([^"]+)"/)?.[1];

    // 8. AES 解密最终 URL
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
    let url = appConfig.site + '/vods/page/' + page + '/wd/' + text;

    const { data } = await $fetch.get(url, { headers: headers });
    const $ = cheerio.load(data);

    $('.detail-info > a').each((_, e) => {
        const item = $(e);
        const href = item.find('.module-item-picbox').attr('href') || '';
        const img = item.find('.module-item-picbox');
        const pic = img.attr('data-original') || img.attr('src') || '';

        cards.push({
            vod_id: href,
            vod_name: item.find('h3.slide-info-title').text().trim(),
            vod_pic: pic,
            vod_remarks: item.find('span.slide-info-remarks').first().text().trim(),
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
        // Base64 解码密文
        const ciphertext = CryptoJS.enc.Base64.parse(encryptedUrl);

        // 从 sessionKey 提取 IV (前4个字符作为 Hex)
        const iv = CryptoJS.enc.Hex.parse(sessionKey.slice(0, 4));

        // sessionKey 剩余部分作为密钥
        const key = CryptoJS.enc.Utf8.parse(sessionKey.slice(4));

        // AES-256-CBC 解密
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
// base64decode - Base64 解码函数 (自定义实现)
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
