import React from "react";
import type { Note } from "../student-detail";
import { FlexBox, FlexContainer } from "~/components/styled-elements";

type MemoNoteListProps = {
   notes: Note[];
}
export const MemoNoteList = ({ notes }: MemoNoteListProps) => {
  const [fixedMemoNotes, temporaryMemoNotes] = React.useMemo(() => {
    const fixed = notes.filter(note => note.type === 'fixed-memo');
    const temporary = notes.filter(note => note.type === 'temporary-memo');
    return [fixed, temporary];
  }, [notes]);

  return (
    <FlexContainer fullHeight fullWidth gap={1} padding="1rem" flexDirection="column" style={{paddingBottom: '3rem'}}>
      <MemoContainer>고정 메모</MemoContainer>
      <MemoContainer>변동 메모</MemoContainer>
    </FlexContainer>
  )
}

const MemoContainer = ({children}: {children: React.ReactNode}) => {
  return <FlexBox height="50%" style={{borderRadius: '8px', border: '1px solid #ddd', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>{children}</FlexBox>
}