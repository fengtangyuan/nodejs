# aowuj_readable 选择器测试报告

## 测试日期
2026-03-13

## 测试目标网站
https://www.aowu.tv

## 反调试问题

**问题**: 网站具有强大的反调试机制，会导致浏览器页面被重定向到 `about:blank`

**解决方案**: 通过 curl 直接获取 HTML 进行分析，或在页面加载前注入反调试脚本

---

## 选择器验证结果

### ✅ 正确的选择器

| 选择器 | 用途 | 状态 | 实际 HTML 验证 |
|--------|------|------|----------------|
| `div.vod-detail` | 搜索结果卡片 | ✅ 正确 | `<div class="vod-detail style-detail cor4 search-list">` |
| `h3.slide-info-title` | 标题 | ✅ 正确 | `<h3 class="slide-info-title hide">葬送的芙莉莲 第二季</h3>` |
| `div.anthology-list-box` | 剧集容器 | ✅ 正确 | `<div class='anthology-list-box none dx'>` |
| `ul.anthology-list-play li a` | 剧集链接 | ✅ 正确 | `<a class="hide cor4" href="/play/3XAAAK-1-1/"><span>第01话</span>` |

### ⚠️ 需要改进的选择器

| 选择器 | 问题 | 建议 |
|--------|------|------|
| `a.swiper-slide` | 会匹配导航菜单 | 改为 `a.vod-playerUrl.swiper-slide` 或添加过滤条件 |

---

## 详细分析

### 1. getTracks 函数 - 提取线路标题

**当前选择器**: `$("a.swiper-slide")`

**问题**: 会同时匹配到导航菜单中的 `li.swiper-slide > a` 元素
```html
<!-- 不想要的导航链接 -->
<li class="swiper-slide"><a target="_self" href="/">首页</a></li>
<li class="swiper-slide"><a target="_blank" href="/show/YAAAAK-.html">当季新番</a></li>

<!-- 想要的线路链接 -->
<a data-form="Moe-D" class="vod-playerUrl swiper-slide on nav-dt">D线</a>
<a data-form="Moe-T" class="vod-playerUrl swiper-slide ">T线</a>
<a data-form="M" class="vod-playerUrl swiper-slide ">S线</a>
```

**建议修改**:
```javascript
// 方案1: 使用更具体的选择器
$("a.vod-playerUrl.swiper-slide").each((i, elem) => {
    const title = $(elem).text().trim().replace(/\s+/g, '').substring(0, 20);
    if (title) titles.push(title);
});

// 方案2: 添加过滤条件
$("a.swiper-slide").each((i, elem) => {
    const $elem = $(elem);
    // 只选择包含 data-form 属性的元素（线路选择）
    if (!$elem.attr('data-form')) return;

    const title = $elem.text().trim().replace(/\s+/g, '').substring(0, 20);
    if (title) titles.push(title);
});
```

### 2. getTracks 函数 - 提取剧集链接

**当前选择器**: `$("div.anthology-list-box")` + `$("ul.anthology-list-play li a")`

**状态**: ✅ 正确

```html
<div class='anthology-list-box none dx'>
    <ul class="anthology-list-play size">
        <li class="bj3 border on ecnav-dt">
            <a class="hide cor4" href="/play/3XAAAK-1-1/">
                <span>第01话</span>
            </a>
        </li>
    </ul>
</div>
```

### 3. search 函数 - 提取搜索结果

**当前选择器**: `$("div.vod-detail")`

**状态**: ✅ 正确

```html
<div class="vod-detail style-detail cor4 search-list">
    <a target="_blank" href="/bangumi/3XAAAK/">
        <h3 class="slide-info-title hide">葬送的芙莉莲 第二季</h3>
    </a>
    <div class="vod-detail-bnt">
        <a target="_blank" href="/play/3XAAAK-1-1/" class="button">播放</a>
    </div>
</div>
```

### 4. search 函数 - 提取标题

**当前选择器**: `$("h3.slide-info-title")`

**状态**: ✅ 正确

---

## 反调试脚本

如果需要在浏览器中测试，可以使用以下脚本禁用反调试：

```javascript
(function() {
    'use strict';

    // 禁用 setInterval 和 setTimeout 中的 debugger
    const _setInterval = window.setInterval;
    const _setTimeout = window.setTimeout;
    const _eval = window.eval;

    window.setInterval = function(handler, timeout, ...args) {
        if (typeof handler === 'string' && handler.includes('debugger')) {
            return 0;
        }
        return _setInterval.call(this, handler, timeout, ...args);
    };

    window.setTimeout = function(handler, timeout, ...args) {
        if (typeof handler === 'string' && handler.includes('debugger')) {
            return 0;
        }
        return _setTimeout.call(this, handler, timeout, ...args);
    };

    window.eval = function(code) {
        if (typeof code === 'string' && code.includes('debugger')) {
            return;
        }
        return _eval.call(this, code);
    };

    // 禁用 devtools 检测
    Object.defineProperty(document, 'hidden', { get: () => false });
    Object.defineProperty(document, 'visibilityState', { get: () => 'visible' });

    try { window.debugger = undefined; } catch(e) {}
})();
```

---

## 总结

1. **大部分选择器都是正确的** ✅
2. **唯一需要改进的是线路选择器** `a.swiper-slide`，建议改用 `a.vod-playerUrl.swiper-slide` 或添加过滤条件
3. **反调试问题**：网站有强反调试，建议使用 curl 获取 HTML 或在页面加载前注入反调试脚本
4. **测试脚本**: 已创建 `test_selectors.js` 用于在浏览器控制台中测试

## 修改建议

将 `getTracks` 函数中的线路提取代码修改为：

```javascript
// 修改前
$("a.swiper-slide").each((i, elem) => {
    const title = $(elem).text().trim().replace(/\s+/g, '').substring(0, 20);
    if (title) titles.push(title);
});

// 修改后（推荐方案1）
$("a.vod-playerUrl.swiper-slide").each((i, elem) => {
    const title = $(elem).text().trim().replace(/\s+/g, '').substring(0, 20);
    if (title) titles.push(title);
});

// 或（推荐方案2）
$("a.swiper-slide[data-form]").each((i, elem) => {
    const title = $(elem).text().trim().replace(/\s+/g, '').substring(0, 20);
    if (title) titles.push(title);
});
```
