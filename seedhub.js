const cheerio = createCheerio()
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/604.1.14 (KHTML, like Gecko)'

const appConfig = {
	ver: 1,
	title: 'SeedHub',
	site: 'https://www.seedhub.cc',
	tabs: [
		{
			name: '首页',
			ext: {
				id: '/',
			},
		},
		{
			name: '电影',
			ext: {
				id: '/categories/1/movies/',
			},
		},
		{
			name: '剧集',
			ext: {
				id: '/categories/3/movies/',
			},
		},
		{
			name: '动漫',
			ext: {
				id: '/categories/2/movies/',
			},
		}

	],
}
async function getConfig() {
	return jsonify(appConfig)
}

async function getCards(ext) {
	ext = argsify(ext)
	let cards = []
	let { page = 1, id } = ext
	const url = appConfig.site + id + `?page=${page}`
	const { data } = await $fetch.get(url, {
		headers: {
			"User-Agent": UA,
		},
	});

	const $ = cheerio.load(data)
	const videos = $('.cover')
	videos.each((_, e) => {
		const href = $(e).find('a').attr('href')
		const title = $(e).find('a img').attr('alt')
		const cover = $(e).find('a img').attr('src')
		cards.push({
			vod_id: href,
			vod_name: title,
			vod_pic: cover,
			vod_remarks: '',
			ext: {
				url: `${appConfig.site}${href}`,
			},
		})
	})
	return jsonify({
		list: cards,
	})
}

async function getTracks(ext) {
	ext = argsify(ext);
	let url = ext.url
	let groups = [];
	let gn = { 'pan.quark.cn': '夸克网盘', 'pan.baidu.com': '百度网盘', 'drive.uc.cn': 'UC网盘' };

	const { data } = await $fetch.get(url, {
		headers: {
			'User-Agent': UA,
		},
	});

	const $ = cheerio.load(data);
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
async function getPlayinfo(ext) {
	ext = argsify(ext)
	const url = ext.url

	return jsonify({ urls: [ext.url] })
}

async function search(ext) {
	ext = argsify(ext)
	let cards = []

	let text = encodeURIComponent(ext.text)
	let page = ext.page || 1
	let url = `${appConfig.site}/s/${text}/?page=${page}`

	const { data } = await $fetch.get(url, {
		headers: {
			'User-Agent': UA,
		},
	})

	const $ = cheerio.load(data)
	const videos = $('.cover')
	videos.each((_, e) => {
		const href = $(e).find('a').attr('href')
		const title = $(e).find('a img').attr('alt')
		const cover = $(e).find('a img').attr('src')
		cards.push({
			vod_id: href,
			vod_name: title,
			vod_pic: cover,
			vod_remarks: '',
			ext: {
				url: `${appConfig.site}${href}`,
			},
		})
	})

	return jsonify({
		list: cards,
	})
}
