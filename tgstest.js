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

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
const url = `https://jable.tv/my/favourites/videos/?mode=async&function=get_block&block_id=list_videos_my_favourite_videos&fav_type=0&playlist_id=0&sort_by=&from_my_fav_videos=03&_=${Date.now()}`
let headers = {
    'User-Agent': UA,
    'cookie': 'kt_ips=140.245.46.71; kt_tcookie=1; kt_member=3c22ff80e4b7794cc25c202fed947b53; PHPSESSID=i2gihtbanc6m493l761o8k1203; cf_clearance=Fc5E_vt32NHrZn5RDzmcbXRJugLll__YjC28b4GIIp0-1737021184-1.2.1.1-iedkRCC.tUr25.4PtNheDQhh5BOK9NJekWZA1UrUxSeV.xzpau36kOrJPUkIxTk4GrsSzYd6666o9Tu9JIYvH96fRAi6AvL4UCBtOGkDpURCKuhtHux9rd0PYGn6uGGC5GaKFMWDe_uAxdscJIBGNZq2PMz83OXxWnPwCEnxnyPg6p.7Jf4rBzHPkOO1qcWmruBZMOYTauan2pMYb..ffsdyAOeDdxHU1OKQvSvxSSIJF4kPH2VXRB_Kt3vCCJwdykP8BututPkoG8ZaZb5iiKzLFBSayjnaDiem44tE208',
    'priority': 'u=0, i',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': "Windows",
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': 1
}
await $fetch.get('https://jable.tv/?login', { headers: headers })
$print('done')
//const {data} =  await $fetch.get(url, {headers: headers})

//$print(data)