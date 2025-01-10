// 导入必要的库
import * as cheerio from 'cheerio'
import axios from "axios"
import fs from 'fs/promises'
const $print = console.log
const jsonify = JSON.stringify
const argsify = JSON.parse
const $fetch = axios 
// const data = await fs.readFile('html.html', 'utf-8')                     

// 设置User Agent
const UA = 'MOBILE_UA'

const key = encodeURIComponent('魔幻手机逆袭天下')
const url = `https://t.me/s/QuarkFree?q=${key}`
const { data } = await $fetch.get(url, {
    headers: {
        'User-Agent': UA,
    },
})
const $ = cheerio.load(data)
$('div.tgme_widget_message_bubble').each((_, element) => {
    const title = $(element).find('.tgme_widget_message_text mark').text()
    const hrefs = []
    $(element).find('.tgme_widget_message_text a').each((_, element) => {
        const href = $(element).attr('href')
        if (href.includes('t.me')) return
        hrefs.push(href)
    })
    const cover = $(element).find('.tgme_widget_message_photo_wrap').attr('style').match(/image\:url\('(.+)'\)/)[1]

    $print(hrefs, title, cover)
})