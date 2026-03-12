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
    module.exports = { _0x32a9, appConfig };
}
`;

fs.writeFileSync('temp_decrypt.cjs', setupCode);

const { _0x32a9, appConfig } = require('./temp_decrypt.cjs');

// 解密后的代码
let decryptedCode = code;

// 匹配所有的 _0x586329(0xXXX, 'YYY') 调用
const regex = /_0x586329\((0x[0-9a-f]+),\s*['"]([^'"]+)['"]\)/g;
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
        console.log(`解密失败: ${fullMatch}`);
    }
}

console.log(`成功解密 ${decryptedMap.size} 个唯一字符串`);

// 替换所有加密调用
for (const [encrypted, decrypted] of decryptedMap) {
    // 如果解密后的字符串包含特殊字符，需要用引号包裹
    let replacement;
    if (decrypted.includes('\\') || decrypted.includes('"') || decrypted.includes('\n') || decrypted.includes('\r')) {
        replacement = '\`' + decrypted.replace(/\\/g, '\\\\').replace(/\`/g, '\\`').replace(/\$/g, '\\$') + '\`';
    } else if (decrypted.includes("'")) {
        replacement = '"' + decrypted + '"';
    } else {
        replacement = '\'' + decrypted + '\'';
    }
    
    // 转义正则特殊字符
    const escaped = encrypted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    decryptedCode = decryptedCode.replace(new RegExp(escaped, 'g'), replacement);
}

// 清理
fs.unlinkSync('temp_decrypt.cjs');

// 美化输出 - 添加换行
// 在函数声明后添加换行
decryptedCode = decryptedCode.replace(/(async function \w+\([^)]*\) \{)/g, '\n$1');
decryptedCode = decryptedCode.replace(/(function \w+\([^)]*\) \{)/g, '\n$1');
decryptedCode = decryptedCode.replace(/(const [a-zA-Z0-9_]+ = )/g, '\n$1');
decryptedCode = decryptedCode.replace(/(let [a-zA-Z0-9_]+ = )/g, '\n$1');
decryptedCode = decryptedCode.replace(/(var [a-zA-Z0-9_]+ = )/g, '\n$1');
decryptedCode = decryptedCode.replace(/(;)/g, '$1\n');
decryptedCode = decryptedCode.replace(/(\})/g, '$1\n');

// 写入解密后的文件
fs.writeFileSync('aowuj_decoded.js', decryptedCode);
console.log('\n解密完成！已保存到 aowuj_decoded.js');

// 显示解密后的 appConfig
console.log('\n=== AppConfig ===');
console.log(JSON.stringify(appConfig, null, 2));
