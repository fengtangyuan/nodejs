const fs = require('fs');

// 创建一个简化版本的解密脚本，专门测试 getTracks 相关的选择器
const testTargets = [
    [0x159, 'orWV'],  // 可能是选择器
    [0x19c, 'iJuG'],  // 可能是选择器
    [0x1d7, 'VpP]'],  // 可能是选择器
    [0x183, 'ej(K'],  // 可能是选择器
    [0x144, 'kq9V'],  // 可能是选择器
    [0x1ad, 'zEb1'],  // 可能是选择器
    [0x1b9, 'qKfW'],  // 可能是选择器
    [0x1f2, 'orWV'],  // 可能是选择器
    [0x1f9, '!&C$'],  // 可能是 $
];

const CODE = fs.readFileSync('decrypt_runner.js', 'utf-8');
const decryptPart = CODE.substring(CODE.indexOf('const CODE ='), CODE.indexOf('eval(CODE);') + 13);
eval(decryptPart);

console.log('getTracks 选择器测试:');
console.log('========================================');
for (const [index, key] of testTargets) {
    const result = decryptString(index, key);
    console.log(`0x${index.toString(16).toUpperCase()}, '${key}':`, JSON.stringify(result));
}
