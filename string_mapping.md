# aowuj.js 字符串解密完整映射表

## 解密方法

通过直接执行原始加密代码并调用解密函数 `_0x586329` (即 `_0x32a9`) 获取真实字符串。

## 完整映射表

### 基础配置

| 索引 | 密钥 | 解密值 | 说明 |
|------|------|--------|------|
| 0x192 | FY#D | 嗷呜动漫 | title |
| 0x1EF | #OgP | Mozilla/5.0 (Macintosh;...) | UA |
| 0x16D | DWwl | type=21 | 番剧分类 |
| 0x171 | 5N)H | type=22 | 剧场分类 |

### getCards 函数

| 索引 | 密钥 | 解密值 | 说明 |
|------|------|--------|------|
| 0x1BA | (%w& | /index.php/ds_api/vod | API 路径 |
| 0x149 | lH!n | post | HTTP 方法 |
| 0x1F6 | b9n[ | site | 站点配置 |
| 0x1F0 | si%3 | list | 列表属性 |
| 0x1C9 | skmR | forEach | 数组方法 |
| 0x167 | p)0) | page | 页码 |
| 0x16B | %96U | vod_id | 视频ID |
| 0x17C | ZcQT | vod_name | 视频名称 |
| 0x204 | VpP] | vod_pic | 视频图片 |
| 0x169 | Y4By | vod_remarks | 备注信息 |
| 0x1D3 | FY#D | site | 站点 |
| 0x18D | si%3 | push | 数组方法 |

### getTracks 函数

| 索引 | 密钥 | 解密值 | 说明 |
|------|------|--------|------|
| 0x1A0 | BStM | url | URL属性 |
| 0x1E4 | !&C$ | get | HTTP方法 |
| 0x1CB | ej(K | load | cheerio方法 |
| 0x208 | vcWe | each | 遍历方法 |
| 0x20A | ad6p | trim | 去空格 |
| 0x19A | p)0) | attr | 获取属性 |
| 0x1A4 | BStM | href | href属性 |
| 0x19B | hGdM | find | 查找方法 |
| 0x1E1 | nL&Q | push | 添加到数组 |
| 0x184 | (%w& | length | 长度 |
| 0x148 | 7mte | sort | 排序 |
| 0x19E | pMpp | name | 名称属性 |
| 0x17A | nL&Q | /vods/page/ | 搜索路径 |
| 0x15E | o]p# | /wd/ | 搜索参数 |

### getPlayinfo 函数

| 索引 | 密钥 | 解密值 | 说明 |
|------|------|--------|------|
| 0x197 | 7mte | parse | JSON解析 |
| 0x182 | hGdM | url | URL属性 |
| 0x1BC | ES!R | url | URL属性 |
| 0x190 | 5N)H | encrypt | 加密类型 |
| 0x18C | 5N)H | /player1/?url= | 播放器路径 |
| 0x20D | o]p# | get | HTTP方法 |
| 0x187 | #OgP | match | 正则匹配 |
| 0x1B8 | FY#D | match | 正则匹配 |
| 0x172 | pXpG | site | 站点 |
| 0x1AB | ZcQT | url | URL属性 |

### search 函数

| 索引 | 密钥 | 解密值 | 说明 |
|------|------|--------|------|
| 0x1DF | GgjU | text | 文本属性 |
| 0x1C5 | sWqH | page | 页码属性 |
| 0x1FF | ej(K | site | 站点 |
| 0x1B7 | B5%) | get | HTTP方法 |
| 0x1E7 | nL&Q | find | 查找方法 |
| 0x17D | #*Ke | data-original | 原图属性 |
| 0x1F8 | iJuG | span.slide-info-remarks | 备注选择器 |
| 0x1D5 | FY#D | find | 查找方法 |
| 0x1F1 | skmR | attr | 属性方法 |
| 0x1A1 | &9PX | h3.slide-info-title | 标题选择器 |
| 0x1DD | skmR | text | 文本方法 |
| 0x164 | b9n[ | trim | 去空格 |
| 0x1C4 | Y4By | find | 查找方法 |
| 0x146 | sWqH | text | 文本方法 |
| 0x14D | E*cO | trim | 去空格 |

## 关键发现

### 1. API 接口
```
POST https://www.aowu.tv/index.php/ds_api/vod
参数: type=21&class=&area=&year=&...&page=1
```

### 2. 搜索接口
```
GET https://www.aowu.tv/vods/page/{page}/wd/{keyword}
```

### 3. 播放器路径
```
/player1/?url=...
```

### 4. 选择器映射

| 功能 | 选择器 |
|------|--------|
| 播放列表标题 | span.slide-info-remarks |
| 视频标题 | h3.slide-info-title |
| 原图属性 | data-original |

## 使用说明

通过解密脚本 `decrypt_runner.js` 可以获取任意 (index, key) 对的解密值：

```bash
node decrypt_runner.js
```

如需添加新的解密目标，在脚本的 `targets` 数组中添加 `[index, key]` 对即可。
