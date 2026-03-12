// 简化版解密测试 - 专门测试 getTracks
const crypto = require('crypto');

// 从原始代码提取的 RC4 解密函数
function base64Decode(str) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let result = '';
    str = str.replace(/[^A-Za-z0-9\+\/\=]/g, '');
    do {
        const enc1 = alphabet.indexOf(str.charAt(i++));
        const enc2 = alphabet.indexOf(str.charAt(i++));
        const enc3 = alphabet.indexOf(str.charAt(i++));
        const enc4 = alphabet.indexOf(str.charAt(i++));
        const chr1 = (enc1 << 2) | (enc2 >> 4);
        const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        const chr3 = ((enc3 & 3) << 6) | enc4;
        result += String.fromCharCode(chr1);
        if (enc3 !== 64) result += String.fromCharCode(chr2);
        if (enc4 !== 64) result += String.fromCharCode(chr3);
    } while (i < str.length);
    return result;
}

function rc4Decrypt(str, key) {
    str = base64Decode(str);
    let s = [];
    let j = 0;
    let x = 0;
    let result = '';
    for (let i = 0; i < 256; i++) s[i] = i;
    for (let i = 0; i < 256; i++) {
        j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
        [s[i], s[j]] = [s[j], s[i]];
    }
    j = 0;
    for (let i = 0; i < str.length; i++) {
        x = (x + 1) % 256;
        j = (j + s[x]) % 256;
        [s[x], s[j]] = [s[j], s[x]];
        result += String.fromCharCode(str.charCodeAt(i) ^ s[(s[x] + s[j]) % 256]);
    }
    return result;
}

