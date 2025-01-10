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

let text = encodeURIComponent('偷窥者')
let url = `http://tg.fish2018.us.kg?wd=${text}`

const { data } = await $fetch.get(url, {
    headers: {
        'User-Agent': UA,
    },    
})

$print(data)