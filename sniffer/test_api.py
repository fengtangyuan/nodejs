#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
视频嗅探 API 手动测试工具

交互式输入网址，测试 API 服务。

用法:
    python test_api.py
    python test_api.py --url http://localhost:8080
"""

import argparse
import json
import sys

# 尝试导入 requests
try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False
    print("请先安装 requests: pip install requests")
    sys.exit(1)


def test_health(base_url: str) -> bool:
    """测试健康检查接口"""
    print("\n" + "="*60)
    print("[1] 测试健康检查")
    print("="*60)
    
    try:
        response = requests.get(f"{base_url}/health", timeout=10)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"[!] 错误: {e}")
        return False


def test_sniff_single_manual(base_url: str):
    """手动输入测试单个 URL"""
    print("\n" + "="*60)
    print("[2] 单 URL 嗅探测试")
    print("="*60)
    
    # 手动输入 URL
    print("\n请输入要嗅探的播放页面 URL (例如: https://example.com/video/123)")
    video_url = input("> ").strip()
    
    if not video_url:
        print("[!] URL 不能为空")
        return
    
    if not video_url.startswith(('http://', 'https://')):
        print("[!] URL 必须以 http:// 或 https:// 开头")
        return
    
    # 其他参数
    print("\n设置参数 (直接回车使用默认值):")
    
    wait_time = input("等待时间 [3.0]: ").strip()
    wait_time = float(wait_time) if wait_time else 3.0
    
    headless_input = input("后台运行 (y/n) [y]: ").strip().lower()
    headless = headless_input != 'n'
    
    proxy = input("代理地址 (可选, 如 http://127.0.0.1:7890): ").strip()
    
    # 构建请求
    payload = {
        "url": video_url,
        "wait_time": wait_time,
        "headless": headless,
        "timeout": 30
    }
    if proxy:
        payload["proxy"] = proxy
    
    print(f"\n[*] 请求 URL: {base_url}/sniff")
    print(f"[*] 请求参数:")
    print(json.dumps(payload, indent=2, ensure_ascii=False))
    print(f"\n[*] 正在嗅探，请稍候...")
    
    try:
        response = requests.post(
            f"{base_url}/sniff",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=120
        )
        
        print(f"\n[*] 状态码: {response.status_code}")
        result = response.json()
        
        print(f"\n[*] 响应结果:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
        # 显示简洁结果
        print("\n" + "-"*60)
        if result.get("success"):
            videos = result.get("videos", [])
            print(f"[✓] 成功找到 {len(videos)} 个视频")
            for i, video in enumerate(videos, 1):
                print(f"\n  [{i}] 类型: {video.get('type', 'unknown')}")
                print(f"      来源: {video.get('source', 'unknown')}")
                print(f"      URL: {video.get('url', '')}")
        else:
            print("[!] 未找到视频")
            if result.get("errors"):
                print(f"[!] 错误: {result['errors']}")
        
        # 显示元数据
        metadata = result.get("metadata", {})
        if metadata:
            print(f"\n  页面标题: {metadata.get('title', 'N/A')}")
            print(f"  最终 URL: {metadata.get('final_url', 'N/A')}")
            print(f"  状态码: {metadata.get('status', 'N/A')}")
        
        print("-"*60)
        
    except requests.exceptions.Timeout:
        print("\n[!] 请求超时，请检查服务是否正常运行")
    except Exception as e:
        print(f"\n[!] 错误: {e}")


def show_curl_example(base_url: str):
    """显示 curl 命令示例"""
    print("\n" + "="*60)
    print("[3] curl 命令示例")
    print("="*60)
    
    example_url = "https://example.com/video/123"
    
    print("\n# 健康检查")
    print(f"curl {base_url}/health")
    print(f"\n# Windows PowerShell")
    print(f"Invoke-RestMethod -Uri '{base_url}/health'")
    
    print("\n" + "-"*60)
    print("\n# 单 URL 嗅探 (curl)")
    payload = json.dumps({
        "url": example_url,
        "wait_time": 3.0,
        "headless": True
    }, ensure_ascii=False)
    
    if sys.platform == "win32":
        # Windows cmd
        print(f'curl -X POST {base_url}/sniff ^')
        print(f'  -H "Content-Type: application/json" ^')
        print(f'  -d "{payload.replace('"', '\\"')}"')
        
        print(f"\n# Windows PowerShell")
        print(f"$body = @'")
        print(f"{payload}")
        print(f"'@")
        print(f"Invoke-RestMethod -Uri '{base_url}/sniff' -Method POST -ContentType 'application/json' -Body $body")
    else:
        # Linux/Mac
        print(f"curl -X POST {base_url}/sniff \\")
        print(f"  -H 'Content-Type: application/json' \\")
        print(f"  -d '{payload}'")
    
    print("\n" + "-"*60)
    print("\n# 批量嗅探")
    batch_payload = json.dumps({
        "urls": [example_url, example_url],
        "wait_time": 3.0,
        "concurrency": 2
    }, ensure_ascii=False)
    
    if sys.platform == "win32":
        print(f'curl -X POST {base_url}/sniff/batch ^')
        print(f'  -H "Content-Type: application/json" ^')
        print(f'  -d "{batch_payload.replace('"', '\\"')}"')
    else:
        print(f"curl -X POST {base_url}/sniff/batch \\")
        print(f"  -H 'Content-Type: application/json' \\")
        print(f"  -d '{batch_payload}'")


def main():
    parser = argparse.ArgumentParser(description="视频嗅探 API 手动测试工具")
    parser.add_argument("--url", default="http://localhost:8000", help="API 基础 URL (默认: http://localhost:8000)")
    args = parser.parse_args()
    
    base_url = args.url.rstrip("/")
    
    print(f"""
╔══════════════════════════════════════════════════════════╗
║              视频嗅探 API 手动测试工具                   ║
╠══════════════════════════════════════════════════════════╣
║  API 地址: {base_url:<47}║
╚══════════════════════════════════════════════════════════╝
""")
    
    # 测试健康检查
    if not test_health(base_url):
        print("\n[!] 健康检查失败，请确保 API 服务已启动")
        print(f"    尝试启动: python api_fastapi.py")
        return
    
    # 主循环
    while True:
        print("\n" + "="*60)
        print("主菜单")
        print("="*60)
        print("1. 测试单 URL 嗅探 (手动输入)")
        print("2. 查看 curl 命令示例")
        print("3. 退出")
        print()
        
        choice = input("请选择操作 (1-3): ").strip()
        
        if choice == "1":
            try:
                test_sniff_single_manual(base_url)
            except KeyboardInterrupt:
                print("\n\n[!] 操作已取消")
        elif choice == "2":
            show_curl_example(base_url)
        elif choice == "3":
            print("\n[*] 再见!")
            break
        else:
            print("\n[!] 无效选项，请重新选择")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n[*] 程序已退出")
        sys.exit(0)
