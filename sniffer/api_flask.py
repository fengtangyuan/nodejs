#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
视频嗅探 HTTP API 服务 - Flask 版本

相比 FastAPI 更轻量，适合简单部署。

安装依赖:
    pip install flask

运行服务:
    python api_flask.py
    
    # 或指定端口
    python api_flask.py --port 8080
"""

import asyncio
import json
from concurrent.futures import ThreadPoolExecutor

# 尝试导入 Flask
try:
    from flask import Flask, request, jsonify
    FLASK_AVAILABLE = True
except ImportError:
    FLASK_AVAILABLE = False
    print("请先安装 Flask: pip install flask")
    raise

# 导入嗅探模块
try:
    from sniffer import sniff_video, sniff_videos
except ImportError:
    import sys
    import os
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from sniffer import sniff_video, sniff_videos


# ============ Flask 应用 ============

app = Flask(__name__)

# 线程池用于执行异步任务
executor = ThreadPoolExecutor(max_workers=3)


def run_async(coro):
    """在同步上下文中运行异步协程"""
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    return loop.run_until_complete(coro)


# ============ 路由 ============

@app.route("/", methods=["GET"])
def index():
    """根路径"""
    return jsonify({
        "status": "ok",
        "message": "视频嗅探 API 服务运行中",
        "endpoints": {
            "POST /sniff": "嗅探单个 URL",
            "POST /sniff/batch": "批量嗅探多个 URL",
            "GET /health": "健康检查"
        }
    })


@app.route("/health", methods=["GET"])
def health():
    """健康检查"""
    return jsonify({
        "status": "ok",
        "message": "服务正常运行"
    })


@app.route("/sniff", methods=["POST"])
def sniff_single():
    """
    嗅探单个视频页面
    
    POST 参数:
        - url: 播放页面 URL (必填)
        - wait_time: 等待时间，默认 3.0 秒
        - headless: 是否后台运行，默认 true
        - timeout: 超时时间，默认 30 秒
        - user_agent: 自定义 User-Agent
        - proxy: 代理地址
    
    返回:
        {
            "success": true/false,
            "page_url": "原始URL",
            "videos": [
                {
                    "url": "视频实际地址",
                    "type": "m3u8/mp4/webm",
                    "source": "来源"
                }
            ],
            "errors": [],
            "metadata": {}
        }
    """
    try:
        data = request.get_json() or {}
        
        # 验证必填参数
        url = data.get("url")
        if not url:
            return jsonify({
                "success": False,
                "error": "缺少必填参数: url"
            }), 400
        
        # 获取可选参数
        wait_time = float(data.get("wait_time", 3.0))
        headless = data.get("headless", True)
        timeout = int(data.get("timeout", 30))
        user_agent = data.get("user_agent")
        proxy = data.get("proxy")
        
        # 执行嗅探
        result = run_async(sniff_video(
            url=url,
            headless=headless,
            wait_time=wait_time,
            timeout=timeout,
            user_agent=user_agent,
            proxy=proxy
        ))
        
        return jsonify(result.to_dict())
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/sniff/batch", methods=["POST"])
def sniff_batch():
    """
    批量嗅探多个视频页面
    
    POST 参数:
        - urls: URL 列表 (必填，最多10个)
        - wait_time: 等待时间，默认 3.0 秒
        - headless: 是否后台运行，默认 true
        - concurrency: 并发数，默认 2
    
    返回:
        [result1, result2, ...]
    """
    try:
        data = request.get_json() or {}
        
        # 验证必填参数
        urls = data.get("urls", [])
        if not urls or not isinstance(urls, list):
            return jsonify({
                "success": False,
                "error": "缺少必填参数: urls (必须是数组)"
            }), 400
        
        if len(urls) > 10:
            return jsonify({
                "success": False,
                "error": "批量嗅探最多支持 10 个 URL"
            }), 400
        
        # 获取可选参数
        wait_time = float(data.get("wait_time", 3.0))
        headless = data.get("headless", True)
        timeout = int(data.get("timeout", 30))
        concurrency = int(data.get("concurrency", 2))
        
        # 执行批量嗅探
        results = run_async(sniff_videos(
            urls=urls,
            headless=headless,
            wait_time=wait_time,
            timeout=timeout,
            concurrency=concurrency
        ))
        
        return jsonify([r.to_dict() for r in results])
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ============ 启动入口 ============

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="视频嗅探 API 服务 (Flask)")
    parser.add_argument("--host", default="0.0.0.0", help="监听地址 (默认: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=5000, help="监听端口 (默认: 5000)")
    parser.add_argument("--debug", action="store_true", help="调试模式")
    args = parser.parse_args()
    
    print(f"""
╔══════════════════════════════════════════════════════════╗
║           视频嗅探 API 服务 (Flask)                      ║
╠══════════════════════════════════════════════════════════╣
║  接口地址: http://{args.host}:{args.port:<5}                     ║
║  POST /sniff    - 嗅探单个 URL                           ║
║  POST /sniff/batch - 批量嗅探                            ║
║  GET  /health   - 健康检查                               ║
╚══════════════════════════════════════════════════════════╝
""")
    
    app.run(
        host=args.host,
        port=args.port,
        debug=args.debug,
        threaded=True
    )
