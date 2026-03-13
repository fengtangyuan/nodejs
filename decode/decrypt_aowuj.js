/**
 * jsjiami.com.v7 解密脚本
 * 用于解密 aowuj.js
 */

const fs = require('fs');
const path = require('path');

// 读取加密文件
const inputFile = path.join(__dirname, 'aowuj.js');
let code = fs.readFileSync(inputFile, 'utf-8');

// ==================== RC4 解密算法 ====================

function base64Decode(str) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    str = str.replace(/[^A-Za-z0-9\+\/\=]/g, '');
    for (let i = 0; i < str.length;) {
        const enc1 = chars.indexOf(str.charAt(i++));
        const enc2 = chars.indexOf(str.charAt(i++));
        const enc3 = chars.indexOf(str.charAt(i++));
        const enc4 = chars.indexOf(str.charAt(i++));
        const chr1 = (enc1 << 2) | (enc2 >> 4);
        const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        const chr3 = ((enc3 & 3) << 6) | enc4;
        output += String.fromCharCode(chr1);
        if (enc3 !== 64) output += String.fromCharCode(chr2);
        if (enc4 !== 64) output += String.fromCharCode(chr3);
    }
    return output;
}

function rc4Decrypt(data, key) {
    const s = [];
    let j = 0;
    let x;

    for (let i = 0; i < 256; i++) {
        s[i] = i;
    }

    for (let i = 0; i < 256; i++) {
        j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
        x = s[i];
        s[i] = s[j];
        s[j] = x;
    }

    let i = 0;
    j = 0;
    let result = '';

    for (let y = 0; y < data.length; y++) {
        i = (i + 1) % 256;
        j = (j + s[i]) % 256;
        x = s[i];
        s[i] = s[j];
        s[j] = x;
        result += String.fromCharCode(data.charCodeAt(y) ^ s[(s[i] + s[j]) % 256]);
    }

    return result;
}

function decryptString(encryptedStr, key) {
    try {
        // 先进行 base64 解码
        const decoded = base64Decode(encryptedStr);
        // 再进行 RC4 解密
        return rc4Decrypt(decoded, key);
    } catch (e) {
        return null;
    }
}

// ==================== 提取字符串数组 ====================

function extractStringArray(code) {
    // 直接在整个代码中查找 _0x2785 函数定义区域
    // 并提取其中的所有字符串

    // 查找 _0x2785 函数开始位置
    const funcStart = code.indexOf("function _0x2785()");
    if (funcStart === -1) {
        throw new Error('无法找到 _0x2785 函数');
    }

    // 找到函数结束位置 (下一个 _0x2785 赋值或文件结束)
    let funcEnd = code.indexOf("let $config", funcStart);
    if (funcEnd === -1) {
        funcEnd = code.length;
    }

    const funcBody = code.substring(funcStart, funcEnd);

    // 提取所有单引号字符串
    const allMatches = funcBody.match(/'([^']+)'/g);
    if (!allMatches) {
        throw new Error('无法提取字符串');
    }

    // 过滤出真正的数据字符串
    const filtered = allMatches
        .map(s => s.slice(1, -1))  // 去掉引号
        .filter(s => {
            // 过滤掉变量名、jsjiami标记和短字符串
            if (s === '_0xodn') return false;
            if (s.startsWith('_0x')) return false;
            if (s === 'jsjiami.com.v7') return false;
            if (s.length < 3) return false;  // 过滤太短的字符串
            return s.length > 0;
        });

    return filtered;
}

// ==================== 解密所有字符串 ====================

function decryptAllStrings() {
    console.log('开始解密...\n');

    // 提取字符串数组
    const strings = extractStringArray(code);
    console.log(`提取到 ${strings.length} 个加密字符串`);

    // 位移量 (从代码中可以得出是 0x143 = 323)
    const shift = 0x143;

    // 解密后的字符串映射
    const decryptedStrings = {};

    console.log('\n=== 解密过程 ===\n');

    for (let i = 0; i < strings.length; i++) {
        const encrypted = strings[i];
        // key 是索引转16进制字符串
        const key = i.toString(16);

        const decrypted = decryptString(encrypted, key);

        if (decrypted !== null) {
            decryptedStrings[shift + i] = decrypted;
            console.log(`[${shift + i}] ${decrypted}`);
        } else {
            console.log(`[${shift + i}] <解密失败>`);
            decryptedStrings[shift + i] = encrypted;
        }
    }

    console.log(`\n解密完成！共解密 ${Object.keys(decryptedStrings).length} 个字符串`);

    return decryptedStrings;
}

