// aowuj.js 解码脚本
const CryptoJS = require('crypto-js');

// 从混淆代码中提取的字符串数组
const stringArray = [
    'jsjiami.com.v7',
    'xBpjPAsIjtiHBaWNmi.RGceoUmn.nyvR7JIUlpuR==',
    'pSkSW7RcLq', 'fw1zaJymWPTLlq', 'eYOrW5zbB0L2W75t', 'mZv+WQ7cGG',
    'BmohW4RcMCoguZlcRrNdHSkGf8oc', 'ltjvW7pcHmoEW7Hpg2u', 'W53cLIe',
    'WPxdVSknW4lcPXu', 'W5tcOKX2EZdcHebCW5dcHG', 'Fmo9W43cG8ovpSkZea',
    'W67dISoGbMNcSmkYea', 'pCk5WPyfW7baWP/cG8oAp2tdUre', 'ruDHdCo/',
    'g8oJhsiA', 'ns11WR/cHq', 'uxVdIrPE', 'WQtcV8kS', 'w8ksW7qkWPK',
    'hmk4dJFcVmoR', 'W7RcMCosa8kJhq7dMG', 'lSkMW4ZcSSol', 'pHFcUSo+nW',
    'WO7cPK8', 'BmolaXuMWRuj', 'fYxcUYdcJW', 'BMybWQVcI8oE',
    'gvTKd8oJWPpdNbxcHwiaW6D/W60', 'WOBdUCkBW4S', 'mY1UWQy',
    'he3dUmoaWRWdcGq', 'u0vRhmoJWOBdMG', 'WQtdLCkhW47cIW',
    '5zAZ5zgF5yMn5R6U', 'WQbclmotW6m', 'vmoYWQtcRCog',
    'bXFcOwBcGqa/g8k8l2Ke', 'mftdP8oAWQO', 'kmoLhsCQ', 'W4BcQIS',
    'he3dSmoEWPSEcW81W5O', 'bNLguG', 'WP7cT8kAzxi', 'cKhdLCoDWPa',
    'WPKbjrtcUG', 'lgngaW', 'WQxdKLurkHu1uCozcxjxWRC', 'mSk1kq',
    'WRZcJSoAWOevyw8hW5ZdU1mxcCkPW4TjWPHaWPK', 'WO8kfbDWea',
    'ymoef8kIvq', 'lSk0cgmk', 'ye/dUmkLzWjVW4ldKN/dJa',
    'kmktW6JcVSob', 'mCkfebZcJG', 'W7NcKCocnq', 'W7ddL8oHpW',
    'pXpcOmo6kY0', 'W63dL8oO', 'W5/cRmoYamkK', 'WRddJf7cSmko',
    'W4JcHtCmqa', 'WOZdTSoEWObw', 'qLLHaW', 'o8k2WRyRWOq',
    'axqWpSkE', 'WQyqbHtcPW', 'obJcPZ/cKW', 'WPz9pmocW78',
    'bGlcQmkL', 'W63cNCoc', 'kwlcKCoMuq', 'gcpcUwdcTa',
    'x8k0dJtcRCo7d1ZdSSoFdCowAmk0CSk2BSo8WOaphq',
    'WPFdHCkcWRin', 'u8ovha', 'dfbUjqi', 'jdDMWRNcReldKxSBWR0',
    'W6dcJmobW4PmpuW7WRFdU34g', 'lCklWO7dGa', 'dqZcRa',
    'E8k/dNGCn8k2WO8', 'W4BdU0hdGSkw', 'u8oYWQZcJG', 'F8kXoMK',
    'nCoRcZe', 'cItcHJ3cHG', 'WPO8aqXO', 'hmkmWQFdRSkoWQVdQq',
    'W6lcHJmvqa', 'wSknW6ae', 'h8kWWQBdPCkxW5GyWRJcLJS',
    'r8otbmkF', 'W53cGZamCa', 'WOJcVvD3', 'pN4sfSkP',
    'evhcQEILPUwVV+wNLUI3IW', 'DSo/bN8uDKCw', 'n2RcKCoG',
    'Fmo0WRFdH8oipCkOf8o0bW', 'iMRcI8oH', 'W6ldPcnRWQe',
    'lYhcNqBcNW', 'kCkrWQ7dNmkbaMtcOW', 'be9EuCoF',
    'orxcPSo/jG', 'oCoyW5brvW', 'egjarmo0', 'dSkgWQ3dNW',
    'W6/cLSov', 'W5NdStf4', 'W5RcOJVdP8kV', 'WOVcOvb6',
    'EufBiSoP', 'emkLWPBdU8kb', 'e3aG', 'erddHSobBG',
    'W7JdOc80', 'WP3cVu12', 'W6ivuCkxWQ/cImonvI3dVH/cLmk7',
    'r8kAfh4f', 'WRRdNmkzWPC', 'h8kuqSoAafFcGbFdTGNcLSo5',
    'WQpcPMi6Bq', 'WQ85dIRcRa', 'W4JcLIyl', 'hHNcTmo0mYLTWQpcKcpcI8kikCkJW6y2W5JcJ8oUustcOmkaWRFcNgL3WPjUe8kzW4OMW4KRWQPHWRxcGr5Cnw51yq7cGSkRt8oDWQG3WPLSB8o/WQRcSsr4obDRWOBcS2b1kaNcN8kNW6nBW4XVwmkQzImZCX15W7ddQvNcL8oaW7FcIgZdRCoGCGhdTCo0gg/cUh3cIX0ZW6ZcQSoWW7WrW6LqWO7cHgNdJd/dJW',
    'WPRdPCkBW5C', 'g8kxWQhdMq', 'ksSHW4PQ', 'AKxdVCkPANvOW6ddT3ZdNmoz',
    'W4pdTGz5WQe', 'WQtdVuZcHCk9', 'W5VdPh/dVW',
    'k8k3W6hcNCoYmmkWf8onhcfi', 'dfxdSmocW7ycaWmqW4SzlmoKW6xcOGBdP8kCed9zAI8',
    'iueqfmkd', 'vCkbW4mIWRq', 'jGtcOG',
    'jslcUGFcPG', 'fSo1hY4e', 'WPxdO8k9W6tcUG', 'rCklW7uf',
    'cSkcWQFdMmkk', 'W6JcLSoIh8ko', 'frBcP0dcJW', 'WQNcSg4jFq',
    'fb7cIrBcRmkJW6m', 'WRdcMw9JwW', 'W6ldKW1fcSkYWQi0BmoNpmoOtZe',
    'W7RcPrNdN8kH', 'gCk5WQtdVW', 'W5BdG8obfLq', 'WPNdRCorWQO',
    'nuhcTwBdLW', 'eSk6WOJdOSk6', 'aJddUq', 'WP7dJNnBcSkToCkrgsq2',
    'ymotW4DbrCkJpCoflCkkWPFcHmkxWRv6', 'WPJdPCkDWO0z',
    'W7hcKHjJEq', 'o8kuWRBdUCkF', 'E8k1jxG', 'W7xcKL0Bba',
    'k8oRhsa', 'W5RcRdRdOa', 's8kjng0Q', 'WQ7dK1CwkrrMvSoyfxjm',
    'WRFcNSknvgW', 'W5NcHsWo', 'qmo3W6ZcI8oKc8k1a8okW549W5RcIxFcV8k9W4hdJSo7cNirmCo1WQSQWRW',
    'W7HKvhZdVmoEW69xW7hdVmoUvG', 'WRVdQfZcMCkk',
    'WPVdINdcPmkh', 'WOddSLpcP8kZ', 'zmoga8kiaLC',
    'W4NdPHiHpI7dG0POW5JdJSkhWPu', 'WPtcNmkACN0',
    'i8kUmYigF0foa1ddTCkFWRZcRq', 'fCkZaW', 'hgCXiG',
    'bG07W4Lx', 'tSoYg8kzBG', 'W71Nwh3dUSoCWPS+W5pdV8oyCCk6W6e',
    'mmk/WRaNWPy', 'c0ddQCoy', 'sIldQCk3', 'nIpcRmo3lG',
    'WPldQCklW5hcQGddPq', 'WOtcMCkerMS', 'W4VdRtRdO8kJWPFcNdhdHvFdQ8ocWOZdKG',
    'cmk9WR/dOW', 'W5ZdV2ldTW', 'WOKzeH4', 'fbFcOG',
    'f2Xvrq', 'W4FcIWDrkW', 'q8o0WQBcTCo4gSkWdCouW5OP',
    'W7ZdJmoYD2BcV8kRhCoFW5VcPYtcUMNcICobWO/dUYRcQCoXiq',
    'zhpdNZnIiG', 'k8k3WRxdS8kvW4uoWRZcRG', 'pHBcKSo+ibC1',
    'odRcM8oTwW', 'WRxdJM7cSq', 'f301nSkZW5lcJWRcOmoH',
    'qLj4c8kNW4tcNa'
];

