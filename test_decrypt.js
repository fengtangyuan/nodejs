const fs = require('fs');
const code = fs.readFileSync('decrypt_runner.js', 'utf-8');

// 提取并执行解密部分
const decryptCode = code.substring(code.indexOf('const CODE ='), code.indexOf('eval(CODE);') + 13);
eval(decryptCode);

// 测试 getPlayinfo 相关的解密
console.log('getPlayinfo 相关解密:');
console.log('0x18C, 5N)H:', decryptString(0x18C, '5N)H'));
console.log('0x155, lH!n:', decryptString(0x155, 'lH!n'));
console.log('0x201, B5%):', decryptString(0x201, 'B5%)'));
console.log('0x20C, vcWe:', decryptString(0x20C, 'vcWe'));
console.log('0x20B, ^6XL:', decryptString(0x20B, '^6XL'));
console.log('0x1F4, GgjU:', decryptString(0x1F4, 'GgjU'));
