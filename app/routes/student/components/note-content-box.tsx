import { FlexBox } from "~/components/styled-elements";
import { Button } from "@mui/material";

export const NoteContentBox = ({ note, isAdding, editingId, handleEditClick, handleDeleteButtonClick }) => {
  return (
    <FlexBox 
      width="100%"
      padding="1rem"
      flexDirection="column"
      gap={0.5}
      sx={{ border: '1px solid #ddd', borderRadius: '0.5rem' }}
    >
      <FlexBox alignItems="flex-start" justifyContent="space-between" height="3rem">
        <div style={{ fontSize: '0.875rem', color: '#999' }}>
          <div>작성일: {new Date(note.createdAt).toLocaleString('ko-KR')}</div>
          <div>수정일: {new Date(note.updatedAt).toLocaleString('ko-KR')}&nbsp;({note.lastCommenter.name})
          </div>
        </div>
        {!(isAdding || editingId) && (
          <div>
            <NoteBoxFooterButton title="편집" onClick={() => handleEditClick(note)} />
            <NoteBoxFooterButton title="삭제" onClick={() => handleDeleteButtonClick(note.id)} />
          </div>
        )}
      </FlexBox>
      <FlexBox className="draggable">{note.value}</FlexBox>
    </FlexBox>
  );
}


type NoteBoxFooterButtonProps = {
  title: string;
  onClick: () => void;
};
export const NoteBoxFooterButton = ({ title, onClick }: NoteBoxFooterButtonProps) => {
  return (
    <Button
      size="small"
      variant="text"
      onClick={onClick}
      sx={{
        fontSize: '0.75rem',
        color: '#666',
        padding: '0.25rem 0.5rem',
        minWidth: 'auto',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        }
      }}
    >
      {title}
    </Button>
  );
};
