/**
 * Unicode Utility for FB Format Pro
 * Handles transformation of text into various Unicode styles.
 */

export type ScriptType = 'Latin' | 'Bengali' | 'Arabic' | 'Devanagari' | 'CJK' | 'Cyrillic' | 'Thai' | 'Other';

export function detectScript(text: string): ScriptType {
  if (!text) return 'Other';
  
  // Check for common script ranges
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    if (charCode >= 0x0980 && charCode <= 0x09FF) return 'Bengali';
    if (charCode >= 0x0600 && charCode <= 0x06FF) return 'Arabic';
    if (charCode >= 0x0900 && charCode <= 0x097F) return 'Devanagari';
    if (charCode >= 0x4E00 && charCode <= 0x9FFF) return 'CJK';
    if (charCode >= 0x0400 && charCode <= 0x04FF) return 'Cyrillic';
    if (charCode >= 0x0E00 && charCode <= 0x0E7F) return 'Thai';
    if ((charCode >= 0x0041 && charCode <= 0x005A) || (charCode >= 0x0061 && charCode <= 0x007A)) return 'Latin';
  }
  
  return 'Other';
}

const MAPS = {
  bold: {
    A: '𝗔', B: '𝗕', C: '𝗖', D: '𝗗', E: '𝗘', F: '𝗙', G: '𝗚', H: '𝗛', I: '𝗜', J: '𝗝', K: '𝗞', L: '𝗟', M: '𝗠',
    N: '𝗡', O: '𝗢', P: '𝗣', Q: '𝗤', R: '𝗥', S: '𝗦', T: '𝗧', U: '𝗨', V: '𝗩', W: '𝗪', X: '𝗫', Y: '𝗬', Z: '𝗭',
    a: '𝗮', b: '𝗯', c: '𝗰', d: '𝗱', e: '𝗲', f: '𝗳', g: '𝗴', h: '𝗵', i: '𝗶', j: '𝗷', k: '𝗸', l: '𝗹', m: '𝗺',
    n: '𝗻', o: '𝗼', p: '𝗽', q: '𝗾', r: '𝗿', s: '𝘀', t: '𝘁', u: '𝘂', v: '𝘃', w: '𝘄', x: '𝗫', y: '𝘆', z: '𝘇',
    '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
  },
  italic: {
    A: '𝘈', B: '𝘉', C: '𝘊', D: '𝘋', E: '𝘌', F: '𝘍', G: '𝘎', H: '𝘏', I: '𝘐', J: '𝘑', K: '𝘒', L: '𝘓', M: '𝘔',
    N: '𝘕', O: '𝘖', P: '𝘗', Q: '𝘘', R: '𝘙', S: '𝘚', T: '𝘛', U: '𝘜', V: '𝘝', W: '𝘞', X: '𝘟', Y: '𝘠', Z: '𝘡',
    a: '𝘢', b: '𝘣', c: '𝘤', d: '𝘥', e: '𝘦', f: '𝘧', g: '𝘨', h: '𝘩', i: '𝘪', j: '𝘫', k: '𝘬', l: '𝘭', m: '𝘮',
    n: '𝘯', o: '𝘰', p: '𝘱', q: '𝘲', r: '𝘳', s: '𝘴', t: '𝘵', u: '𝘶', v: '𝘷', w: '𝘸', x: '𝘹', y: '𝘺', z: '𝘻'
  },
  boldItalic: {
    A: '𝘼', B: '𝘽', C: '𝘾', D: '𝘿', E: '𝙀', F: '𝙁', G: '𝙂', H: '𝙃', I: '𝙄', J: '𝙅', K: '𝙆', L: '𝙇', M: '𝙈',
    N: '𝙉', O: '𝙊', P: '𝙋', Q: '𝙌', R: '𝙍', S: '𝙎', T: '𝙏', U: '𝙐', V: '𝙑', W: '𝙒', X: '𝙓', Y: '𝙔', Z: '𝙕',
    a: '𝙖', b: '𝙗', c: '𝙘', d: '𝙙', e: '𝙚', f: '𝙛', g: '𝙜', h: '𝙝', i: '𝙞', j: '𝙟', k: '𝙠', l: '𝙡', m: '𝙢',
    n: '𝙣', o: '𝙤', p: '𝙥', q: '𝙦', r: '𝙧', s: '𝙨', t: '𝙩', u: '𝙪', v: '𝙫', w: '𝙬', x: '𝙭', y: '𝙮', z: '𝙯'
  },
  monospace: {
    A: '𝙰', B: '𝙱', C: '𝙲', D: '𝙳', E: '𝙴', F: '𝙵', G: '𝙶', H: '𝙷', I: '𝙸', J: '𝙹', K: '𝙺', L: '𝙻', M: '𝙼',
    N: '𝙽', O: '𝙾', P: '𝙿', Q: '𝚀', R: '𝚁', S: '𝚂', T: '𝚃', U: '𝚄', V: '𝚅', W: '𝚆', X: '𝚇', Y: '𝚈', Z: '𝚉',
    a: '𝚊', b: '𝚋', c: '𝚌', d: '𝚍', e: '𝚎', f: '𝚏', g: '𝚐', h: '𝚑', i: '𝚒', j: '𝚓', k: '𝚔', l: '𝚕', m: '𝚖',
    n: '𝚗', o: '𝚘', p: '𝚙', q: '𝚚', r: '𝚛', s: '𝚜', t: '𝚝', u: '𝚞', v: '𝚟', w: '𝚠', x: '𝚡', y: '𝚢', z: '𝚣',
    '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿'
  },
  bubble: {
    A: 'Ⓐ', B: 'Ⓑ', C: 'Ⓒ', D: 'Ⓓ', E: 'Ⓔ', F: 'Ⓕ', G: 'Ⓖ', H: 'Ⓗ', I: 'Ⓘ', J: 'Ⓙ', K: 'Ⓚ', L: 'Ⓛ', M: 'Ⓜ',
    N: 'Ⓝ', O: 'Ⓞ', P: 'Ⓟ', Q: 'Ⓠ', R: 'Ⓡ', S: 'Ⓢ', T: 'Ⓣ', U: 'Ⓤ', V: 'Ⓥ', W: 'Ⓦ', X: 'Ⓧ', Y: 'Ⓨ', Z: 'Ⓩ',
    a: 'ⓐ', b: 'ⓑ', c: 'ⓒ', d: 'ⓓ', e: 'ⓔ', f: 'ⓕ', g: 'ⓖ', h: 'ⓗ', i: 'ⓘ', j: 'ⓙ', k: 'ⓚ', l: 'ⓛ', m: 'ⓜ',
    n: 'ⓝ', o: 'ⓞ', p: 'ⓟ', q: 'ⓠ', r: 'ⓡ', s: 'ⓢ', t: 'ⓣ', u: 'ⓤ', v: 'ⓥ', w: 'ⓦ', x: 'ⓧ', y: 'ⓨ', z: 'ⓩ',
    '0': '⓪', '1': '①', '2': '②', '3': '③', '4': '④', '5': '⑤', '6': '⑥', '7': '⑦', '8': '⑧', '9': '⑨'
  },
  bubbleFilled: {
    A: '🅐', B: '🅑', C: '🅒', D: '🅓', E: '🅔', F: '🅕', G: '🅖', H: '🅗', I: '🅘', J: '🅙', K: '🅚', L: '🅛', M: '🅜',
    N: '🅝', O: '🅞', P: '🅟', Q: '🅠', R: '🅡', S: '🅢', T: '🅣', U: '🅤', V: '🅥', W: '🅦', X: '🅧', Y: '🅨', Z: '🅩',
    a: '🅐', b: '🅑', c: '🅒', d: '🅓', e: '🅔', f: '🅕', g: '🅖', h: '🅗', i: '🅘', j: '🅙', k: '🅚', l: '🅛', m: '🅜',
    n: '🅝', o: '🅞', p: '🅟', q: '🅠', r: '🅡', s: '🅢', t: '🅣', u: '🅤', v: '🅥', w: '🅦', x: '🅧', y: '🅨', z: '🅩',
    '0': '⓿', '1': '❶', '2': '❷', '3': '❸', '4': '❹', '5': '❺', '6': '❻', '7': '❼', '8': '❽', '9': '❾'
  },
  square: {
    A: '🄰', B: '🄱', C: '🄲', D: '🄳', E: '🄴', F: '🄵', G: '🄿', H: '🄷', I: '🄸', J: '🄹', K: '🄺', L: '🄻', M: '🄼',
    N: '🄽', O: '🄾', P: '🄿', Q: '🅀', R: '🅁', S: '🅂', T: '🅃', U: '🅄', V: '🅅', W: '🅆', X: '🅇', Y: '🅈', Z: '🅉',
    a: '🄰', b: '🄱', c: '🄲', d: '🄳', e: '🄴', f: '🄵', g: '🄿', h: '🄷', i: '🄸', j: '🄹', k: '🄺', l: '🄻', m: '🄼',
    n: '🄽', o: '🄾', p: '🄿', q: '🅀', r: '🅁', s: '🅂', t: '🅃', u: '🅄', v: '🅅', w: '🅆', x: '🅇', y: '🅈', z: '🅉'
  },
  squareFilled: {
    A: '🅰', B: '🅱', C: '🅲', D: '🅳', E: '🅴', F: '🅵', G: '🅶', H: '🅷', I: '🅸', J: '🅹', K: '🅺', L: '🅻', M: '🅼',
    N: '🅽', O: '🅾', P: '🅿', Q: '🆀', R: '🆁', S: '🆂', T: '🆃', U: '🆄', V: '🆅', W: '🆆', X: '🆇', Y: '🆈', Z: '🆉',
    a: '🅰', b: '🅱', c: '🅲', d: '🅳', e: '🅴', f: '🅵', g: '🅶', h: '🅷', i: '🅸', j: '🅹', k: '🅺', l: '🅻', m: '🅼',
    n: '🅽', o: '🅾', p: '🅿', q: '🆀', r: '🆁', s: '🆂', t: '🆃', u: '🆄', v: '🆅', w: '🆆', x: '🆇', y: '🆈', z: '🆉'
  },
  wide: {
    A: 'Ａ', B: 'Ｂ', C: 'Ｃ', D: 'Ｄ', E: 'Ｅ', F: 'Ｆ', G: 'Ｇ', H: 'Ｈ', I: 'Ｉ', J: 'Ｊ', K: 'Ｋ', L: 'Ｌ', M: 'Ｍ',
    N: 'Ｎ', O: 'Ｏ', P: 'Ｐ', Q: 'Ｑ', R: 'Ｒ', S: 'Ｓ', T: 'Ｔ', U: 'Ｕ', V: 'Ｖ', W: 'Ｗ', X: 'Ｘ', Y: 'Ｙ', Z: 'Ｚ',
    a: 'ａ', b: 'ｂ', c: 'ｃ', d: 'ｄ', e: 'ｅ', f: 'ｆ', g: 'ｇ', h: 'ｈ', i: 'ｉ', j: 'ｊ', k: 'ｋ', l: 'ｌ', m: 'ｍ',
    n: 'ｎ', o: 'ｏ', p: 'ｐ', q: 'ｑ', r: 'ｒ', s: 'ｓ', t: 'ｔ', u: 'ｕ', v: 'ｖ', w: 'ｗ', x: 'ｘ', y: 'ｙ', z: 'ｚ',
    '0': '０', '1': '１', '2': '２', '3': '３', '4': '４', '5': '５', '6': '６', '7': '７', '8': '８', '9': '９',
    ' ': '　'
  },
  script: {
    A: '𝒜', B: 'ℬ', C: '𝒞', D: '𝒟', E: 'ℰ', F: 'ℱ', G: '𝒢', H: 'ℋ', I: 'ℐ', J: '𝒥', K: '𝒦', L: 'ℒ', M: 'ℳ',
    N: '𝒩', O: '𝒪', P: '𝒫', Q: '𝒬', R: 'ℛ', S: '𝒮', T: '𝒯', U: '𝒰', V: '𝒱', W: '𝒲', X: '𝒳', Y: '𝒴', Z: '𝒵',
    a: '𝒶', b: '𝒷', c: '𝒸', d: '𝒹', e: 'ℯ', f: '𝒻', g: 'ℊ', h: '𝒽', i: '𝒾', j: '𝒿', k: '𝓀', l: '𝓁', m: '𝓂',
    n: '𝓃', o: 'ℴ', p: '𝓅', q: '𝓆', r: '𝓇', s: '𝓈', t: '𝓉', u: '𝓊', v: '𝓋', w: '𝓌', x: '𝓍', y: '𝓎', z: '𝓏'
  },
  doubleStruck: {
    A: '𝔸', B: '𝔹', C: 'ℂ', D: '𝔻', E: '𝔼', F: '𝔽', G: '𝔾', H: 'ℍ', I: '𝕀', J: '𝕁', K: '𝕂', L: '𝕃', M: '𝕄',
    N: 'ℕ', O: '𝕆', P: 'ℙ', Q: 'ℚ', R: 'ℝ', S: '𝕊', T: '𝕋', U: '𝕌', V: '𝕍', W: '𝕎', X: '𝕏', Y: '𝕐', Z: 'ℤ',
    a: '𝕒', b: '𝕓', c: '𝕔', d: '𝕕', e: '𝕖', f: '𝕗', g: '𝕘', h: '𝕙', i: '𝕚', j: '𝕛', k: '𝕜', l: '𝕝', m: '𝕞',
    n: '𝕟', o: '𝕠', p: '𝕡', q: '𝕢', r: '𝕣', s: '𝕤', t: '𝕥', u: '𝕦', v: '𝕧', w: '𝕨', x: '𝕩', y: '𝕪', z: '𝕫',
    '0': '𝟘', '1': '𝟙', '2': '𝟚', '3': '𝟛', '4': '𝟜', '5': '𝟝', '6': '𝟞', '7': '𝟟', '8': '𝟠', '9': '𝟡'
  },
  fraktur: {
    A: '𝔄', B: '𝔅', C: 'ℭ', D: '𝔇', E: '𝔈', F: '𝔉', G: '𝔊', H: 'ℌ', I: 'ℑ', J: '𝔍', K: '𝔎', L: '𝔏', M: '𝔐',
    N: '𝔑', O: '𝔒', P: '𝔓', Q: '𝔔', R: 'ℜ', S: '𝔖', T: '𝔗', U: '𝔘', V: '𝔙', W: '𝔚', X: '𝔛', Y: '𝔜', Z: 'ℨ',
    a: '𝔞', b: '𝔟', c: '𝔠', d: '𝔡', e: '𝔢', f: '𝔣', g: '𝔤', h: '𝔥', i: '𝔦', j: '𝔧', k: '𝔨', l: '𝔩', m: '𝔪',
    n: '𝔫', o: '𝔬', p: '𝔭', q: '𝔮', r: '𝔯', s: '𝔰', t: '𝔱', u: '𝔲', v: '𝔳', w: '𝔴', x: '𝔵', y: '𝔶', z: '𝔷'
  }
};

