# 视频嗅探模块

基于 Playwright 的真实浏览器视频嗅探工具，支持 HTTP API 接口调用。

## 功能特点

- ✅ 模拟真实 Chrome/Firefox 浏览器环境
- ✅ 自动执行页面 JavaScript，捕获动态加载的视频
- ✅ 拦截网络请求，从流量中提取视频地址
- ✅ 支持 iframe 嵌套页面解析
- ✅ 支持多种视频格式（m3u8, mp4, webm, flv 等）
- ✅ **HTTP API 接口**，支持 POST 请求调用
- ✅ 后台运行，支持 headless 模式
- ✅ 支持批量嗅探

## 安装

### 1. 安装 Python 依赖

```bash
cd sniffer
pip install -r requirements.txt
```

### 2. 安装浏览器

```bash
playwright install chromium
```

## 使用方法

### 方式一：HTTP API 服务（推荐）

#### 启动 FastAPI 服务

```bash
# 默认启动
python api_fastapi.py

# 指定端口
python api_fastapi.py --port 8080

# 或使用 uvicorn
uvicorn api_fastapi:app --host 0.0.0.0 --port 8000
```

服务启动后会显示：
```
接口地址: http://0.0.0.0:8000
API 文档: http://0.0.0.0:8000/docs
健康检查: http://0.0.0.0:8000/health
```

#### API 接口说明

**1. 单 URL 嗅探**

```bash
POST /sniff
Content-Type: application/json

{
    "url": "https://example.com/video/123",
    "wait_time": 3.0,
    "headless": true,
    "timeout": 30
}
```

**2. 批量 URL 嗅探**

```bash
POST /sniff/batch
Content-Type: application/json

{
    "urls": [
        "https://example.com/video/1",
        "https://example.com/video/2"
    ],
    "wait_time": 3.0,
    "concurrency": 2
}
```

**3. 健康检查**

```bash
GET /health
```

#### curl 示例

```bash
# 健康检查
curl http://localhost:8000/health

# 单 URL 嗅探
curl -X POST http://localhost:8000/sniff \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/video/123",
    "wait_time": 3.0,
    "headless": true
  }'

# 批量嗅探
curl -X POST http://localhost:8000/sniff/batch \
  -H "Content-Type: application/json" \
  -d '{
    "urls": ["https://example.com/video/1", "https://example.com/video/2"],
    "wait_time": 3.0,
    "concurrency": 2
  }'
```

#### Python 调用示例

```python
import requests

# 调用 API
response = requests.post(
    "http://localhost:8000/sniff",
    json={
        "url": "https://example.com/video/123",
        "wait_time": 3.0,
        "headless": True
    }
)

result = response.json()
print(f"成功: {result['success']}")
print(f"找到 {len(result['videos'])} 个视频")

for video in result['videos']:
    print(f"类型: {video['type']}, URL: {video['url']}")
```

#### 返回格式

```json
{
  "success": true,
  "page_url": "https://example.com/video/123",
  "videos": [
    {
      "url": "https://cdn.example.com/video/123.m3u8",
      "type": "m3u8",
      "source": "network_response_m3u8",
      "quality": null,
      "title": null
    }
  ],
  "errors": [],
  "metadata": {
    "title": "视频标题",
    "final_url": "https://example.com/video/123",
    "status": 200
  }
}
```

---

### 方式二：Flask API 服务

```bash
# 启动 Flask 服务
python api_flask.py

# 指定端口
python api_flask.py --port 8080
```

接口与 FastAPI 版本相同，但启动更快，占用资源更少。

---

### 方式三：Python 代码调用

```python
import asyncio
from sniffer import sniff_video

async def main():
    result = await sniff_video(
        url="https://example.com/video/123",
        headless=True,
        wait_time=3.0
    )
    
    # 输出 JSON
    print(result.to_json())

asyncio.run(main())
```

---

### 方式四：命令行工具

```bash
# 基本使用
python run.py "https://example.com/video/123"

# 显示浏览器窗口（调试用）
python run.py "https://example.com/video/123" --show

# 设置等待时间
python run.py "https://example.com/video/123" -t 5

# 使用代理
python run.py "https://example.com/video/123" -p http://127.0.0.1:7890

# 输出到文件
python run.py "https://example.com/video/123" -o result.json
```

## 测试 API

使用提供的测试脚本：

```bash
# 测试本地服务
python test_api.py

# 测试指定地址
python test_api.py --url http://localhost:8080

# 只测试健康检查（跳过嗅探）
python test_api.py --skip-sniff
```

## 文件说明

| 文件 | 说明 |
|------|------|
| `sniffer.py` | 核心嗅探模块 |
| `api_fastapi.py` | FastAPI HTTP 服务（推荐） |
| `api_flask.py` | Flask HTTP 服务（轻量） |
| `test_api.py` | API 测试脚本 |
| `run.py` | 命令行入口 |
| `example.py` | 使用示例 |
| `config.json` | 配置文件 |

## API 参数说明

### POST /sniff 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| url | string | 是 | - | 播放页面 URL |
| wait_time | float | 否 | 3.0 | 页面加载后等待时间（秒） |
| headless | bool | 否 | true | 是否后台运行 |
| timeout | int | 否 | 30 | 页面加载超时时间（秒） |
| user_agent | string | 否 | - | 自定义 User-Agent |
| proxy | string | 否 | - | 代理服务器地址 |

### POST /sniff/batch 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| urls | array | 是 | - | 播放页面 URL 列表（最多10个） |
| wait_time | float | 否 | 3.0 | 页面加载后等待时间（秒） |
| headless | bool | 否 | true | 是否后台运行 |
| concurrency | int | 否 | 2 | 并发数（1-5） |

## 注意事项

1. **首次运行**需要下载浏览器，可能需要等待几分钟
2. **headless 模式**默认后台运行，如需调试可使用 `--show` 或 `headless: false`
3. **等待时间**根据页面复杂度调整，动态加载内容需要更长时间
4. **反爬网站**可能需要配合代理使用

## 常见问题

### Q: 提示未安装 playwright
```bash
pip install playwright
playwright install chromium
```

### Q: 某些网站无法获取视频
- 增加等待时间 `wait_time: 5` 或更长
- 检查是否需要特定 User-Agent
- 检查是否需要代理

### Q: 如何调试
- 设置 `headless: false` 显示浏览器窗口
- 查看返回的 `errors` 字段
- 检查 `metadata` 中的页面标题和状态码
