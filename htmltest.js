import * as cheerio from 'cheerio';
import axios from "axios"
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
const $fetch = axios
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0'
//定义 jsonify 函数
function jsonify(data) {
  return JSON.stringify(data, null, 2);
}
// ES Module 下获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取同目录下的html.html文件
const htmlPath = path.join(__dirname, 'html.html')
const html = fs.readFileSync(htmlPath, 'utf-8')

//。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。//
let list = []
let ignore = ['新番預告', 'H漫畫']
function isIgnoreClassName(className) {
  return ignore.some((element) => className.includes(element))
}
const $ = cheerio.load(html);
let allClass = $('.home-genre-tabs-wrapper > a')

allClass.each((i, e) => {
  const name = $(e).text()
  const href = $(e).attr('href')
  const isIgnore = isIgnoreClassName(name)
  if (isIgnore) return

  list.push({
    name,
    ext: {
      url: encodeURI(href),
    },
  })
})

console.log(jsonify(list))