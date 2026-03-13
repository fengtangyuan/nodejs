
// ============================================
// 嗷呜动漫爬虫 - 解密后的代码
// ============================================

const cheerio = createCheerio();
const CryptoJS = createCryptoJS();

let $config = argsify($config_str);
const SITE = $config['site'] || 'https://www.aowu.tv';
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

const headers = {
    'Referer': SITE + '/',
    'Origin': SITE,
    'User-Agent': UA
};

const appConfig = {
    'ver': 1,
    'title': "嗷呜动漫",
    'site': SITE,
    'tabs': [
        { 'name': '新番', 'ext': { 'type': 'type=20' } },
        { 'name': '番剧', 'ext': { 'type': 'type=21' } },
        { 'name': '剧场', 'ext': { 'type': 'type=22' } }
    ]
};

// 获取配置
async function getConfig() {
    return jsonify(appConfig);
}

// 获取卡片列表
async function getCards(ext) {
    ext = argsify(ext);
    let list = [];
    const url = appConfig["site"] + "/index.php/ds_api/vod";
    const page = ext["page"] || 1;
    const params = ext['type'] + '&class=&area=&year=&lang=&version=&state=&letter=&time=&level=0&weekday=&by=time&page=' + page;

    const { data } = await $fetch.post(url, params, { 'headers': headers });

    argsify(data)["list"]["forEach"](item => {
        list.push({
            'vod_id': item["vod_id"]["toString"](),
            'vod_name': item["vod_name"],
            'vod_pic': item["vod_pic"],
            'vod_remarks': item["vod_remarks"],
            'ext': { 'url': appConfig["site"] + item["url"] }
        });
    });

    return jsonify({ 'list': list });
}

// 获取播放轨道
async function getTracks(ext) {
    ext = argsify(ext);
    let result = [];
    const url = ext["url"];

    const { data } = await $fetch.get(url, { 'headers': headers });
    const $ = cheerio["load"](data);

    let titles = [];

    // 提取线路标题
    $("a.swiper-slide").each((i, elem) => {
        const title = $(elem).text().trim().replace(/\s+/g, '').substring(0, 20);
        if (title) titles.push(title);
    });

    // 提取播放链接
    $("div.anthology-list-box").each((i, elem) => {
        let tracks = [];

        $(elem).find("ul.anthology-list-play li a").each((j, linkElem) => {
            const name = $(linkElem).text().trim();
            const href = $(linkElem).attr('href');
            if (!href) return;

            // 提取集数
            let match = name.match(/\d+/);
            if (match) {
                name = match[0].padStart(2, '0');
            }

            tracks.push({
                'name': name,
                'pan': '',
                'ext': { 'url': appConfig['site'] + href }
            });
        });

        if (tracks.length === 0) return;

        // 排序
        tracks.sort((a, b) => parseInt(a.name) - parseInt(b.name));

        result.push({
            'title': titles[i] || '线路' + (i + 1),
            'tracks': tracks
        });
    });

    return jsonify({ 'list': result });
}

// 获取播放信息
async function getPlayinfo(ext) {
    ext = argsify(ext);
    let url = ext['url'];

    const { data } = await $fetch['get'](url, { 'headers': headers });
    const playerData = JSON["parse"](data.match(/player_aaaa=(.+?)<\/script>/)[1]);

    // 解密URL
    if (playerData['encrypt'] == '1') {
        playerData["url"] = unescape(playerData["url"]);
    } else if (playerData["encrypt"] == '2') {
        playerData['url'] = unescape(base64decode(playerData['url']));
    }

    // 请求加密接口
    const plainData = 'plain=' + playerData["url"];
    const { data: encodeData } = await $fetch['post'](appConfig["site"] + '/player1/encode.php', plainData, { 'headers': headers });

    // 构建解密请求URL
    const decodeUrl = appConfig['site'] + "/player1/?url=" + encodeURIComponent(argsify(encodeData)["url"]) +
        '&ts=' + encodeURIComponent(argsify(encodeData)['ts']) +
        "&sig=" + encodeURIComponent(argsify(encodeData)['sig']);

    const { data: decryptPage } = await $fetch.get(decodeUrl, { 'headers': headers });

    // 提取加密参数
    const encryptedUrl = decryptPage["match"](/const\s+encryptedUrl\s*=\s*"([^"]+)"/)?.[1];
    const sessionKey = decryptPage["match"](/const\s+sessionKey\s*=\s*"([^"]+)"/)?.[1];

    // AES解密
    const playUrl = decryptAES(encryptedUrl, sessionKey);

    $print(playUrl);
    return jsonify({ 'urls': [playUrl] });
}

