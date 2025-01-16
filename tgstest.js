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
const url = `https://jable.tv/my/favourites/videos/?mode=async&function=get_block&block_id=list_videos_my_favourite_videos&fav_type=0&playlist_id=0&sort_by=&from_my_fav_videos=03&_=${Date.now()}`
let headers = {
    'Referer': 'https://jable.tv/my/favourites/videos/',
    'Origin': 'https://jable.tv/my/favourites/videos',
    'User-Agent': UA,
    'cookie':'kt_tcookie=1; kt_ips=45.153.5.169%2C140.245.46.71; kt_member=e99ae487c6193884c77ffe2be5c8f961; PHPSESSID=gr1c84pkuuo2arq5afj1db3se8; cf_clearance=dkx.TDnBR3Ek4v9JD6dW1vtHiuEScOQMtW2cOdDB0GU-1737018819-1.2.1.1-n5UfIYvkHpROyFWu2CfEbqZmY8Jn8pCaOX.yhqxv2TAixBrC_YrJxod4ddpKLswuldcQEsnEBJk5gT6yYYRPcWkTZjLHkQo67bRzvdnVkY62iDXyb_fWj30k_N1bOB1fp.dqhRNcIgocCio5EUNfJ1wRQHtoeXwFcBSp2ssAXb4E9K0fkcDIOzU0scod7X3p3.KamFKmbm_dpP9E7cXyLEca_6g.nIy6rOpEDHTfq_bJx1IdNzwuF9xoT5X3WirD0b4uQ1nDVVnZTr.l7erdvpsPt9wS0WS0x8ZJEQlN.0c',
    'x-requested-with': 'XMLHttpRequest'
}

const {data} =  await $fetch.get(url, {headers: headers})

$print(data)