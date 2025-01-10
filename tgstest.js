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

const UA = 'MOBILE_UA'

let ext1 = jsonify({
    text: '七龙珠',
    page: 1
})

let $config1 = {
    "channels": [
        "QuarkFree",
        "ucpanpan",
        "NewQuark",
        "hao115",
        "guaguale115",
        "Channel_Shares_115",
        "XiangxiuNB",
        "yunpanpan",
        "zaihuayun",
        "Quark_Movies",
        "yunpanshare",
        "shareAliyun",
        "ikiviyyp",
        "alyp_1",
    ]
}

let $config = {  
    "channels": [
      "QuarkFree",
      "ucpanpan",
      "NewQuark",
      "leoziyuan",
      "ydypzyfx",
      "clouddriveresources",
      "oneonefivewpfx",
      "hao115",
      "guaguale115",
      "Channel_Shares_115",
      "dianyingshare",
      "XiangxiuNB",
      "yunpanpan",
      "zaihuayun",
      "Quark_Movies",
      "vip115hot",
      "yunpanshare",
      "shareAliyun",
      "ikiviyyp",
      "alyp_1",
      "quanziyuanshe",
    ]
  }

let appConfig = {
    ver: 1,
    title: 'tg搜索',
    site: 'https://t.me/s/',
    tabs: [{
        name: '只能搜索',
        ui: 1,
        ext: {
            id: '',
        },
    }]
}

async function search(ext) {
    ext = argsify(ext);
    let cards = [];
    let page = ext.page || 1;
    if (page > 1) {
        return jsonify({
            list: [],
        });
    }
    let text = encodeURIComponent(ext.text);

    for (const channel of $config.channels) {
        let url = `${appConfig.site}${channel}?q=${text}`;
        const { data } = await $fetch.get(url, {
            headers: {
                "User-Agent": UA,
            },
        });
        const $ = cheerio.load(data);
        if ($('div.tgme_widget_message_bubble').length === 0) continue;
        $('div.tgme_widget_message_bubble').each((_, element) => {
            let title = '';
            let hrefs = [];
            let cover = '';
            let remarks = '';
            try {
                const titletext = $(element).find('.tgme_widget_message_text').text()
                if (titletext.includes('名称：')) {
                    title = titletext.split('描述：')[0].replace('名称：', '').trim();
                } else {
                    title = $(element).find('.tgme_widget_message_text mark').text();
                }
                $(element).find('.tgme_widget_message_text > a').each((_, element) => {
                    const href = $(element).attr('href');
                    if (href.match(/https:\/\/(.+)\/s\/(.+)/)) {
                        hrefs.push(href);
                    }
                });
                cover = $(element)
                    .find('.tgme_widget_message_photo_wrap')
                    .attr('style')
                    .match(/image\:url\('(.+)'\)/)[1];
                remarks = hrefs[0].match(/https:\/\/(.+)\/s\//)[1];
            } catch (e) {
                $print(`${channel}搜索失败`);
            }
            if (remarks === '') return;
            cards.push({
                vod_id: hrefs[0],
                vod_name: title,
                vod_pic: cover,
                vod_remarks: remarks,
                ext: {
                    url: hrefs,
                },
            });
        });
    }
    return jsonify({
        list: cards,
    });
}

async function main() {
    let result = await search(ext1);
    $print(result)
}

main();