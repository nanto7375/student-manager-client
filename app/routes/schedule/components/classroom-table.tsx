import React from "react";
import { TableContainer, Table, TableBody, TableRow, TableCell } from "@mui/material";
import { FlexBox } from "~/components/styled-elements";
import { AppleTg } from "~/components/typography";
import { StudentActionPopup } from "~/components/student-action-popup";
import { auth } from "~/lib/auth";
import { TABLE_STYLE } from "~/constants/styles";
import { useClassroomDrop, createDragStartHandler } from "~/hooks/use-classroom-drop";

import type { ActivityCheck, ActivityRecordType } from "../activity-records.type";
import { ActivityKey, nextStatus, nextMonthlyStatus, ACTIVITY_BUTTON_TEXT, MONTHLY_BUTTON_TEXT } from "../activity-records.type";
import { ActivityRecordButton } from "./activity-record-button";
import { BookRentalPopover } from "./book-rental-popover";
import type { Classroom } from "~/constants/student.type";

export type ClassroomTableProps = {
  classroom: Classroom;
  records: ActivityRecordType[];
  fixedMemosMap: Record<number, string>;
  tempMemosMap: Record<number, string>;
  activePopup: number | null;
  setActivePopup: (id: number | null) => void;
  setMemoInput: (v: string) => void;
  navigate: (path: string) => void;
  setMakeupTarget: (target: { studentId: number } | null) => void;
  setMemoTargetStudentId: (id: number | null) => void;
  setMemoType: (type: 'fixed-memo' | 'temporary-memo') => void;
  handleWeeklyActivityRecordButtonClick: (params: { activityId: number; activityKey: keyof ActivityCheck; value: string }) => void;
  handleBookRentalButtonClick: (record: ActivityRecordType, bookTitle?: string) => void;
  handleBookReturnButtonClick: (record: ActivityRecordType, bookRentalId: number) => void;
  handleClassroomDrop: (studentId: number, classroomId: number) => void;
  showNotes?: boolean;
  showNotesBelow?: boolean;
  fullWidth?: boolean;
  hideHeader?: boolean;
};

const isBorrowedToday = (borrowedAt: Date) => {
  const today = new Date();
  const d = new Date(borrowedAt);
  return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
};

const getBookButtonLabel = (books: ActivityRecordType['borrowedBooks']) => {
  if (books.length === 0) return '책 대여';
  const hasToday = books.some(b => isBorrowedToday(b.borrowedAt));
  return hasToday ? <>● 대여 {books.length}권</> : `대여 ${books.length}권`;
};

const monthlyStatusToButtonStatus = (status: string) => {
  if (status === 'completed') return 'completed' as const;
  if (status === 'failed' || status === 'none') return 'failed' as const;
  return 'pending' as const;
};

