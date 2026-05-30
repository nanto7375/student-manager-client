import React from "react";
import { useLoaderData, useNavigate } from "react-router";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Button, Modal } from "@mui/material";
import dayjs from "dayjs";

import { getActivityRecordsApi, updateWeeklyActivityRecordApi, updateMonthlyActivityRecordApi, borrowBookApi, returnBookApi } from "~/lib/api/activities.api";
import { createNoteApi, changeClassroomApi } from "~/lib/api/students.api";
import { FlexBox, FlexContainer } from "~/components/styled-elements";
import { AppleTg } from "~/components/typography";
import { useGlobalToast } from "~/providers/toast-provider";
import { MakeupScheduleDialog } from "~/components/makeup-schedule-dialog";
import { StudentActionPopup } from "~/components/student-action-popup";
import { auth } from "~/lib/auth";
import { TABLE_STYLE } from "~/constants/styles";
import { useClassroomDrop, createDragStartHandler } from "~/hooks/use-classroom-drop";

import type { ActivityCheck, ActivityRecordType } from "./activity-records.type";
import { ActivityKey, monthlyProjectStatusText, monthlyProjectNextKey, activityRecordsQueryKey } from "./activity-records.type";
import { CLASSROOMS, type Classroom } from "~/constants/student.type";

export { activityRecordsQueryKey } from "./activity-records.type";

export const clientLoader = async ({ params, request }: { params: { scheduleId: string }; request: Request }) => {
  const date = new URL(request.url).searchParams.get('date') ?? dayjs().format('YYYYMMDD');
  return { scheduleId: params.scheduleId, date };
}

