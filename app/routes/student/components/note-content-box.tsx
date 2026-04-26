import { FlexBox } from "~/components/styled-elements";
import { Button } from "@mui/material";

export const NoteContentBox = ({ note, isAdding, editingId, handleEditClick, handleDeleteButtonClick }) => {
  return (
    <FlexBox 
      width="100%"
      padding="2rem"
      flexDirection="column"
      sx={{ border: '1px solid #ddd', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
    >
      <FlexBox alignItems="flex-start" justifyContent="space-between" height="3rem">
        <div style={{ fontSize: '0.875rem', color: '#999' }}>
          <div>작성일: {new Date(note.createdAt).toLocaleString('ko-KR')}</div>
          <div>수정일: {new Date(note.updatedAt).toLocaleString('ko-KR')}&nbsp;({note.lastCommenter.name})
          </div>
        </div>
        {!(isAdding || editingId) && (
          <FlexBox gap={1}>
            <NoteBoxFooterButton title="편집" onClick={() => handleEditClick(note)} />
            <NoteBoxFooterButton title="삭제" onClick={() => handleDeleteButtonClick(note.id)} />
          </FlexBox>
        )}
      </FlexBox>
      
      <FlexBox className="draggable" style={{padding: '0.5rem 0'}}>
        {note.value}
      </FlexBox>
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
