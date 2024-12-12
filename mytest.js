// 导入必要的库
import * as cheerio from 'cheerio'
import axios from 'axios'
const $print = console.log
const jsonify = JSON.stringify
const argsify = JSON.parse
const $fetch = axios

// 设置User Agent，模拟iPhone浏览器
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0'

let appConfig = {
    ver: 1,
    title: '桃花族',
    // 40thz.com
    site: 'http://7340hsck.cc',
}

async function getTabs() {
    let list = []

    try {
        const { data } = await $fetch.get(appConfig.site, {
            headers: {
                'User-Agent': UA,
            },
        })
        $print(data)
        if (data.includes('hao123')) {
            const { data } = await $fetch.get(appConfig.site, {
                headers: {
                    'User-Agent': UA,
                },
            })
        }
        const $ = cheerio.load(data)

        let allClass = $('.stui-pannel__menu li')
        allClass.each((_, e) => {
            const text = $(e).find('a').text()
            const span = $(e).find('a span').text()
            const href = $(e).find('a').attr('href')

            list.push({
                name: text.replace(span, ''),
                ext: {
                    typeurl: href,
                },
                ui: 1,
            })
        })
    } catch (error) {
        $print(error)
    }

    return list
}

async function getConfig() {
    let config = appConfig
    config.tabs = await getTabs()
    return jsonify(config)
}

async function main() {
    result = await getConfig();
    $print(result)
}

main();