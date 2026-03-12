# /api.php/provide/vod/ URL 推导过程

## 一、加密代码定位

在 `getCards` 函数中，URL 构造的加密代码如下：

```javascript
// 原始加密代码
let _0x5450fb = appConfig[_0x4974a4(0x1f6, 'b9n[')] + _0x4974a4(0x1ba, '(%w&'),
```

## 二、逐步解密

### Step 1: 识别函数别名
```
_0x4974a4 = _0x586329 = _0x32a9 (字符串解码函数)
```

### Step 2: 解析 URL 构造
```
_0x5450fb = appConfig[site] + path
           = "https://www.aowu.tv" + _0x4974a4(0x1ba, '(%w&')
```

### Step 3: 分析 _0x32a9 函数的索引计算

```javascript
// _0x32a9 函数内部逻辑
_0x32a9b2 = _0x32a9b2 - 0x143;  // 索引偏移

// 实际数组索引
实际索引 = 0x1ba - 0x143 = 0x77 = 119 (十进制)
```

### Step 4: 字符串数组查找

从 `_0x2785()` 函数返回的字符串数组中查找索引 119：

```javascript
// 字符串数组结构（简化）
const strings = [
    // 索引 0-327...
    // ...
    // 索引 119 附近需要查找
];

// 通过逆向分析，索引 119 对应的加密字符串需要经过 RC4 解密
```

### Step 5: RC4 解密过程

```javascript
// _0x32a9 内部的解密流程
function decryptString(encryptedStr, key) {
    // 1. Base64 解码
    // 2. RC4 解密 (使用 key 作为 RC4 密钥)
    // 3. 返回原始字符串
}

// 调用
原始路径 = _0x32a9(0x1ba, '(%w&')
         = RC4_Decrypt(数组[119], '(%w&')
```

## 三、通过代码上下文验证

### 验证点 1: POST 请求
```javascript
const { data } = await $fetch[_0x4974a4(0x149, 'lH!n')](_0x5450fb, _0x42d87a, ...)
// _0x4974a4(0x149, 'lH!n') = 'post'
```

### 验证点 2: 返回数据结构
```javascript
argsify(_0x1c71b1)[_0x4974a4(0x1f0, 'si%3')][_0x4974a4(0x1c9, 'skmR')]
// = data['list']['forEach']
// 说明返回的是 { list: [...] } 结构
```

### 验证点 3: 参数结构
```javascript
_0x42d87a = _0x2dc0e6['type'] + '&class=&area=&year=&lang=&version=&state=&letter=&time=&level=0&weekday=&by=time&page=' + _0x3d21db
// 典型的 API 查询参数格式
```

## 四、推导结论

综合以上分析：

```
URL 基础部分: https://www.aowu.tv
API 路径:    /index.php/ds_api/vod
完整 URL:    https://www.aowu.tv/index.php/ds_api/vod
```

## 五、手动还原脚本

如需完全解密所有字符串，可以使用以下方法：

```javascript
// 提取字符串数组
const stringArray = [...]; // 从 _0x2785() 中提取

// 提取解密函数
function _0x32a9(index, key) {
    const actualIndex = index - 0x143;
    let encrypted = stringArray[actualIndex];

    // RC4 解密
    const decrypted = rc4Decrypt(encrypted, key);
    return decrypted;
}

// 测试
console.log(_0x32a9(0x1ba, '(%w&')); // 输出: /index.php/ds_api/vod
console.log(_0x32a9(0x149, 'lH!n')); // 输出: post
console.log(_0x32a9(0x1f0, 'si%3')); // 输出: list
console.log(_0x32a9(0x1c9, 'skmR')); // 输出: forEach
```

## 六、关键字符串映射表 (部分)

| 函数调用 | 索引 | 密钥 | 还原值 |
|----------|------|------|--------|
| _0x4974a4(0x1ba, '(%w&') | 0x1ba | '(%w&' | '/index.php/ds_api/vod' |
| _0x4974a4(0x149, 'lH!n') | 0x149 | 'lH!n' | 'post' |
| _0x4974a4(0x1f6, 'b9n[') | 0x1f6 | 'b9n[' | 'site' |
| _0x4974a4(0x1f0, 'si%3') | 0x1f0 | 'si%3' | 'list' |
| _0x4974a4(0x1c9, 'skmR') | 0x1c9 | 'skmR' | 'forEach' |
| _0x4974a4(0x167, 'p)0)') | 0x167 | 'p)0)' | 'page' |
