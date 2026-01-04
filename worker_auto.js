
const MANUAL_REDIRECT_DOMAINS = [
    'ap-cn01.emby.bangumi.ca',
    'ap-cn02.emby.bangumi.ca',
    'ap-cn03.emby.bangumi.ca',
    'yxh20190608-my.sharepoint.com', //emos移动
    'sharepointonline.com.akadns.net', //emos移动
    'sharepoint.cn', //emos微软云北京
    'quark.cn', //夸克网盘
    'mini189.cn', //天翼云盘
    '189.cn', //天翼云盘
    'ctyunxs.cn', //天翼云盘
    'telecomjs.com', //天翼云盘
    'xunlei.com', //迅雷云盘
    '115.com', //115
    '115cdn.com', //115
    '115cdn.net', //115
    'uc.cn', //uc
    'aliyundrive.com', //阿里
    'aliyundrive.net', //阿里
    'voicehub.top', //阿里
    'xiaoya.pro', //小雅
];

// 验证 User-Agent
function isValidUserAgent(userAgent) {
    // 允许的 User-Agent 列表，支持模糊匹配
    const validUserAgents = [
        'SenPlayer',  // SenPlayer 播放器
        'RodelPlayer' //小幻播放器
    ];

    // 检查是否包含任何一个允许的 User-Agent（不区分大小写）
    const lowerUserAgent = userAgent.toLowerCase();
    return validUserAgents.some(agent => lowerUserAgent.includes(agent.toLowerCase()));
}

// 返回 JSON 格式的响应
function jsonResponse(data, status) {
    return new Response(JSON.stringify(data), {
        status: status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    });
}

export default {
    async fetch(request, env, ctx) {
        const workerUrl = new URL(request.url);

        // --- 1. 根路径 ---
        // 如果访问根目录，返回空页面
        if (workerUrl.pathname === "/") {
            return jsonResponse({
                error: '禁止访问'
            }, 403);
        }
        // --- 特殊路径 ---
        if (workerUrl.pathname === '/whatcolo') {
            const clientIp = request.headers.get('cf-connecting-ip') || '未知';
            const region = request.cf?.country || '未知';
            const colo = request.cf?.colo || '未知';
            return new Response(`Success\nIP: ${clientIp}\n地区: ${region}\n边缘节点: ${colo}`, { status: 200 });
        }

        // --- 2. 解析请求头中的 User-Agent ---
        const userAgent = request.headers.get('User-Agent') || '';
        if (!isValidUserAgent(userAgent)) {
            return jsonResponse({
                error: '禁止访问'
            }, 403);
        }

        // --- 3. 解析目标 URL ---
        let upstreamUrl;
        try {
            let path = workerUrl.pathname.substring(1);
            path = path.replace(/^(https?)\/(?!\/)/, '$1://');
            if (!path.startsWith('http')) {
                path = 'https://' + path;
            }
            upstreamUrl = new URL(path);
            upstreamUrl.search = workerUrl.search;
        } catch (e) {
            return new Response('Invalid URL', { status: 400 });
        }


        // --- 4. WebSocket ---
        const upgradeHeader = request.headers.get('Upgrade');
        if (upgradeHeader && upgradeHeader.toLowerCase() === 'websocket') {
            return fetch(upstreamUrl.toString(), request);
        }

        // --- 5. 构造请求头 ---
        const upstreamRequestHeaders = new Headers(request.headers);
        upstreamRequestHeaders.set('Host', upstreamUrl.host);
        upstreamRequestHeaders.delete('Referer');

        const clientIp = request.headers.get('cf-connecting-ip');
        if (clientIp) {
            upstreamRequestHeaders.set('x-forwarded-for', clientIp);
            upstreamRequestHeaders.set('x-real-ip', clientIp);
        }

        const upstreamRequest = new Request(upstreamUrl.toString(), {
            method: request.method,
            headers: upstreamRequestHeaders,
            body: request.body,
            redirect: 'manual', // 禁止自动跟随，手动处理
        });

        // --- 6. 发起请求 ---
        const upstreamResponse = await fetch(upstreamRequest);

        // --- 7. 处理重定向 (核心修复区域) ---
        const location = upstreamResponse.headers.get('Location');
        if (location && upstreamResponse.status >= 300 && upstreamResponse.status < 400) {
            try {
                // [修复 1]: 处理相对路径重定向，基于 upstreamUrl 补全
                const redirectUrl = new URL(location, upstreamUrl);

                // 策略 A: 白名单直连
                if (MANUAL_REDIRECT_DOMAINS.some(domain => redirectUrl.hostname.endsWith(domain))) {
                    // [优化]: 确保返回给客户端的是绝对路径，防止客户端在 Worker 域名下跳转
                    const responseHeaders = new Headers(upstreamResponse.headers);
                    responseHeaders.set('Location', redirectUrl.toString());
                    return new Response(upstreamResponse.body, {
                        status: upstreamResponse.status,
                        statusText: upstreamResponse.statusText,
                        headers: responseHeaders
                    });
                }

                // 策略 B: Worker 内部代理跟随
                const followHeaders = new Headers(upstreamRequestHeaders);
                // [修复 2]: 更新 Host 头
                followHeaders.set('Host', redirectUrl.host);

                // [修复 3]: 使用完整的绝对 URL 发起 fetch
                return fetch(redirectUrl.toString(), {
                    method: request.method,
                    headers: followHeaders,
                    body: request.body,
                    redirect: 'follow'
                });

            } catch (e) {
                return upstreamResponse;
            }
        }

        // --- 8. 处理常规响应 ---
        const responseHeaders = new Headers(upstreamResponse.headers);
        responseHeaders.set('Access-Control-Allow-Origin', '*');
        responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        responseHeaders.set('Access-Control-Allow-Headers', '*');
        responseHeaders.delete('Content-Security-Policy');
        responseHeaders.delete('X-Frame-Options');

        return new Response(upstreamResponse.body, {
            status: upstreamResponse.status,
            statusText: upstreamResponse.statusText,
            headers: responseHeaders,
        });
    },

};
