// 导入必要的库
import fetch from "node-fetch"
import * as cheerio from 'cheerio'
import axios from "axios"
const $print = console.log
const jsonify = JSON.stringify
const argsify = JSON.parse
const $fetch = axios                      

// 设置User Agent，模拟iPhone浏览器
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0'

let ext1 = jsonify({ url: "https://hanime1.me/watch?v=97244" })

let appConfig = {
    ver: 1,
    title: 'docker',
    site: 'https://hanime1.me',
}

async function getConfig() {
    let config = appConfig
    return jsonify(config)
}

async function getTracks(ext) {
    ext = argsify(ext)
    let tracks1 = []
	let tracks2 = []
    let url = ext.url

    const { data } = await $fetch.get(url, {
         headers: {
             'User-Agent': UA,
         },
     })

    const $ = cheerio.load(data)
    const playlist = $('.hover-video-playlist > div')
    $print(playlist.html())

    playlist.each((_, e) => {
         const name = $(e).find('.card-mobile-title').text()
         const href = $(e).find('a.overlay').attr('href')
         tracks2.push({
             name: name,
             pan: '',
             ext: {
                 url: href,
             },
         })
     })
	tracks1.push({
        name: '播放',
        pan: '',
        ext: {
            url: url,
        },
    })

    return jsonify({
        list: [
            {
                title: '当前',
                tracks1,
            },
			{
                title: '其他',
                tracks2,
            }
        ],
    })
}




async function main() {
    let result = await getTracks(ext1);
    $print(result)
}

main();