import React from "react";
import { Button } from "@mui/material";
import { FlexBox } from "~/components/styled-elements";
import { useAutoResizeTextarea } from "~/hooks/use-auto-resize-textarea";

type NoteEditBoxProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSave: () => void;
  onCancel: () => void;
  placeholder?: string;
  isInline?: boolean;
};

export const NoteEditBox = ({
  value,
  onChange,
  onSave,
  onCancel,
  placeholder,
  isInline = false
}: NoteEditBoxProps) => {
  const textareaRef = useAutoResizeTextarea(value);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (textareaRef.current) {
      const length = textareaRef.current.value.length;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(length, length);
    }

    // 박스가 화면에 완전히 보이도록 스크롤
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, []);

  return (
    <FlexBox
      width="100%"
      padding="1rem"
      flexDirection="column"
      gap={0.5}
      sx={{ border: '1px solid #ddd', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
      ref={containerRef}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="auto-resize-textarea"
        style={{ padding: isInline ? '0' : '1rem' }}
      />
      <FlexBox alignItems='flex-end' justifyContent='flex-end' sx={{ gap: '1rem', height: '3rem' }}>
        <Button variant="contained" onClick={onSave} sx={{ width: '3rem', height: '2.5rem' }}>
          저장
        </Button>
        <Button variant="outlined" onClick={onCancel} sx={{ width: '3rem', height: '2.5rem' }}>
          취소
        </Button>
      </FlexBox>
    </FlexBox>
  );
};
