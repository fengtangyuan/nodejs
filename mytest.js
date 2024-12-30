// 导入必要的库
import * as cheerio from 'cheerio'
import axios from 'axios'
import fs from 'fs'
const $print = console.log
const jsonify = JSON.stringify
const argsify = JSON.parse
const $fetch = axios

// 设置User Agent，模拟iPhone浏览器
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0'

let ext1 = jsonify({ text: "偷窥者" })

let appConfig = {
    ver: 1,
    title: 'docker',
    site: 'http://192.168.152.172:8080/video/yunpanshare',
}

async function getConfig() {
    let config = appConfig
    return jsonify(config)
}

async function getTracks(ext) {
	ext = argsify(ext)
	let tracks = []
	let url = ext.url

	const { data } = await $fetch.get(url, {
		headers: {
			'token': '40da2be0d7ded05f',
		},
	})
    
    
	const list = data.list
    for (const e of list) {
        const title = e.vod_name
        const panShareUrl = e.vod_content.match(/链接：(https?:\/\/pan\.quark\.cn\/s\/\w+)\n/)[1]
        tracks.push({
            name: title,
            pan: panShareUrl,
        })
    }
	return jsonify({
		list: [
			{
				title: '默认分组',
				tracks,
			},
		],
	})
}


async function search(ext) {
	ext = argsify(ext)
	let cards = []

	let text = encodeURIComponent(ext.text)
	let url = `${appConfig.site}?wd=${text}&platform=ysc`

	const { data } = await $fetch.get(url, {
		headers: {
			'token': '40da2be0d7ded05f',
		},
	})
    const list = data.list
	for (const e of list) {
		const href = e.vod_id
		const title = e.vod_name
		const cover = e.vod_pic
		const remarks = e.vod_remarks
		cards.push({
			vod_id: href,
			vod_name: title,
			vod_pic: cover,
			vod_remarks: remarks,

			ext: {
				url: `${appConfig.site}?ac=detail&ids=${href}&platform=ysc`,
			},
		})
	}
	return jsonify({
		list: cards,
	})
}

async function main() {
    let result = await search(ext1);
    $print(result)
}

main();