// RC4 解密函数
function rc4Decrypt(text, key) {
    let s = [];
    for (let i = 0; i < 256; i++) {
        s[i] = i;
    }
    let j = 0;
    for (let i = 0; i < 256; i++) {
        j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
        [s[i], s[j]] = [s[j], s[i]];
    }
    let i = 0;
    j = 0;
    let result = '';
    for (let k = 0; k < text.length; k++) {
        i = (i + 1) % 256;
        j = (j + s[i]) % 256;
        [s[i], s[j]] = [s[j], s[i]];
        result += String.fromCharCode(text.charCodeAt(k) ^ s[(s[i] + s[j]) % 256]);
    }
    return result;
}

// Base64 解码然后 RC4 解密
function decryptString(str, key) {
    try {
        // 先进行 base64 解码（如果需要）
        // 然后进行 RC4 解密
        const base64Decode = (str) => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
            let output = '';
            str = str.replace(/[^A-Za-z0-9+/=]/g, '');
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
        };

        const decoded = base64Decode(str);
        return rc4Decrypt(decoded, key);
    } catch (e) {
        return str; // 如果解密失败，返回原字符串
    }
}

// 测试解密一些字符串
const testKeys = ['ES!R', '#OgP', 'Fe9c', '7mte', 'pXpG', 'FY#D', 'DWwl', '5N)H', 'Y4By', 'hW!s', 'nL&Q', 'qKfW', 'p)0)', 'iJuG', 'ej(K', 'hGdM', 'b9n[', 'G1i5', 'VpP]', 'vcWe', 'pMpp', 'BStM', 'zEb1', 'mVOl', 'ZcQT', 'skmR', 'T^Uu', 'GgjU', 'ad6p', 'lH!n', 'si%3', 'Qxq0', 'WqJp', 'E*cO', '(%w&', 'B5%)', 'orWV', 'o]p#', 'kq9V', 'sWqH', 'gdgv', '^6XL', 'jRAW', '%96U'];

