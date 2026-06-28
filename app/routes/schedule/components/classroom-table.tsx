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

export const ClassroomTable = ({ classroom, records, fixedMemosMap, tempMemosMap, activePopup, setActivePopup, setMemoInput, navigate, setMakeupTarget, setMemoTargetStudentId, setMemoType, handleWeeklyActivityRecordButtonClick, handleBookRentalButtonClick, handleBookReturnButtonClick, handleClassroomDrop, showNotes = false, showNotesBelow = false, fullWidth = false, hideHeader = false }: ClassroomTableProps) => {
  const { dragOver, dropHandlers } = useClassroomDrop(classroom.id, handleClassroomDrop);
  const [bookInputTarget, setBookInputTarget] = React.useState<number | null>(null);
  const [bookTitleInput, setBookTitleInput] = React.useState('');

  return (
    <FlexBox
      flexDirection="column"
      gap={0.5}
      sx={{ width: fullWidth ? '100%' : 'auto', outline: dragOver ? '2px dashed #036635' : 'none', borderRadius: '0.5rem', transition: 'outline 0.15s' }}
      onClick={() => setBookInputTarget(null)}
      {...dropHandlers}
    >
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
            {records.map((activityRecord: ActivityRecordType) => (
              <TableRow key={activityRecord.id}>
                <TableCell align="center" sx={{ width: '2%', px: 0, py: 0, borderRight: 'none !important' }}>
                  <span
                    draggable
                    onDragStart={createDragStartHandler(activityRecord.student.id, classroom.id)}
                    className="drag-handle"
                  >⠿</span>
                </TableCell>
                <TableCell align="center" sx={{ width: '10%', borderLeft: 'none !important' }}>
                  <FlexBox sx={{ position: 'relative', justifyContent: 'center' }}>
                    <AppleTg component="div" sx={{ fontSize: '0.9rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '2lh' }} onClick={(e: React.MouseEvent) => { e.stopPropagation(); setActivePopup(activePopup === activityRecord.id ? null : activityRecord.id); setBookInputTarget(null); setMemoInput(''); }}>
                      <div style={{ fontWeight: 600 }}>{activityRecord.student.name}{activityRecord.isMakeup && <span style={{ color: '#e65100' }}> (보강)</span>}</div>
                      {(activityRecord.student.schoolName || activityRecord.student.schoolGrade) && <div style={{ fontSize: '0.75rem', color: '#999' }}>({activityRecord.student.schoolName ? `${activityRecord.student.schoolName.replace('초등학교', '초').replace('중학교', '중').replace('고등학교', '고')} ` : ''}{activityRecord.student.schoolGrade}학년)</div>}
                    </AppleTg>
                    {activePopup === activityRecord.id && (
                      <StudentActionPopup
                        myLevel={auth.getMyInfo()?.level ?? 0}
                        onNavigateDetail={() => { navigate(`/student/${activityRecord.student.id}`); setActivePopup(null); }}
                        onAddMakeup={() => { setMakeupTarget({ studentId: activityRecord.student.id }); setActivePopup(null); }}
                        onAddFixedMemo={() => { setMemoTargetStudentId(activityRecord.student.id); setMemoType('fixed-memo'); setActivePopup(null); }}
                        onAddTempMemo={() => { setMemoTargetStudentId(activityRecord.student.id); setMemoType('temporary-memo'); setActivePopup(null); }}
                      />
                    )}
                  </FlexBox>
                </TableCell>
                <TableCell align="center" sx={{ width: '12%' }}>
                  <ActivityRecordButton
                    status={activityRecord.attendance}
                    label={`${ACTIVITY_BUTTON_TEXT.attendance[activityRecord.attendance]}${activityRecord.isMakeup && activityRecord.attendance === 'pending' ? ' (보강)' : ''}`}
                    onClick={() => handleWeeklyActivityRecordButtonClick({ activityId: activityRecord.id, activityKey: ActivityKey.ATTENDANCE, value: nextStatus(activityRecord.attendance) })}
                  />
                </TableCell>
                <TableCell align="center" sx={{ width: '12%' }}>
                  <ActivityRecordButton
                    status={activityRecord.report1}
                    label={ACTIVITY_BUTTON_TEXT.report1[activityRecord.report1]}
                    onClick={() => handleWeeklyActivityRecordButtonClick({ activityId: activityRecord.id, activityKey: ActivityKey.REPORT1, value: nextStatus(activityRecord.report1) })}
                  />
                </TableCell>
                <TableCell align="center" sx={{ width: '12%' }}>
                  <ActivityRecordButton
                    status={activityRecord.report2}
                    label={ACTIVITY_BUTTON_TEXT.report2[activityRecord.report2]}
                    onClick={() => handleWeeklyActivityRecordButtonClick({ activityId: activityRecord.id, activityKey: ActivityKey.REPORT2, value: nextStatus(activityRecord.report2) })}
                  />
                </TableCell>
                <TableCell align="center" sx={{ width: '12%' }}>
                  <ActivityRecordButton
                    status={activityRecord.monthlyProject === 'completed' ? 'completed' : activityRecord.monthlyProject === 'failed' || activityRecord.monthlyProject === 'none' ? 'failed' : 'pending'}
                    label={MONTHLY_BUTTON_TEXT[activityRecord.monthlyProject]}
                    activeEffect
                    onClick={() => handleWeeklyActivityRecordButtonClick({ activityId: activityRecord.id, activityKey: ActivityKey.MONTHLY_PROJECT, value: nextMonthlyStatus(activityRecord.monthlyProject) })}
                  />
                </TableCell>
                <TableCell align="center" sx={{ width: '12%', position: 'relative' }}>
                  <ActivityRecordButton
                    status={activityRecord.borrowedBooks.length > 0 ? 'completed' : 'pending'}
                    label={(() => {
                      if (activityRecord.borrowedBooks.length === 0) return '책 대여';
                      const today = new Date(); const hasToday = activityRecord.borrowedBooks.some(b => { const d = new Date(b.borrowedAt); return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate(); });
                      return hasToday ? <>● 대여 {activityRecord.borrowedBooks.length}권</> : `대여 ${activityRecord.borrowedBooks.length}권`;
                    })()}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      setBookInputTarget(bookInputTarget === activityRecord.id ? null : activityRecord.id);
                      setBookTitleInput('');
                      setActivePopup(null);
                    }}
                  />
                  {bookInputTarget === activityRecord.id && (
                    <FlexBox
                      flexDirection="column"
                      gap={0.5}
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      sx={{ position: 'absolute', top: '100%', right: 0, zIndex: 20, backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', padding: '0.5rem', width: '14rem' }}
                    >
                      {activityRecord.borrowedBooks.map(book => (
                        <FlexBox key={book.id} alignItems="center" justifyContent="space-between" sx={{ fontSize: '0.75rem', color: '#444', py: 0.25 }}>
                          <AppleTg sx={{ fontSize: '0.7rem', color: '#999', flexShrink: 0 }}>{new Date(book.borrowedAt).getMonth() + 1}/{new Date(book.borrowedAt).getDate()}</AppleTg>
                          <AppleTg sx={{ fontSize: '0.75rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ml: 0.5 }}>{book.bookTitle}</AppleTg>
                          <AppleTg sx={{ fontSize: '0.7rem', color: '#e57373', cursor: 'pointer', flexShrink: 0, ml: 0.5 }} onClick={() => { handleBookReturnButtonClick(activityRecord, book.id); }}>반납</AppleTg>
                        </FlexBox>
                      ))}
                      <FlexBox gap={0.5}>
                        <input
                          autoFocus
                          placeholder="책 이름"
                          value={bookTitleInput}
                          onChange={(e) => setBookTitleInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && bookTitleInput.trim()) {
                              e.preventDefault();
                              handleBookRentalButtonClick(activityRecord, bookTitleInput.trim());
                              setBookTitleInput('');
                              setBookInputTarget(null);
                            }
                            if (e.key === 'Escape') setBookInputTarget(null);
                          }}
                          style={{ flex: 1, padding: '0.3rem 0.5rem', border: '1px solid #ddd', borderRadius: '0.25rem', fontSize: '0.8rem', outline: 'none' }}
                        />
                        <AppleTg
                          sx={{ fontSize: '0.75rem', color: bookTitleInput.trim() ? '#036635' : '#ccc', cursor: bookTitleInput.trim() ? 'pointer' : 'default', fontWeight: 600, flexShrink: 0, alignSelf: 'center' }}
                          onClick={() => {
                            if (bookTitleInput.trim()) {
                              handleBookRentalButtonClick(activityRecord, bookTitleInput.trim());
                              setBookTitleInput('');
                              setBookInputTarget(null);
                            }
                          }}
                        >확인</AppleTg>
                      </FlexBox>
                    </FlexBox>
                  )}
                </TableCell>
                {showNotes && activityRecord === records[0] && (
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
