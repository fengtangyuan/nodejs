// 导入必要的库
import * as cheerio from 'cheerio'
import axios from "axios"
import fs from 'fs/promises'
const $print = console.log
const jsonify = JSON.stringify
const argsify = JSON.parse
const $fetch = axios
// const data = await fs.readFile('html.html', 'utf-8')                     

let $config = {
    channels: ['guaguale115']
}
const UA = 'MOBILE_UA'
let appConfig = {
    ver: 1,
    title: 'tg搜索',
    site: 'https://t.me/s/',
}
const ext1 = jsonify({
    text: '国色芳华',})

async function search(ext) {
    ext = argsify(ext)
    let cards = []
    let page = ext.page || 1
    if (page > 1) {
        return jsonify({
            list: [],
        })
    }
    let text = encodeURIComponent(ext.text)
    const requests = $config.channels.map(async (channel) => {
        const url = `${appConfig.site}${channel}?q=${text}`;
        try {
            const { data } = await $fetch.get(url, {
                headers: {
                    'User-Agent': UA,
                },
            });
            const $ = cheerio.load(data)
            if ($('div.tgme_widget_message_bubble').length === 0) return
            $('div.tgme_widget_message_bubble').each((_, element) => {
                let title = ''
                let hrefs = []
                let cover = ''
                let remarks = ''
                try {
                    const html = $(element).find('.tgme_widget_message_text').html().replace(/<b[^>]*>|<\/b>|<a[^>]*>|<\/a>|<mark[^>]*>|<\/mark>|<i[^>]*>|<\/i>|<div[^>]*>|<\/div>/g, '').replace(/【[^】]*】/g, '')
                    html.split('<br>').forEach((e) => {
                        const titletext = e.trim()
                        if (/(名称|名字|短剧|资源标题)(：|:)/.test(titletext)) {
                            title = titletext
                                .split(/：|:/)[1]
                                .trim()
                            //如果第一字符是[则匹配第二个[
                            if (title.startsWith('[')) {
                                title = title.split('][')[0].replace('[', '')
                            } else { title = title.split(/（|\(|\[|(更新?至|全)/)[0] }
                        } else if (/（|\(|\[|(更新?至|全)/.test(titletext)) {
                            title = titletext.split(/（|\(|\[|(更新?至|全)/)[0]
                        } else if (/(.+)\s(更新?至|全)/.test(titletext)) {
                            title = titletext.split(/更新?至|全/)[0]
                        } else if (/S\d+/.test(titletext)) {
                            title = titletext.split('S')[0]
                        }
                    })
                    title = title.replace(/<b>/, '').replace(/4K.*$/g, '').replace('发行时间', '').replace('描述', '').trim()
                    cover = $(element)
                        .find('.tgme_widget_message_photo_wrap')
                        .attr('style')
                        .match(/image\:url\('(.+)'\)/)[1]
                    $(element)
                        .find('.tgme_widget_message_text > a')
                        .each((_, element) => {
                            const href = $(element).attr('href')
                            if (href.match(/https:\/\/(.+)\/(s|t)\/(.+)/)) {
                                hrefs.push(href)
                            }
                        })
                    remarks = hrefs[0].match(/https:\/\/(.+)\/(s|t)\//)[1].replace(/(115\.com)|(anxia\.com)/, '115')
                        .replace(/(pan\.quark\.cn)/, '夸克')
                        .replace(/(drive\.uc\.cn)/, 'UC')
                        .replace(/(www\.aliyundrive\.com)|(www\.alipan\.com)/, '阿里')
                        .replace(/(cloud\.189\.cn)/, '天翼')
                        .trim();
                } catch (e) {
                    //$utils.toastError(`${channel}搜索失败`)
                }
                if (remarks === '') return
                cards.push({
                    vod_id: hrefs[0],
                    vod_name: title,
                    vod_pic: cover,
                    vod_remarks: channel,
                    vod_duration: remarks,
                    ext: {
                        url: hrefs,
                        name: title,
                    },
                })
            })
        } catch (error) {
            //
        }

    });
    await Promise.all(requests);
    return jsonify({
        list: cards,
    })
}

async function main() {
    let result = await search(ext1);
    $print(result)
}

main();