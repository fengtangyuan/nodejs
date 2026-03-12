// aowuj.js 手动解密 - 基于代码分析
const fs = require('fs');

// 读取原始加密文件
const encryptedCode = fs.readFileSync('./aowuj.js', 'utf-8');

// 基于代码分析和 czzy.js 对比，提取已知的明文字符串
const knownStrings = {
    // 从代码中直接可见的字符串
    'https://www.aowu.tv': 'https://www.aowu.tv',
    '新番': '新番',
    '番剧': '番剧',
    '剧场': '剧场',
    'type=20': 'type=20',
    '/player1/encode.php': '/player1/encode.php',

    // 基于 czzy.js 推测的字符串
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/604.1.14 (KHTML, like Gecko)': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/604.1.14 (KHTML, like Gecko)',
    'Referer': 'Referer',
    'Origin': 'Origin',
    'User-Agent': 'User-Agent',
    'site': 'site',
    'get': 'get',
    'post': 'post',
    'href': 'href',
    'data-src': 'data-src',
    'src': 'src',
    'push': 'push',
    'each': 'each',
    'find': 'find',
    'text': 'text',
    'attr': 'attr',
    'load': 'load',
};

// 从代码中提取更多字符串
console.log('分析 aowuj.js 中的字符串...\n');

// 提取所有单引号和双引号字符串
const stringPattern = /(['"`])(?:(?!\1|\\).|\\.)*\1/g;
const foundStrings = new Set();
let match;
while ((match = stringPattern.exec(encryptedCode)) !== null) {
    let s = match[0].slice(1, -1);
    if (s.length > 0 && s.length < 100) {
        foundStrings.add(s);
    }
}

console.log(`找到 ${foundStrings.size} 个字符串`);
console.log('\n=== 明文字符串列表 ===');
Array.from(foundStrings).sort().forEach(s => {
    console.log(`"${s}"`);
});

// 尝试识别关键字符串模式
console.log('\n=== 识别的关键字符串 ===');
const keyPatterns = {
    'URL 模式': /[a-z]+:\/\/[^\s"'`]+|\/[a-z0-9_\-\/]+/gi,
    'CSS 选择器': /[.#][a-z_\-][a-z0-9_\-]*/gi,
    'HTTP 方法': /\b(get|post|put|delete|head|options)\b/gi,
    '属性名': /\b(href|src|data-src|class|id|name|type|value)\b/gi,
};

Object.entries(keyPatterns).forEach(([name, pattern]) => {
    const matches = encryptedCode.match(pattern) || [];
    const uniqueMatches = [...new Set(matches)].filter(m => m.length < 50);
    if (uniqueMatches.length > 0) {
        console.log(`\n${name}:`);
        uniqueMatches.slice(0, 20).forEach(m => console.log(`  ${m}`));
    }
});

// 分析函数调用模式
console.log('\n=== 函数调用模式 ===');
const functionCalls = {
    'cheerio.': (encryptedCode.match(/cheerio\.\w+/g) || []).length,
    'CryptoJS.': (encryptedCode.match(/CryptoJS\.\w+/g) || []).length,
    '$fetch.': (encryptedCode.match(/\$fetch\.\w+/g) || []).length,
    '_0x586329': (encryptedCode.match(/_0x586329\(/g) || []).length,
};
Object.entries(functionCalls).forEach(([name, count]) => {
    console.log(`${name}: ${count} 次调用`);
});

console.log('\n=== 建议的手动解密方法 ===');
console.log('1. 基于上述字符串列表，结合 czzy.js 的结构手动重构代码');
console.log('2. 重点关注 cheerio、CryptoJS 和 $fetch 的调用模式');
console.log('3. _0x586329 函数调用需要手动解密或替换');

