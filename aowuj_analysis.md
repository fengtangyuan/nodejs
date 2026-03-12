# aowuj.js 解密还原分析报告

## 一、加密分析

### 1.1 加密工具识别
```
var _0xodn = 'jsjiami.com.v7';
```
- 加密工具：jsjiami.com.v7 (JS 加密器)
- 加密方式：字符串混淆 + RC4 流加密

### 1.2 混淆结构
```javascript
// 典型的 jsjiami 结构
(function (_0x252374, _0x596710, _0xaa466c, ...) {
    // RC4 解密逻辑
    // 字符串映射表 _0x2785
}(0x324, 0x9efa1, _0x2785, 0xcb), _0x2785)
```

## 二、功能还原

### 2.1 基本配置
```javascript
const SITE = 'https://www.aowu.tv';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/604.1.14';

appConfig = {
    ver: 1,
    title: '傲物',
    site: SITE,
    tabs: [
        { name: '新番', ext: { type: 'type=20' } },
        { name: '番剧', ext: { type: 'type=25' } },
        { name: '剧场', ext: { type: 'type=21' } }
    ]
}
```

### 2.2 API 接口对照

| 函数 | 作用 | 请求方式 | 端点 |
|------|------|----------|------|
| getConfig() | 获取配置 | - | 返回 appConfig |
| getCards(ext) | 获取视频列表 | POST | /index.php/ds_api/vod |
| getTracks(ext) | 获取播放轨道 | GET | 详情页 HTML |
| getPlayinfo(ext) | 获取播放地址 | GET/POST | 多层解密 |
| search(ext) | 搜索 | GET | /vodsearch/{page}.html?wd= |

### 2.3 getCards - 视频列表获取
```javascript
// 请求参数
POST /api.php/provide/vod/
Content-Type: application/x-www-form-urlencoded

params = ext.type + '&class=&area=&year=&lang=&version=&state=&letter=&time=&level=0&weekday=&by=time&page=' + page

// 返回数据结构
{
    "list": [
        {
            "vod_id": "...",
            "vod_name": "...",
            "vod_pic": "...",
            "vod_remarks": "...",
            "url": "..."
        }
    ]
}
```

### 2.4 getTracks - 播放轨道解析
```javascript
// HTML 解析目标
$('.module-tab-item')      // 线路标题
$('.module-play-list')     // 播放列表容器
$('.module-play-list-link') // 单集链接

// 数据结构转换
{
    title: lineTitles[index] || '线路' + (index + 1),
    tracks: [
        { name: "01", pan: "", ext: { url: "..." } },
        { name: "02", pan: "", ext: { url: "..." } }
    ]
}
```

## 三、核心解密逻辑 (getPlayinfo)

### 3.1 完整解密流程
```
1. 获取播放页面
   ↓
2. 提取 player_aaaa JSON 配置
   ↓
3. 根据 encrypt 字段解密 URL
   ├─ encrypt=1: unescape()
   └─ encrypt=2: base64decode() + unescape()
   ↓
4. POST /player1/encode.php
   参数: plain=<解密后的URL>
   ↓
5. 构造播放器 URL
   /player1/index.php?data=<url>&ts=<ts>&sign=<sig>
   ↓
6. 获取播放器页面，提取加密数据
   ├─ encryptedUrl
   └─ sessionKey
   ↓
7. AES-256-CBC 解密最终 URL
```

### 3.2 AES 解密参数
```javascript
function decryptAES(encryptedUrl, sessionKey) {
    // 密文: Base64 编码
    const ciphertext = CryptoJS.enc.Base64.parse(encryptedUrl);

    // IV: sessionKey 前 4 个字符 (Hex 解析)
    const iv = CryptoJS.enc.Hex.parse(sessionKey.slice(0, 4));

    // Key: sessionKey 剩余部分 (UTF8)
    const key = CryptoJS.enc.Utf8.parse(sessionKey.slice(4));

    // 解密配置
    {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    }
}
```

## 四、与 czzy.js 对比

### 4.1 相同点
- 使用 cheerio 解析 HTML
- 使用 CryptoJS 进行加密/解密
- API 接口命名一致 (getConfig, getCards, getTracks, getPlayinfo, search)
- 返回数据结构相同

### 4.2 不同点

| 特性 | aowuj.js | czzy.js |
|------|----------|---------|
| 列表获取方式 | API 接口 | HTML 解析 |
| 播放地址加密 | AES-256-CBC | 自定义/AES |
| 播放器路径 | /player1/ | iframe 嵌入 |
| 搜索 URL | /vodsearch/{n}.html | /daoyongjiek0shibushiyoubing |
| 站点 | aowu.tv | czzymovie.com |

### 4.3 代码风格对比

**czzy.js (HTML 解析方式):**
```javascript
const $ = cheerio.load(data);
$('.bt_img.mi_ne_kd.mrb ul > li').each((_, element) => {
    // 解析 DOM
});
```

**aowuj.js (API 方式):**
```javascript
const { data } = await $fetch.post(url, params);
argsify(data).list.forEach(item => {
    // 解析 JSON
});
```

## 五、关键字符串映射表

从加密代码中提取的关键字符串：

| 混淆后 | 原始值 |
|--------|--------|
| _0x586329(0x1ef, '#OgP') | Mozilla/5.0... (UA) |
| _0x586329(0x192, 'FY#D') | 傲物 |
| _0x586329(0x16d, 'DWwl') | type=25 |
| _0x586329(0x171, '5N)H') | type=21 |
| '.module-tab-item' | 线路标题选择器 |
| '.module-play-list' | 播放列表选择器 |
| /api.php/provide/vod/ | API 端点 |
| /player1/encode.php | 编码接口 |
| /player1/index.php | 播放器接口 |

## 六、解密示例

假设以下加密数据：
```javascript
encryptedUrl = "U2FsdGVkX1..."
sessionKey = "a1b2c3d4secretkey123"
```

解密过程：
```javascript
// 1. Base64 解码密文
ciphertext = CryptoJS.enc.Base64.parse(encryptedUrl)

// 2. 提取 IV 和 Key
iv = CryptoJS.enc.Hex.parse("a1b2")      // 前 4 字符
key = CryptoJS.enc.Utf8.parse("c3d4secretkey123")  // 剩余部分

// 3. AES 解密
decrypted = CryptoJS.AES.decrypt(
    { ciphertext: ciphertext },
    key,
    { iv: iv, mode: CBC, padding: Pkcs7 }
)

// 4. 输出原始 URL
playUrl = decrypted.toString(CryptoJS.enc.Utf8)
// 结果: "https://example.com/video.m3u8"
```

## 七、总结

1. **aowuj.js** 是一个针对 aowu.tv 的视频爬虫脚本
2. 使用 jsjiami.com.v7 进行加密保护
3. 核心功能：视频列表、播放轨道、播放地址获取
4. 播放地址使用 AES-256-CBC 加密
5. 参考czzy.js 的结构进行还原，保持代码风格一致
