// aowuj_readable 选择器测试脚本
// 用于在浏览器控制台中运行，测试元素提取逻辑

(function() {
    'use strict';

    // 强力反调试脚本
    (function() {
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

        Object.defineProperty(document, 'hidden', { get: () => false });
        Object.defineProperty(document, 'visibilityState', { get: () => 'visible' });

        try {
            window.debugger = undefined;
        } catch(e) {}

        console.log('Anti-debug script loaded');
    })();

    // 测试函数集合
    const tests = {
        // 测试1: 提取线路标题 (getTracks)
        testSwiperSlides: function() {
            const results = [];
            document.querySelectorAll('a.swiper-slide').forEach((el, i) => {
                const text = el.textContent.trim().replace(/\s+/g, '');
                // 排除导航菜单中的 swiper-slide
                if (text && !text.includes('首页') && !text.includes('当季新番') &&
                    !text.includes('番剧') && !text.includes('剧场')) {
                    results.push({
                        index: i,
                        text: text.substring(0, 20),
                        class: el.className,
                        dataForm: el.getAttribute('data-form')
                    });
                }
            });
            return {
                selector: 'a.swiper-slide',
                found: results.length,
                items: results
            };
        },

        // 测试2: 提取播放链接 (getTracks)
        testAnthologyBoxes: function() {
            const results = [];
            document.querySelectorAll('div.anthology-list-box').forEach((box, boxIndex) => {
                const links = [];
                box.querySelectorAll('ul.anthology-list-play li a').forEach((link) => {
                    const name = link.textContent.trim();
                    const href = link.getAttribute('href');
                    if (href) {
                        links.push({
                            name: name,
                            url: href
                        });
                    }
                });
                if (links.length > 0) {
                    results.push({
                        boxIndex: boxIndex,
                        linkCount: links.length,
                        links: links.slice(0, 3) // 只显示前3个
                    });
                }
            });
            return {
                selector: 'div.anthology-list-box ul.anthology-list-play li a',
                found: results.length,
                boxes: results
            };
        },

        // 测试3: 提取搜索结果 (search)
        testVodDetails: function() {
            const results = [];
            document.querySelectorAll('div.vod-detail').forEach((el, i) => {
                if (i < 5) { // 只显示前5个
                    const titleElem = el.querySelector('h3.slide-info-title');
                    const linkElem = el.querySelector('.detail-info > a') || el.querySelector('a');
                    const imgElem = el.querySelector('.detail-pic img');
                    const remarksElem = el.querySelector('span.slide-info-remarks');

                    results.push({
                        index: i,
                        title: titleElem ? titleElem.textContent.trim() : 'N/A',
                        href: linkElem ? linkElem.getAttribute('href') : 'N/A',
                        remarks: remarksElem ? remarksElem.textContent.trim() : 'N/A',
                        hasPic: !!imgElem
                    });
                }
            });
            return {
                selector: 'div.vod-detail',
                found: results.length,
                items: results
            };
        },

        // 测试4: 提取标题 (通用)
        testSlideInfoTitles: function() {
            const results = [];
            document.querySelectorAll('h3.slide-info-title').forEach((el, i) => {
                if (i < 5) {
                    results.push({
                        index: i,
                        text: el.textContent.trim(),
                        class: el.className
                    });
                }
            });
            return {
                selector: 'h3.slide-info-title',
                found: results.length,
                items: results
            };
        },

        // 测试5: 提取 player_aaaa (getPlayinfo)
        testPlayerAaaa: function() {
            const scripts = document.querySelectorAll('script');
            let playerData = null;
            scripts.forEach(script => {
                const match = script.textContent.match(/player_aaaa=(.+?)<\/script>/);
                if (match) {
                    try {
                        playerData = JSON.parse(match[1]);
                    } catch(e) {
                        playerData = 'Parse error: ' + e.message;
                    }
                }
            });
            return {
                selector: 'script:contains("player_aaaa")',
                found: !!playerData,
                data: playerData
            };
        }
    };

    // 运行所有测试
    function runAllTests() {
        console.log('\n=== aowuj_readable 选择器测试 ===\n');
        console.log('URL:', window.location.href);
        console.log('Title:', document.title);

        console.log('\n--- 测试1: 线路标题 (a.swiper-slide) ---');
        const result1 = tests.testSwiperSlides();
        console.log('找到:', result1.found, '个线路');
        console.table(result1.items);

        console.log('\n--- 测试2: 剧集链接 (div.anthology-list-box) ---');
        const result2 = tests.testAnthologyBoxes();
        console.log('找到:', result2.found, '个剧集容器');
        console.table(result2.boxes);

        console.log('\n--- 测试3: 搜索结果 (div.vod-detail) ---');
        const result3 = tests.testVodDetails();
        console.log('找到:', result3.found, '个搜索结果');
        console.table(result3.items);

        console.log('\n--- 测试4: 标题 (h3.slide-info-title) ---');
        const result4 = tests.testSlideInfoTitles();
        console.log('找到:', result4.found, '个标题');
        console.table(result4.items);

        console.log('\n--- 测试5: player_aaaa 数据 ---');
        const result5 = tests.testPlayerAaaa();
        console.log('找到:', result5.found);
        if (result5.data && typeof result5.data === 'object') {
            console.log('encrypt:', result5.data.encrypt);
            console.log('url:', result5.data.url ? result5.data.url.substring(0, 50) + '...' : 'N/A');
        } else {
            console.log('data:', result5.data);
        }

        console.log('\n=== 测试完成 ===\n');

        // 返回结果供进一步处理
        return {
            swiperSlides: result1,
            anthologyBoxes: result2,
            vodDetails: result3,
            slideInfoTitles: result4,
            playerAaaa: result5
        };
    }

    // 导出到全局
    window.aowujTest = {
        runAll: runAllTests,
        tests: tests
    };

    // 自动运行
    return runAllTests();
})();
