#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
视频嗅探 HTTP API 服务 - FastAPI 版本

提供 RESTful API 接口，通过 POST 请求发送播放页面 URL，返回嗅探到的视频地址。

安装依赖:
    pip install fastapi uvicorn python-multipart

运行服务:
    python api_fastapi.py
    
    # 或指定端口
    uvicorn api_fastapi:app --host 0.0.0.0 --port 8080 --reload

API 文档:
    启动后访问 http://localhost:8000/docs 查看 Swagger UI 文档

接口说明:
    POST /sniff          - 嗅探单个 URL
    POST /sniff/batch    - 批量嗅探多个 URL
    GET  /health         - 健康检查
"""

import asyncio
import json
import logging
from typing import List, Optional
from contextlib import asynccontextmanager

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 尝试导入 FastAPI
try:
    from fastapi import FastAPI, HTTPException, BackgroundTasks, Query, Request
    from fastapi.responses import JSONResponse
    from pydantic import BaseModel, Field, HttpUrl
    FASTAPI_AVAILABLE = True
except ImportError:
    FASTAPI_AVAILABLE = False
    print("请先安装 FastAPI: pip install fastapi uvicorn python-multipart")
    raise

# 导入嗅探模块
try:
    from sniffer import VideoSniffer, sniff_video, SniffResult
except ImportError:
    import sys
    import os
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from sniffer import VideoSniffer, sniff_video, SniffResult


# ============ 数据模型 ============

class SniffRequest(BaseModel):
    """嗅探请求模型"""
    url: str = Field(..., description="播放页面 URL", example="https://example.com/video/123")
    wait_time: float = Field(3.0, ge=0, le=60, description="页面加载后等待时间（秒）")
    headless: bool = Field(True, description="是否后台运行（无头模式）")
    timeout: int = Field(30, ge=5, le=120, description="页面加载超时时间（秒）")
    user_agent: Optional[str] = Field(None, description="自定义 User-Agent")
    proxy: Optional[str] = Field(None, description="代理服务器地址，如 http://127.0.0.1:7890")
    
    class Config:
        json_schema_extra = {
            "example": {
                "url": "https://example.com/video/123",
                "wait_time": 3.0,
                "headless": True,
                "timeout": 30
            }
        }


class BatchSniffRequest(BaseModel):
    """批量嗅探请求模型"""
    urls: List[str] = Field(..., description="播放页面 URL 列表", min_items=1, max_items=10)
    wait_time: float = Field(3.0, ge=0, le=60, description="页面加载后等待时间（秒）")
    headless: bool = Field(True, description="是否后台运行（无头模式）")
    timeout: int = Field(30, ge=5, le=120, description="页面加载超时时间（秒）")
    concurrency: int = Field(2, ge=1, le=5, description="并发数")
    
    class Config:
        json_schema_extra = {
            "example": {
                "urls": [
                    "https://example.com/video/1",
                    "https://example.com/video/2"
                ],
                "wait_time": 3.0,
                "concurrency": 2
            }
        }


class VideoInfo(BaseModel):
    """视频信息模型"""
    url: str = Field(..., description="视频实际播放地址")
    type: str = Field(..., description="视频类型 (m3u8, mp4, webm, flv 等)")
    source: str = Field(..., description="来源 (network, html, script, iframe 等)")
    quality: Optional[str] = Field(None, description="视频质量")
    title: Optional[str] = Field(None, description="视频标题")


class SniffResponse(BaseModel):
    """嗅探响应模型"""
    success: bool = Field(..., description="是否成功找到视频")
    page_url: str = Field(..., description="请求的播放页面 URL")
    videos: List[VideoInfo] = Field(default_factory=list, description="嗅探到的视频列表")
    errors: List[str] = Field(default_factory=list, description="错误信息列表")
    metadata: dict = Field(default_factory=dict, description="元数据（页面标题、URL等）")


class HealthResponse(BaseModel):
    """健康检查响应"""
    status: str
    message: str


# ============ 全局状态 ============

# 浏览器实例池（用于复用）
browser_pool: List[VideoSniffer] = []
MAX_POOL_SIZE = 2


async def get_browser_from_pool() -> Optional[VideoSniffer]:
    """从池中获取浏览器实例"""
    if browser_pool:
        return browser_pool.pop()
    return None


async def return_browser_to_pool(sniffer: VideoSniffer):
    """将浏览器实例归还到池"""
    if len(browser_pool) < MAX_POOL_SIZE:
        browser_pool.append(sniffer)
    else:
        await sniffer.stop()


# ============ FastAPI 应用 ============

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时执行
    print("[*] 视频嗅探 API 服务启动")
    print("[*] 文档地址: http://localhost:8000/docs")
    yield
    # 关闭时执行
    print("[*] 正在关闭浏览器实例...")
    for sniffer in browser_pool:
        await sniffer.stop()
    browser_pool.clear()


app = FastAPI(
    title="视频嗅探 API",
    description="通过 HTTP API 接口嗅探视频播放页面，提取实际视频地址",
    version="1.0.0",
    lifespan=lifespan
)


# 全局异常处理
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """全局异常处理器"""
    logger.error(f"全局异常: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": str(exc),
            "detail": "服务器内部错误"
        }
    )


# 请求日志中间件
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """记录请求日志"""
    # 跳过健康检查的日志
    if request.url.path != "/health":
        logger.info(f"{request.method} {request.url.path}")
    
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        logger.error(f"请求处理错误: {e}")
        raise


# ============ API 路由 ============

@app.get("/", response_model=HealthResponse)
async def root():
    """根路径 - 返回服务信息"""
    return HealthResponse(
        status="ok",
        message="视频嗅探 API 服务运行中，访问 /docs 查看文档"
    )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """健康检查"""
    return HealthResponse(
        status="ok", 
        message="服务正常运行"
    )


@app.post("/sniff", response_model=SniffResponse)
async def sniff_single(request: SniffRequest):
    """
    嗅探单个视频页面
    
    接收播放页面 URL，返回嗅探到的实际视频地址。
    """
    logger.info(f"开始嗅探: {request.url}")
    
    try:
        # 使用独立实例（更简单可靠）
        result = await sniff_video(
            url=request.url,
            headless=request.headless,
            wait_time=request.wait_time,
            timeout=request.timeout,
            user_agent=request.user_agent,
            proxy=request.proxy
        )
        
        logger.info(f"嗅探完成: {request.url}, 找到 {len(result.videos)} 个视频")
        
        return SniffResponse(
            success=result.success,
            page_url=result.page_url,
            videos=[VideoInfo(**v.to_dict()) for v in result.videos],
            errors=result.errors,
            metadata=result.metadata
        )
        
    except Exception as e:
        logger.error(f"嗅探失败: {request.url}, 错误: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/sniff/batch", response_model=List[SniffResponse])
async def sniff_batch(request: BatchSniffRequest):
    """
    批量嗅探多个视频页面
    
    接收多个播放页面 URL，并发嗅探并返回结果。
    最多支持 10 个 URL。
    """
    from sniffer import sniff_videos
    
    try:
        results = await sniff_videos(
            urls=request.urls,
            headless=request.headless,
            wait_time=request.wait_time,
            timeout=request.timeout,
            concurrency=request.concurrency
        )
        
        return [
            SniffResponse(
                success=r.success,
                page_url=r.page_url,
                videos=[VideoInfo(**v.to_dict()) for v in r.videos],
                errors=r.errors,
                metadata=r.metadata
            )
            for r in results
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/sniff/async", response_model=dict)
async def sniff_async(request: SniffRequest, background_tasks: BackgroundTasks):
    """
    异步嗅探（后台执行）
    
    立即返回任务 ID，后台执行嗅探任务。
    适用于需要长时间等待的页面。
    """
    import uuid
    
    task_id = str(uuid.uuid4())
    
    # 这里可以实现任务队列和状态存储
    # 简化版本直接返回任务 ID
    
    return {
        "task_id": task_id,
        "status": "pending",
        "message": "任务已提交，请通过 /task/{task_id} 查询结果（待实现）"
    }


# ============ 启动入口 ============

if __name__ == "__main__":
    import uvicorn
    
    # 命令行参数
    import argparse
    parser = argparse.ArgumentParser(description="视频嗅探 API 服务")
    parser.add_argument("--host", default="0.0.0.0", help="监听地址 (默认: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=8000, help="监听端口 (默认: 8000)")
    parser.add_argument("--reload", action="store_true", help="开发模式：代码修改自动重载")
    args = parser.parse_args()
    
    print(f"""
╔══════════════════════════════════════════════════════════╗
║              视频嗅探 API 服务                           ║
╠══════════════════════════════════════════════════════════╣
║  接口地址: http://{args.host}:{args.port:<5}                     ║
║  API 文档: http://{args.host}:{args.port:<5}/docs               ║
║  健康检查: http://{args.host}:{args.port:<5}/health             ║
╚══════════════════════════════════════════════════════════╝
""")
    
    uvicorn.run(
        "api_fastapi:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        log_level="info"
    )
