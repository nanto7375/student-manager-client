const mapKoreanToEnglish: { [key: string]: string } = {
  ㄱ: 'r',
  ㄲ: 'R',
  ㄴ: 's',
  ㄷ: 'e',
  ㄸ: 'E',
  ㄹ: 'f',
  ㅁ: 'a',
  ㅂ: 'q',
  ㅃ: 'Q',
  ㅅ: 't',
  ㅆ: 'T',
  ㅇ: 'd',
  ㅈ: 'w',
  ㅉ: 'W',
  ㅊ: 'c',
  ㅋ: 'z',
  ㅌ: 'x',
  ㅍ: 'v',
  ㅎ: 'g',
  ㅏ: 'k',
  ㅑ: 'i',
  ㅓ: 'j',
  ㅕ: 'u',
  ㅗ: 'h',
  ㅛ: 'y',
  ㅜ: 'n',
  ㅠ: 'b',
  ㅡ: 'm',
  ㅣ: 'l',
  ㅐ: 'o',
  ㅒ: 'O',
  ㅔ: 'p',
  ㅖ: 'P',
};

export const removeSpace = (value: string) => value.replace(/\s/g, '');
export const convertKoreanToEnglish = (value: string) => {
  return value
    .split('')
    .map((char) => mapKoreanToEnglish[char] || char)
    .join('');
};
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