export function applyLatinStyle(text: string, style: keyof typeof MAPS): string {
  const map = MAPS[style];
  return Array.from(text).map(char => map[char as keyof typeof map] || char).join('');
}

export function applyCombiningStyle(text: string, combiningChar: string): string {
  return Array.from(text).map(char => char === ' ' || char === '\n' ? char : char + combiningChar).join('');
}

export function toFacebookBold(text: string): string {
  const script = detectScript(text);
  if (script === 'Latin') {
    return applyLatinStyle(text, 'bold');
  }
  return '【' + text + '】';
}

export function toFacebookItalic(text: string): string {
  const script = detectScript(text);
  if (script === 'Latin') {
    return applyLatinStyle(text, 'italic');
  }
  return '『' + text + '』';
}

export function toFacebookStrikethrough(text: string): string {
  const script = detectScript(text);
  if (script === 'Latin') {
    return applyCombiningStyle(text, '\u0336');
  }
  return '꧁̶' + text + '̶꧂';
}

export function toFacebookUnderline(text: string): string {
  const script = detectScript(text);
  if (script === 'Latin') {
    return applyCombiningStyle(text, '\u0332');
  }
  return '⸤' + text + '⸥';
}

export function toFacebookMonospace(text: string): string {
  const script = detectScript(text);
  if (script === 'Latin') {
    return applyLatinStyle(text, 'monospace');
  }
  return '❲' + text + '❳';
}

