import React from "react";
import { FlexBox } from "~/components/styled-elements";
import { AppleTg } from "~/components/typography";
import type { ActivityRecordType } from "../activity-records.type";

type BookRentalPopoverProps = {
  record: ActivityRecordType;
  onBorrow: (record: ActivityRecordType, bookTitle: string) => void;
  onReturn: (record: ActivityRecordType, bookRentalId: number) => void;
  onClose: () => void;
};

const formatDate = (date: Date) => `${new Date(date).getMonth() + 1}/${new Date(date).getDate()}`;

export const BookRentalPopover = ({ record, onBorrow, onReturn, onClose }: BookRentalPopoverProps) => {
  const [input, setInput] = React.useState('');

  const handleSubmit = () => {
    if (!input.trim()) return;
    onBorrow(record, input.trim());
    onClose();
  };

  return (
    <FlexBox
      flexDirection="column"
      gap={0.5}
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
      sx={{ position: 'absolute', top: '100%', right: 0, zIndex: 20, backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', padding: '0.5rem', width: '14rem' }}
    >
      {record.borrowedBooks.map(book => (
        <FlexBox key={book.id} alignItems="center" justifyContent="space-between" sx={{ py: 0.25 }}>
          <AppleTg sx={{ fontSize: '0.7rem', color: '#999', flexShrink: 0 }}>{formatDate(book.borrowedAt)}</AppleTg>
          <AppleTg sx={{ fontSize: '0.75rem', color: '#444', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ml: 0.5 }}>{book.bookTitle}</AppleTg>
          <AppleTg sx={{ fontSize: '0.7rem', color: '#e57373', cursor: 'pointer', flexShrink: 0, ml: 0.5 }} onClick={() => onReturn(record, book.id)}>반납</AppleTg>
        </FlexBox>
      ))}
      <FlexBox gap={0.5}>
        <input
          autoFocus
          placeholder="책 이름"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
            if (e.key === 'Escape') onClose();
          }}
          style={{ flex: 1, padding: '0.3rem 0.5rem', border: '1px solid #ddd', borderRadius: '0.25rem', fontSize: '0.8rem', outline: 'none' }}
        />
        <AppleTg
          sx={{ fontSize: '0.75rem', color: input.trim() ? '#036635' : '#ccc', cursor: input.trim() ? 'pointer' : 'default', fontWeight: 600, flexShrink: 0, alignSelf: 'center' }}
          onClick={handleSubmit}
        >확인</AppleTg>
      </FlexBox>
    </FlexBox>
  );
};
