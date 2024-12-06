// 导入必要的库
//import cheerio from 'cheerio'
//import axios from 'axios' // 用于发送HTTP请求
const $print = console.log
const jsonify = JSON.stringify
const argsify = JSON.parse
//const $fetch = axios

// 设置User Agent，模拟iPhone浏览器
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1'
let appConfig = {
    ver: 1,
    title: 'pornhub',
    site: 'https://cn.pornhub.com',
    tabs: [
        {
            name: 'home',
            ext: {
                id: 'sy',
            },
            ui: 1,
        },
        {
            name: 'newest',
            ext: {
                id: 'cm',
            },
            ui: 1,
        },
        {
            name: 'most viewed',
            ext: {
                id: 'mv',
            },
            ui: 1,
        },
        {
            name: 'hottest',
            ext: {
                id: 'ht',
            },
            ui: 1,
        },
        {
            name: 'top rated',
            ext: {
                id: 'tr',
            },
            ui: 1,
        },
    ],
}
let ext = appConfig.tabs[0].ext

let { page = 1, id } = ext

let url = `${appConfig.site}`

if (id === 'sy') {
    url = `${appConfig.site}/video?`
    if (page > 1) {
        url = url + `page=${page}`
    }
} else {
    url = `${appConfig.site}/video?o=${id}`
    if (page > 1) {
        url = url + `&page=${page}`
    }
}

$print(url)