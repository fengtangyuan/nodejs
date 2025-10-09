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
  let groups = []

  const $ = cheerio.load(html)
  let gn = []
  $('a.swiper-slide').each((_, each) => {
    gn.push($(each).text().replace(/[0-9]/g, ''))
  })

  $('ul.anthology-list-play').each((i, each) => {
    let group = {
      title: gn[i],
      tracks: [],
    }
    $(each).find('li.bj3 > a').each((_, item) => {
      group.tracks.push({
        name: $(item).text(),
        pan: '',
        ext: {
          url: $(item).attr('href')
        }
      })
    })
    groups.push(group)
  })

  console.log(jsonify({ list: groups }))

}

await getTracks()

