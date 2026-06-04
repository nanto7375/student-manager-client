import React from "react";
import { TableContainer, Table, TableBody, TableRow, TableCell } from "@mui/material";
import { FlexBox } from "~/components/styled-elements";
import { AppleTg } from "~/components/typography";
import { StudentActionPopup } from "~/components/student-action-popup";
import { auth } from "~/lib/auth";
import { TABLE_STYLE } from "~/constants/styles";
import { useClassroomDrop, createDragStartHandler } from "~/hooks/use-classroom-drop";

import type { ActivityCheck, ActivityRecordType } from "../activity-records.type";
import { ActivityKey, monthlyProjectStatusText, monthlyProjectNextKey } from "../activity-records.type";
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
  handleWeeklyActivityRecordButtonClick: (params: { activityId: number; activityKey: keyof ActivityCheck; value: boolean }) => void;
  handleMonthlyActivityRecordButtonClick: (params: { activityId: number; activityKey: keyof ActivityCheck | 'monthlyProject'; value: string | null }) => void;
  handleBookRentalButtonClick: (record: ActivityRecordType) => void;
  handleClassroomDrop: (studentId: number, classroomId: number) => void;
  showNotes?: boolean;
  showNotesBelow?: boolean;
  fullWidth?: boolean;
  hideHeader?: boolean;
};

export const ClassroomTable = ({ classroom, records, fixedMemosMap, tempMemosMap, activePopup, setActivePopup, setMemoInput, navigate, setMakeupTarget, setMemoTargetStudentId, setMemoType, handleWeeklyActivityRecordButtonClick, handleMonthlyActivityRecordButtonClick, handleBookRentalButtonClick, handleClassroomDrop, showNotes = false, showNotesBelow = false, fullWidth = false, hideHeader = false }: ClassroomTableProps) => {
  const { dragOver, dropHandlers } = useClassroomDrop(classroom.id, handleClassroomDrop);

  return (
    <FlexBox
      flexDirection="column"
      gap={0.5}
      sx={{ width: fullWidth ? '100%' : 'auto', outline: dragOver ? '2px dashed #036635' : 'none', borderRadius: '0.5rem', transition: 'outline 0.15s' }}
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
                    <AppleTg component="div" sx={{ fontSize: '0.9rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '2lh' }} onClick={(e: React.MouseEvent) => { e.stopPropagation(); setActivePopup(activePopup === activityRecord.id ? null : activityRecord.id); setMemoInput(''); }}>
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
                    value={activityRecord.attendance}
                    buttonTextOn={`출석${activityRecord.isMakeup ? ' (보강)' : ''}`}
                    buttonTextOff={`${activityRecord.isMakeup ? '보강' : '출석'} 완료`}
                    onClick={() => handleWeeklyActivityRecordButtonClick({ activityId: activityRecord.id, activityKey: ActivityKey.ATTENDANCE, value: !activityRecord.attendance })}
                  />
                </TableCell>
                <TableCell align="center" sx={{ width: '12%' }}>
                  <ActivityRecordButton
                    value={activityRecord.report1}
                    buttonTextOn="독후감"
                    buttonTextOff="독후감 완료"
                    onClick={() => handleWeeklyActivityRecordButtonClick({ activityId: activityRecord.id, activityKey: ActivityKey.REPORT1, value: !activityRecord.report1 })}
                  />
                </TableCell>
                <TableCell align="center" sx={{ width: '12%' }}>
                  <ActivityRecordButton
                    value={activityRecord.report2}
                    buttonTextOn="주간 레오"
                    buttonTextOff="주간 완료"
                    onClick={() => handleWeeklyActivityRecordButtonClick({ activityId: activityRecord.id, activityKey: ActivityKey.REPORT2, value: !activityRecord.report2 })}
                  />
                </TableCell>
                <TableCell align="center" sx={{ width: '12%' }}>
                  <ActivityRecordButton
                    value={!!(activityRecord.monthlyProject && activityRecord.monthlyPreview && activityRecord.monthlyReport)}
                    buttonTextOn={`월간 ${monthlyProjectStatusText(activityRecord)}`}
                    buttonTextOff="월간 완료"
                    activeEffect
                    onClick={() => {
                      const nextKey = monthlyProjectNextKey(activityRecord);
                      const current = nextKey === 'monthlyProject' ? activityRecord.monthlyProject : activityRecord[nextKey];
                      const value = current ? null : new Date().toISOString();
                      handleMonthlyActivityRecordButtonClick({ activityId: activityRecord.id, activityKey: nextKey, value });
                    }}
                  />
                </TableCell>
                <TableCell align="center" sx={{ width: '12%' }}>
                  <ActivityRecordButton
                    value={!!activityRecord.borrowedBook}
                    buttonTextOn="책 대여"
                    buttonTextOff="책 반납"
                    onClick={() => handleBookRentalButtonClick(activityRecord)}
                    mainBgColor="transparent"
                    disabledBgColor="grey.200"
                    fontColor='black'
                  />
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
