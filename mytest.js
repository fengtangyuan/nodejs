// 导入必要的库
import * as cheerio from 'cheerio'
import axios from 'axios'
import fs from 'fs'
const $print = console.log
const jsonify = JSON.stringify
const argsify = JSON.parse
const $fetch = axios

// 设置User Agent，模拟iPhone浏览器
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0'

let ext1 = jsonify({ "page": 2, "url": "https://rou.video/t/國產AV" })
let ext2 = jsonify({ "url": "https://missav.com/start-220-chinese-subtitle" })

let appConfig = {
    ver: 1,
    title: '肉视频',
    // 40thz.com
    site: 'https://rou.video',
}

async function getConfig() {
    let config = appConfig
    config.tabs = await getTabs()
    return jsonify(config)
}

async function getTabs() {
    let list = []
    let ignore = ['首頁', '分類', '搜索']
    function isIgnoreClassName(className) {
        return ignore.some((element) => className.includes(element))
    }

    const { data } = await $fetch.get(`${appConfig.site}/home`, {
        headers: {
            'User-Agent': UA,
        },
    })
    const $ = cheerio.load(data)

    let $allClass = $('.drawer-side div ul > li > a')
    $allClass.each((i, e) => {
        const name = $(e).text()
        const href = $(e).attr('href')
        const isIgnore = isIgnoreClassName(name)
        if (isIgnore) return

        list.push({
            name,
            ext: {
                url: appConfig.site + href,
            },
        })
    })

    return list
}

async function getCards(ext) {
    ext = argsify(ext)
    let cards = []
    let { page = 1, url } = ext

    if (page > 1) {
        url += `?order=createdAt&page=${page}`
    }

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })


    const $ = cheerio.load(data)

    $('.grid.grid-cols-2.gap-1.mb-6 > div').each((_, element) => {
        if ($(element).find('.relative').length == 0) return
        const href = $(element).find('.relative a').attr('href')
        const title = $(element).find('img').attr('alt')
        const cover = $(element).find('img').attr('src')
        const subTitle = $(element).find('.relative a > div:eq(1)').text()
        const hdinfo = $(element).find('.relative a > div:first').text()
        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_remarks: subTitle || hdinfo,
            ext: {
                url: appConfig.site + href,
            },
        })
    })

    return jsonify({
        list: cards,
    })
}

async function getTracks(ext) {
    ext = argsify(ext)
    let url = ext.url
    let m3u8Prefix = 'https://surrit.com/'
    let m3u8Suffix = '/playlist.m3u8'
    let uuid = 1
    let tracks = []

    fs.readFile('./html.html', 'utf8', (err, data) => {

        const match2 = data.match(/https\|video\|(.+)\|source1280/)
        $print(match2[1])


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
    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })
    const playurl = data.video.videoUrl
    return jsonify({ urls: [playurl], headers: [{ 'User-Agent': UA }] })
}

async function main() {
    let result = await getTracks(ext2);
    $print(result)
}

main();