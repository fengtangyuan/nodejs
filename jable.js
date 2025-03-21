
const cheerio = createCheerio()
const $config = argsify($config_str)

const UA =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/604.1.14 (KHTML, like Gecko)'

let appConfig = {
    ver: 1,
    title: 'jable',
    site: 'https://jable.tv',
}

async function getConfig() {
    let config = appConfig
    config.tabs = await getTabs()
    return jsonify(config)
}

async function getTabs() {
    let list = []
    let ignore = ['首页']
    function isIgnoreClassName(className) {
        return ignore.some((element) => className.includes(element))
    }
    let classurl = `${appConfig.site}/categories/?mode=async&function=get_block&block_id=list_categories_video_categories_list&sort_by=avg_videos_popularity`

    const { data } = await $fetch.get(classurl, {
        headers: {
            'User-Agent': UA,
        },
    })
    if (data.includes('Just a moment...')) {
        $utils.openSafari(classurl, UA)
    }
    const $ = cheerio.load(data)

    let allClass = $('.container .col-6.col-sm-4.col-lg-3')
    allClass.each((_, e) => {
        const name = $(e).find('h4').text()
        const href = $(e).find('a').attr('href')
        const isIgnore = isIgnoreClassName(name)
        if (isIgnore) return

        list.push({
            name,
            ext: {
                typeurl: href,
            },
            ui: 1,
        })
    })
    if ($config.enload) {
        list.push({
            name: '我的收藏',
            ext: {
                typeurl: `${appConfig.site}/my/`,
            },
            ui: 1,
        })
    }
    return list
}

async function getCards(ext) {
    ext = argsify(ext)
    let cards = []
    let url = ''
    let { page = 1, typeurl } = ext

    if (typeurl.includes ("/my/")) { 
        url = 
            typeurl + 
            `?mode=async&function=get_block&block_id=list_videos_my_favourite_videos&fav_type=0&playlist_id=0&sort_by=&from_my_fav_videos=${page}&_=${Date.now()}`
    } else {
        url =
            typeurl +
            `?mode=async&function=get_block&block_id=list_videos_common_videos_list&sort_by=post_date&from=${page}&_=${Date.now()}`
    }
    let tempdata
    try{
        const { data } = await $fetch.get(url, {
            headers: {
                'User-Agent': UA,
                'referer': `${typeurl}`,
                'Origin': 'https://jable.tv',
                'X-requested-with': 'XMLHttpRequest'
            },
        })
        tempdata = data
    }catch(e){
        $utils.toastError(e.message)
        $utils.openSafari(appConfig.site, UA)
    }
    if (tempdata.includes('Just a moment...')) {
        $utils.openSafari(url, UA)
    }
    const $ = cheerio.load(tempdata)

    $('#list_videos_common_videos_list .container .row > div').each(
        (_, element) => {
            const href = $(element).find('.title a').attr('href')
            const title = $(element).find('.title a').text()
            const cover = $(element).find('.img-box img').attr('data-src')
            const duration = $(element).find('.label').text()

            cards.push({
                vod_id: href,
                vod_name: title,
                vod_pic: cover,
                vod_duration: duration,
                ext: {
                    url: href,
                },
            })
        }
    )

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
        },
    })
    if (data.includes('Just a moment...')) {
        $utils.openSafari(url, UA)
    }
    const $ = cheerio.load(data)
    let script = $('#site-content .container .col')
        .eq(0)
        .find('section')
        .eq(0)
        .find('script:last')
        .text()
    let playUrl = script.match(/var hlsUrl = '(.*)';/)[1]

    tracks.push({
        name: '播放',
        pan: '',
        ext: {
            url: playUrl,
        },
    })

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

    return jsonify({ urls: [url] })
}

async function search(ext) {
    ext = argsify(ext)
    let cards = []

    let text = encodeURIComponent(ext.text)
    let page = ext.page || 1
    let url = `${appConfig.site
        }/search/${text}/?mode=async&function=get_block&block_id=list_videos_videos_list_search_result&q=${text}&sort_by=&from=${page}&_=${Date.now()}`

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })

    const $ = cheerio.load(data)

    $('#list_videos_videos_list_search_result .container .row > div').each(
        (_, element) => {
            const href = $(element).find('.title a').attr('href')
            const title = $(element).find('.title a').text()
            const cover = $(element).find('.img-box img').attr('data-src')
            const duration = $(element).find('.label').text()

            cards.push({
                vod_id: href,
                vod_name: title,
                vod_pic: cover,
                vod_duration: duration,
                ext: {
                    url: href,
                },
            })
        }
    )

    return jsonify({
        list: cards,
    })
}
