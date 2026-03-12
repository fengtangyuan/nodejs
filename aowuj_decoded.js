const cheerio = createCheerio();
const CryptoJS = createCryptoJS();

let $config = argsify($config_str);
const SITE = $config.site || 'https://www.aowu.tv';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/604.1.14 (KHTML, like Gecko)';

const headers = {
    'Referer': SITE + '/',
    'Origin': SITE,
    'User-Agent': UA
};

const appConfig = {
    ver: 1,
    title: '嗷呜动漫',
    site: SITE,
    tabs: [
        { name: '新番', ext: { type: 'type=20' } },
        { name: '番剧', ext: { type: 'type=21' } },
        { name: '剧场', ext: { type: 'type=22' } }
    ]
};

async function getConfig() {
    return jsonify(appConfig);
}

async function getCards(ext) {
    ext = argsify(ext);
    let cards = [];
    let page = ext.page || 1;
    let url = appConfig.site + '/index.php/api/vod';

    // 构造请求参数
    let postData = ext.type + '&class=&area=&year=&lang=&version=&state=&letter=&time=&level=0&weekday=&by=time&page=' + page;

    const { data } = await $fetch.post(url, postData, { headers: headers });
    let res = typeof data === 'string' ? JSON.parse(data) : data;

    if (res && res.list) {
        res.list.forEach(item => {
            cards.push({
                vod_id: item.vod_id.toString(),
                vod_name: item.vod_name,
                vod_pic: item.vod_pic,
                vod_remarks: item.vod_remarks,
                ext: {
                    url: appConfig.site + (item.url || `/index.php/vod/detail/id/${item.vod_id}.html`)
                }
            });
        });
    }

    return jsonify({ list: cards });
}

async function getTracks(ext) {
    ext = argsify(ext);
    let list = [];
    let url = ext.url;

    const { data } = await $fetch.get(url, { headers: headers });
    const $ = cheerio.load(data);

    let titles = [];
    $('.nav-tabs li a, .module-tab-item, .myui-panel_hd .nav-tabs li a').each((i, e) => {
        let title = $(e).text().trim();
        if (title) titles.push(title);
    });

    $('.tab-content .tab-pane, .module-play-list, .myui-content__list').each((i, e) => {
        let tracks = [];
        $(e).find('a').each((j, a) => {
            let name = $(a).text().trim();
            let href = $(a).attr('href');
            if (!href) return;

            // 提取数字并补齐两位，例如 "1" -> "01"
            let match = name.match(/\d+/);
            if (match) name = match[0].padStart(2, '0');

            tracks.push({
                name: name,
                pan: '',
                ext: {
                    url: appConfig.site + href
                }
            });
        });

        if (tracks.length > 0) {
            // 按照集数排序
            tracks.sort((a, b) => parseInt(a.name) - parseInt(b.name));
            list.push({
                title: titles[i] || '线路' + (i + 1),
                tracks: tracks
            });
        }
    });

    return jsonify({ list: list });
}

function base64decode(str) {
    return CryptoJS.enc.Base64.parse(str).toString(CryptoJS.enc.Utf8);
}

function decryptAES(encryptedUrl, sessionKey) {
    try {
        const ciphertextWA = CryptoJS.enc.Base64.parse(encryptedUrl);
        // IV 是密文的前 16 字节 (4 个 Word)
        const iv = CryptoJS.lib.WordArray.create(ciphertextWA.words.slice(0, 4));
        // 真正的密文是 16 字节之后的部分
        const ciphertext = CryptoJS.lib.WordArray.create(ciphertextWA.words.slice(4));
        const key = CryptoJS.enc.Utf8.parse(sessionKey);

        const decrypted = CryptoJS.AES.decrypt({ ciphertext: ciphertext }, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        console.error(e);
        return null;
    }
}

async function getPlayinfo(ext) {
    ext = argsify(ext);
    let url = ext.url;

    let { data } = await $fetch.get(url, { headers: headers });

    let match = data.match(/player_aaaa=(.+?)<\/script>/);
    if (!match) return jsonify({ urls: [] });

    let player_aaaa = JSON.parse(match[1]);
    let playUrl = player_aaaa.url;

    if (player_aaaa.encrypt == '1') {
        playUrl = unescape(playUrl);
    } else if (player_aaaa.encrypt == '2') {
        playUrl = unescape(base64decode(playUrl));
    }

    // 向 encode.php 接口请求加密的播放链接
    let postData = 'plain=' + playUrl;
    let { data: encodeRes } = await $fetch.post(appConfig.site + '/player1/encode.php', postData, { headers: headers });
    encodeRes = typeof encodeRes === 'string' ? JSON.parse(encodeRes) : encodeRes;

    // 获取最终的加密视频地址
    let reqUrl = appConfig.site + '/player1/api.php?ts=' + encodeURIComponent(encodeRes.ts) + '&sig=' + encodeURIComponent(encodeRes.sig);
    let { data: apiData } = await $fetch.get(reqUrl, { headers: headers });

    // 提取加密的 URL 和 Session Key
    const encryptedUrl = apiData.match(/const\s+encryptedUrl\s*=\s*"([^"]+)"/)?.[1];
    const sessionKey = apiData.match(/const\s+sessionKey\s*=\s*"([^"]+)"/)?.[1];

    let finalUrl = decryptAES(encryptedUrl, sessionKey);
    $print(finalUrl);

    return jsonify({ urls: [finalUrl] });
}

async function search(ext) {
    ext = argsify(ext);
    let cards = [];
    let text = encodeURIComponent(ext.text);
    let page = ext.page || 1;
    let url = appConfig.site + '/index.php/vod/search/page/' + page + '/wd/' + text + '.html';

    const { data } = await $fetch.get(url, { headers: headers });
    const $ = cheerio.load(data);

    $('.module-search-item, .myui-vodlist__media li').each((i, e) => {
        let node = $(e);
        let aNode = node.find('.detail-info > a, .detail > h3 > a, .video-info-header h3 a, .thumb > a').first();
        let href = aNode.attr('href') || node.find('a').first().attr('href') || '';
        let title = aNode.text().trim() || node.find('a').first().attr('title') || '';

        let imgNode = node.find('.module-item-pic img, .myui-vodlist__thumb');
        let pic = imgNode.attr('data-src') || imgNode.attr('data-original') || imgNode.attr('src') || '';

        let remarks = node.find('.module-item-text, .pic-text, .time').first().text().trim();

        let vod_id = '';
        let idMatch = href.match(/\/id\/(\d+)/) || href.match(/(\d+)\.html/);
        if (idMatch) vod_id = idMatch[1];

        if (vod_id) {
            cards.push({
                vod_id: vod_id,
                vod_name: title,
                vod_pic: pic,
                vod_remarks: remarks,
                ext: {
                    url: appConfig.site + href
                }
            });
        }
    });

    return jsonify({ list: cards });
}