// 字符串数组（从 _0x2785 函数中提取的部分）
const stringArray = [
    'jsjiami.com.v7',
    'xBpjPAsIjtiHBaWNmi.RGceoUmn.nyvR7JIUlpuR==',
    'pSkSW7RcLq',
    'fw1zaJymWPTLlq',
    'eYOrW5zbB0L2W75t',
    'mZv+WQ7cGG',
    'BmohW4RcMCoguZlcRrNdHSkGf8oc',
    'ltjvW7pcHmoEW7Hpg2u',
    'W53cLIe',
    'WPxdVSknW4lcPXu',
    'W5tcOKX2EZdcHebCW5dcHG',
    'Fmo9W43cG8ovpSkZea',
    'W67dISoGbMNcSmkYea',
    'pCk5WPyfW7baWP/cG8oAp2tdUre',
    'ruDHdCo/',
    'g8oJhsiA',
    'ns11WR/cHq',
    'uxVdIrPE',
    'WQtcV8kS',
    'w8ksW7qkWPK',
    'hmk4dJFcVmoR',
    'W7RcMCosa8kJhq7dMG',
    'lSkMW4ZcSSol',
    'pHFcUSo+nW',
    'WO7cPK8',
    'BmolaXuMWRuj',
    'fYxcUYdcJW',
    'BMybWQVcI8oE',
    'gvTKd8oJWPpdNbxcHwiaW6D/W60',
    'WOBdUCkBW4S',
    'mY1UWQy',
    'he3dUmoaWRWdcGq',
    'u0vRhmoJWOBdMG',
    'WQtdLCkhW47cIW',
    '5zAZ5zgF5yMn5R6U',
    'WQbclmotW6m',
    'vmoYWQtcRCog',
    'bXFcOwBcGqa/g8k8l2Ke',
    'mftdP8oAWQO',
    'kmoLhsCQ',
    'W4BcQIS',
    'he3dSmoEWPSEcW81W5O',
    'bNLguG',
    'WP7cT8kAzxi',
    'cKhdLCoDWPa',
    'WPKbjrtcUG',
    'lgngaW',
    'WQxdKLurkHu1uCozcxjxWRC',
    'mSk1kq',
    'WRZcJSoAWOevyw8hW5ZdU1mxcCkPW4TjWPHaWPK',
    'WO8kfbDWea',
    'ymoef8kIvq',
    'lSk0cgmk',
    'ye/dUmkLzWjVW4ldKN/dJa',
    'kmktW6JcVSob',
    'mCkfebZcJG',
    'W7NcKCocnq',
    'W7ddL8oHpW',
    'pXpcOmo6kY0',
    'W63dL8oO',
    'W5/cRmoYamkK',
    'WRddJf7cSmko',
    'W4JcHtCmqa',
    'WOZdTSoEWObw',
    'qLLHaW',
    'o8k2WRyRWOq',
    'axqWpSkE',
    'WQyqbHtcPW',
    'obJcPZ/cKW',
    'WPz9pmocW78',
    'bGlcQmkL',
    'W63cNCoc',
    'kwlcKCoMuq',
    'gcpcUwdcTa',
    'x8k0dJtcRCo7d1ZdSSoFdCowAmk0CSk2BSo8WOaphq',
    'WPFdHCkcWRin',
    'u8ovha',
    'dfbUjqi',
    'jdDMWRNcReldKxSBWR0',
    'W6dcJmobW4PmpuW7WRFdU34g',
    'lCklWO7dGa',
    'dqZcRa',
    'E8k/dNGCn8k2WO8',
    'W4BdU0hdGSkw',
    'u8oYWQZcJG',
    'F8kXoMK',
    'nCoRcZe',
    'cItcHJ3cHG',
    'WPO8aqXO',
    'hmkmWQFdRSkoWQVdQq',
    'W6lcHJmvqa',
    'wSknW6ae',
    'h8kWWQBdPCkxW5GyWRJcLJS',
    'r8otbmkF',
    'W53cGZamCa',
    'WOJcVvD3',
    'pN4sfSkP',
    'evhcQEILPUwVV+wNLUI3IW',
    'DSo/bN8uDKCw',
    'n2RcKCoG',
    'Fmo0WRFdH8oipCkOf8o0bW',
    'iMRcI8oH',
    'W6ldPcnRWQe',
    'lYhcNqBcNW',
    'kCkrWQ7dNmkbaMtcOW',
    'be9EuCoF',
    'orxcPSo/jG',
    'oCoyW5brvW',
    'egjarmo0',
    'dSkgWQ3dNW',
    'W6/cLSov',
    'W5NdStf4',
    'W5RcOJVdP8kV',
    'WOVcOvb6',
    'EufBiSoP',
    'emkLWPBdU8kb',
    'e3aG',
    'erddHSobBG',
    'W7JdOc80',
    'WP3cVu12',
    'W6ivuCkxWQ/cImonvI3dVH/cLmk7',
    'r8kAfh4f',
    'WRRdNmkzWPC',
    'h8kuqSoAafFcGbFdTGNcLSo5',
    'WQpcPMi6Bq',
    'WQ85dIRcRa',
    'W4JcLIyl',
    'hHNcTmo0mYLTWQpcKcpcI8kikCkJW6y2W5JcJ8oUustcOmkaWRFcNgL3WPjUe8kzW4OMW4KRWQPHWRxcGr5Cnw51yq7cGSkRt8oDWQG3WPLSB8o/WQRcSsr4obDRWOBcS2b1kaNcN8kNW6nBW4XVwmkQzImZCX15W7ddQvNcL8oaW7FcIgZdRCoGCGhdTCo0gg/cUh3cIX0ZW6ZcQSoWW7WrW6LqWO7cHgNdJd/dJW',
    'WPRdPCkBW5C',
    'g8kxWQhdMq',
    'ksSHW4PQ',
    'AKxdVCkPANvOW6ddT3ZdNmoz',
    'W4pdTGz5WQe',
    'WQtdVuZcHCk9',
    'W5VdPh/dVW',
    'k8k3W6hcNCoYmmkWf8onhcfi',
    'dfxdSmocW7ycaWmqW4SzlmoKW6xcOGBdP8kCed9zAI8',
    'iueqfmkd',
    'vCkbW4mIWRq',
    'jGtcOG'
];

function decryptString(index, key) {
    const OFFSET = 0x143;
    const actualIndex = index - OFFSET;
    if (actualIndex < 0 || actualIndex >= stringArray.length) return null;
    return rc4Decrypt(stringArray[actualIndex], key);
}

console.log('getTracks 相关选择器测试:');
console.log('=================================');

const getTracksTargets = [
    [0x159, 'orWV'],
    [0x19c, 'iJuG'],
    [0x1d7, 'VpP]'],
    [0x183, 'ej(K'],
    [0x144, 'kq9V'],
    [0x1ad, 'zEb1'],
    [0x1b9, 'qKfW'],
    [0x1f2, 'orWV'],
    [0x1f9, '!&C$'],
    [0x1ee, 'E*cO'],
    [0x1ed, 'Qxq0'],
    [0x165, 'mVOl'],
    [0x163, 'vcWe'],
    [0x20a, 'ad6p'],
    [0x19b, 'hGdM'],
];

for (const [index, key] of getTracksTargets) {
    const result = decryptString(index, key);
    const hexIndex = '0x' + index.toString(16).toUpperCase();
    console.log(`${hexIndex}, '${key}': ${JSON.stringify(result)}`);
}
