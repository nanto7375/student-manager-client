import { Button } from "@mui/material";
import { FlexBox } from "~/components/styled-elements";

type Props = {
  onNavigateDetail: () => void;
  onAddMakeup: () => void;
  onAddFixedMemo: () => void;
  onAddTempMemo: () => void;
};

export const StudentActionPopup = ({ onNavigateDetail, onAddMakeup, onAddFixedMemo, onAddTempMemo }: Props) => (
  <FlexBox flexDirection="column" sx={{
    position: 'absolute', top: 'calc(100% + 0.5rem)', left: '50%', transform: 'translateX(-50%)',
    zIndex: 1000, backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '0.5rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', padding: '0.25rem', whiteSpace: 'nowrap',
    '&::before': { content: '""', position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)', borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '6px solid #e0e0e0' },
    '&::after': { content: '""', position: 'absolute', top: '-5px', left: '50%', transform: 'translateX(-50%)', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '5px solid white' },
  }}>
    <Button size="small" sx={{ color: 'black' }} onClick={onNavigateDetail}>상세로 이동</Button>
    <Button size="small" sx={{ color: 'black' }} onClick={onAddMakeup}>보강 추가</Button>
    <Button size="small" sx={{ color: 'black' }} onClick={onAddFixedMemo}>고정 메모 추가</Button>
    <Button size="small" sx={{ color: 'black' }} onClick={onAddTempMemo}>변동 메모 추가</Button>
  </FlexBox>
);
