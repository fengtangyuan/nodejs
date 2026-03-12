/**
 * aowuj.js 字符串解密脚本
 * 真正执行解密逻辑，获取所有字符串映射
 */

// ============================================================
// 一、提取的字符串数组 (从 _0x2785 函数中)
// ============================================================
const getStringArray = () => {
    return [
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
        'jGtcOG',
        'jslcUGFcPG',
        'fSo1hY4e',
        'WPxdO8k9W6tcUG',
        'rCklW7uf',
        'cSkcWQFdMmkk',
        'W6JcLSoIh8ko',
        'frBcP0dcJW',
        'WQNcSg4jFq',
        'fb7cIrBcRmkJW6m',
        'WRdcMw9JwW',
        'W6ldKW1fcSkYWQi0BmoNpmoOtZe',
        'W7RcPrNdN8kH',
        'gCk5WQtdVW',
        'W5BdG8obfLq',
        'WPNdRCorWQO',
        'nuhcTwBdLW',
        'eSk6WOJdOSk6',
        'aJddUq',
        'WP7dJNnBcSkToCkrgsq2',
        'ymotW4DbrCkJpCoflCkkWPFcHmkxWRv6',
        'WPJdPCkDWO0z',
        'W7hcKHjJEq',
        'o8kuWRBdUCkF',
        'E8k1jxG',
        'W7xcKL0Bba',
        'k8oRhsa',
        'W5RcRdRdOa',
        's8kjng0Q',
        'WQ7dK1CwkrrMvSoyfxjm',
        'WRFcNSknvgW',
        'W5NcHsWo',
        'qmo3W6ZcI8oKc8k1a8okW549W5RcIxFcV8k9W4hdJSo7cNirmCo1WQSQWRW',
        'W7HKvhZdVmoEW69xW7hdVmoUvG',
        'WRVdQfZcMCkk',
        'WPVdINdcPmkh',
        'WOddSLpcP8kZ',
        'zmoga8kiaLC',
        'W4NdPHiHpI7dG0POW5JdJSkhWPu',
        'WPtcNmkACN0',
        'i8kUmYigF0foa1ddTCkFWRZcRq',
        'fCkZaW',
        'hgCXiG',
        'bG07W4Lx',
        'tSoYg8kzBG',
        'W71Nwh3dUSoCWPS+W5pdV8oyCCk6W6e',
        'mmk/WRaNWPy',
        'c0ddQCoy',
        'sIldQCk3',
        'nIpcRmo3lG',
        'WPldQCklW5hcQGddPq',
        'WOtcMCkerMS',
        'W4VdRtRdO8kJWPFcNdhdHvFdQ8ocWOZdKG',
        'cmk9WR/dOW',
        'W5ZdV2ldTW',
        'WOKzeH4',
        'fbFcOG',
        'f2Xvrq',
        'W4FcIWDrkW',
        'q8o0WQBcTCo4gSkWdCouW5OP',
        'W7ZdJmoYD2BcV8kRhCoFW5VcPYtcUMNcICobWO/dUYRcQCoXiq',
        'zhpdNZnIiG',
        'k8k3WRxdS8kvW4uoWRZcRG',
        'pHBcKSo+ibC1',
        'odRcM8oTwW',
        'WRxdJM7cSq',
        'f301nSkZW5lcJWRcOmoH',
        'qLj4c8kNW4tcNa'
    ];
};

// ============================================================
// 二、RC4 解密函数 (从 _0x32a9 函数中提取)
// ============================================================

/**
 * Base64 解码
 */
function base64Decode(str) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let result = '';
    let temp = '';
    let i = 0;

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

        if (enc3 !== 64) {
            result += String.fromCharCode(chr2);
        }
        if (enc4 !== 64) {
            result += String.fromCharCode(chr3);
        }

        temp = '';
    } while (i < str.length);

    return result;
}

/**
 * RC4 解密
 */
