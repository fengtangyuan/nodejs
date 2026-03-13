#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
视频嗅探模块使用示例
"""

import asyncio
from sniffer import sniff_video, sniff_videos, VideoSniffer


async def example_1_basic():
    """示例1: 基本用法 - 快速嗅探单个页面"""
    print("=" * 50)
    print("示例1: 基本用法")
    print("=" * 50)
    
    # 替换为实际的视频页面 URL
    test_url = "https://example.com/video/123"
    
    result = await sniff_video(
        url=test_url,
        headless=True,   # 后台运行
        wait_time=3.0    # 等待3秒让页面加载完成
    )
    
    print(f"\n页面标题: {result.metadata.get('title', 'N/A')}")
    print(f"找到视频: {len(result.videos)} 个")
    
    for i, video in enumerate(result.videos, 1):
        print(f"\n[{i}] {video.type.upper()}")
        print(f"    来源: {video.source}")
        print(f"    URL: {video.url}")
    
    if result.errors:
        print(f"\n错误: {result.errors}")
    
    return result


async def example_2_batch():
    """示例2: 批量嗅探多个页面"""
    print("\n" + "=" * 50)
    print("示例2: 批量嗅探")
    print("=" * 50)
    
    urls = [
        "https://example.com/video/1",
        "https://example.com/video/2",
        "https://example.com/video/3",
    ]
    
    results = await sniff_videos(
        urls=urls,
        headless=True,
        concurrency=2  # 并发数
    )
    
    for result in results:
        print(f"\n{result.page_url}")
        print(f"  视频数: {len(result.videos)}")
        for video in result.videos:
            print(f"  - {video.type}: {video.url[:80]}...")
    
    return results


async def example_3_advanced():
    """示例3: 高级用法 - 复用浏览器实例，自定义参数"""
    print("\n" + "=" * 50)
    print("示例3: 高级用法")
    print("=" * 50)
    
    # 创建嗅探器实例，可以复用浏览器
    async with VideoSniffer(
        headless=True,
        browser_type='chromium',  # chromium, firefox, webkit
        timeout=30,
        # proxy='http://127.0.0.1:7890',  # 如有需要可启用代理
        user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ) as sniffer:
        
        # 第一个页面
        print("\n[*] 嗅探页面 1...")
        result1 = await sniffer.sniff(
            url="https://example.com/video/1",
            wait_time=3.0,
            wait_for_selector="video"  # 等待 video 元素出现
        )
        print(f"找到 {len(result1.videos)} 个视频")
        
        # 第二个页面（复用同一个浏览器实例）
        print("\n[*] 嗅探页面 2...")
        result2 = await sniffer.sniff(
            url="https://example.com/video/2",
            wait_time=3.0
        )
        print(f"找到 {len(result2.videos)} 个视频")
        
        # 第三个页面
        print("\n[*] 嗅探页面 3...")
        result3 = await sniffer.sniff(
            url="https://example.com/video/3",
            wait_time=5.0  # 更长的等待时间
        )
        print(f"找到 {len(result3.videos)} 个视频")
    
    return [result1, result2, result3]


async def example_4_json_output():
    """示例4: JSON 输出"""
    print("\n" + "=" * 50)
    print("示例4: JSON 输出")
    print("=" * 50)
    
    result = await sniff_video(
        url="https://example.com/video/123",
        headless=True,
        wait_time=3.0
    )
    
    # 输出 JSON 格式结果
    json_output = result.to_json(indent=2)
    print(json_output)
    
    # 保存到文件
    with open('result.json', 'w', encoding='utf-8') as f:
        f.write(json_output)
    print("\n[*] 结果已保存到 result.json")
    
    return result


def print_usage():
    """打印使用说明"""
    print("""
视频嗅探模块 - 使用示例

请修改本文件中的 test_url 为实际的视频页面 URL，然后运行：

    python example.py [示例编号]

示例:
    python example.py 1    # 运行示例1: 基本用法
    python example.py 2    # 运行示例2: 批量嗅探
    python example.py 3    # 运行示例3: 高级用法
    python example.py 4    # 运行示例4: JSON 输出
    python example.py all  # 运行所有示例

或者直接在代码中调用：

    import asyncio
    from sniffer import sniff_video
    
    async def main():
        result = await sniff_video("https://your-video-url.com")
        print(result.to_json())
    
    asyncio.run(main())
""")


async def main():
    """主函数"""
    import sys
    
    if len(sys.argv) < 2:
        print_usage()
        return
    
    arg = sys.argv[1]
    
    try:
        if arg == '1':
            await example_1_basic()
        elif arg == '2':
            await example_2_batch()
        elif arg == '3':
            await example_3_advanced()
        elif arg == '4':
            await example_4_json_output()
        elif arg == 'all':
            await example_1_basic()
            await example_2_batch()
            await example_3_advanced()
            await example_4_json_output()
        else:
            print_usage()
    except Exception as e:
        print(f"\n[!] 错误: {e}")
        print("[!] 请确保已安装 playwright: pip install playwright && playwright install chromium")


if __name__ == '__main__':
    asyncio.run(main())