export default function StudentActivityRecords() {
  const queryClient = useQueryClient();
  const { scheduleId, date } = useLoaderData<typeof clientLoader>();
  const toast = useGlobalToast();
  const navigate = useNavigate();

  const [updating, setUpdating] = React.useState(false);
  const [activePopup, setActivePopup] = React.useState<number | null>(null);
  const [memoInput, setMemoInput] = React.useState('');
  const [memoTargetStudentId, setMemoTargetStudentId] = React.useState<number | null>(null);
  const [memoType, setMemoType] = React.useState<'fixed-memo' | 'temporary-memo'>('temporary-memo');
  const [makeupTarget, setMakeupTarget] = React.useState<{ studentId: number } | null>(null);

  const invalidateRecords = () => queryClient.invalidateQueries({ queryKey: activityRecordsQueryKey(scheduleId, date) });

  /** 공통 업데이트 래퍼: updating 상태 관리 + 에러 핸들링 */
  const withUpdating = async (fn: () => Promise<unknown>, errorMsg: string) => {
    if (updating) return;
    setUpdating(true);
    try {
      await fn();
      invalidateRecords();
    } catch (error: any) {
      console.error(error);
      toast.error(error.status >= 500 ? `서버에 문제가 발생했습니다.(${error.message})` : errorMsg);
    } finally {
      setTimeout(() => setUpdating(false), 300);
    }
  };

  const handleAddTempMemo = async (studentId: number) => {
    if (!memoInput.trim()) return;
    try {
      await createNoteApi({ params: { studentId }, body: { value: memoInput.trim(), type: memoType } });
      invalidateRecords();
      setMemoInput('');
      setMemoTargetStudentId(null);
    } catch (e) {
      console.error(e);
      toast.error('메모 추가에 실패했습니다.');
    }
  };
  
  const { data: activityRecords, isLoading } = useQuery({
    queryKey: activityRecordsQueryKey(scheduleId, date),
    queryFn: () => getActivityRecordsApi({ query: { scheduleId, date } }),
    enabled: !!scheduleId && !!date,
    placeholderData: keepPreviousData,
  });

  const buildMemoMap = (type: 'fixed-memo' | 'temporary-memo') =>
    Object.fromEntries(
      activityRecords.map(r => [r.student.id, r.student.notes.filter(n => n.type === type).map(n => n.value.trim().replace(/\.$/, '')).join('. ')])
    );

  const fixedMemosMap = React.useMemo(() => {
    if (!activityRecords) return {};
    return buildMemoMap('fixed-memo');
  }, [activityRecords]);

  const tempMemosMap = React.useMemo(() => {
    if (!activityRecords) return {};
    return buildMemoMap('temporary-memo');
  }, [activityRecords]);

  const recordsByClassroom = React.useMemo(() => {
    if (!activityRecords) return [];
    return CLASSROOMS
      .map(c => ({ classroom: c, records: activityRecords.filter(r => r.student.classroom.id === c.id) }));
  }, [activityRecords]);

  const handleWeeklyActivityRecordButtonClick = ({activityId, activityKey, value}: {activityId: number; activityKey: keyof ActivityCheck; value: boolean}) =>
    withUpdating(
      () => updateWeeklyActivityRecordApi({ params: { activityId }, body: { [activityKey]: value } }),
      '활동 기록 업데이트에 실패했습니다.'
    );

  const handleMonthlyActivityRecordButtonClick = ({activityId, activityKey, value}: {activityId: number; activityKey: keyof ActivityCheck | 'monthlyProject'; value: string | null}) =>
    withUpdating(
      () => updateMonthlyActivityRecordApi({ params: { activityId }, body: { [activityKey]: value } }),
      '활동 기록 업데이트에 실패했습니다.'
    );

  const handleBookRentalButtonClick = (record: ActivityRecordType) =>
    withUpdating(
      () => record.borrowedBook
        ? returnBookApi({ params: { bookRentalId: record.borrowedBook.id } })
        : borrowBookApi({ body: { studentId: record.student.id } }),
      '책 대여/반납 처리에 실패했습니다.'
    );

  const handleClassroomDrop = (studentId: number, classroomId: number) =>
    withUpdating(
      () => changeClassroomApi({ params: { studentId }, body: { classroomId } }),
      '강의실 변경에 실패했습니다.'
    );

  if (isLoading || !activityRecords) {
    return <FlexContainer padding="1rem" fullHeight fullWidth center></FlexContainer>;
  }
  return (
    <FlexContainer padding="1rem" fullWidth fullHeight flexDirection="column" gap={3} sx={{ '&::after': { content: '""', minHeight: '0.01px', flexShrink: 0 } }} onClick={() => setActivePopup(null)}>
      {recordsByClassroom.map(({ classroom, records }) => (
        <ClassroomTable key={classroom.id} classroom={classroom} records={records} fixedMemosMap={fixedMemosMap} tempMemosMap={tempMemosMap} activePopup={activePopup} setActivePopup={setActivePopup} setMemoInput={setMemoInput} navigate={navigate} setMakeupTarget={setMakeupTarget} setMemoTargetStudentId={setMemoTargetStudentId} setMemoType={setMemoType} handleWeeklyActivityRecordButtonClick={handleWeeklyActivityRecordButtonClick} handleMonthlyActivityRecordButtonClick={handleMonthlyActivityRecordButtonClick} handleBookRentalButtonClick={handleBookRentalButtonClick} handleClassroomDrop={handleClassroomDrop} fullWidth showNotes />
      ))}

      {/* 변동 메모 추가 모달 */}
      <Modal open={!!memoTargetStudentId} onClose={() => { setMemoTargetStudentId(null); setMemoInput(''); }}>
        <FlexBox center fullWidth fullHeight>
          <FlexBox flexDirection="column" gap={1} sx={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', width: '20rem' }}>
            <AppleTg sx={{ fontWeight: 600 }}>{memoType === 'fixed-memo' ? '고정 메모 추가' : '변동 메모 추가'}</AppleTg>
            <input
              autoFocus
              placeholder="메모 입력"
              value={memoInput}
              onChange={(e) => setMemoInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && memoTargetStudentId) handleAddTempMemo(memoTargetStudentId); }}
              className="memo-input"
            />
            <FlexBox justifyContent="flex-end" gap={0.5}>
              <Button size="small" onClick={() => { setMemoTargetStudentId(null); setMemoInput(''); }}>취소</Button>
              <Button size="small" variant="contained" onClick={() => memoTargetStudentId && handleAddTempMemo(memoTargetStudentId)}>추가</Button>
            </FlexBox>
          </FlexBox>
        </FlexBox>
      </Modal>

      <div style={{ minHeight: '0.01px', flexShrink: 0 }} />

      <MakeupScheduleDialog
        open={!!makeupTarget}
        onClose={() => setMakeupTarget(null)}
        studentId={makeupTarget?.studentId ?? 0}
        onSuccess={invalidateRecords}
      />
    </FlexContainer>
  )
}

