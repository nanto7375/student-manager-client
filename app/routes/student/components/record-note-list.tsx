import { Tab, Tabs, Button } from "@mui/material"
import { FlexBox, FlexContainer } from "~/components/styled-elements"
import { NoteEditBox } from "./note-edit-box"
import { NoteContentBox } from "./note-content-box"

export const RecordNoteList = ({ selectedTab, setSelectedTab, isAdding, editingId, recordingNote, handleTextareaChange, handleSaveClick, handleCancelButtonClick, handleAddClick, handleEditClick, handleDeleteButtonClick, notes }) => {
  return (
    <FlexContainer width="70%" sx={{flexDirection: 'column', flex: 1, overflow: 'hidden'}}>
      <Tabs
        value={selectedTab}
        onChange={(_, newValue) => setSelectedTab(newValue)}
        sx={{
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Tab label="학생 기록" value="assessment" sx={{ fontSize: '1rem' }} />
        <Tab label="상담 기록" value="parent-counseling" sx={{ fontSize: '1rem' }} />
      </Tabs>

      {/* 평가 목록 */}
      <FlexBox flexDirection='column' alignItems='flex-start' sx={{flex: 1, overflow: 'auto', paddingTop: '1rem'}} gap={1}>

        {/* 기록 추가 영역 */}
        <FlexBox flexDirection='column' width="100%" gap={1} sx={{overflow: 'auto', flex: 1, paddingBottom: '1rem'}}>
          {(isAdding ? (
            <FlexBox width="100%" sx={{ flexDirection: 'column', gap: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}>
              <NoteEditBox
                value={recordingNote.value}
                onChange={handleTextareaChange}
                onSave={handleSaveClick}
                onCancel={handleCancelButtonClick}
                placeholder="기록을 입력하세요"
                isInline={false}
              />
            </FlexBox>
          ) : (
            <AddNoteButton onClick={handleAddClick} disabled={!!editingId} />
          ))}
          {notes.map((note) => (
            editingId === note.id ? (
              <NoteEditBox
              key={note.id}
                value={recordingNote.value}
                onChange={handleTextareaChange}
                onSave={handleSaveClick}
                onCancel={handleCancelButtonClick}
                isInline={true}
              />
            ) : (
              <NoteContentBox
                key={note.id}
                note={note}
                isAdding={isAdding}
                editingId={editingId}
                handleEditClick={handleEditClick}
                handleDeleteButtonClick={handleDeleteButtonClick}
              />
            )
          ))}
        </FlexBox>
      </FlexBox>
    </FlexContainer>
  )
}

type AddNoteButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};
export const AddNoteButton = ({ onClick, disabled = false }: AddNoteButtonProps) => {
  return (
    <Button
      variant="outlined"
      onClick={onClick}
      disabled={disabled}
      sx={{
        width: '100%',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #ddd',
        color: '#666',
        '&:hover': {
          border: '1px solid #999',
          backgroundColor: 'action.hover',
        },
        '&.Mui-disabled': {
          border: '1px solid #e0e0e0',
          color: '#bbb',
          cursor: 'not-allowed',
        }
      }}
    >
      + 기록 추가
    </Button>
  );
};