console.log('尝试解密字符串...\n');

// 从代码中可以看到偏移量从 0x143 (323) 开始
// _0x586329 函数中 _0x32a9b2 = _0x32a9b2 - 0x143
// 所以 stringArray[0] 对应偏移 0x143

const offset = 0x143;

// 输出一些已知的字符串映射
console.log('字符串映射表 (偏移 -> 解密后的值):\n');

// 从代码分析中已知的映射
const knownMappings = {
    0x1ef: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/604.1.14 (KHTML, like Gecko)',
    0x192: '奥乌',
    0x16d: 'type=21',
    0x171: 'type=22',
    0x1ba: '/api.php/provide/vod/?',
    0x167: 'page',
    0x149: 'post',
    0x1f0: 'list',
    0x1c9: 'forEach',
    0x16b: 'vId',
    0x1d8: 'trim',
    0x17c: 'vName',
    0x204: 'vPic',
    0x169: 'remarks',
    0x1d3: 'site',
    0x15a: 'argsify',
    0x1a0: 'url',
    0x1e4: 'get',
    0x1cb: 'load',
    0x1d7: '.swiper-wrapper',
    0x208: 'each',
    0x183: '.module-items',
    0x1b9: 'W7xdTmkr',
    0x1ee: 'each',
    0x1ad: 'li',
    0x165: 'each',
    0x163: 'text',
    0x19a: 'attr',
    0x1a4: 'href',
    0x1b1: 'argsify',
    0x1fd: 'url',
    0x1bd: 'vDpzl',
    0x1e5: 'unescape',
    0x14c: 'encrypt',
    0x1ce: 'ptuoB',
    0x190: '2',
    0x182: 'url',
    0x1bc: 'url',
    0x172: 'site',
    0x1ab: 'url',
    0x1d6: 'plain=',
    0x209: '&url=',
    0x205: '&key=',
    0x151: 'https://',
    0x201: 'key',
    0x20c: '&ts=',
    0x20b: '&sig=',
    0x1f4: '&sig=',
    0x1c3: 'decryptAES',
    0x157: 'enc',
    0x153: 'Hex',
    0x1e0: 'parse',
    0x198: 'enc',
    0x16c: 'Hex',
    0x179: 'parse',
    0x1c1: 'enc',
    0x173: 'Utf8',
    0x1a2: 'parse',
    0x1b6: 'Hex',
    0x200: 'parse',
    0x1c6: 'mode',
    0x1c2: 'toString',
    0x1de: 'enc',
    0x1e6: 'Utf8',
    0x1d1: 'decrypt error',
    0x1ae: 'error',
    0x1a9: 'text',
    0x20f: '/search/',
    0x17d: 'data-original',
    0x1f8: 'trim',
    0x1df: 'text',
    0x1c5: 'page',
    0x1ff: 'site',
    0x17a: '?page=',
    0x15e: '&text=',
    0x1b7: 'get',
    0x1f2: '.module-item',
    0x1d5: 'find',
    0x15f: '.module-item-cover',
    0x1f1: 'attr',
    0x203: 'href',
    0x1d0: '.module-item-title',
    0x14a: 'data-src',
    0x1cd: 'attr',
    0x146: 'text',
    0x14d: 'trim',
    0x1c4: 'find',
    0x207: '.module-item-text',
    0x1a8: 'site',
    0x1a1: '.module-item-titlebox',
    0x1dd: 'find',
    0x164: 'trim',
    0x1c0: 'push',
    0x143: 'W63dUSoD',
    0x158: 'W5/dH8oz',
    0x145: 'Fe9c',
    0x155: 'EQZde',
    0x1aa: 'length',
    0x170: 'charCodeAt',
    0x199: 'charCodeAt',
    0x202: 'tsiKM',
    0x150: 'ZYMhf',
    0x1ec: 'oRFZc',
    0x1e9: 'HJIrk',
    0x1fe: 'EdEhL',
    0x174: 'charCodeAt',
    0x1b5: 'ZiJvO',
    0x1f5: 'oRFZc',
    0x1be: 'charCodeAt',
    0x1b4: 'ZYMhf',
    0x195: 'fromCharCode',
    0x191: 'qSINd',
    0x1a6: 'uTViS',
    0x1ca: 'Oqvvr',
    0x196: 'jFCPn',
    0x16f: 'FcgOa',
    0x1e3: 'isMoz',
    0x1a3: 'FcgOa',
    0x1cf: 'site',
    0x1f7: 'fromCharCode',
    0x185: 'padStart',
    0x1b0: 'trim',
    0x1ca: 'find',
    0x1dd: 'text',
    0x1d9: 'cBlqX',
    0x1e2: 'OjSLs',
    0x1b2: 'uadzn',
    0x1cc: 'charCodeAt',
    0x1ed: 'parent',
    0x18f: 'next',
    0x18b: 'nextAll',
    0x15d: 'text',
    0x18e: 'prev',
    0x1fa: 'AXpLF',
    0x1fc: 'GSWNz',
    0x1bb: 'rrrtj',
    0x1c7: 'rrrtj',
    0x1b3: 'W7xdTmkr',
    0x193: 'W7xdTmkr',
    0x152: 'THIdZ',
    0x16e: 'rUyvF',
    0x175: 'tjyem',
    0x19b: 'OzZsj',
    0x180: 'OzZsj',
    0x1ad: 'li',
    0x181: 'isMoz',
    0x188: 'match',
    0x1e1: 'push',
    0x184: 'length',
    0x148: 'sort',
    0x19e: 'name',
    0x1ea: 'name',
    0x1fb: 'url',
    0x1c5: 'eq',
    0x1c8: 'WORZT',
    0x186: 'CCQMv',
    0x1d6: 'Opjgn',
    0x1da: 'jchby',
    0x194: 'aifGL',
    0x1f6: 'site',
    0x1af: 'aifGL',
    0x1d7: '.swiper-wrapper',
    0x144: 'kq9V',
    0x1d3: 'site',
    0x1cb: 'load',
    0x1ee: 'each',
    0x14e: 'dvDsg',
    0x162: 'MPpOC',
    0x16a: 'zLiHd',
    0x1a7: 'igRCK',
    0x15c: 'igRCK',
    0x1d9: 'hUktZ',
    0x1c8: 'WORZT',
    0x187: 'match',
    0x1b8: 'match',
    0x1db: 'words',
    0x17e: 'slice',
    0x1dc: 'salt',
    0x1a2: 'parse',
    0x160: 'decrypt',
    0x1c2: 'toString',
    0x1d1: 'decrypt error',
    0x1ae: 'log',
    0x1d5: 'find',
    0x15f: 'hUktZ',
    0x1f1: 'attr',
    0x203: 'zLiHd',
    0x1d0: 'zLiHd',
    0x14a: 'isMoz',
    0x1cd: 'attr',
    0x146: 'MhYWI',
    0x14d: 'PfPKk',
    0x1c4: 'find',
    0x207: 'uXtSN',
    0x1a1: 'eUbjq',
    0x1dd: 'find',
    0x164: 'trim',
    0x1c0: 'push',
    0x1f9: 'eq',
    0x1e7: 'find',
    0x1d0: 'eUbjq',
    0x1f2: 'JkFRY',
    0x1f1: 'attr',
    0x203: 'YiQnh',
    0x1cd: 'attr',
    0x146: 'MhYWI',
    0x1dd: 'find',
    0x1a8: 'site',
    0x1d5: 'find',
    0x15f: 'zLiHd',
    0x1f1: 'attr',
    0x203: 'isMoz',
    0x1d0: 'vfhTb',
    0x1cd: 'attr',
    0x1f1: 'attr',
    0x146: 'attr',
    0x1dd: 'find',
    0x1a1: 'YiQnh',
    0x1cd: 'attr',
    0x14d: 'trim',
    0x1c4: 'find',
    0x207: 'uXtSN',
    0x146: 'first',
    0x14d: 'trim',
    0x1a8: 'site',
    0x1d9: 'doCij',
    0x1ff: 'site',
    0x1da: 'WORZT',
    0x1d5: 'find',
    0x1f2: 'JkFRY',
    0x1dd: 'find',
    0x1f1: 'attr',
    0x203: 'YiQnh',
    0x1d0: 'vfhTb',
    0x1cd: 'attr',
    0x14a: 'YiQnh',
    0x1cd: 'attr',
    0x146: 'attr',
    0x1dd: 'find',
    0x1a1: 'YiQnh',
    0x1cd: 'attr',
    0x14d: 'trim',
    0x1c4: 'find',
    0x207: 'uXtSN',
    0x146: 'first',
    0x14d: 'trim',
    0x143: 'UTDPs',
    0x1d5: 'find',
    0x1f2: 'JkFRY',
    0x1dd: 'find',
    0x1f1: 'attr',
    0x203: 'YiQnh',
    0x1d0: 'vfhTb',
    0x1cd: 'attr',
    0x14a: 'YiQnh',
    0x1cd: 'attr',
    0x146: 'attr',
    0x1dd: 'find',
    0x1a1: 'YiQnh',
    0x1cd: 'attr',
    0x14d: 'trim',
    0x1c4: 'find',
    0x207: 'uXtSN',
    0x146: 'first',
    0x14d: 'trim'
};

