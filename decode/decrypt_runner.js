/**
 * 解密运行器 - 使用 vm 模块执行代码
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

try {
    // 执行代码
    vm.runInContext(code, context);

    console.log('代码执行成功');
    console.log('_0x586329:', typeof context._0x586329);
    console.log('_0x32a9:', typeof context._0x32a9);
    console.log('_0x2785:', typeof context._0x2785);

    // 获取解密函数
    const decryptFunc = context._0x586329 || context._0x32a9;

    if (typeof decryptFunc !== 'function') {
        console.error('无法找到解密函数');
        process.exit(1);
    }

    console.log('\n=== 测试解密 ===\n');

    // 测试几个已知的调用
    const testCases = [
        [0x143, 'ES!R'],
        [0x149, 'lH!n'],
        [0x154, 'nL&Q'],
        [0x158, '!$C$'],
        [0x159, 'orWV'],
        [0x162, 'lH!n'],
        [0x167, 'p)0)'],
        [0x168, 'kq9V'],
        [0x169, 'Y4By'],
        [0x16a, 'ZcQT'],
        [0x16b, '%96U'],
        [0x16c, 'vcWe'],
        [0x16d, 'DWwl'],
        [0x16e, 'DWwl'],
        [0x171, '5N)H'],
        [0x172, 'pXpG'],
        [0x173, 'pMpp'],
        [0x176, 'Fe9c'],
        [0x177, 'hW!s'],
        [0x179, 'si%3'],
        [0x17a, 'nL&Q'],
        [0x17b, 'pXpG'],
        [0x17c, 'ZcQT'],
        [0x17d, '#*Ke'],
        [0x17e, '5N)H'],
        [0x17f, '7mte'],
        [0x180, 'jRAW'],
        [0x182, 'hGdM'],
        [0x183, 'ej(K'],
        [0x184, '(%w&'],
        [0x185, 'B5%)'],
        [0x186, 'pXpG'],
        [0x187, '#OgP'],
        [0x188, 'nL&Q'],
        [0x189, '7mte'],
        [0x18a, 'VpP]'],
        [0x18b, 'hW!s'],
        [0x18c, '5N)H'],
        [0x18d, 'si%3'],
        [0x18e, 'jRAW'],
        [0x18f, 'iJuG'],
        [0x190, '5N)H'],
        [0x191, 'si%3'],
        [0x192, 'FY#D'],
        [0x193, 'WqJp'],
        [0x194, 'Y4By'],
        [0x195, 'qKfW'],
        [0x196, 'iJuG'],
        [0x197, '7mte'],
        [0x198, 'lH!n'],
        [0x19a, 'p)0)'],
        [0x19b, 'hGdM'],
        [0x19c, 'iJuG'],
        [0x19d, 'Qxq0'],
        [0x19e, 'pMpp'],
        [0x1a0, 'BStM'],
        [0x1a1, '&9PX'],
        [0x1a2, 'mVOl'],
        [0x1a3, 'ES!R'],
        [0x1a4, 'BStM'],
        [0x1a5, '#OgP'],
        [0x1a6, 'pXpG'],
        [0x1a7, '(%w&'],
        [0x1a8, 'B5%)'],
        [0x1a9, 'ZcQT'],
        [0x1aa, '#OgP'],
        [0x1ab, 'ZcQT'],
        [0x1ac, 'B5%)'],
        [0x1ad, 'zEb1'],
        [0x1ae, 'E*cO'],
        [0x1af, 'ad6p'],
        [0x1b0, '5N)H'],
        [0x1b1, '#*Ke'],
        [0x1b2, '!&C$'],
        [0x1b3, 'Qxq0'],
        [0x1b4, 'VpP]'],
        [0x1b5, 'WqJp'],
        [0x1b6, '#OgP'],
        [0x1b7, 'B5%)'],
        [0x1b8, 'FY#D'],
        [0x1b9, 'qKfW'],
        [0x1ba, '(%w&'],
        [0x1bb, 'T^Uu'],
        [0x1bc, 'ES!R'],
        [0x1be, 'jRAW'],
        [0x1c1, 'qKfW'],
        [0x1c2, 'sWqH'],
        [0x1c4, 'Y4By'],
        [0x1c5, 'sWqH'],
        [0x1c6, '7mte'],
        [0x1c7, 'VpP]'],
        [0x1c8, 'mVOl'],
        [0x1c9, 'skmR'],
        [0x1cb, 'ej(K'],
        [0x1cc, 'vcWe'],
        [0x1ce, 'E*cO'],
        [0x1d0, '!&C$'],
        [0x1d1, 'FY#D'],
        [0x1d3, 'FY#D'],
        [0x1d5, 'FY#D'],
        [0x1d6, 'GgjU'],
        [0x1d7, 'VpP]'],
        [0x1d8, 'Fe9c'],
        [0x1d9, 'p)0)'],
        [0x1da, '#OgP'],
        [0x1db, 'G1i5'],
        [0x1dc, 'p)0)'],
        [0x1dd, 'skmR'],
        [0x1de, 'B5%)'],
        [0x1df, 'GgjU'],
        [0x1e0, 'lH!n'],
        [0x1e1, 'nL&Q'],
        [0x1e2, '5N)H'],
        [0x1e3, 'skmR'],
        [0x1e4, '!&C$'],
        [0x1e5, 'o]p#'],
        [0x1e6, 'GgjU'],
        [0x1e7, 'nL&Q'],
        [0x1e8, 'BStM'],
        [0x1e9, 'sWqH'],
        [0x1ea, '&9PX'],
        [0x1eb, 'ES!R'],
        [0x1ec, 'gdgv'],
        [0x1ed, 'Qxq0'],
        [0x1ee, 'E*cO'],
        [0x1ef, '#OgP'],
        [0x1f0, 'si%3'],
        [0x1f1, 'skmR'],
        [0x1f2, 'orWV'],
        [0x1f3, '#OgP'],
        [0x1f4, 'GgjU'],
        [0x1f5, 'zEb1'],
        [0x1f6, 'b9n['],
        [0x1f7, 'pXpG'],
        [0x1f8, 'iJuG'],
        [0x1f9, '!&C$'],
        [0x1fa, 'ej(K'],
        [0x1fb, '#OgP'],
        [0x1fc, 'VpP]'],
        [0x1fd, '7mte'],
        [0x1fe, 'si%3'],
        [0x1ff, 'ej(K'],
        [0x200, 'skmR'],
        [0x201, 'B5%)'],
        [0x202, 'qKfW'],
        [0x203, 'gdgv'],
        [0x204, 'VpP]'],
        [0x205, 'nL&Q'],
        [0x206, 'gdgv'],
        [0x207, 'lH!n'],
        [0x208, 'vcWe'],
        [0x209, 'ZcQT'],
        [0x20a, 'ad6p'],
        [0x20b, '^6XL'],
        [0x20c, 'vcWe'],
        [0x20d, 'o]p#'],
        [0x20f, 'G1i5']
    ];

    const results = {};
    const uniqueOffsets = new Map();

    for (const [offset, key] of testCases) {
        if (!uniqueOffsets.has(offset)) {
            uniqueOffsets.set(offset, key);
        }
    }

    console.log(`去重后共 ${uniqueOffsets.size} 个唯一偏移量\n`);

    for (const [offset, key] of uniqueOffsets) {
        try {
            const result = decryptFunc(offset, key);
            results[offset] = result;
            console.log(`[0x${offset.toString(16).padStart(3, '0')}] ${result}`);
        } catch (e) {
            console.log(`[0x${offset.toString(16).padStart(3, '0')}] ERROR: ${e.message}`);
        }
    }

    // 保存结果
    const outputFile = path.join(__dirname, 'decrypted_strings.json');
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`\n解密结果已保存到: decrypted_strings.json`);
    console.log(`共解密 ${Object.keys(results).length} 个字符串`);

} catch (error) {
    console.error('执行失败:', error.message);
    console.error(error.stack);
}
