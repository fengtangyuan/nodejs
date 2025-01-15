// 导入必要的库
import * as cheerio from 'cheerio'
import axios from "axios"
import fs from 'fs/promises'
const $print = console.log
const jsonify = JSON.stringify
const argsify = JSON.parse
const $fetch = axios 
const data = await fs.readFile('html.html', 'utf-8')                     

// 设置User Agent，模拟iPhone浏览器
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0'
const ext1 = jsonify({
    text: '偷窥者',
    page: 2
})

let appConfig = {
    ver: 1,
    title: 'tg搜索|夸克',
    site: 'http://192.168.152.159:8080/video/yunpanshare',
    tabs: [{
        name: '搜索',
        ui: 1,
        ext: {
            id: '',
        },
    }]
}

async function getactress() {
 
    const $ = cheerio.load(data)
    const actresss = $('.max-w-full.p-8.text-nord4.bg-nord1.rounded-lg')
    if (actresss.length == 0) {
        $print('无数据')
    }
    let list = []
	$print(actresss.html())
    actresss.find('.space-y-4').each((_, e) => {
        const href = $(e).find('a:first').attr('href').replace(`${appConfig.site}/`, '')
        const name = $(e).find('img').attr('alt')
        list.push({
            name: name,
            ext: {
                id: href,
            },
        })
    })

    return list

}


async function main() {
    let result = await getactress();
    $print(result)
}

main();