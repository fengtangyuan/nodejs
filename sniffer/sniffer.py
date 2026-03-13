#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
视频嗅探模块 - 基于 Playwright 的真实浏览器模拟

功能特点：
1. 模拟真实 Chrome/Firefox 浏览器环境
2. 自动执行页面 JavaScript，捕获动态加载的视频
3. 拦截网络请求，从流量中提取视频地址
4. 支持 iframe 嵌套页面解析
5. 支持多种视频格式（m3u8, mp4, webm, flv 等）
6. 后台运行，支持 headless 模式

依赖安装：
    pip install playwright
    playwright install chromium
"""

import asyncio
import json
import re
import time
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Set, Callable
from urllib.parse import urljoin, urlparse
from contextlib import asynccontextmanager

# 尝试导入 playwright
try:
    from playwright.async_api import async_playwright, Page, Browser, BrowserContext
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    print("警告: 未安装 playwright，请运行: pip install playwright && playwright install chromium")


# ============ 数据模型 ============

@dataclass
class VideoInfo:
    """视频信息"""
    url: str
    type: str  # m3u8, mp4, webm, flv, etc.
    source: str  # 来源：network, html, script, iframe 等
    quality: Optional[str] = None
    title: Optional[str] = None
    headers: Dict = field(default_factory=dict)
    
    def to_dict(self) -> Dict:
        return {
            "url": self.url,
            "type": self.type,
            "source": self.source,
            "quality": self.quality,
            "title": self.title,
            "headers": self.headers
        }


@dataclass
class SniffResult:
    """嗅探结果"""
    success: bool
    page_url: str
    videos: List[VideoInfo] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    metadata: Dict = field(default_factory=dict)
    
    def to_dict(self) -> Dict:
        return {
            "success": self.success,
            "page_url": self.page_url,
            "videos": [v.to_dict() for v in self.videos],
            "errors": self.errors,
            "metadata": self.metadata
        }
    
    def to_json(self, indent: int = 2) -> str:
        return json.dumps(self.to_dict(), ensure_ascii=False, indent=indent)


# ============ 配置常量 ============

# 视频格式正则
VIDEO_PATTERNS = {
    'm3u8': re.compile(r'https?://[^\s"\'<>|]+\.m3u8(?:\?[^\s"\'<>|]*)?', re.IGNORECASE),
    'mp4': re.compile(r'https?://[^\s"\'<>|]+\.mp4(?:\?[^\s"\'<>|]*)?', re.IGNORECASE),
    'webm': re.compile(r'https?://[^\s"\'<>|]+\.webm(?:\?[^\s"\'<>|]*)?', re.IGNORECASE),
    'flv': re.compile(r'https?://[^\s"\'<>|]+\.flv(?:\?[^\s"\'<>|]*)?', re.IGNORECASE),
    'ts': re.compile(r'https?://[^\s"\'<>|]+\.ts(?:\?[^\s"\'<>|]*)?', re.IGNORECASE),
    'mkv': re.compile(r'https?://[^\s"\'<>|]+\.mkv(?:\?[^\s"\'<>|]*)?', re.IGNORECASE),
    'mov': re.compile(r'https?://[^\s"\'<>|]+\.mov(?:\?[^\s"\'<>|]*)?', re.IGNORECASE),
    'avi': re.compile(r'https?://[^\s"\'<>|]+\.avi(?:\?[^\s"\'<>|]*)?', re.IGNORECASE),
}

# 播放器配置正则
PLAYER_PATTERNS = {
    'hls_url': re.compile(r'var\s+hlsUrl\s*=\s*["\']([^"\']+)["\']', re.IGNORECASE),
    'video_url': re.compile(r'var\s+(?:videoUrl|playUrl|sourceUrl|video_src|src)\s*=\s*["\']([^"\']+)["\']', re.IGNORECASE),
    'm3u8_url': re.compile(r'["\']([^"\']+\.m3u8(?:\?[^"\']*)?)["\']', re.IGNORECASE),
    'mp4_url': re.compile(r'["\']([^"\']+\.mp4(?:\?[^"\']*)?)["\']', re.IGNORECASE),
    'url_param': re.compile(r'[?&]url=([^&]+)', re.IGNORECASE),
}

# 真实浏览器 User-Agent
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
]


# ============ 核心嗅探类 ============

class VideoSniffer:
    """视频嗅探器"""
    
    def __init__(self, 
                 headless: bool = True,
                 browser_type: str = 'chromium',
                 timeout: int = 30,
                 user_agent: Optional[str] = None,
                 proxy: Optional[str] = None):
        """
        初始化嗅探器
        
        Args:
            headless: 是否无头模式（后台运行）
            browser_type: 浏览器类型 chromium/firefox/webkit
            timeout: 页面加载超时时间（秒）
            user_agent: 自定义 User-Agent
            proxy: 代理服务器地址，如 http://127.0.0.1:7890
        """
        if not PLAYWRIGHT_AVAILABLE:
            raise ImportError("请先安装 playwright: pip install playwright && playwright install chromium")
        
        self.headless = headless
        self.browser_type = browser_type
        self.timeout = timeout
        self.user_agent = user_agent or USER_AGENTS[0]
        self.proxy = proxy
        
        self._browser: Optional[Browser] = None
        self._context: Optional[BrowserContext] = None
        
    async def __aenter__(self):
        await self.start()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.stop()
    
    async def start(self):
        """启动浏览器"""
        try:
            self._playwright = await async_playwright().start()
            
            # 选择浏览器类型
            browser_class = getattr(self._playwright, self.browser_type)
            
            # 启动参数
            launch_args = {
                'headless': self.headless,
                'args': [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu',
                    '--window-size=1920,1080',
                    '--disable-blink-features=AutomationControlled',
                    '--disable-extensions',
                    '--disable-plugins',
                    '--disable-images',
                    '--disable-javascript',
                ]
            }
            
            # 注意：Playwright 的 launch 参数中 proxy 是独立参数
            # 如果设置了代理，需要在 new_context 中设置
            
            self._browser = await browser_class.launch(**launch_args)
            
            # 创建浏览器上下文
            context_options = {
                'user_agent': self.user_agent,
                'viewport': {'width': 1920, 'height': 1080},
                'locale': 'zh-CN',
                'timezone_id': 'Asia/Shanghai',
            }
            
            # 如果在上下文中使用代理
            if self.proxy:
                context_options['proxy'] = {'server': self.proxy}
            
            self._context = await self._browser.new_context(**context_options)
            
            # 添加 stealth 脚本，隐藏自动化特征
            await self._context.add_init_script("""
                // 隐藏 webdriver 标志
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined
                });
                
                // 隐藏 playwright 特征
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [1, 2, 3, 4, 5]
                });
                
                // 修改 chrome 属性
                if (window.chrome) {
                    Object.defineProperty(window, 'chrome', {
                        get: () => ({
                            runtime: {},
                            loadTimes: () => {},
                            csi: () => {},
                            app: {}
                        })
                    });
                }
            """)
        except Exception as e:
            raise RuntimeError(f"浏览器启动失败: {e}")
    
    async def stop(self):
        """关闭浏览器"""
        if self._context:
            await self._context.close()
        if self._browser:
            await self._browser.close()
        if hasattr(self, '_playwright'):
            await self._playwright.stop()
    
    async def sniff(self, 
                    url: str,
                    wait_time: float = 3.0,
                    wait_for_selector: Optional[str] = None,
                    intercept_network: bool = True,
                    extract_from_page: bool = True) -> SniffResult:
        """
        嗅探视频地址
        
        Args:
            url: 播放页面 URL
            wait_time: 页面加载后等待时间（秒）
            wait_for_selector: 等待特定元素出现
            intercept_network: 是否拦截网络请求
            extract_from_page: 是否从页面内容提取
            
        Returns:
            SniffResult: 嗅探结果
        """
        result = SniffResult(success=False, page_url=url)
        video_urls: Set[str] = set()
        videos: List[VideoInfo] = []
        
        try:
            page = await self._context.new_page()
            
            # 设置拦截器，捕获视频请求
            if intercept_network:
                page.on('request', lambda req: self._handle_request(req, video_urls, videos))
                page.on('response', lambda res: asyncio.create_task(
                    self._handle_response(res, video_urls, videos)
                ))
            
            # 访问页面
            try:
                response = await page.goto(url, wait_until='networkidle', timeout=self.timeout * 1000)
                if response:
                    result.metadata['status'] = response.status
                    result.metadata['content_type'] = response.headers.get('content-type', '')
            except Exception as e:
                result.errors.append(f"页面加载失败: {str(e)}")
                return result
            
            # 等待特定元素
            if wait_for_selector:
                try:
                    await page.wait_for_selector(wait_for_selector, timeout=10000)
                except:
                    pass
            
            # 额外等待，让 JavaScript 执行
            if wait_time > 0:
                await asyncio.sleep(wait_time)
            
            # 从页面内容提取
            if extract_from_page:
                await self._extract_from_page(page, video_urls, videos, result)
            
            # 处理 iframe
            await self._extract_from_iframes(page, video_urls, videos, result)
            
            # 获取页面标题
            try:
                result.metadata['title'] = await page.title()
            except:
                pass
            
            # 获取页面 URL（可能有重定向）
            result.metadata['final_url'] = page.url
            
            await page.close()
            
        except Exception as e:
            result.errors.append(f"嗅探过程出错: {str(e)}")
        
        # 去重并整理结果
        seen_urls = set()
        for video in videos:
            if video.url not in seen_urls:
                seen_urls.add(video.url)
                result.videos.append(video)
        
        result.success = len(result.videos) > 0
        return result
    
    def _handle_request(self, request, video_urls: Set[str], videos: List[VideoInfo]):
        """处理网络请求"""
        url = request.url
        self._check_and_add_video(url, 'network_request', video_urls, videos)
    
    async def _handle_response(self, response, video_urls: Set[str], videos: List[VideoInfo]):
        """处理网络响应"""
        url = response.url
        content_type = response.headers.get('content-type', '')
        
        # 检查内容类型
        if 'm3u8' in content_type or 'mpegurl' in content_type:
            self._check_and_add_video(url, 'network_response_m3u8', video_urls, videos, content_type)
        elif 'mp4' in content_type or 'video/mp4' in content_type:
            self._check_and_add_video(url, 'network_response_mp4', video_urls, videos, content_type)
        elif 'video' in content_type:
            self._check_and_add_video(url, 'network_response_video', video_urls, videos, content_type)
    
    def _check_and_add_video(self, url: str, source: str, 
                             video_urls: Set[str], videos: List[VideoInfo],
                             content_type: str = None):
        """检查并添加视频 URL"""
        if url in video_urls:
            return
        
        # 检查是否为视频 URL
        video_type = None
        url_lower = url.lower()
        
        for vtype in ['m3u8', 'mp4', 'webm', 'flv', 'ts', 'mkv', 'mov']:
            if f'.{vtype}' in url_lower or (content_type and vtype in content_type):
                video_type = vtype
                break
        
        if video_type:
            video_urls.add(url)
            videos.append(VideoInfo(
                url=url,
                type=video_type,
                source=source
            ))
    
    async def _extract_from_page(self, page: Page, video_urls: Set[str], 
                                  videos: List[VideoInfo], result: SniffResult):
        """从页面内容提取视频"""
        try:
            # 获取页面 HTML
            html = await page.content()
            
            # 使用正则提取
            for vtype, pattern in VIDEO_PATTERNS.items():
                matches = pattern.findall(html)
                for match in matches:
                    self._check_and_add_video(match, f'html_{vtype}', video_urls, videos)
            
            # 提取播放器配置中的 URL
            for name, pattern in PLAYER_PATTERNS.items():
                matches = pattern.findall(html)
                for match in matches:
                    if isinstance(match, tuple):
                        match = match[0]
                    if match.startswith('http'):
                        self._check_and_add_video(match, f'script_{name}', video_urls, videos)
            
            # 从 video 标签提取
            video_elements = await page.query_selector_all('video')
            for i, video in enumerate(video_elements):
                try:
                    src = await video.get_attribute('src')
                    if src:
                        if src.startswith('http'):
                            self._check_and_add_video(src, 'video_tag', video_urls, videos)
                        elif src.startswith('//'):
                            self._check_and_add_video(f"https:{src}", 'video_tag', video_urls, videos)
                    
                    # 检查 source 子元素
                    sources = await video.query_selector_all('source')
                    for source in sources:
                        src = await source.get_attribute('src')
                        if src:
                            if src.startswith('http'):
                                self._check_and_add_video(src, 'video_source_tag', video_urls, videos)
                            elif src.startswith('//'):
                                self._check_and_add_video(f"https:{src}", 'video_source_tag', video_urls, videos)
                except:
                    pass
            
            # 执行 JavaScript 获取播放器信息
            try:
                player_info = await page.evaluate("""
                    () => {
                        const result = {};
                        if (window.player) {
                            result.player = window.player;
                        }
                        if (window.hlsUrl) {
                            result.hlsUrl = window.hlsUrl;
                        }
                        if (window.videoUrl) {
                            result.videoUrl = window.videoUrl;
                        }
                        if (window.playUrl) {
                            result.playUrl = window.playUrl;
                        }
                        return result;
                    }
                """)
                
                for key, value in player_info.items():
                    if isinstance(value, str) and value.startswith('http'):
                        self._check_and_add_video(value, f'js_{key}', video_urls, videos)
                    elif isinstance(value, dict):
                        for k, v in value.items():
                            if isinstance(v, str) and v.startswith('http'):
                                self._check_and_add_video(v, f'js_{key}_{k}', video_urls, videos)
            except:
                pass
                
        except Exception as e:
            result.errors.append(f"页面提取失败: {str(e)}")
    
    async def _extract_from_iframes(self, page: Page, video_urls: Set[str],
                                     videos: List[VideoInfo], result: SniffResult):
        """从 iframe 中提取视频"""
        try:
            iframes = await page.query_selector_all('iframe')
            for i, iframe in enumerate(iframes[:3]):  # 限制最多处理3个 iframe
                try:
                    frame = await iframe.content_frame()
                    if frame:
                        # 等待 iframe 加载
                        await asyncio.sleep(1)
                        
                        # 获取 iframe 内容
                        html = await frame.content()
                        
                        # 提取视频
                        for vtype, pattern in VIDEO_PATTERNS.items():
                            matches = pattern.findall(html)
                            for match in matches:
                                self._check_and_add_video(match, f'iframe_{i}_{vtype}', video_urls, videos)
                        
                        # 检查 iframe 中的 video 标签
                        video_elements = await frame.query_selector_all('video')
                        for video in video_elements:
                            src = await video.get_attribute('src')
                            if src and src.startswith('http'):
                                self._check_and_add_video(src, f'iframe_{i}_video', video_urls, videos)
                except:
                    continue
        except:
            pass


# ============ 便捷函数 ============

async def sniff_video(url: str, 
                      headless: bool = True,
                      wait_time: float = 3.0,
                      **kwargs) -> SniffResult:
    """
    便捷函数：快速嗅探单个视频页面
    
    Args:
        url: 播放页面 URL
        headless: 是否后台运行
        wait_time: 等待时间
        **kwargs: 其他 VideoSniffer 参数
    
    Returns:
        SniffResult: 嗅探结果
    """
    async with VideoSniffer(headless=headless, **kwargs) as sniffer:
        return await sniffer.sniff(url, wait_time=wait_time)


async def sniff_videos(urls: List[str],
                       headless: bool = True,
                       concurrency: int = 3,
                       **kwargs) -> List[SniffResult]:
    """
    便捷函数：批量嗅探多个视频页面
    
    Args:
        urls: 播放页面 URL 列表
        headless: 是否后台运行
        concurrency: 并发数
        **kwargs: 其他 VideoSniffer 参数
    
    Returns:
        List[SniffResult]: 嗅探结果列表
    """
    semaphore = asyncio.Semaphore(concurrency)
    
    async def sniff_one(url):
        async with semaphore:
            return await sniff_video(url, headless=headless, **kwargs)
    
    return await asyncio.gather(*[sniff_one(url) for url in urls])


# ============ CLI 接口 ============

def main():
    """命令行入口"""
    import argparse
    
    parser = argparse.ArgumentParser(description='视频嗅探工具')
    parser.add_argument('url', help='要嗅探的播放页面 URL')
    parser.add_argument('-t', '--wait-time', type=float, default=3.0, help='等待时间（秒）')
    parser.add_argument('--show', action='store_true', help='显示浏览器窗口（非 headless 模式）')
    parser.add_argument('-p', '--proxy', help='代理服务器，如 http://127.0.0.1:7890')
    parser.add_argument('-o', '--output', help='输出结果到文件')
    parser.add_argument('--ua', help='自定义 User-Agent')
    
    args = parser.parse_args()
    
    async def run():
        print(f"[*] 开始嗅探: {args.url}")
        print(f"[*] 等待时间: {args.wait_time} 秒")
        print(f"[*] 后台模式: {not args.show}")
        
        result = await sniff_video(
            url=args.url,
            headless=not args.show,
            wait_time=args.wait_time,
            proxy=args.proxy,
            user_agent=args.ua
        )
        
        print(f"\n[+] 嗅探完成!")
        print(f"[+] 页面标题: {result.metadata.get('title', 'N/A')}")
        print(f"[+] 找到视频: {len(result.videos)} 个")
        
        if result.videos:
            print("\n[*] 视频列表:")
            for i, video in enumerate(result.videos, 1):
                print(f"\n  [{i}] 类型: {video.type.upper()}")
                print(f"      来源: {video.source}")
                print(f"      URL: {video.url}")
        
        if result.errors:
            print("\n[!] 错误信息:")
            for error in result.errors:
                print(f"    - {error}")
        
        # 输出 JSON
        json_output = result.to_json()
        
        if args.output:
            with open(args.output, 'w', encoding='utf-8') as f:
                f.write(json_output)
            print(f"\n[+] 结果已保存到: {args.output}")
        else:
            print("\n[*] JSON 输出:")
            print(json_output)
    
    asyncio.run(run())


if __name__ == '__main__':
    main()
