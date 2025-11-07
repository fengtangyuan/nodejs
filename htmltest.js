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
async function getTracks() {
  let cards = []

  const $ = cheerio.load(html)
  $('.search-list').each((_, each) => {
    cards.push({
      vod_id: $(each).find('a').eq(0).attr('href'),
      vod_name: $(each).find('.slide-info-title').text(),
      vod_pic: $(each).find('img.gen-movie-img').attr('data-src'),
      vod_remarks: $(each).find('.slide-info-remarks.cor5').text(),
      ext: {
        url: $(each).find('a').eq(0).attr('href'),
      },
    })
  })

  return jsonify({
    list: cards,
  })
}

try {
  const result = await getTracks()
  console.log(result)
} catch (error) {
  console.error('Error:', error)
}

