// 导入必要的库
import * as cheerio from 'cheerio'
import axios from "axios"
import fs from 'fs/promises'
const $print = console.log
const jsonify = JSON.stringify
const argsify = JSON.parse
const $fetch = axios
// const data = await fs.readFile('html.html', 'utf-8')                     
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/604.1.14 (KHTML, like Gecko)'
const {data: data1} = await $fetch.get('https://surrit.com/7d789f8b-7faa-4ca3-b1b0-8eccd410677f/playlist.m3u8', {
    headers: {
        'User-Agent': UA,
    }
})
// 按行分割字符串
const lines = data1.split('\n');

// 过滤出包含 '/video.m3u8' 的行
const matches = lines.filter(line => line.includes('/video.m3u8'));

// 输出结果
$print(matches)