export const ClassroomTable = ({ classroom, records, fixedMemosMap, tempMemosMap, activePopup, setActivePopup, setMemoInput, navigate, setMakeupTarget, setMemoTargetStudentId, setMemoType, handleWeeklyActivityRecordButtonClick, handleBookRentalButtonClick, handleBookReturnButtonClick, handleClassroomDrop, showNotes = false, showNotesBelow = false, fullWidth = false, hideHeader = false }: ClassroomTableProps) => {
  const { dragOver, dropHandlers } = useClassroomDrop(classroom.id, handleClassroomDrop);
  const [bookInputTarget, setBookInputTarget] = React.useState<number | null>(null);

  const openStudentPopup = (e: React.MouseEvent, recordId: number) => {
    e.stopPropagation();
    setActivePopup(activePopup === recordId ? null : recordId);
    setBookInputTarget(null);
    setMemoInput('');
  };

  const openBookPopover = (e: React.MouseEvent, recordId: number) => {
    e.stopPropagation();
    setBookInputTarget(bookInputTarget === recordId ? null : recordId);
    setActivePopup(null);
  };

  return (
    <FlexBox
      flexDirection="column"
      gap={0.5}
      sx={{ width: fullWidth ? '100%' : 'auto', outline: dragOver ? '2px dashed #036635' : 'none', borderRadius: '0.5rem', transition: 'outline 0.15s' }}
      onClick={() => setBookInputTarget(null)}
      {...dropHandlers}
    >
      {/* 교실 헤더 + 고정 메모 */}
      {!hideHeader && (
        <FlexBox alignItems="center" gap={1.5}>
          <AppleTg sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#333', pl: 0.5, whiteSpace: 'nowrap', flexShrink: 0 }}>{classroom.name}</AppleTg>
          {records.some(r => fixedMemosMap[r.student.id]) && (
            <FlexBox gap={0.5} sx={{ flexWrap: 'wrap' }}>
              {records.filter((r, i, arr) => fixedMemosMap[r.student.id] && arr.findIndex(a => a.student.id === r.student.id) === i).map(r => (
                <AppleTg key={r.id} sx={{ fontSize: '0.75rem', color: '#555', border: '1px solid #ddd', borderRadius: '1rem', padding: '0.2rem 0.6rem' }}>
                  <strong>{r.student.name}</strong> {fixedMemosMap[r.student.id]}
                </AppleTg>
              ))}
            </FlexBox>
          )}
        </FlexBox>
      )}

      {/* 활동 기록 테이블 */}
      <TableContainer className='non-overflow-scroll' sx={{
        border: '1px solid #e0e0e0',
        borderRadius: hideHeader ? '0.5rem 0 0 0.5rem' : showNotesBelow ? '0.5rem 0.5rem 0 0' : '0.5rem',
        overflow: 'visible',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        width: fullWidth ? '100%' : 'fit-content',
        minHeight: '3.5rem',
      }}>
        <Table sx={{ ...TABLE_STYLE, borderCollapse: 'collapse', '& td': { px: 0, py: 0, height: '3.5rem', borderTop: '1px solid #e0e0e0', borderLeft: '1px dashed #e0e0e0' }, '& td:first-of-type': { borderLeft: 'none' }, '& tbody tr:first-of-type td': { borderTop: 'none' }, ...(!fullWidth && { width: 'auto' }) }}>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                {/* 드래그 핸들 */}
                <TableCell align="center" sx={{ width: '2%', px: 0, py: 0, borderRight: 'none !important' }}>
                  <span draggable onDragStart={createDragStartHandler(record.student.id, classroom.id)} className="drag-handle">⠿</span>
                </TableCell>

                {/* 학생 이름 */}
                <TableCell align="center" sx={{ width: '10%', borderLeft: 'none !important' }}>
                  <FlexBox sx={{ position: 'relative', justifyContent: 'center' }}>
                    <AppleTg component="div" sx={{ fontSize: '0.9rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '2lh' }} onClick={(e: React.MouseEvent) => openStudentPopup(e, record.id)}>
                      <div style={{ fontWeight: 600 }}>
                        {record.student.name}
                        {record.isMakeup && <span style={{ color: '#e65100' }}> (보강)</span>}
                      </div>
                      {(record.student.schoolName || record.student.schoolGrade) && (
                        <div style={{ fontSize: '0.75rem', color: '#999' }}>
                          ({record.student.schoolName ? `${record.student.schoolName.replace('초등학교', '초').replace('중학교', '중').replace('고등학교', '고')} ` : ''}{record.student.schoolGrade}학년)
                        </div>
                      )}
                    </AppleTg>
                    {activePopup === record.id && (
                      <StudentActionPopup
                        myLevel={auth.getMyInfo()?.level ?? 0}
                        onNavigateDetail={() => { navigate(`/student/${record.student.id}`); setActivePopup(null); }}
                        onAddMakeup={() => { setMakeupTarget({ studentId: record.student.id }); setActivePopup(null); }}
                        onAddFixedMemo={() => { setMemoTargetStudentId(record.student.id); setMemoType('fixed-memo'); setActivePopup(null); }}
                        onAddTempMemo={() => { setMemoTargetStudentId(record.student.id); setMemoType('temporary-memo'); setActivePopup(null); }}
                      />
                    )}
                  </FlexBox>
                </TableCell>

                {/* 출석 */}
                <TableCell align="center" sx={{ width: '12%' }}>
                  <ActivityRecordButton
                    status={record.attendance}
                    label={`${ACTIVITY_BUTTON_TEXT.attendance[record.attendance]}${record.isMakeup && record.attendance === 'pending' ? ' (보강)' : ''}`}
                    onClick={() => handleWeeklyActivityRecordButtonClick({ activityId: record.id, activityKey: ActivityKey.ATTENDANCE, value: nextStatus(record.attendance) })}
                  />
                </TableCell>

                {/* 주간 레오 */}
                <TableCell align="center" sx={{ width: '12%' }}>
                  <ActivityRecordButton
                    status={record.report2}
                    label={ACTIVITY_BUTTON_TEXT.report2[record.report2]}
                    onClick={() => handleWeeklyActivityRecordButtonClick({ activityId: record.id, activityKey: ActivityKey.REPORT2, value: nextStatus(record.report2) })}
                  />
                </TableCell>

                {/* 감상문 */}
                <TableCell align="center" sx={{ width: '12%' }}>
                  <ActivityRecordButton
                    status={record.report1}
                    label={ACTIVITY_BUTTON_TEXT.report1[record.report1]}
                    onClick={() => handleWeeklyActivityRecordButtonClick({ activityId: record.id, activityKey: ActivityKey.REPORT1, value: nextStatus(record.report1) })}
                  />
                </TableCell>

                {/* 책 대여 */}
                <TableCell align="center" sx={{ width: '12%', position: 'relative' }}>
                  <ActivityRecordButton
                    status={record.borrowedBooks.length > 0 ? 'completed' : 'pending'}
                    label={getBookButtonLabel(record.borrowedBooks)}
                    onClick={(e) => openBookPopover(e, record.id)}
                  />
                  {bookInputTarget === record.id && (
                    <BookRentalPopover
                      record={record}
                      onBorrow={handleBookRentalButtonClick}
                      onReturn={handleBookReturnButtonClick}
                      onClose={() => setBookInputTarget(null)}
                    />
                  )}
                </TableCell>

                {/* 월간 레오 */}
                <TableCell align="center" sx={{ width: '12%' }}>
                  <ActivityRecordButton
                    status={monthlyStatusToButtonStatus(record.monthlyProject)}
                    label={MONTHLY_BUTTON_TEXT[record.monthlyProject]}
                    activeEffect
                    onClick={() => handleWeeklyActivityRecordButtonClick({ activityId: record.id, activityKey: ActivityKey.MONTHLY_PROJECT, value: nextMonthlyStatus(record.monthlyProject) })}
                  />
                </TableCell>

                {/* 변동 메모 */}
                {showNotes && record === records[0] && (
                  <TableCell rowSpan={records.length} sx={{ width: '20%', verticalAlign: 'top', borderLeft: '1px dashed #e0e0e0 !important', padding: '1.2rem 0.75rem !important' }}>
                    {records.filter(r => tempMemosMap[r.student.id]).map((r, i) => (
                      <FlexBox key={r.student.id} sx={{ color: '#666', mt: i > 0 ? 1.5 : 0 }}>
                        <AppleTg sx={{ whiteSpace: 'nowrap', flexShrink: 0, fontSize: '0.8rem' }}>· {r.student.name}:</AppleTg>
                        <AppleTg sx={{ ml: 0.5, fontSize: '0.8rem' }}>{tempMemosMap[r.student.id]}</AppleTg>
                      </FlexBox>
                    ))}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 하단 메모 */}
      {showNotesBelow && (
        <FlexBox sx={{ border: '1px solid #e0e0e0', borderTop: 'none', borderRadius: '0 0 0.5rem 0.5rem', padding: '0.75rem 1rem', minHeight: '2.5rem', mt: '-0.5rem' }}>
          <AppleTg sx={{ fontSize: '0.75rem', color: '#666', whiteSpace: 'pre-line' }}>
            {records.filter(r => tempMemosMap[r.student.id]).map(r => `${r.student.name}: ${tempMemosMap[r.student.id]}`).join('\n')}
          </AppleTg>
        </FlexBox>
      )}
    </FlexBox>
  );
};
