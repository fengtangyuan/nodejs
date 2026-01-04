// 监听 fetch 事件，处理所有传入的 HTTP 请求
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

// 异步处理请求的主函数
async function handleRequest(request) {
    try {
        // 解析请求 URL
        const url = new URL(request.url);

        // User-Agent 验证
        const userAgent = request.headers.get('User-Agent') || '';
        if (!isValidUserAgent(userAgent)) {
            return jsonResponse({
                error: '禁止访问'
            }, 403);
        }

        // 提取并解码请求 URL 中的路径部分
        let actualUrlStr = decodeURIComponent(url.pathname.replace("/", ""));

        // 确保 URL 有正确的协议前缀
        actualUrlStr = ensureProtocol(actualUrlStr, url.protocol);

        // 保留原始 URL 的查询参数
        actualUrlStr += url.search;

        // 过滤掉 Cloudflare 相关的请求头
        const newHeaders = filterHeaders(request.headers, name => !name.startsWith('cf-'));

        // 创建修改后的请求对象
        const modifiedRequest = new Request(actualUrlStr, {
            headers: newHeaders,
            method: request.method,
            body: request.body,
            redirect: 'manual'
        });

        // 发送修改后的请求
        const response = await fetch(modifiedRequest);
        let body = response.body;

        // 处理重定向响应
        if ([301, 302, 303, 307, 308].includes(response.status)) {
            body = response.body;
            return handleRedirect(response, body);
        }
        // 处理 HTML 内容，替换相对路径
        else if (response.headers.get("Content-Type")?.includes("text/html")) {
            body = await handleHtmlContent(response, url.protocol, url.host, actualUrlStr);
        }

        // 创建最终响应，保留原始状态码和响应头
        const modifiedResponse = new Response(body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
        });

        // 设置禁用缓存的响应头
        setNoCacheHeaders(modifiedResponse.headers);
        // 设置 CORS 响应头允许跨域访问
        setCorsHeaders(modifiedResponse.headers);

        return modifiedResponse;
    } catch (error) {
        // 捕获错误并返回 500 错误响应
        return jsonResponse({
            error: error.message
        }, 500);
    }
}


// 确保 URL 有正确的协议（http 或 https）
function ensureProtocol(url, defaultProtocol) {
    return url.startsWith("http://") || url.startsWith("https://") ? url : defaultProtocol + "//" + url;
}

// 处理 HTTP 重定向响应
function handleRedirect(response, body) {
    // 获取重定向目标 URL
    const location = new URL(response.headers.get('location'));
    // 将重定向 URL 编码后放入路径中
    const modifiedLocation = `/${encodeURIComponent(location.toString())}`;
    return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
            ...response.headers,
            'Location': modifiedLocation
        }
    });
}

// 处理 HTML 内容，替换其中的相对路径
async function handleHtmlContent(response, protocol, host, actualUrlStr) {
    // 读取响应内容为文本
    const originalText = await response.text();
    // 替换 HTML 中的相对路径
    let modifiedText = replaceRelativePaths(originalText, protocol, host, new URL(actualUrlStr).origin);
    return modifiedText;
}

// 用正则表达式替换 HTML 中的相对路径
function replaceRelativePaths(text, protocol, host, origin) {
    // 匹配 href、src、action 属性中的相对路径（以 / 开头但不是 // 的路径）
    const regex = new RegExp('((href|src|action)=["\'])/(?!/)', 'g');
    // 将相对路径替换为完整的 URL
    return text.replace(regex, `$1${protocol}//${host}/${origin}/`);
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

// 根据过滤函数筛选请求头
function filterHeaders(headers, filterFunc) {
    // 将 Headers 对象转为数组，过滤后再转回 Headers 对象
    return new Headers([...headers].filter(([name]) => filterFunc(name)));
}

// 设置禁用缓存的响应头
function setNoCacheHeaders(headers) {
    headers.set('Cache-Control', 'no-store');
}

// 设置 CORS 响应头，允许跨域访问
function setCorsHeaders(headers) {
    // 允许任何来源的跨域请求
    headers.set('Access-Control-Allow-Origin', '*');
    // 允许的 HTTP 方法
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    // 允许任何请求头
    headers.set('Access-Control-Allow-Headers', '*');
}

// 验证 User-Agent
function isValidUserAgent(userAgent) {
    // 允许的 User-Agent 列表，支持模糊匹配
    const validUserAgents = [
        'SenPlayer',  // SenPlayer 播放器
    ];

    // 检查是否包含任何一个允许的 User-Agent（不区分大小写）
    const lowerUserAgent = userAgent.toLowerCase();
    return validUserAgents.some(agent => lowerUserAgent.includes(agent.toLowerCase()));
}