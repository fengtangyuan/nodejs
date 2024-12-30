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

let ext1 = jsonify({ url: "http://127.0.0.1:8080/video/yunpanshare?ac=detail&ids=75421&platform=ysc" })

let appConfig = {
    ver: 1,
    title: 'docker',
    site: 'http://127.0.0.1:8080/video/yunpanshare',
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
    let page = ext.page || 1
    let url = `${appConfig.site}?wd=${text}&platform=ysc`

    const { data } =  await $fetch.get(url, {
        headers: {
            'token': '40da2be0d7ded05f',
        },
    })
    $print(data.list[0].vod_id)
}

async function main() {
    let result = await getTracks(ext1);
    $print(result)
}

main();