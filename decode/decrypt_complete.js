/**
 * 完整解密脚本 - 处理别名调用
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// 读取加密文件
const inputFile = path.join(__dirname, 'aowuj.js');
let code = fs.readFileSync(inputFile, 'utf-8');

// 创建模拟环境
const mockContext = {
    createCheerio: () => ({ load: () => () => ({}) }),
    createCryptoJS: () => ({
        enc: {
            Hex: { parse: (s) => ({ words: [], sigBytes: 0 }) },
            Utf8: { parse: (s) => ({ words: [], sigBytes: 0 }) },
            Base64: { parse: (s) => ({ words: [], sigBytes: 0 }) }
        },
        AES: { decrypt: () => ({ toString: () => '' }) },
        mode: { CBC: null },
        pad: { ZeroPadding: null }
    }),
    $fetch: { get: async () => ({ data: '' }), post: async () => ({ data: '' }) },
    argsify: (x) => x || {},
    jsonify: (x) => x,
    $print: console.log,
    $config_str: '{}',
    console: console,
    global: null,
    process: process,
    setTimeout: setTimeout,
    setImmediate: setImmediate
};

// 创建执行上下文
const context = new vm.createContext(mockContext);

// 执行代码以获取解密函数
vm.runInContext(code, context);

const decryptFunc = context._0x32a9;

console.log('开始完整解密...\n');

// 移除自执行函数部分（在 cheerio 之前）
const beforeCheerio = code.indexOf('const cheerio = createCheerio()');
let decryptedCode = code.substring(beforeCheerio);

// 找出所有别名的定义和调用
// 首先找出所有 _0x586329 和 _0x32a9 的别名
const aliasDefs = [];
const defPattern = /const (_0x[0-9a-f]+) = (_0x586329|_0x32a9)/g;
let match;
while ((match = defPattern.exec(decryptedCode)) !== null) {
    aliasDefs.push({
        alias: match[1],
        original: match[2]
    });
}

console.log(`找到 ${aliasDefs.length} 个解密函数别名`);

// 收集所有需要解密的调用（包括直接调用和别名调用）
const allCalls = [];

// 直接调用
const directPattern = /(_0x586329|_0x32a9)\(0x([0-9a-fA-F]+),\s*'([^']+)'\)/g;
while ((match = directPattern.exec(decryptedCode)) !== null) {
    allCalls.push({
        funcName: match[1],
        offset: parseInt(match[2], 16),
        key: match[3],
        start: match.index,
        end: match.index + match[0].length,
        fullMatch: match[0]
    });
}

// 别名调用
for (const alias of aliasDefs) {
    const aliasPattern = new RegExp(`${alias.alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\(0x([0-9a-fA-F]+),\\s*'([^']+)'\\)`, 'g');
    while ((match = aliasPattern.exec(decryptedCode)) !== null) {
        allCalls.push({
            funcName: alias.alias,
            offset: parseInt(match[1], 16),
            key: match[2],
            start: match.index,
            end: match.index + match[0].length,
            fullMatch: match[0]
        });
    }
}

console.log(`找到 ${allCalls.length} 个需要处理的调用\n`);

// 解密并替换
const replaced = new Map();

for (const call of allCalls) {
    const key = `${call.offset}|${call.key}`;
    if (!replaced.has(key)) {
        try {
            const decrypted = decryptFunc(call.offset, call.key);
            const escapedStr = JSON.stringify(decrypted);
            replaced.set(key, escapedStr);
            console.log(`[0x${call.offset.toString(16)}] ${decrypted}`);
        } catch (e) {
            console.error(`解密失败 [0x${call.offset.toString(16)}, '${call.key}']: ${e.message}`);
        }
    }
}

console.log(`\n共解密 ${replaced.size} 个不同的字符串\n`);

// 从后向前替换，避免位置偏移
const sortedCalls = [...allCalls].sort((a, b) => b.start - a.start);
let replaceCount = 0;

for (const call of sortedCalls) {
    const key = `${call.offset}|${call.key}`;
    const replacement = replaced.get(key);
    if (replacement) {
        decryptedCode = decryptedCode.substring(0, call.start) +
                        replacement +
                        decryptedCode.substring(call.end);
        replaceCount++;
    }
}

console.log(`替换了 ${replaceCount} 处调用\n`);

// 移除 _0x2785 和 _0x32a9 函数定义
decryptedCode = decryptedCode.replace(/function _0x2785\(\) \{[\s\S]*?return _0x2785; \};\s*/g, '');
decryptedCode = decryptedCode.replace(/function _0x32a9\([^)]+\) \{[\s\S]*?\}, _0x32a9\([^)]+\);\s*\}\s*/g, '');

// 移除版本标记
decryptedCode = decryptedCode.replace(/var version_ = 'jsjiami\.com\.v7';\s*/g, '');

// 清理多余空行
decryptedCode = decryptedCode.replace(/\n{3,}/g, '\n\n');

// 移除行尾多余空格
decryptedCode = decryptedCode.replace(/[ \t]+$/gm, '');

// 保存解密后的代码
const outputFile = path.join(__dirname, 'aowuj_decrypted.js');
fs.writeFileSync(outputFile, decryptedCode, 'utf-8');
console.log(`解密后的代码已保存到: aowuj_decrypted.js`);

// 保存字符串列表
const listFile = path.join(__dirname, 'decrypted_strings.txt');
let listContent = '=== 解密后的字符串列表 ===\n\n';
const sortedKeys = [...replaced.keys()].sort((a, b) => {
    const [offsetA] = a.split('|');
    const [offsetB] = b.split('|');
    return parseInt(offsetA) - parseInt(offsetB);
});
for (const key of sortedKeys) {
    const [offset, keyStr] = key.split('|');
    listContent += `[0x${parseInt(offset).toString(16)}] ${replaced.get(key).slice(1, -1)}\n`;
}
fs.writeFileSync(listFile, listContent, 'utf-8');
console.log(`字符串列表已保存到: decrypted_strings.txt`);

console.log('\n解密完成！');
console.log(`共解密 ${replaced.size} 个不同的字符串`);
console.log(`替换了 ${replaceCount} 处调用`);