// AES解密函数
function decryptAES(encryptedData, key) {
    try {
        const parsedData = CryptoJS["enc"]["Base64"]["parse"](encryptedData);
        const iv = CryptoJS["lib"]["WordArray"]["create"](parsedData["words"]["slice"](0, 4));
        const ciphertext = CryptoJS["lib"]["WordArray"]["create"](parsedData["words"]['slice'](4));

        const decrypted = CryptoJS['AES']["decrypt"](
            { 'ciphertext': ciphertext },
            CryptoJS['enc']["Utf8"]["parse"](key),
            {
                'iv': iv,
                'mode': CryptoJS["mode"]['CBC'],
                'padding': CryptoJS["pad"]["Pkcs7"]
            }
        );

        return decrypted["toString"](CryptoJS["enc"]["Utf8"]);
    } catch (error) {
        console["error"]("URL解密失败", error);
        return null;
    }
}

// 搜索功能
async function search(ext) {
    ext = argsify(ext);
    let list = [];
    const keyword = encodeURIComponent(ext["text"]);
    const page = ext["page"] || 1;

    const url = appConfig["site"] + "/vods/page/" + page + "/wd/" + keyword;
    const { data } = await $fetch.get(url, { 'headers': headers });
    const $ = cheerio['load'](data);

    $("div.vod-detail").each((i, elem) => {
        const $elem = $(elem);
        const vodId = $elem.find('.detail-info > a').first().attr('href') || '';
        const titleElem = $elem.find('.detail-info > a');
        const imgElem = $elem.find('.detail-pic img');

        const pic = imgElem.attr('data-src') ||
            imgElem.attr('data-original') ||
            imgElem.attr('src') || '';

        list.push({
            'vod_id': vodId,
            'vod_name': $elem.find('h3.slide-info-title').text().trim(),
            'vod_pic': pic,
            'vod_remarks': $elem.find('span.slide-info-remarks').first().text().trim(),
            'ext': { 'url': appConfig["site"] + vodId }
        });
    });

    return jsonify({ 'list': list });
}

// Base64解码函数
function base64decode(data) {
    const lookup = new Array(
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57,
        58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
        15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33,
        34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1
    );

    for (let c1, c2, c3, c4, len = data["length"], i = 0, result = ''; i < len;) {
        do {
            c1 = lookup[0xff & data["charCodeAt"](i++)];
        } while (i < len && c1 === -1);

        if (c1 === -1) break;

        do {
            c2 = lookup[0xff & data["charCodeAt"](i++)];
        } while (i < len && c2 === -1);

        if (c2 === -1) break;

        result += String["fromCharCode"]((c1 << 2) | ((c2 & 48) >> 4));

        do {
            c3 = data["charCodeAt"](i++);
            if (c3 === 61) return result;

            c3 = lookup[c3];
        } while (i < len && c3 === -1);

        if (c3 === -1) break;

        result += String['fromCharCode'](((c2 & 15) << 4) | ((c3 & 60) >> 2));

        do {
            c4 = data["charCodeAt"](i++);
            if (c4 === 61) return result;

            c4 = lookup[c4];
        } while (i < len && c4 === -1);

        if (c4 === -1) break;

        result += String["fromCharCode"](((c3 & 3) << 6) | c4);
    }

    return result;
}