function rc4Decrypt(str, key) {
    // 先 Base64 解码
    str = base64Decode(str);

    // RC4 解密
    let s = [];
    let j = 0;
    let x = 0;
    let result = '';

    // 初始化 S 盒
    for (let i = 0; i < 256; i++) {
        s[i] = i;
    }

    // 密钥调度算法 (KSA)
    for (let i = 0; i < 256; i++) {
        j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
        [s[i], s[j]] = [s[j], s[i]];
    }

    // 伪随机生成算法 (PRGA)
    j = 0;
    for (let i = 0; i < str.length; i++) {
        x = (x + 1) % 256;
        j = (j + s[x]) % 256;
        [s[x], s[j]] = [s[j], s[x]];
        result += String.fromCharCode(str.charCodeAt(i) ^ s[(s[x] + s[j]) % 256]);
    }

    return result;
}

/**
 * 字符串解密函数 (模拟 _0x32a9)
 */
function decryptString(index, key) {
    const OFFSET = 0x143; // jsjiami 偏移量
    const stringArray = getStringArray();

    const actualIndex = index - OFFSET;

    if (actualIndex < 0 || actualIndex >= stringArray.length) {
        return null;
    }

    const encrypted = stringArray[actualIndex];
    return rc4Decrypt(encrypted, key);
}

// ============================================================
// 三、解密所有字符串
// ============================================================

// 常见的 (index, key) 对，从原始代码中提取
const decryptTargets = [
    // getCards 函数
    [0x1ba, '(%w&'], // API 路径
    [0x149, 'lH!n'], // post
    [0x1f6, 'b9n['], // site
    [0x1f0, 'si%3'], // list
    [0x1c9, 'skmR'], // forEach
    [0x167, 'p)0)'], // page
    [0x16b, '%96U'], // vod_id
    [0x17c, 'ZcQT'], // vod_name
    [0x204, 'VpP]'], // vod_pic
    [0x169, 'Y4By'], // vod_remarks
    [0x1d3, 'FY#D'], // site (再次)
    [0x18d, 'si%3'], // push

    // getTracks 函数
    [0x1a0, 'BStM'], // url
    [0x1e4, '!&C$'], // get
    [0x1cb, 'ej(K'], // load
    [0x159, 'orWV'], // .module-tab-item
    [0x19c, 'iJuG'], // text
    [0x1d7, 'VpP]'], // .module-play-list
    [0x208, 'vcWe'], // each
    [0x1ed, 'Qxq0'], // trim
    [0x18f, 'iJuG'], // text (重复)
    [0x18b, 'hW!s'], // split
    [0x15d, 'iJuG'], // text (重复)
    [0x18e, 'jRAW'], // shift
    [0x183, 'ej(K'], // .module-play-list
    [0x1ee, 'E*cO'], // each
    [0x1b9, 'qKfW'], // .module-tab-item
    [0x144, 'kq9V'], // .module-play-list-link
    [0x1ad, 'zEb1'], // find
    [0x165, 'mVOl'], // each
    [0x163, 'vcWe'], // text
    [0x20a, 'ad6p'], // trim
    [0x19a, 'p)0)'], // attr
    [0x1a4, 'BStM'], // href
    [0x19b, 'hGdM'], // find
    [0x1b5, 'WqJp'], // >> (右移)
    [0x1fe, 'si%3'], // charCodeAt
    [0x1e9, 'sWqH'], // length
    [0x1e1, 'nL&Q'], // push
    [0x184, '(%w&'], // length
    [0x148, '7mte'], // sort
    [0x19e, 'pMpp'], // name
    [0x1ea, '&9PX'], // name

    // getPlayinfo 函数
    [0x1b1, '#*Ke'], // argsify
    [0x197, '7mte'], // parse
    [0x182, 'hGdM'], // url
    [0x1bc, 'ES!R'], // url
    [0x190, '5N)H'], // encrypt
    [0x1ce, 'E*cO'], // !==
    [0x14c, 'hGdM'], // url
    [0x1bd, 'pMpp'], // url
    [0x1e5, 'o]p#'], // unescape
    [0x1fd, '7mte'], // fromCharCode
    [0x1d6, 'GgjU'], // +
    [0x209, 'ZcQT'], // url
    [0x205, 'nL&Q'], // +
    [0x151, 'zEb1'], // +
    [0x18c, '5N)H'], // /player1/index.php?data=
    [0x201, 'B5%)'], // argsify
    [0x20c, 'vcWe'], // &ts=
    [0x20b, '^6XL'], // &sign=
    [0x1f4, 'GgjU'], // encodeURIComponent
    [0x20d, 'o]p#'], // get
    [0x187, '#OgP'], // match
    [0x1b8, 'FY#D'], // match
    [0x1c3, 'b9n['], // decryptAES
    [0x172, 'pXpG'], // site
    [0x1ab, 'ZcQT'], // url

    // search 函数
    [0x19d, 'Qxq0'], // argsify
    [0x1ac, 'B5%)'], // encodeURIComponent
    [0x1df, 'GgjU'], // text
    [0x1c5, 'sWqH'], // page
    [0x1ff, 'ej(K'], // site
    [0x17a, 'nL&Q'], // /vodsearch/
    [0x15e, 'o]p#'], // .html?wd=
    [0x1b7, 'B5%)'], // get
    [0x1f2, 'orWV'], // .detail-info > a
    [0x161, 'hGdM'], // .module-item-pic
    [0x15f, '#OgP'], // attr
    [0x203, 'gdgv'], // href
    [0x1e7, 'nL&Q'], // find
    [0x1d0, '!&C$'], // .module-item-pic
    [0x14a, 'sWqH'], // data-src
    [0x17d, '#*Ke'], // src
    [0x1f8, 'iJuG'], // .module-card-item-title
    [0x1d5, 'FY#D'], // find
    [0x1f1, 'skmR'], // attr
    [0x1a1, '&9PX'], // .module-card-item-title
    [0x1dd, 'skmR'], // text
    [0x164, 'b9n['], // trim
    [0x1c4, 'Y4By'], // .module-card-item-status
    [0x207, 'lH!n'], // first
    [0x146, 'sWqH'], // text
    [0x14d, 'E*cO'], // trim
    [0x1a8, 'B5%)'], // site
    [0x143, 'T^Uu'], // jsonify
    [0x1f9, '!&C$'], // $

    // 常量
    [0x1ef, '#OgP'], // UA
    [0x192, 'FY#D'], // 傲物
    [0x16d, 'DWwl'], // type=25
    [0x171, '5N)H'], // type=21
    [0x1da, '#OgP'], // jsonify
];

