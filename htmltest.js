import * as cheerio from 'cheerio';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
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

async function getCards() {
  let cards = []
  const $ = cheerio.load(html)
  $('.module > a').each((_, element) => {
    const href = $(element).attr('href')
    const title = $(element).find('img').attr('alt')
    const cover = $(element).find('img').attr('data-original')
    const subTitle = $(element).find('.module-item-note').text()
    cards.push({
      vod_id: href,
      vod_name: title,
      vod_pic: cover,
      vod_remarks: subTitle,
      ext: {
        url: href,
      },
    })
  })

  return jsonify({
    list: cards,
  })
}
async function getTracks() {
  let list = []
  const $ = cheerio.load(html)

  $('.module-play-list').each((i, element) => {
    let temp = []
    $(element).find('a').each((_, e) => {
      const name = $(e).find('span').text()
      const href = $(e).attr('href')
      temp.push({
        name: name,
        pan: '',
        ext: {
          url: `${href}`,
        },
      })
    })
    list.push({
      title: '播放源' + (i + 1),
      tracks: temp,
    })
  })
  return jsonify({
    list: list,
  })
}

let url = 'JTY4JTc0JTc0JTcwJTczJTNBJTJGJTJGJTc2JTJFJTZDJTdBJTYzJTY0JTZFJTMyJTM2JTJFJTYzJTZGJTZEJTJGJTMyJTMwJTMyJTM1JTMwJTM3JTMxJTMzJTJGJTMyJTM0JTMyJTMzJTMzJTVGJTY0JTM5JTYzJTM2JTM1JTYxJTMwJTMwJTJGJTY5JTZFJTY0JTY1JTc4JTJFJTZEJTMzJTc1JTM4'

function urlDecode(str) {

  // 首先尝试base64解码
  let decoded;
  try {
    decoded = CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(str));
  } catch (e) {
    //$utils.toastError(`播放地址解析失败`);
  }

  // 然后尝试URL解码解码后的结果
  if (decoded) {
    try {
      const urlDecoded = decodeURIComponent(decoded);
    } catch (e) {
      $utils.toastError(`播放地址解码失败`);
    }
  }
  return decoded;
}

console.log(urlDecode(url))