type ActivityRecordButtonProps = {
  value: boolean;
  buttonTextOn: string;
  buttonTextOff: string | React.ReactNode;
  onClick: () => void;
  mainBgColor?: string;
  disabledBgColor?: string;
  fontColor?: string;
}
const ActivityRecordButton = ({ value, buttonTextOn, buttonTextOff, onClick, mainBgColor='transparent', disabledBgColor='grey.500', fontColor='black' }: ActivityRecordButtonProps) => (
  <Button 
    variant="contained" 
    size="small" 
    sx={{ minWidth: 0, px: 1, py: 0, width: '100%', height: '100%', borderRadius: 0, boxShadow: 'none', backgroundColor: value ? disabledBgColor : mainBgColor, color: fontColor, cursor: 'default', '&:hover': { boxShadow: 'none' } }} 
    onClick={onClick}
  >
    <AppleTg sx={{fontSize: '0.8rem', whiteSpace: 'nowrap'}}>{value ? buttonTextOff : buttonTextOn}</AppleTg>
  </Button>
);

type ClassroomTableProps = {
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

const ClassroomTable = ({ classroom, records, fixedMemosMap, tempMemosMap, activePopup, setActivePopup, setMemoInput, navigate, setMakeupTarget, setMemoTargetStudentId, setMemoType, handleWeeklyActivityRecordButtonClick, handleMonthlyActivityRecordButtonClick, handleBookRentalButtonClick, handleClassroomDrop, showNotes = false, showNotesBelow = false, fullWidth = false, hideHeader = false }: ClassroomTableProps) => {
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
                  <AppleTg component="div" sx={{fontSize: '0.9rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '2lh'}} onClick={(e: React.MouseEvent) => { e.stopPropagation(); setActivePopup(activePopup === activityRecord.id ? null : activityRecord.id); setMemoInput(''); }}>
                    <div>{activityRecord.student.name}{activityRecord.isMakeup && <span style={{ color: '#e65100' }}> (보강)</span>}</div>
                    {activityRecord.student.schoolName && <div>({activityRecord.student.schoolName.replace('초등학교', '초').replace('중학교', '중').replace('고등학교', '고')} {activityRecord.student.schoolGrade}학년)</div>}
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
                  onClick={() => handleWeeklyActivityRecordButtonClick({
                    activityId: activityRecord.id, 
                    activityKey: ActivityKey.ATTENDANCE, 
                    value: !activityRecord.attendance
                  })} 
                />
              </TableCell>
              <TableCell align="center" sx={{ width: '12%' }}>
                <ActivityRecordButton 
                  value={activityRecord.report1} 
                  buttonTextOn="독후감" 
                  buttonTextOff="독후감 완료" 
                  onClick={() => handleWeeklyActivityRecordButtonClick({
                    activityId: activityRecord.id, 
                    activityKey: ActivityKey.REPORT1, 
                    value: !activityRecord.report1
                  })} 
                />
              </TableCell>
              <TableCell align="center" sx={{ width: '12%' }}>
                <ActivityRecordButton 
                  value={activityRecord.report2} 
                  buttonTextOn="주간 레오" 
                  buttonTextOff="주간 완료" 
                  onClick={() => handleWeeklyActivityRecordButtonClick({
                    activityId: activityRecord.id, 
                    activityKey: ActivityKey.REPORT2, 
                    value: !activityRecord.report2
                  })} 
                />
              </TableCell>
              <TableCell align="center" sx={{ width: '12%' }}>
                <ActivityRecordButton 
                  value={!!(activityRecord.monthlyProject && activityRecord.monthlyPreview && activityRecord.monthlyReport)} 
                  buttonTextOn={`월간 ${monthlyProjectStatusText(activityRecord)}`} 
                  buttonTextOff="월간 완료"
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
