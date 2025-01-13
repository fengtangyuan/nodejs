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

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0'

let headers = {
    'Referer': 'https://pan.quark.cn/',
    'Origin': 'https://pan.quark.cn',
    'User-Agent': UA,
}

let body = {pwd_id: "6cf41768a877", passcode: ""}

let url = `https://drive-h.quark.cn/1/clouddrive/share/sharepage/token?pr=ucpro&fr=pc&uc_param_str=&__dt=17974&__t=${Date.now()}`

const {data} =  await $fetch.post(url, body, {headers: headers})

$print(data)