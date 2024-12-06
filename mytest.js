// 导入必要的库
import cheerio from 'cheerio'
import axios from 'axios' // 用于发送HTTP请求
const $print = console.log
const jsonify = JSON.stringify
const argsify = JSON.parse
const $fetch = axios

// 设置User Agent，模拟iPhone浏览器
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1'

const url = 'https://jable.tv'

const { data } = await axios.get(url, {
    headers: {
        'User-Agent': UA,
    },
})

$print(data)