// 导入必要的库
import * as cheerio from 'cheerio'; // 用于解析HTML
import axios from 'axios' // 用于发送HTTP请求

// 设置User Agent，模拟iPhone浏览器
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1'

// 应用配置对象，包含版本、标题、网站和导航标签
let appConfig = {
    ver: 1,
    title: '4k-av',
    site: 'https://4k-av.com',
    tabs: [{
        name: '首页',  // 首页标签
        ext: {
            id: 0,
            url: 'https://4k-av.com',
        },
    }, {
        name: '电影',  // 电影标签
        ext: {
            id: 1,
            url: 'https://4k-av.com/movie',
        },
    }, {
        name: '电视剧',  // 电视剧标签
        ext: {
            id: 2,
            url: 'https://4k-av.com/tv',
        },
    },],
}

// 创建缓存Map用于存储页面信息
const $cache = new Map();

// 获取配置信息的函数
async function getConfig() {
    return JSON.stringify(appConfig)
}

// 获取视频卡片列表的函数
async function getCards(ext) {
    ext = JSON.parse(ext)
    // 初始化页码缓存
    var lastPage = {
        0: 1, 1: 1, 2: 1,
    }
    // 从缓存中获取页码信息
    let val = $cache.get('av')
    if (val) {
        lastPage = JSON.parse(val)
    }

    let cards = []
    let { id, page = 1, url } = ext

    // 构建分页URL
    if (page > 1) {
        url += `/page-${lastPage[id] - page + 1}.html`
    }

    console.log(`url: ${url}`)

    // 发送HTTP请求获取页面内容
    const { data } = await axios.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })
    // 使用cheerio加载HTML
    const $ = cheerio.load(data)

    // 解析视频列表
    $('#MainContent_newestlist .virow .NTMitem').each((_, element) => {
        const href = $(element).find('.title a').attr('href')
        const title = $(element).find('.title h2').text()
        const cover = $(element).find('.poster img').attr('src')
        const subTitle = $(element).find('label[title=分辨率]').text().split('/')[0]
        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_remarks: subTitle,
            ext: {
                url: `${appConfig.site}${href}`,
            },
        })
    })

    // 获取最后一页的页码并缓存
    if (page === 1) {
        const pageNumber = $('#MainContent_header_nav .page-number').text()
        lastPage[id] = pageNumber.split('/')[1]
        const jsonData = JSON.stringify(lastPage, null, 2)
        $cache.set('av', jsonData)
    }

    return JSON.stringify({
        list: cards,
    })
}

// 获取视频播放列表的函数
async function getTracks(ext) {
    ext = JSON.parse(ext)
    let tracks = []
    let url = ext.url

    // 获取页面内容
    const { data } = await axios.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })
    const $ = cheerio.load(data)

    // 检查是否有多集
    let playlist = $('#rtlist li')
    console.log("typeof playlist:" + playlist.length);
    if (playlist.length > 0) {
        console.log(typeof playlist);

        // 遍历播放列表
        for (const element of playlist) {
            let name = $(element).find('span').text()
            let pic = $(element).find('img').attr('src')
            let url = pic.replace('screenshot.jpg', '')
            tracks.push({
                name: name,
                pan: '',
                ext: {
                    url,
                },
            })
        }
    } else {
        // 单集视频
        tracks.push({
            name: '播放',
            pan: '',
            ext: {
                url,
            },
        })
    }

    return JSON.stringify({
        list: [{
            title: '默认分组',
            tracks,
        },],
    })
}

// 获取播放信息的函数
async function getPlayinfo(ext) {
    ext = JSON.parse(ext)
    let url = ext.url.replace('www.', '')

    // 获取视频页面内容
    const { data } = await axios.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })
    const $ = cheerio.load(data)
    // 获取视频源URL
    let playUrl = $('#MainContent_videowindow video source').attr('src')

    return JSON.stringify({ urls: [playUrl] })
}

// 搜索功能实现
async function search(text) {
    let cards = []

    // URL编码搜索文本
    text = encodeURIComponent(text)
    let url = appConfig.site + `/s?k=${text}`

    // 获取搜索结果页面
    const { data } = await axios.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })

    const $ = cheerio.load(data)

    // 解析搜索结果列表
    $('#MainContent_newestlist .virow .NTMitem').each((_, element) => {
        const href = $(element).find('.title a').attr('href')
        const title = $(element).find('.title h2').text()
        const cover = $(element).find('.poster img').attr('src')
        const subTitle = $(element).find('label[title=分辨率]').text().split('/')[0]
        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_remarks: subTitle,
            ext: {
                url: `${appConfig.site}${href}`,
            },
        })
    })

    return JSON.stringify({
        list: cards,
    })
}


/***
    以下为测试代码
 */

// 测试搜索功能
/*search("首尔").then(list => {
    console.log(list)
})*/

getConfig().then(list => {
    list = JSON.parse(list)

    for (const listElement of list.tabs) {
        getCards(JSON.stringify(listElement.ext)).then(entity => {
            console.log(entity);
            // entity = JSON.parse(entity)
            // for (const entityElement of entity.list) {
            //     getTracks(JSON.stringify(entityElement.ext)).then(vod => {
            //         console.log(vod);
            //     })
            // }
            entity = JSON.parse(entity)
            for (const entityElement of entity.list) {
                getPlayinfo(JSON.stringify(entityElement.ext)).then(vod => {
                    console.log(vod);
                })
            }

        })
    }
}).catch(error => {
    console.error('Error fetching tabs:', error);
});