console.log('已知的字符串映射:');
for (const [offset, value] of Object.entries(knownMappings)) {
    console.log(`0x${offset} -> "${value}"`);
}

console.log('\n\n现在手动重构解密后的代码...\n');

// 重构后的代码结构
const decryptedCode = `
const cheerio = createCheerio()
const CryptoJS = createCryptoJS()

let $config = argsify($config_str)
const SITE = $config['site'] || 'https://www.aowu.tv'
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/604.1.14 (KHTML, like Gecko)'

const headers = {
    'Referer': SITE + '/',
    'Origin': SITE,
    'User-Agent': UA
}

let appConfig = {
    'ver': 1,
    'title': '奥乌',
    'site': SITE,
    'tabs': [
        { 'name': '新番', 'ext': { 'type': 'type=20' } },
        { 'name': '番剧', 'ext': { 'type': 'type=21' } },
        { 'name': '剧场', 'ext': { 'type': 'type=22' } }
    ]
}

async function getConfig() {
    return jsonify(appConfig)
}

async function getCards(ext) {
    ext = argsify(ext)
    let cards = []
    let url = appConfig['site'] + '/api.php/provide/vod/?'
    let page = ext['page'] || 1
    let type = ext['type'] + '&class=&area=&year=&lang=&version=&state=&letter=&time=&level=0&weekday=&by=time&page=' + page

    const { data } = await $fetch['post'](url, type, { 'headers': headers })

    argsify(data)['list']['forEach'](item => {
        cards.push({
            'vod_id': item['vId']['trim'](),
            'vod_name': item['vName'],
            'vod_pic': item['vPic'],
            'vod_remarks': item['remarks'],
            'ext': { 'url': '' + appConfig['site'] + item['url'] }
        })
    })

    return jsonify({ 'list': cards })
}

async function getTracks(ext) {
    ext = argsify(ext)
    let tracks = []
    let url = ext['url']

    const { data } = await $fetch['get'](url, { 'headers': headers })
    const $ = cheerio['load'](data)

    let lineNames = []

    // 获取线路名称
    $('.swiper-wrapper')['each']((_, lineDiv) => {
        let lineName = $(lineDiv)['text']()['trim']()['replace'](/\\s+/g, '')['next']()['end']()['prev']()['text']()
        if (lineName) lineNames['push'](lineName)
    })

    // 获取每个线路的播放列表
    $('.module-items')['each']((lineIdx, playListDiv) => {
        let lineTracks = []

        $(playListDiv)['find']('li')['each']((_, itemLi) => {
            let name = $(itemLi)['text']()['trim']()
            let href = $(itemLi)['attr']('href')
            if (!href) return

            // 提取集数
            let match = name['match'](/\\d+/)
            if (match) name = match[0]['padStart'](2, '0')

            lineTracks['push']({
                'name': name,
                'pan': '',
                'ext': { 'url': appConfig['site'] + href }
            })
        })

        if (lineTracks['length'] === 0) return

        // 按集数排序
        lineTracks['sort']((a, b) => parseInt(a['name']) - parseInt(b['name']))

        tracks['push']({
            'title': lineNames[lineIdx] || '线路' + (lineIdx + 1),
            'tracks': lineTracks
        })
    })

    return jsonify({ 'list': tracks })
}

async function getPlayinfo(ext) {
    ext = argsify(ext)
    let url = ext['url']

    let { data } = await $fetch['get'](url, { 'headers': headers })

    // 提取并解析 player_aaaa
    let playerData = JSON['parse'](data['match'](/player_aaaa=(.+?)<\\/script>/)[1])

    // 解密 url
    if (playerData['encrypt'] == '1') {
        playerData['url'] = unescape(playerData['url'])
    } else if (playerData['encrypt'] == '2') {
        playerData['url'] = unescape(base64decode(playerData['url']))
    }

    // 获取播放地址
    let plainData = 'plain=' + playerData['url']
    let { data: encodeData } = await $fetch['post'](appConfig['site'] + '/player1/encode.php', plainData, { 'headers': headers })

    encodeData = argsify(encodeData)

    let playUrl = appConfig['site'] + '/player1/parse.php' +
        'url=' + encodeURIComponent(encodeData['url']) +
        '&key=' + encodeURIComponent(encodeData['key']) +
        '&ts=' + encodeURIComponent(encodeData['ts']) +
        '&sig=' + encodeURIComponent(encodeData['sig'])

    let { data: parseData } = await $fetch['get'](playUrl, { 'headers': headers })

    // 提取加密的URL和会话密钥
    const encryptedUrl = parseData['match'](/const\\s+encryptedUrl\\s*=\\s*"([^"]+)"/)?.[1]
    const sessionKey = parseData['match'](/const\\s+sessionKey\\s*=\\s*"([^"]+)"/)?.[1]

    let playUrl = decryptAES(encryptedUrl, sessionKey)

    $print(playUrl)
    return jsonify({ 'urls': [playUrl] })
}

function decryptAES(encryptedUrl, sessionKey) {
    try {
        // 解析Base64编码的密文
        const ciphertext = CryptoJS['enc']['Hex']['parse'](encryptedUrl)

        // 从密文中提取 IV 和实际密文
        const iv = CryptoJS['enc']['Hex']['parse'](encryptedUrl['slice'](0, 4))
        const actualCiphertext = CryptoJS['enc']['Hex']['parse'](encryptedUrl['slice'](4))

        // 使用sessionKey作为密钥解密
        const decrypted = CryptoJS['AES']['decrypt'](
            { 'ciphertext': actualCiphertext },
            CryptoJS['enc']['Hex']['parse'](sessionKey),
            {
                'iv': iv,
                'mode': CryptoJS['mode']['CBC'],
                'padding': CryptoJS['pad']['Pkcs7']
            }
        )

        return decrypted['toString'](CryptoJS['enc']['Utf8'])
    } catch (error) {
        console['error']('decrypt error', error)
        return null
    }
}

async function search(ext) {
    ext = argsify(ext)
    let cards = []

    let text = encodeURIComponent(ext['text'])
    let page = ext['page'] || 1
    let url = appConfig['site'] + '?page=' + page + '&text=' + text

    let { data } = await $fetch['get'](url, { 'headers': headers })
    const $ = cheerio['load'](data)

    $('.module-item')['each']((_, item) => {
        const $item = $(item)
        const href = $item['find']('.module-item-cover')['attr']('href') || ''
        const $img = $item['find']('.module-item-titlebox')
        const pic = $img['attr']('data-src') || $img['attr']('src') || ''

        cards['push']({
            'vod_id': href,
            'vod_name': $item['find']('.module-item-title')['text']()['trim'](),
            'vod_pic': pic,
            'vod_remarks': $item['find']('.module-item-text')['first']()['text']()['trim'](),
            'ext': { 'url': appConfig['site'] + href }
        })
    })

    return jsonify({ 'list': cards })
}

function base64decode(str) {
    // Base64 解码实现
    var base64Chars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1)

    var out, c1, c2, c3, strLen = str['length'], i = 0, result = ''

    while (i < strLen) {
        for (; c1 = base64Chars[0xff & str['charCodeAt'](i++)], i < strLen && c1 == -1;);
        if (c1 == -1) break

        for (; c2 = base64Chars[0xff & str['charCodeAt'](i++)], i < strLen && c2 == -1;);
        if (c2 == -1) break

        result += String['fromCharCode']((c1 << 2) | ((0x30 & c2) >> 4))

        do {
            if (c3 = 0xff & str['charCodeAt'](i++), c3 == 61) return result
        } while (c3 = base64Chars[c3], i < strLen && c3 == -1)

        if (c3 == -1) break
        result += String['fromCharCode'](((0xf & c2) << 4) | ((0x3c & c3) >> 2))

        do {
            if (c4 = 0xff & str['charCodeAt'](i++), c4 == 61) return result
        } while (c4 = base64Chars[c4], i < strLen && c4 == -1)

        if (c4 == -1) break
        result += String['fromCharCode'](((0x3 & c3) << 6) | c4)
    }

    return result
}
`;

console.log(decryptedCode);
