// 嗷呜动漫爬虫
// 解密自 aowuj.js (jsjiami.com.v7 加密)
// 站点: https://www.aowu.tv

const cheerio = createCheerio()
const CryptoJS = createCryptoJS()

const cheerio = createCheerio(), CryptoJS = createCryptoJS();

let $config = argsify($config_str);

const SITE = $config['site'] || 'https://www.aowu.tv', UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', headers = { 'Referer': SITE + '/', 'Origin': '' + SITE, 'User-Agent': UA }, appConfig = { 'ver': 0x1, 'title': '嗷呜动漫', 'site': SITE, 'tabs': [{ 'name': '新番', 'ext': { 'type': 'type=20' } }, { 'name': '番剧', 'ext': { 'type': 'type=21' } }, { 'name': '剧场', 'ext': { 'type': 'type=22' } }] };

async function getConfig() {
    const _0x51060c = _0x586329, _0x4b1067 = { 'jchby': function (_0x3d2b58, _0xb0f59b) { return _0x3d2b58(_0xb0f59b); } };
    return _0x4b1067['jchby'](jsonify, appConfig); } async function getCards(_0x2dc0e6) {
    const _0x4974a4 = _0x586329, _0xb382e7 = { 'aifGL': function (_0x307239, _0x105d58) { return _0x307239(_0x105d58); } }; _0x2dc0e6 = _0xb382e7['aifGL'](argsify, _0x2dc0e6);

let _0x4949b5 = [], _0x5450fb = appConfig['site'] + '/index.php/ds_api/vod', _0x3d21db = _0x2dc0e6['page'] || 0x1, _0x42d87a = _0x2dc0e6['type'] + '&class=&area=&year=&lang=&version=&state=&letter=&time=&level=0&weekday=&by=time&page=' + _0x3d21db;

const { data: _0x1c71b1 } = await $fetch['post'](_0x5450fb, _0x42d87a, { 'headers': headers });
    return argsify(_0x1c71b1)['list']['forEach'](_0x566268 => {
    const _0x45f9ad = _0x4974a4; _0x4949b5['push']({ 'vod_id': _0x566268['vod_id']['toString'](), 'vod_name': _0x566268['vod_name'], 'vod_pic': _0x566268['vod_pic'], 'vod_remarks': _0x566268['vod_remarks'], 'ext': { 'url': '' + appConfig['site'] + _0x566268['url'] } }); }), _0xb382e7['aifGL'](jsonify, { 'list': _0x4949b5 }); } async function getTracks(_0x341c20) {
    const _0x1c77a6 = _0x586329, _0x557eac = { 'AXpLF': function (_0x390961, _0x43486e) { return _0x390961 == _0x43486e; }, 'igRCK': function (_0x249328, _0x3c60f5) { return _0x249328 & _0x3c60f5; }, 'ccBBz': function (_0xea3fd9, _0x5ba7a8) { return _0xea3fd9 === _0x5ba7a8; }, 'abZwg': 'vOKmU', 'GSWNz': 'udDqH', 'cBlqX': function (_0x3b8f96, _0x57f61e) { return _0x3b8f96(_0x57f61e); }, 'yFwkv': function (_0x2d4d16, _0x5aeb77) { return _0x2d4d16(_0x5aeb77); }, 'frvAe': 'vDpzl', 'DhUDy': function (_0x4bc8d4, _0x1aa6cc) { return _0x4bc8d4(_0x1aa6cc); }, 'zLiHd': 'href', 'hUktZ': function (_0x3c7e83, _0x5d9a7d) { return _0x3c7e83(_0x5d9a7d); }, 'dvDsg': 'ul.anthology-list-play li a', 'MPpOC': 'a.swiper-slide', 'mpujW': 'div.anthology-list-box' }; _0x341c20 = _0x557eac['hUktZ'](argsify, _0x341c20);

let _0x363a5c = [], _0x2c211e = _0x341c20['url'];

const { data: _0x2c3c5f } = await $fetch['get'](_0x2c211e, { 'headers': headers }), _0xa545d7 = cheerio['load'](_0x2c3c5f);

let _0xa7248c = [];
    return _0x557eac['yFwkv'](_0xa545d7, _0x557eac['MPpOC'])['each']((_0x66fade, _0x45ee71) => {
    const _0x262e13 = _0x1c77a6, _0x50b98f = { 'OjSLs': function (_0x5b9093, _0xad46e3) {
    const _0x5943d0 = _0x32a9;
    return _0x557eac['AXpLF'](_0x5b9093, _0xad46e3); }, 'uadzn': function (_0xad40dc, _0x39402a) {
    const _0x4e36a1 = _0x32a9;
    return _0x557eac['igRCK'](_0xad40dc, _0x39402a); } };
    if (_0x557eac['ccBBz'](_0x557eac['abZwg'], _0x557eac['GSWNz'])) { if (_0x50b98f['OjSLs'](0x3d, _0x3bba90 = _0x50b98f['uadzn'](0xff, _0x2e114e['charCodeAt'](_0x186a91++)))) return _0x1a759f; }
}else {
    let _0xc89658 = _0x557eac['cBlqX'](_0xa545d7, _0x45ee71)['clone']()['children']()['remove']()['end']()['text']()['trim']();
    if (_0xc89658) _0xa7248c['push'](_0xc89658); } }), _0xa545d7(_0x557eac['mpujW'])['each']((_0x4c870a, _0x5c7271) => {
    const _0x4c87a2 = _0x1c77a6, _0x39e5ca = { 'THIdZ': function (_0x43be1d, _0x469336) {
    const _0x5dd69d = _0x32a9;
    return _0x557eac['yFwkv'](_0x43be1d, _0x469336); }, 'rUyvF': _0x557eac['frvAe'], 'tjyem': function (_0x1a9be0, _0x261515) { return _0x1a9be0(_0x261515); }, 'OzZsj': function (_0x37e633, _0x57093c) { return _0x557eac['DhUDy'](_0x37e633, _0x57093c); }, 'isMoz': _0x557eac['zLiHd'], 'rrrtj': function (_0x18e136, _0x96c8e) {
    const _0x361b64 = _0x4c87a2;
    return _0x557eac['hUktZ'](_0x18e136, _0x96c8e); } };
    if ('jEgPn' !== 'snJuy') {
    let _0x476845 = []; _0xa545d7(_0x5c7271)['find'](_0x557eac['dvDsg'])['each']((_0x434194, _0x54f8ed) => {
    const _0xd4e281 = _0x4c87a2, _0x11e995 = { 'CgrvU': function (_0x2642e5, _0x589729) {
    const _0x226cf3 = _0x32a9;
    return _0x39e5ca['THIdZ'](_0x2642e5, _0x589729); } };
    if (_0x39e5ca['rUyvF'] === 'vDpzl') {
    let _0x47aa23 = _0x39e5ca['tjyem'](_0xa545d7, _0x54f8ed)['text']()['trim'](), _0x2e97c5 = _0x39e5ca['OzZsj'](_0xa545d7, _0x54f8ed)['attr'](_0x39e5ca['isMoz']);
    if (!_0x2e97c5) return;

let _0x1de8ca = _0x47aa23['match'](/\d+/);
    if (_0x1de8ca) _0x47aa23 = _0x1de8ca[0x0]['padStart'](0x2, '0'); _0x476845['push']({ 'name': _0x47aa23, 'pan': '', 'ext': { 'url': appConfig['site'] + _0x2e97c5 } }); } else _0x44cca7['url'] = _0x11e995['CgrvU'](_0x349db7, _0x11e995['CgrvU'](_0x34034d, _0x37d8bf['url'])); });
    if (_0x557eac['ccBBz'](_0x476845['length'], 0x0)) return; _0x476845['sort']((_0x5e6344, _0x4fd324) => parseInt(_0x5e6344['name']) - parseInt(_0x4fd324['name'])), _0x363a5c['push']({ 'title': _0xa7248c[_0x4c870a] || '线路' + (_0x4c870a + 0x1), 'tracks': _0x476845 }); } else _0x548a72['url'] = _0x39e5ca['rrrtj'](_0x33ed61, _0x64beec['url']); }), jsonify({ 'list': _0x363a5c }); } async function getPlayinfo(_0xac9d29) {
    const _0x1d0817 = _0x586329, _0x225433 = { 'bnTOY': function (_0x4cdbf4, _0x4dc425) { return _0x4cdbf4(_0x4dc425); }, 'pZOdw': function (_0x355cec, _0x4013b7) { return _0x355cec == _0x4013b7; }, 'ptuoB': function (_0x562454, _0x237880) { return _0x562454 !== _0x237880; }, 'fSMBt': 'NqpzK', 'kalDq': 'NRECu', 'tEKYm': function (_0x585b05, _0x4ad618) { return _0x585b05(_0x4ad618); }, 'Opjgn': function (_0x2de4d2, _0x446599) { return _0x2de4d2 + _0x446599; }, 'NfEOS': function (_0x3bf334, _0xf3a86e) { return _0x3bf334 + _0xf3a86e; }, 'KMLqS': function (_0x3b4eab, _0x4a7533) { return _0x3b4eab + _0x4a7533; }, 'qeBfv': '/player1/?url=', 'nbOun': function (_0xdbc697, _0x5d72ff) { return _0xdbc697(_0x5d72ff); }, 'CCQMv': '&sig=', 'nvJXs': function (_0xc68656, _0x4cd8c7, _0x48f0db) { return _0xc68656(_0x4cd8c7, _0x48f0db); } }; _0xac9d29 = _0x225433['bnTOY'](argsify, _0xac9d29);

let _0x434d2b = _0xac9d29['url']; ({ data: data } = await $fetch['get'](_0x434d2b, { 'headers': headers }));

let _0x29ce1d = JSON['parse'](data['match'](/player_aaaa=(.+?)<\/script>/)[0x1]);
    if (_0x29ce1d['encrypt'] == '1') _0x29ce1d['url'] = unescape(_0x29ce1d['url']);
    else { if (_0x225433['pZOdw'](_0x29ce1d['encrypt'], '2')) { if (_0x225433['ptuoB'](_0x225433['fSMBt'], _0x225433['kalDq'])) _0x29ce1d['url'] = _0x225433['tEKYm'](unescape, base64decode(_0x29ce1d['url']));
    else return _0x303d0a(_0x83e0c2); } } let _0x4f2c8e = 'plain=' + _0x29ce1d['url']; ({ data: data } = await $fetch['post'](appConfig['site'] + '/player1/encode.php', _0x4f2c8e, { 'headers': headers }));

var _0x4fa207 = _0x225433['Opjgn'](_0x225433['NfEOS'](_0x225433['KMLqS'](_0x225433['Opjgn'](appConfig['site'] + _0x225433['qeBfv'], encodeURIComponent(_0x225433['bnTOY'](argsify, data)['url'])), '&ts='), _0x225433['nbOun'](encodeURIComponent, argsify(data)['ts'])), _0x225433['CCQMv']) + _0x225433['nbOun'](encodeURIComponent, argsify(data)['sig']);; ({ data: data } = await $fetch['get'](_0x4fa207, { 'headers': headers }));

const _0x5d0fdf = data['match'](/const\s+encryptedUrl\s*=\s*"([^"]+)"/)?.[0x1], _0x1ae53b = data['match'](/const\s+sessionKey\s*=\s*"([^"]+)"/)?.[0x1];

let _0x5174ab = _0x225433['nvJXs'](decryptAES, _0x5d0fdf, _0x1ae53b);
    return _0x225433['tEKYm']($print, _0x5174ab), jsonify({ 'urls': [_0x5174ab] }); } function decryptAES(_0xea175d, _0x51214a) {
    const _0x52c7ff = _0x586329, _0x52dc5f = { 'AjhDH': 'URL解密失败' }; try {
    const _0x28b14f = CryptoJS['enc']['Base64']['parse'](_0xea175d), _0x433eb8 = CryptoJS['lib']['WordArray']['create'](_0x28b14f['words']['slice'](0x0, 0x4)), _0x1a0f8d = CryptoJS['lib']['WordArray']['create'](_0x28b14f['words']['slice'](0x4)), _0x2cd875 = CryptoJS['AES']['decrypt']({ 'ciphertext': _0x1a0f8d }, CryptoJS['enc']['Utf8']['parse'](_0x51214a), { 'iv': _0x433eb8, 'mode': CryptoJS['mode']['CBC'], 'padding': CryptoJS['pad']['Pkcs7'] });
    return _0x2cd875['toString'](CryptoJS['enc']['Utf8']); }
} catch (_0x44a7aa) { return console['error'](_0x52dc5f['AjhDH'], _0x44a7aa), null; } } async function search(_0x452b1f) {
    const _0x22b56f = _0x586329, _0x1f0664 = { 'UTDPs': function (_0x2580d9, _0x26613b) { return _0x2580d9(_0x26613b); }, 'eUbjq': '.detail-info\x20>\x20a', 'zQZuD': 'href', 'JkFRY': '.detail-pic img', 'DYiaD': 'data-src', 'uXtSN': 'data-original', 'MhYWI': 'src', 'PfPKk': 'span.slide-info-remarks', 'doCij': function (_0x410d01, _0x58b8dd) { return _0x410d01 + _0x58b8dd; }, 'YiQnh': 'div.vod-detail', 'vfhTb': function (_0x5821d5, _0x291aae) { return _0x5821d5(_0x291aae); } }; _0x452b1f = _0x1f0664['UTDPs'](argsify, _0x452b1f);

let _0x5483b9 = [], _0x72de96 = _0x1f0664['UTDPs'](encodeURIComponent, _0x452b1f['text']), _0x4aaa67 = _0x452b1f['page'] || 0x1;

const _0x221e40 = appConfig['site'] + '/vods/page/' + _0x4aaa67 + '/wd/' + _0x72de96, { data: _0x478f86 } = await $fetch['get'](_0x221e40, { 'headers': headers }), _0x5cfd39 = cheerio['load'](_0x478f86);
    return _0x1f0664['UTDPs'](_0x5cfd39, _0x1f0664['YiQnh'])['each']((_0x16f37b, _0x46a729) => {
    const _0x323f69 = _0x22b56f, _0x5d9439 = _0x1f0664['UTDPs'](_0x5cfd39, _0x46a729), _0x4d4b20 = _0x5d9439['find'](_0x1f0664['eUbjq'])['attr'](_0x1f0664['zQZuD']) || '', _0x423335 = _0x5d9439['find'](_0x1f0664['JkFRY']), _0x43b6bf = _0x423335['attr'](_0x1f0664['DYiaD']) || _0x423335['attr'](_0x1f0664['uXtSN']) || _0x423335['attr'](_0x1f0664['MhYWI']) || ''; _0x5483b9['push']({ 'vod_id': _0x4d4b20, 'vod_name': _0x5d9439['find']('h3.slide-info-title')['text']()['trim'](), 'vod_pic': _0x43b6bf, 'vod_remarks': _0x5d9439['find'](_0x1f0664['PfPKk'])['first']()['text']()['trim'](), 'ext': { 'url': _0x1f0664['doCij'](appConfig['site'], _0x4d4b20) } }); }), _0x1f0664['vfhTb'](jsonify, { 'list': _0x5483b9 }); } function base64decode(_0x43d370) {
    const _0x1b255a = _0x586329, _0x9eeb99 = { 'Oqvvr': function (_0x548e84, _0x4001ac) { return _0x548e84(_0x4001ac); }, 'jFCPn': 'href', 'FcgOa': function (_0xb65c54, _0x24d798) { return _0xb65c54 + _0x24d798; }, 'tsiKM': function (_0x5b3d21, _0x54ac7d) { return _0x5b3d21 < _0x54ac7d; }, 'ZYMhf': function (_0x3ae51b, _0x58e27c) { return _0x3ae51b === _0x58e27c; }, 'fjKQl': 'pzSkt', 'EQZde': function (_0x1a0eb8, _0x22f4bd) { return _0x1a0eb8 & _0x22f4bd; }, 'oRFZc': function (_0x3d0470, _0x266779) { return _0x3d0470 == _0x266779; }, 'pGVFT': function (_0x5be311, _0x2f4d38) { return _0x5be311 == _0x2f4d38; }, 'uTViS': function (_0xfab443, _0x1bd290) { return _0xfab443 << _0x1bd290; }, 'ZvfdB': function (_0x51ade5, _0x232362) { return _0x51ade5 >> _0x232362; }, 'EdEhL': function (_0x27000b, _0x577489) { return _0x27000b & _0x577489; }, 'coUGi': function (_0x5df97d, _0x1ff09e) { return _0x5df97d == _0x1ff09e; }, 'HJIrk': function (_0x4c3d2c, _0x532d39) { return _0x4c3d2c == _0x532d39; }, 'qSINd': function (_0x356ed5, _0xc521d8) { return _0x356ed5 | _0xc521d8; }, 'bbZVH': function (_0x2d6e3a, _0x1d6bce) { return _0x2d6e3a >> _0x1d6bce; }, 'ZiJvO': function (_0x406cf9, _0x3449f3) { return _0x406cf9 == _0x3449f3; }, 'RYomX': function (_0x379e94, _0x1391b1) { return _0x379e94 << _0x1391b1; }, 'eVfNp': function (_0x4aff6d, _0x2566f8) { return _0x4aff6d & _0x2566f8; } };

var _0x3910be = new Array(-0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, 0x3e, -0x1, -0x1, -0x1, 0x3f, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x3b, 0x3c, 0x3d, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, 0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, -0x1, -0x1, -0x1, -0x1, -0x1, -0x1, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f, 0x20, 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x2b, 0x2c, 0x2d, 0x2e, 0x2f, 0x30, 0x31, 0x32, 0x33, -0x1, -0x1, -0x1, -0x1, -0x1); for (var _0x4457f2, _0x307962, _0x29d8d7, _0x3644cf, _0x470a32 = _0x43d370['length'], _0x41fceb = 0x0, _0x396c14 = ''; _0x9eeb99['tsiKM'](_0x41fceb, _0x470a32);) { if (_0x9eeb99['ZYMhf']('pzSkt', _0x9eeb99['fjKQl'])) { for (; _0x4457f2 = _0x3910be[_0x9eeb99['EQZde'](0xff, _0x43d370['charCodeAt'](_0x41fceb++))], _0x41fceb < _0x470a32 && _0x9eeb99['oRFZc'](-0x1, _0x4457f2););
    if (_0x9eeb99['oRFZc'](-0x1, _0x4457f2)) break; for (; _0x307962 = _0x3910be[0xff & _0x43d370['charCodeAt'](_0x41fceb++)], _0x9eeb99['tsiKM'](_0x41fceb, _0x470a32) && _0x9eeb99['pGVFT'](-0x1, _0x307962););
    if (-0x1 == _0x307962) break; _0x396c14 += String['fromCharCode'](_0x9eeb99['uTViS'](_0x4457f2, 0x2) | _0x9eeb99['ZvfdB'](_0x9eeb99['EdEhL'](0x30, _0x307962), 0x4)); do { if (_0x9eeb99['coUGi'](0x3d, _0x29d8d7 = 0xff & _0x43d370['charCodeAt'](_0x41fceb++))) return _0x396c14; } while (_0x29d8d7 = _0x3910be[_0x29d8d7], _0x9eeb99['tsiKM'](_0x41fceb, _0x470a32) && _0x9eeb99['HJIrk'](-0x1, _0x29d8d7));
    if (-0x1 == _0x29d8d7) break; _0x396c14 += String['fromCharCode'](_0x9eeb99['qSINd']((0xf & _0x307962) << 0x4, _0x9eeb99['bbZVH'](_0x9eeb99['EQZde'](0x3c, _0x29d8d7), 0x2))); do { if (_0x9eeb99['pGVFT'](0x3d, _0x3644cf = 0xff & _0x43d370['charCodeAt'](_0x41fceb++))) return _0x396c14; } while (_0x3644cf = _0x3910be[_0x3644cf], _0x41fceb < _0x470a32 && -0x1 == _0x3644cf);
    if (_0x9eeb99['ZiJvO'](-0x1, _0x3644cf)) break; _0x396c14 += String['fromCharCode'](_0x9eeb99['RYomX'](_0x9eeb99['eVfNp'](0x3, _0x29d8d7), 0x6) | _0x3644cf); }
}else {
    let _0x2a5479 = _0x9eeb99['Oqvvr'](_0x334a32, _0x1fbd6c)['text']()['trim'](), _0x4a9230 = _0x9eeb99['Oqvvr'](_0x6a2915, _0x1f2593)['attr'](_0x9eeb99['jFCPn']);
    if (!_0x4a9230) return;

let _0x5abba2 = _0x2a5479['match'](/\d+/);
    if (_0x5abba2) _0x2a5479 = _0x5abba2[0x0]['padStart'](0x2, '0'); _0x2ac9e7['push']({ 'name': _0x2a5479, 'pan': '', 'ext': { 'url': _0x9eeb99['FcgOa'](_0x3c008e['site'], _0x4a9230) } }); } } return _0x396c14; } var version_ = 'jsjiami.com.v7';