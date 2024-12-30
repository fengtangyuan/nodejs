let appConfig = {
    ver: 1,
    title: 'tg搜索|夸克',
    site: 'http://192.168.152.172:8080/video/yunpanshare',
}

async function getConfig() {
    let config = appConfig
    return jsonify(config)
}

async function getCards() {
    return jsonify({
        list: [],
    })
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

async function getPlayinfo(ext) {
	return jsonify({ urls: [] })
}

async function search(ext) {
	ext = argsify(ext)
	let cards = []

	let text = encodeURIComponent(ext.text)
	let url = `${appConfig.site}?wb=${text}&platform=ysc`

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