export function toFacebookWide(text: string): string {
  return applyLatinStyle(text, 'wide');
}

export function toFacebookBubble(text: string, filled = false): string {
  const script = detectScript(text);
  if (script === 'Latin') {
    return applyLatinStyle(text, filled ? 'bubbleFilled' : 'bubble');
  }
  return filled ? '⦗' + text + '⦘' : '⟮' + text + '⟯';
}

export function toFacebookSquare(text: string, filled = false): string {
  const script = detectScript(text);
  if (script === 'Latin') {
    return applyLatinStyle(text, filled ? 'squareFilled' : 'square');
  }
  return filled ? '⁅' + text + '⁆' : '⟬' + text + '⟭';
}

export function toFacebookScript(text: string): string {
  const script = detectScript(text);
  if (script === 'Latin') {
    return applyLatinStyle(text, 'script');
  }
  return '✨' + text + '✨';
}

export function toFacebookDoubleStruck(text: string): string {
  const script = detectScript(text);
  if (script === 'Latin') {
    return applyLatinStyle(text, 'doubleStruck');
  }
  return '『' + text + '』';
}

export function toFacebookFraktur(text: string): string {
  const script = detectScript(text);
  if (script === 'Latin') {
    return applyLatinStyle(text, 'fraktur');
  }
  return '⸔' + text + '⸕';
}

