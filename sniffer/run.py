#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
视频嗅探启动脚本

用法:
    python run.py <URL> [选项]
    
示例:
    python run.py "https://example.com/video/123"
    python run.py "https://example.com/video/123" -t 5 -o result.json
"""

import sys
import os

# 确保可以导入 sniffer 模块
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sniffer import main

if __name__ == '__main__':
    main()
