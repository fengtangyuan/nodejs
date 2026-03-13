#!/bin/bash

# 视频嗅探 API 服务启动脚本

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║              视频嗅探 API 服务启动器                     ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo "[!] 未找到 Python3，请确保 Python 已安装"
    exit 1
fi

# 检查依赖
echo "[*] 检查依赖..."
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "[!] 未检测到 FastAPI，正在安装依赖..."
    pip3 install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "[!] 依赖安装失败"
        exit 1
    fi
fi

# 选择模式
echo ""
echo "[*] 选择启动模式:"
echo "    1. FastAPI 模式 (推荐，支持自动文档)"
echo "    2. Flask 模式 (轻量级)"
echo ""
read -p "请输入选项 (1-2): " choice

case $choice in
    1)
        echo ""
        echo "[*] 启动 FastAPI 服务..."
        echo "[*] 访问 http://localhost:8000/docs 查看 API 文档"
        echo ""
        python3 api_fastapi.py "$@"
        ;;
    2)
        echo ""
        echo "[*] 启动 Flask 服务..."
        echo "[*] 访问 http://localhost:5000 使用 API"
        echo ""
        python3 api_flask.py "$@"
        ;;
    *)
        echo "[!] 无效选项"
        exit 1
        ;;
esac
