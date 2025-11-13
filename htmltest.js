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
  let groups = [];
  let gn = { 'pan.quark.cn': '夸克网盘', 'pan.baidu.com': '百度网盘', 'drive.uc.cn': 'UC网盘' };


  const $ = cheerio.load(html)
  const playlist = $('.pan-links');

  if (playlist.length === 0 || playlist.find('li').length === 0) {
    $utils.toastError('没有网盘资源');
    return jsonify({ list: [] });
  }

  playlist.each((_, e) => {
    $(e).find('li a').each((_, link) => {
      const pan_type = $(link).attr('data-link');
      const href = $(link).attr('href');
      // 提取 movie_title 参数并去掉所有空格和特殊符号
      const match = href.match(/[?&]movie_title=([^&]+)/);
      let name = match ? decodeURIComponent(match[1]) : '';
      // 去掉不间断空格及所有空白字符
      name = name.replace(/\u00A0/g, '').replace(/\s+/g, '');
      // 只保留中文、英文字母和数字，移除其它特殊符号
      name = name.replace(/[^\p{L}\p{N}\u4e00-\u9fa5]+/gu, '');
      const title = gn[pan_type];
      let track = {
        name: name,
        pan: href
      };
      let target = groups.find(g => g.title === title);
      if (!target) {
        target = { title: title, tracks: [] };
        groups.push(target);
      }
      target.tracks.push(track);
    });
  });

  return jsonify({ list: groups })
}

try {
  const result = await getTracks()
  console.log(result)
} catch (error) {
  console.error('Error:', error)
}

