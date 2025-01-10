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

const ext1 = jsonify({
    url:"https://pan.quark.cn/s/bfd4deb285c0&&https://pan.baidu.com/s/18j-scfmpCFAWMDva6_i5JA?pwd=rkz3"
})

const $config = {
    channels: [
        "QuarkFree",
        "ucpanpan",
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
            const title = $(element).find('.tgme_widget_message_text mark').text();
            const hrefs = [];
            $(element).find('.tgme_widget_message_text a').each((_, element) => {
                const href = $(element).attr('href');
                if (href.includes('t.me')) return;
                hrefs.push(href);
            });
            const cover = $(element)
                .find('.tgme_widget_message_photo_wrap')
                .attr('style')
                .match(/image\:url\('(.+)'\)/)[1];
            cards.push({
                vod_id: hrefs[0],
                vod_name: title,
                vod_pic: cover,
                vod_remarks: '',
                ext: {
                     url: hrefs.join("&&"),
                },
            });
        });
    }
    return jsonify({
        list: cards,
    });
}

async function getTracks(ext) {
	ext = argsify(ext)
	let tracks = []
	let urls = ext.url.split('&&')
	for (const url of urls) {
		tracks.push({
			name: '网盘',
			pan: url,
		})
	}
	return jsonify({
		list: [
			{
				title: '默认分组',
				tracks,
			}
		],
	})
}

async function main() {
    let result = await getTracks(ext1);
    $print(result)
}

main();