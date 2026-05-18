import React from "react"
import { Button } from "@mui/material"

import { FlexBox, FlexContainer } from "~/components/styled-elements"
import { NoteEditBox } from "./note-edit-box"
import { NoteContentBox } from "./note-content-box"
import type { Note, NoteType } from "../student-detail"
import { useConfirmModal } from "~/hooks/use-confirm-modal"

const initNote = () => ({ id: -1, value: '', type: 'note' as NoteType })

type RecordNoteListProps = {
  notes: Note[];
  deleteNote: (noteId: number) => void;
  createNote: (note: { value: string, type: NoteType }) => Promise<Note>;
  updateNote: (note: { id: number, value: string }) => Promise<void>;
  selectedTab: 'assessment' | 'parent-counseling';
  disabled?: boolean;
}
export const RecordNoteList = ({ notes, deleteNote, createNote, updateNote, selectedTab, disabled }: RecordNoteListProps) => {
  const noteListRef = React.useRef<HTMLDivElement>(null);

  const recordNotes = React.useMemo(() => {
      return notes.filter(note => note.type === selectedTab);
    }, [notes, selectedTab]);

  const [isAdding, setIsAdding] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const [recordingNote, setRecordingNote] = React.useState<{ id: number, value: string }>(initNote());
  
    const {ConfirmModal: DeleteModal, openConfirmModal: openDeleteModal, closeConfirmModal: closeDeleteModal} = useConfirmModal();
    const {ConfirmModal: CancelModal, openConfirmModal: openCancelModal, closeConfirmModal: closeCancelModal} = useConfirmModal();

  const handleAddClick = React.useCallback(() => {
    setIsAdding(true);
  }, []);

  const handleEditClick = React.useCallback((note: Note) => {
    setRecordingNote({ id: note.id, value: note.value });
    setEditingId(note.id);
  }, []); 

  const handleEditCancel = React.useCallback(() => {
    setIsAdding(false);
    setEditingId(null);
    setRecordingNote(initNote());
    closeCancelModal();
  }, []);

  const handleSaveClick = async () => {
    const isNew = recordingNote.id === -1;

    if (isNew) {
      const note = await createNote({ value: recordingNote.value, type: selectedTab as NoteType });
      setRecordingNote(prev => ({ ...prev, id: note.id }));
    } else {
      const currentNote = recordNotes.find(a => a.id === recordingNote.id);
      const changed = currentNote?.value !== recordingNote.value;
      changed && await updateNote({ id: recordingNote.id, value: recordingNote.value });
    }

    setIsAdding(false);
    setEditingId(null);
    setRecordingNote(initNote());

    setTimeout(() => {
      if (!isNew) return;
      if (noteListRef.current) {
        noteListRef.current.scrollTo({
          top: noteListRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  }

  const handleDeleteButtonClick = React.useCallback(async (noteId: number) => {
      setDeletingId(noteId)
      openDeleteModal()
    }, [])

  const handleDeleteAssessment = React.useCallback(async () => {
    deleteNote(deletingId);
    setDeletingId(null);
    closeDeleteModal();
  }, [deletingId])

  
  const handleCancelButtonClick = React.useCallback(() => {
    openCancelModal();
  }, [])

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRecordingNote(prev => ({ ...prev, value: e.target.value }));
    // 자동으로 높이 조절
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };
  

  return (
    <FlexContainer width="100%" fullHeight sx={{flexDirection: 'column', overflow: 'hidden'}}>
      {/* 기록 추가 영역 (상단 고정) */}
      {isAdding ? (
        <NoteEditBox
          value={recordingNote.value}
          onChange={handleTextareaChange}
          onSave={handleSaveClick}
          onCancel={handleCancelButtonClick}
          placeholder="기록을 입력하세요"
          isInline={false}
        />
      ) : (
        <AddNoteButton onClick={handleAddClick} disabled={!!editingId || disabled} />
      )}

      {/* 평가 목록 */}
      <FlexBox ref={noteListRef} flexDirection='column' alignItems='flex-start' sx={{overflow: 'auto', mt: 1.5, '&::-webkit-scrollbar': { width: '0.375rem' }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#ccc', borderRadius: '0.1875rem' }}} gap={1}>
        {recordNotes.map((note) => (
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
              disabled={disabled}
            />
          )
        ))}
      </FlexBox>

      <DeleteModal onConfirm={handleDeleteAssessment} bodyText='삭제하시겠습니까?' />
      <CancelModal onConfirm={handleEditCancel} bodyText='취소하시겠습니까?' />
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
        padding: '0.8rem',
        borderRadius: '0.5rem',
        border: '1px solid #ddd',
        color: '#666',
        boxShadow: '0 3px 6px rgba(0,0,0,0.08)',
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
