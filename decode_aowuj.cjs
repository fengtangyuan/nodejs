const fs = require('fs');

// 读取加密文件
const code = fs.readFileSync('aowuj.js', 'utf8');

// 提取 _0x2785 函数 - 更精确的正则
const arrayMatch = code.match(/function _0x2785\(\)\s*\{[\s\S]*?_0x2785\s*=\s*function\s*\(\)\s*\{\s*return\s*_0x8748b4;\s*\};\s*return\s*_0x2785\(\);\s*\}/);
if (!arrayMatch) {
    console.log('尝试备用匹配模式...');
    // 备用模式
    const altMatch = code.match(/function _0x2785\(\)\s*\{[\s\S]*?return\s*_0x2785;?\s*\}/);
    if (!altMatch) {
        console.log('无法找到字符串数组函数 _0x2785');
        process.exit(1);
    }
}

// 使用更简单的方法：直接执行整个文件并提取字符串数组
const setupCode = `
function createCheerio() { return {}; }
function createCryptoJS() { return {}; }
function jsonify(obj) { return JSON.stringify(obj); }
function argsify(ext) { return typeof ext === 'string' ? JSON.parse(ext) : ext; }
const $fetch = { get: async () => ({ data: '' }), post: async () => ({ data: '' }) };
const $utils = { openSafari: () => {} };
const $print = console.log;
let $config_str = '{}';

// 这里插入原始代码
${code}

// 导出
if (typeof module !== 'undefined') {
    module.exports = { _0x2785, _0x32a9, _0x586329, appConfig, getConfig, getCards, getTracks, getPlayinfo, search, base64decode, decryptAES };
}
`;

// 写入临时文件
fs.writeFileSync('temp_full.cjs', setupCode);

try {
    // 加载模块
    const decrypted = require('./temp_full.cjs');
    
    // 获取字符串数组
    const stringArray = decrypted._0x2785();
    console.log('字符串数组长度:', stringArray.length);
    console.log('\n=== 字符串数组内容 ===');
    stringArray.forEach((str, idx) => {
        console.log(`[${idx}]: ${str}`);
    });
} catch (e) {
    console.log('执行出错:', e.message);
    console.log(e.stack);
} finally {
    // 清理临时文件
    if (fs.existsSync('temp_full.cjs')) {
        fs.unlinkSync('temp_full.cjs');
    }
}
