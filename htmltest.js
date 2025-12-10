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
const $config_str = { "age18": true }
let $config = { age18: true }
const appConfig = {
  ver: 1,
  title: "youknow_兔",
  site: "https://www.youknow.tv",
  tabs: [{
    name: '剧集',
    ext: {
      url: 'https://www.youknow.tv/show/1--------{page}---/'
    },
  }, {
    name: '电影',
    ext: {
      url: 'https://www.youknow.tv/show/2--------{page}---/'
    },
  }, {
    name: '综艺',
    ext: {
      url: 'https://www.youknow.tv/show/3--------{page}---/'
    },
  }, {
    name: '动漫',
    ext: {
      url: 'https://www.youknow.tv/show/4--------{page}---/'
    },
  }, {
    name: '短剧',
    ext: {
      url: 'https://www.youknow.tv/show/55--------{page}---/'
    },
  }, {
    name: '纪录片',
    ext: {
      url: 'https://www.youknow.tv/show/5--------{page}---/'
    },
  }
  ]
}

async function getConfig() {
  if ($config?.age18) {
    appConfig.tabs.push({
      name: '成人',
      ext: {
        url: 'https://www.youknow.tv/show/57--------{page}---/'
      },
    })
  }
  return jsonify(appConfig)
}

try {
  const result = await getConfig()
  console.log(result)
} catch (error) {
  console.error('Error:', error)
}

