import React from "react";
import { Checkbox, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import type { Note, NoteType } from "../student-detail";
import { FlexBox, FlexContainer } from "~/components/styled-elements";
import { AppleTg } from "~/components/typography";

type MemoNoteListProps = {
  notes: Note[];
  createNote: (params: { value: string; type: string }) => Promise<Note>;
  deleteNote: (noteId: number) => Promise<void>;
  disabled?: boolean;
};

export const MemoNoteList = ({ notes, createNote, deleteNote, disabled }: MemoNoteListProps) => {
  const fixedMemoNotes = notes.filter(note => note.type === 'fixed-memo');
  const temporaryMemoNotes = notes.filter(note => note.type === 'temporary-memo');

  return (
    <FlexContainer fullHeight fullWidth gap={1.5} flexDirection="column">
      <MemoContainer title="고정 메모" notes={fixedMemoNotes} type="fixed-memo" createNote={createNote} disabled={disabled} />
      <MemoContainer title="변동 메모" notes={temporaryMemoNotes} type="temporary-memo" createNote={createNote} disabled={disabled} />
    </FlexContainer>
  );
};

const MemoContainer = ({ title, notes, type, createNote, disabled }: { title: string; notes: Note[]; type: NoteType; createNote: (params: { value: string; type: string }) => Promise<Note>; disabled?: boolean }) => {
  const [checked, setChecked] = React.useState<Set<number>>(new Set());
  const [adding, setAdding] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  const toggleCheck = (id: number) => {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAdd = async () => {
    if (!inputValue.trim()) return;
    await createNote({ value: inputValue.trim(), type });
    setInputValue('');
    setAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') { setAdding(false); setInputValue(''); }
  };

  return (
    <FlexBox
      flexDirection="column"
      height="50%"
      fullWidth
      sx={{ borderRadius: '0.5rem', border: '1px solid #ddd', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden', flex: 1, minHeight: 0 }}
    >
      <FlexBox padding="0.5rem 1rem" sx={{ borderBottom: '1px solid #eee' }}>
        <AppleTg sx={{ fontWeight: 500, color: '#555' }}>{title}</AppleTg>
      </FlexBox>
      <FlexBox flexDirection="column" sx={{ overflowY: 'auto', flex: 1, py: 0.5, '&::-webkit-scrollbar': { width: '0.375rem' }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#ccc', borderRadius: '0.1875rem' } }}>
        {notes.map(note => (
          <FlexBox
            key={note.id}
            alignItems="center"
            padding="0.25rem 0.5rem"
            sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}
          >
            <Checkbox
              size="small"
              checked={checked.has(note.id)}
              onChange={() => toggleCheck(note.id)}
              disabled={disabled}
            />
            <AppleTg sx={{ textDecoration: checked.has(note.id) ? 'line-through' : 'none', color: checked.has(note.id) ? '#aaa' : 'inherit' }}>
              {note.value}
            </AppleTg>
          </FlexBox>
        ))}
      </FlexBox>
      {!disabled && (
      <FlexBox alignItems="center" padding="0.25rem 0.5rem" sx={{ borderTop: '1px solid #eee' }}>
        {adding ? (
          <input
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleAdd}
            placeholder="메모 입력"
            style={{ flex: 1, padding: '0.4rem', border: 'none', outline: 'none', fontSize: '0.875rem' }}
          />
        ) : (
          <IconButton size="small" onClick={() => setAdding(true)}>
            <AddIcon fontSize="small" />
          </IconButton>
        )}
      </FlexBox>
      )}
    </FlexBox>
  );
};
