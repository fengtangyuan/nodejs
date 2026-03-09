//from y佬
const cheerio = createCheerio();
const CryptoJS = createCryptoJS();

let appConfig = {
    ver: 20260204,
    title: 'javxx',
    site: 'https://javxx.com',
};
let header = {
    'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
};

async function getConfig() {
    let config = appConfig;
    config.tabs = await getTabs();
    return jsonify(config)
}

async function getTabs() {
    let list = [
        {
            name: '热门',
            ext: {
                url: `${appConfig.site}/cn/hot`,
            },
            ui: 1,
        },
        {
            name: '最新',
            ext: {
                url: `${appConfig.site}/cn/new`,
            },
            ui: 1,
        },
        {
            name: '最近',
            ext: {
                url: `${appConfig.site}/cn/recent`,
            },
            ui: 1,
        },
        {
            name: '有码',
            ext: {
                url: `${appConfig.site}/cn/censored`,
            },
            ui: 1,
        },
        {
            name: '无码',
            ext: {
                url: `${appConfig.site}/cn/uncensored`,
            },
            ui: 1,
        },
    ];

    return list
}

async function getCards(ext) {
    ext = argsify(ext);
    let cards = [];
    let { page = 1, url } = ext;

    if (page > 1) {
        url += `?page=${page}`;
    }

    const { data } = await $fetch.get(url, {
        headers: header,
    });

    const $ = cheerio.load(data);

    $('.vid-items > div.item').each((_, element) => {
        const href = $(element).find('.title').attr('href');
        const title = $(element).find('.title').text();
        const cover = $(element).find('.image > img').attr('src');
        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_duration: $(element).find('.duration').text(),
            ext: {
                url: href,
            },
        });
    });

    return jsonify({
        list: cards,
    })
}

async function getTracks(ext) {
    ext = argsify(ext);
    let tracks = [];
    let url = appConfig.site + ext.url;

    const { data } = await $fetch.get(url, {
        headers: header,
    });

    const $ = cheerio.load(data);

    // get token
    let dataUrl = $('#video-files div').attr('data-url');
    let decodeUrl = deUrl(dataUrl);
    let vid = decodeUrl.split('/').pop().split('?')[0];
    let token = encryptVid(vid);

    // get url
    let res = (
        await $fetch.get(`https://surrit.store/stream?src=javxx&poster=&token=${token}`, {
            headers: header,
        })
    ).data;
    let encryptedUrl = JSON.parse(res).result.media;
    let decryptedMedia = decryptMedia(encryptedUrl);
    let playUrl = JSON.parse(decryptedMedia).stream;
    let subtitle = JSON.parse(decryptedMedia).vtt;

    tracks.push({
        name: `播放`,
        ext: {
            playUrl,
            subtitle,
        },
    });

    function _atob(b64) {
        var chars = {
            ascii: function () {
                return 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
            },
            indices: function () {
                if (!this.cache) {
                    this.cache = {};
                    var ascii = chars.ascii();

                    for (var c = 0; c < ascii.length; c++) {
                        var chr = ascii[c];
                        this.cache[chr] = c;
                    }
                }
                return this.cache
            },
        };
        var indices = chars.indices(),
            pos = b64.indexOf('='),
            padded = pos > -1,
            len = padded ? pos : b64.length,
            i = -1,
            data = '';

        while (i < len) {
            var code =
                (indices[b64[++i]] << 18) | (indices[b64[++i]] << 12) | (indices[b64[++i]] << 6) | indices[b64[++i]];
            if (code !== 0) {
                data += String.fromCharCode((code >>> 16) & 255, (code >>> 8) & 255, code & 255);
            }
        }

        if (padded) {
            data = data.slice(0, pos - b64.length);
        }

        return data
    }

    function deUrl(encodedStr) {
        const decodedStr = _atob(encodedStr);

        const key = 'G9zhUyphqPWZGWzZ';

        let result = '';

        for (let i = 0; i < decodedStr.length; i++) {
            const keyChar = key[i % key.length];
            const decryptedChar = String.fromCharCode(decodedStr.charCodeAt(i) ^ keyChar.charCodeAt(0));
            result += decryptedChar;
        }

        return decodeURIComponent(result)
    }

    function encryptVid(videoId, key = 'ym1eS4t0jTLakZYQ') {
        let result = [];

        for (let i = 0; i < videoId.length; i++) {
            const keyByte = key.charCodeAt(i % key.length);
            const encryptedChar = videoId.charCodeAt(i) ^ keyByte;
            result.push(encryptedChar);
        }

        // Convert to Base64
        const wordArray = CryptoJS.lib.WordArray.create(Uint8Array.from(result));
        return CryptoJS.enc.Base64.stringify(wordArray)
    }

    function decryptMedia(encryptedMedia, key = 'ym1eS4t0jTLakZYQ') {
        const binary = _atob(encryptedMedia);

        let result = '';

        for (let i = 0; i < binary.length; i++) {
            result += String.fromCharCode(binary.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }

        return decodeURIComponent(result)
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
    ext = argsify(ext);
    const playUrl = ext.playUrl;

    return jsonify({
        urls: [playUrl],
        headers: [
            { 'User-Agent': header['User-Agent'], origin: 'https://surrit.store', referer: 'https://surrit.store/' },
        ],
    })
}

async function search(ext) {
    ext = argsify(ext);
    let keyword = ext.keyword || '';
    let page = ext.page || 1;
    let cards = [];
    let url = `${appConfig.site}/cn/search/?keyword=${encodeURIComponent(keyword)}&page=${page}`;
    const { data } = await $fetch.get(url, {
        headers: header,
    });

    const $ = cheerio.load(data);

    $('.vid-items > div.item').each((_, element) => {
        const href = $(element).find('.title').attr('href');
        const title = $(element).find('.title').text();
        const cover = $(element).find('.image > img').attr('src');
        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_duration: $(element).find('.duration').text(),
            ext: {
                url: href,
            },
        });
    });

    return jsonify({
        list: cards,
    })
}