export function toFacebookFancy1(text: string): string {
  return '【' + text + '】';
}

export function toFacebookFancy2(text: string): string {
  return '『' + text + '』';
}

export function toFacebookFancy3(text: string): string {
  return '꧁' + text + '꧂';
}

export function toFacebookFancy4(text: string): string {
  return '★彡 ' + text + ' 彡★';
}

export function toFacebookFancy5(text: string): string {
  return '░' + text + '░';
}

export function toFacebookFancy6(text: string): string {
  return '⟪' + text + '⟫';
}

export function toFacebookFancy7(text: string): string {
  return '⸔' + text + '⸕';
}

export function toFacebookFancy8(text: string): string {
  return '⁅' + text + '⁆';
}

export function toFacebookFancy9(text: string): string {
  return '⦗' + text + '⦘';
}

export function toFacebookFancy10(text: string): string {
  return '⟬' + text + '⟭';
}

export function normalizeText(text: string): string {
  // 1. Remove all common combining characters (strikethrough, underline, accents, enclosing, etc.)
  let result = text.replace(/[\u0300-\u036f\u0483-\u0489\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f\u034f\u20dd\u20de]/g, '');
  
  // 2. Remove decorative brackets and symbols used for non-Latin fallbacks
  result = result.replace(/[⟮⟯⟬⟭【】『』꧁꧂░⟪⟫⸔⸕⁅⁆⦗⦘❲❳⸤⸥★彡░꧁꧂✨̶]/g, '');
  
  // 3. Map Mathematical Alphanumeric Symbols and other styled Unicodes back to normal
  const reverseMap: { [key: string]: string } = {};
  
  Object.values(MAPS).forEach(map => {
    Object.entries(map).forEach(([normal, styled]) => {
      reverseMap[styled] = normal;
    });
  });

  // Iterate over code points correctly using Array.from
  return Array.from(result).map(char => reverseMap[char] || char).join('');
}

export function clearFormatting(text: string): string {
  return normalizeText(text);
}
