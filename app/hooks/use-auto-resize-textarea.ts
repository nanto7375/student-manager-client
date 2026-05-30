import React from "react";

/** textarea 높이를 내용에 맞게 자동 조절하는 훅 */
export const useAutoResizeTextarea = (value: string) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  return textareaRef;
};
