const fs = require('fs');

// 读取加密文件
const code = fs.readFileSync('aowuj.js', 'utf8');

// 创建执行环境
const setupCode = `
function createCheerio() { return {}; }
function createCryptoJS() { return {}; }
function jsonify(obj) { return JSON.stringify(obj); }
function argsify(ext) { return typeof ext === 'string' ? JSON.parse(ext) : ext; }
const $fetch = { get: async () => ({ data: '' }), post: async () => ({ data: '' }) };
const $utils = { openSafari: () => {} };
const $print = console.log;
let $config_str = '{}';

${code}

if (typeof module !== 'undefined') {
    module.exports = { _0x32a9 };
}
`;

fs.writeFileSync('temp_decrypt.cjs', setupCode);

const { _0x32a9 } = require('./temp_decrypt.cjs');

// 解密后的代码
let decryptedCode = code;

// 匹配所有形式的解密调用: _0xXXXXXX(0xXXX, 'YYY')
// 这包括 _0x586329, _0x3d2236, _0x51060c, _0x4974a4 等
const regex = /_0x[0-9a-f]+\((0x[0-9a-f]+),\s*['"]([^'"]+)['"]\)/g;
const matches = [...code.matchAll(regex)];

console.log(`找到 ${matches.length} 个加密字符串调用`);

// 创建一个映射来存储解密结果
const decryptedMap = new Map();

for (const match of matches) {
    const fullMatch = match[0];
    const index = parseInt(match[1], 16);
    const key = match[2];
    
    try {
        const decrypted = _0x32a9(index, key);
        if (!decryptedMap.has(fullMatch)) {
            decryptedMap.set(fullMatch, decrypted);
        }
    } catch (e) {
        // 忽略解密失败的
    }
}

console.log(`成功解密 ${decryptedMap.size} 个唯一字符串`);

// 按长度从长到短排序，避免部分替换问题
const sortedEntries = [...decryptedMap.entries()].sort((a, b) => b[0].length - a[0].length);

// 替换所有加密调用
for (const [encrypted, decrypted] of sortedEntries) {
    // 选择合适的引号
    let replacement;
    if (decrypted.includes('`')) {
        replacement = '"' + decrypted.replace(/"/g, '\\"') + '"';
    } else if (decrypted.includes('"')) {
        replacement = "'" + decrypted + "'";
    } else if (decrypted.includes("'")) {
        replacement = '"' + decrypted + '"';
    } else {
        replacement = "'" + decrypted + "'";
    }
    
    // 转义正则特殊字符
    const escaped = encrypted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    decryptedCode = decryptedCode.replace(new RegExp(escaped, 'g'), replacement);
}

// 清理临时文件
fs.unlinkSync('temp_decrypt.cjs');

// 写入解密后的文件
fs.writeFileSync('aowuj_decoded.js', decryptedCode);
console.log('\n解密完成！已保存到 aowuj_decoded.js');

// 显示一些解密示例
console.log('\n=== 解密示例（前20个）===');
let count = 0;
for (const [encrypted, decrypted] of sortedEntries.slice(0, 20)) {
    console.log(`${encrypted} => '${decrypted}'`);
}
