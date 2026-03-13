/**
 * 最终解密脚本 - 使用 vm 模块执行代码并解密
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

console.log('开始解密并替换代码...\n');

// 找出所有需要解密的调用
// 模式: _0x586329(0x..., '...') 或 _0x32a9(0x..., '...')
const callPattern = /_0x586329\(0x([0-9a-fA-F]+),\s*'([^']+)'\)/g;
const callPattern2 = /_0x32a9\(0x([0-9a-fA-F]+),\s*'([^']+)'\)/g;

// 收集所有需要解密的调用
const callsToDecrypt = [];
let match;

while ((match = callPattern.exec(code)) !== null) {
    callsToDecrypt.push({
        fullMatch: match[0],
        offset: parseInt(match[1], 16),
        key: match[2],
        start: match.index,
        end: match.index + match[0].length
    });
}

while ((match = callPattern2.exec(code)) !== null) {
    callsToDecrypt.push({
        fullMatch: match[0],
        offset: parseInt(match[1], 16),
        key: match[2],
        start: match.index,
        end: match.index + match[0].length
    });
}

console.log(`找到 ${callsToDecrypt.length} 个需要解密的调用`);

// 解密所有调用并构建替换映射
const replacementMap = new Map();

for (const call of callsToDecrypt) {
    const key = `${call.offset}|${call.key}`;
    if (!replacementMap.has(key)) {
        try {
            const decrypted = decryptFunc(call.offset, call.key);
            // 转义字符串中的特殊字符
            const escapedStr = JSON.stringify(decrypted);
            replacementMap.set(key, {
                original: call.fullMatch,
                replacement: escapedStr,
                decrypted: decrypted
            });
        } catch (e) {
            console.error(`解密失败 [0x${call.offset.toString(16)}, '${call.key}']: ${e.message}`);
        }
    }
}

console.log(`成功解密 ${replacementMap.size} 个字符串\n`);

// 从后向前替换，避免位置偏移
let decryptedCode = code;
const sortedCalls = [...callsToDecrypt].sort((a, b) => b.start - a.start);

let replacedCount = 0;
for (const call of sortedCalls) {
    const key = `${call.offset}|${call.key}`;
    const replacement = replacementMap.get(key);
    if (replacement) {
        decryptedCode = decryptedCode.substring(0, call.start) +
                        replacement.replacement +
                        decryptedCode.substring(call.end);
        replacedCount++;
    }
}

console.log(`替换了 ${replacedCount} 处调用\n`);

// 清理代码
console.log('清理代码...');

// 移除加密相关的前置代码 (自执行函数部分)
decryptedCode = decryptedCode.replace(
    /var _0xodn = 'jsjiami\.com\.v7'; const _0x586329 = _0x32a9; \(function \([^)]+\) \{[\s\S]*?\}\(_0x2785, 0x9efa1, _0x2785, 0xcb\), _0x2785\) && \(_0xodn = 0x48c4\); /,
    ''
);

// 移除 _0x2785 函数定义
decryptedCode = decryptedCode.replace(
    /function _0x2785\(\) \{[\s\S]*?return _0x2785; \};\s*/,
    ''
);

// 移除 _0x32a9 函数定义
decryptedCode = decryptedCode.replace(
    /function _0x32a9\([^)]+\) \{[\s\S]*?\}, _0x32a9\([^)]+\);\s*\}\s*/,
    ''
);

// 移除版本标记
decryptedCode = decryptedCode.replace(/var version_ = 'jsjiami\.com\.v7';\s*/, '');

// 清理多余空行
decryptedCode = decryptedCode.replace(/\n{3,}/g, '\n\n');

// 移除行尾多余空格
decryptedCode = decryptedCode.replace(/[ \t]+$/gm, '');

// 保存解密后的代码
const outputFile = path.join(__dirname, 'aowuj_decrypted.js');
fs.writeFileSync(outputFile, decryptedCode, 'utf-8');
console.log(`解密后的代码已保存到: aowuj_decrypted.js`);

// 保存字符串映射
const mapFile = path.join(__dirname, 'string_map.json');
const mapData = {};
replacementMap.forEach((value, key) => {
    const [offset, keyStr] = key.split('|');
    mapData[parseInt(offset).toString(16)] = {
        key: keyStr,
        decrypted: value.decrypted
    };
});
fs.writeFileSync(mapFile, JSON.stringify(mapData, null, 2), 'utf-8');
console.log(`字符串映射已保存到: string_map.json`);

// 保存字符串列表
const listFile = path.join(__dirname, 'decrypted_strings.txt');
let listContent = '=== 解密后的字符串列表 ===\n\n';
const sortedOffsets = [...replacementMap.keys()].sort((a, b) => {
    const [offsetA] = a.split('|');
    const [offsetB] = b.split('|');
    return parseInt(offsetA) - parseInt(offsetB);
});
for (const key of sortedOffsets) {
    const [offset, keyStr] = key.split('|');
    listContent += `[0x${offset.toString(16)}] ${replacementMap.get(key).decrypted}\n`;
}
fs.writeFileSync(listFile, listContent, 'utf-8');
console.log(`字符串列表已保存到: decrypted_strings.txt`);

console.log('\n解密完成！');
console.log(`共解密 ${replacementMap.size} 个字符串`);
console.log(`替换了 ${replacedCount} 处调用`);
