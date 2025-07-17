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
let appConfig = {
  ver: 1,
  title: '大师兄',
  site: 'https://dsxys.com',
  tabs: [
    {
      name: '电影',
      ui: 1,
      ext: {
        id: '/vodshow/1--time------p---',
      },
    },
    {
      name: '电视剧',
      ui: 1,
      ext: {
        id: '/vodshow/2--time------p---',
      },
    },
    {
      name: '综艺',
      ui: 1,
      ext: {
        id: '/vodshow/3--time------p---',
      },
    },
    {
      name: '动漫',
      ui: 1,
      ext: {
        id: '/vodshow/4--time------p---',
      },
    },
  ],
}

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
          url: `${appConfig.site}${href}`,
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
async function getPlayinfo() {

  const data = html
  let urlencoded = data.match(/"url"\s*:\s*"(JT[^"]+)"/)[1];
  console.log(urlencoded);
  let decodedUrl = urlDecode(urlencoded);
  return jsonify({
    urls: [decodedUrl],
  })
}

function urlDecode(str) {

  let decoded;
  try {
    decoded = atob(str);
  } catch (e) {
    //$utils.toastError(`播放地址解析失败`);
  }

  // 然后尝试URL解码解码后的结果
  if (decoded) {
    try {
      const urlDecoded = decodeURIComponent(decoded);
      return urlDecoded;
    } catch (e) {
      $utils.toastError(`播放地址解码失败`);
    }
  }
}

async function search(ext) {
  let cards = []

  let text = encodeURIComponent(ext.text)
  let page = ext.page || 1
  let url = `${appConfig.site}/sb/kemksmaksdl7nhZe3c1${text}-/page/${page}.html`
  console.log(url)
  const { data } = await $fetch.get(url, {
    headers: {
      'User-Agent': UA,
    },
  })
  console.log(data)
  const $ = cheerio.load(data)

  $('.module-card-item-poster').each((_, element) => {
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

let ext1 = {
  text: '复仇者',
  page: 1,
}
console.log(await search(ext1)); // 调用 getPlayinfo 函数并打印结果

//https://dsxys.com/sb/kemksmaksdl7nhZe3c1%E5%A4%8D%E4%BB%87%E8%80%85-/page/1.html
//https://dsxys.com/sb/kemksmaksdl7nhZe3c1%E5%A4%8D%E4%BB%87%E8%80%85-/page/1.html