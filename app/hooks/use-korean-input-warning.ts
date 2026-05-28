import React from "react";

const KOREAN_REGEX = /[ㄱ-ㅎㅏ-ㅣ가-힣]/;

/**
 * 비밀번호 등 영문 전용 입력에서 한글 입력 시 경고를 표시하는 훅.
 * 한글이 감지되면 값을 업데이트하지 않고 경고만 표시.
 */
export const useKoreanInputWarning = () => {
  const [koreanWarning, setKoreanWarning] = React.useState(false);

  const handleChange = (value: string, setter: (v: string) => void) => {
    const trimmed = value.replace(/\s/g, '');
    if (KOREAN_REGEX.test(trimmed)) {
      setKoreanWarning(true);
      return;
    }
    setKoreanWarning(false);
    setter(trimmed);
  };

  return { koreanWarning, handleChange };
};
