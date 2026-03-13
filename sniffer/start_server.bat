@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║              视频嗅探 API 服务启动器                     ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

REM 检查 Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [!] 未找到 Python，请确保 Python 已安装并添加到 PATH
    pause
    exit /b 1
)

REM 检查依赖
echo [*] 检查依赖...
python -c "import fastapi" >nul 2>&1
if errorlevel 1 (
    echo [!] 未检测到 FastAPI，正在安装依赖...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo [!] 依赖安装失败
        pause
        exit /b 1
    )
)

REM 选择模式
echo.
echo [*] 选择启动模式:
echo     1. FastAPI 模式 (推荐，支持自动文档)
echo     2. Flask 模式 (轻量级)
echo.
set /p choice="请输入选项 (1-2): "

if "%choice%"=="1" (
    echo.
    echo [*] 启动 FastAPI 服务...
    echo [*] 访问 http://localhost:8000/docs 查看 API 文档
    echo.
    python api_fastapi.py
) else if "%choice%"=="2" (
    echo.
    echo [*] 启动 Flask 服务...
    echo [*] 访问 http://localhost:5000 使用 API
    echo.
    python api_flask.py
) else (
    echo [!] 无效选项
    pause
    exit /b 1
)

pause
