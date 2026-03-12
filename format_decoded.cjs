const fs = require('fs');

// 读取解密后的文件
let code = fs.readFileSync('aowuj_decoded.js', 'utf8');

// 移除 jsjiami 的前缀混淆代码 (从开始到 "_0x2785) && (_0xodn = 0x48c4);" 之后的 const cheerio)
code = code.replace(/^var _0xodn[\s\S]*?_0x2785\)\s*&&\s*\(_0xodn\s*=\s*0x48c4\);\s*/, '');

// 移除字符串数组函数
code = code.replace(/function _0x2785\(\)\s*\{[\s\S]*?return _0x2785\(\);\s*\};?\s*/, '');

// 移除解密函数
code = code.replace(/function _0x32a9\(_0xa8665c,\s*_0x5e8a95\)\s*\{[\s\S]*?_0x32a9\(_0xa8665c,\s*_0x5e8a95\);\s*\}\s*/, '');

// 美化代码 - 在关键位置添加换行
code = code
    .replace(/;\s*const\s+/g, ';\n\nconst ')
    .replace(/;\s*let\s+/g, ';\n\nlet ')
    .replace(/;\s*var\s+/g, ';\n\nvar ')
    .replace(/;\s*async function\s+/g, ';\n\nasync function ')
    .replace(/;\s*function\s+/g, ';\n\nfunction ')
    .replace(/\{\s*const\s+/g, '{\n    const ')
    .replace(/\{\s*let\s+/g, '{\n    let ')
    .replace(/;\s*return\s+/g, ';\n    return ')
    .replace(/;\s*await\s+/g, ';\n    await ')
    .replace(/;\s*if\s*\(/g, ';\n    if (')
    .replace(/;\s*else\s+/g, ';\n    else ')
    .replace(/\}\s*else\s*\{/g, '}\n}else {')
    .replace(/\}\s*catch\s*\(/g, '}\n} catch (')
    .replace(/\}\s*finally\s*\{/g, '}\n} finally {')
    .replace(/;\s*\}\s*$/g, ';\n}');

// 添加文件头
const header = `// 嗷呜动漫爬虫
// 解密自 aowuj.js (jsjiami.com.v7 加密)
// 站点: https://www.aowu.tv

const cheerio = createCheerio()
const CryptoJS = createCryptoJS()

`;

code = header + code;

// 写入格式化后的文件
fs.writeFileSync('aowuj_formatted.js', code);
console.log('格式化完成！已保存到 aowuj_formatted.js');