// ==================== 替换代码中的函数调用 ====================

function replaceFunctionCalls(code, decryptedStrings) {
    console.log('\n开始替换代码中的函数调用...');

    let result = code;
    let replacedCount = 0;

    // 替换 _0x586329(0x..., '...') 模式
    const pattern = /_0x586329\(0x([0-9a-fA-F]+),\s*'[^']+'\)/g;

    result = result.replace(pattern, (match, hexOffset) => {
        const offset = parseInt(hexOffset, 16);
        if (decryptedStrings[offset]) {
            replacedCount++;
            // 返回带引号的字符串
            return JSON.stringify(decryptedStrings[offset]);
        }
        return match;
    });

    // 替换 _0x32a9(0x..., '...') 模式
    const pattern2 = /_0x32a9\(0x([0-9a-fA-F]+),\s*'[^']+'\)/g;

    result = result.replace(pattern2, (match, hexOffset) => {
        const offset = parseInt(hexOffset, 16);
        if (decryptedStrings[offset]) {
            replacedCount++;
            return JSON.stringify(decryptedStrings[offset]);
        }
        return match;
    });

    console.log(`替换了 ${replacedCount} 处函数调用`);

    return result;
}

// ==================== 清理代码 ====================

function cleanupCode(code) {
    console.log('\n清理代码...');

    let result = code;

    // 移除加密相关的前置代码 (自执行函数)
    result = result.replace(/var _0xodn = 'jsjiami\.com\.v7';[\s\S]*?\) \(_0xodn = 0x48c4\); /, '');

    // 移除 _0x2785 函数定义
    result = result.replace(/function _0x2785\(\) \{[\s\S]*?return _0x2785; \}; \s*/, '');

    // 移除 _0x32a9 函数定义 (解密函数)
    result = result.replace(/function _0x32a9\([^)]+\) \{[\s\S]*?\}, _0x32a9\([^)]+\); \}/, '');

    // 移除版本标记
    result = result.replace(/var version_ = 'jsjiami\.com\.v7';\s*/, '');

    // 清理多余空行
    result = result.replace(/\n{3,}/g, '\n\n');

    // 移除行尾多余空格
    result = result.replace(/[ \t]+$/gm, '');

    return result;
}

// ==================== 主函数 ====================

function main() {
    try {
        // 解密所有字符串
        const decryptedStrings = decryptAllStrings();

        // 保存字符串映射到文件
        const mapFile = path.join(__dirname, 'string_map.json');
        fs.writeFileSync(mapFile, JSON.stringify(decryptedStrings, null, 2), 'utf-8');
        console.log(`\n字符串映射已保存到: string_map.json`);

        // 替换函数调用
        let decryptedCode = replaceFunctionCalls(code, decryptedStrings);

        // 清理代码
        decryptedCode = cleanupCode(decryptedCode);

        // 保存解密后的代码
        const outputFile = path.join(__dirname, 'aowuj_decrypted.js');
        fs.writeFileSync(outputFile, decryptedCode, 'utf-8');
        console.log(`\n解密后的代码已保存到: aowuj_decrypted.js`);

        // 保存可读的字符串列表
        const listFile = path.join(__dirname, 'decrypted_strings.txt');
        let listContent = '=== 解密后的字符串列表 ===\n\n';
        Object.keys(decryptedStrings).sort((a, b) => a - b).forEach(key => {
            listContent += `[${key}] ${decryptedStrings[key]}\n`;
        });
        fs.writeFileSync(listFile, listContent, 'utf-8');
        console.log(`字符串列表已保存到: decrypted_strings.txt`);

    } catch (error) {
        console.error('解密失败:', error.message);
        console.error(error.stack);
    }
}

// 运行
main();