// ============================================================
// 四、执行解密
// ============================================================

console.log('='.repeat(80));
console.log('aowuj.js 字符串解密结果');
console.log('='.repeat(80));
console.log('');

const results = [];
for (const [index, key] of decryptTargets) {
    const decrypted = decryptString(index, key);
    const hexIndex = '0x' + index.toString(16).toUpperCase().padStart(3, '0');

    results.push({
        index: hexIndex,
        key: `'${key}'`,
        value: decrypted,
        length: decrypted?.length || 0
    });
}

// 按索引排序
results.sort((a, b) => parseInt(a.index) - parseInt(b.index));

// 输出结果
console.log('┌─────────┬─────────────┬──────────────────────────────────────────┐');
console.log('│ 索引    │ 密钥        │ 解密值                                    │');
console.log('├─────────┼─────────────┼──────────────────────────────────────────┤');

for (const r of results) {
    const value = r.value || '(null)';
    const valueDisplay = value.length > 45 ? value.substring(0, 42) + '...' : value;
    console.log(`│ ${r.index}  │ ${r.key.padEnd(11)} │ ${valueDisplay.padEnd(42)} │`);
}

console.log('└─────────┴─────────────┴──────────────────────────────────────────┘');
console.log('');
console.log(`总计: ${results.length} 个字符串`);
console.log('');

// 输出 JSON 格式
console.log('='.repeat(80));
console.log('JSON 格式输出 (可复制使用)');
console.log('='.repeat(80));
console.log('');
console.log('const stringMap = {');
for (const r of results) {
    if (r.value) {
        const jsonValue = JSON.stringify(r.value);
        console.log(`    '${r.index}': ${jsonValue},`);
    }
}
console.log('};');
