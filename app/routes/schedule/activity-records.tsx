import React from "react";
import { useLoaderData, useNavigate } from "react-router";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Button, Modal } from "@mui/material";
import dayjs from "dayjs";

import { getActivityRecordsApi, updateWeeklyActivityRecordApi, updateMonthlyActivityRecordApi, borrowBookApi, returnBookApi } from "~/lib/api/activities.api";
import { createNoteApi } from "~/lib/api/students.api";
import { FlexBox, FlexContainer } from "~/components/styled-elements";
import { AppleTg } from "~/components/typography";
import { useGlobalToast } from "~/providers/toast-provider";
import { MakeupScheduleDialog } from "~/components/makeup-schedule-dialog";
import { StudentActionPopup } from "~/components/student-action-popup";
import { auth } from "~/lib/auth";
import { TABLE_STYLE } from "~/constants/styles";

import type { ActivityCheck, ActivityRecordType } from "./activity-records.type";
import { ActivityKey, monthlyProjectStatusText, monthlyProjectNextKey, activityRecordsQueryKey } from "./activity-records.type";

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

  const fixedMemosMap = React.useMemo(() => {
    if (!activityRecords) return {};
    return Object.fromEntries(
      activityRecords.map(r => [r.student.id, r.student.notes.filter(n => n.type === 'fixed-memo').map(n => n.value.trim().replace(/\.$/, '')).join('. ')])
    );
  }, [activityRecords]);

  const handleWeeklyActivityRecordButtonClick = ({activityId, activityKey, value}: {activityId: number; activityKey: keyof ActivityCheck; value: boolean}) =>
    withUpdating(
      () => updateWeeklyActivityRecordApi({ params: { activityId }, body: { [activityKey]: value } }),
      '활동 기록 업데이트에 실패했습니다.'
    );

  const handleMonthlyActivityRecordButtonClick = ({activityId, activityKey, value}: {activityId: number; activityKey: keyof ActivityCheck; value: boolean}) =>
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

  if (isLoading || !activityRecords) {
    return <FlexContainer padding="1rem" fullHeight fullWidth center></FlexContainer>;
  }
  return (
    <FlexContainer padding="1rem" fullWidth fullHeight flexDirection="column" gap={1}>
      {/* 학생별 고정 메모 */}
      {Object.entries(fixedMemosMap).some(([, memo]) => memo) && (
        <FlexBox justifyContent="flex-end" gap={0.5} sx={{ flexWrap: 'wrap' }}>
          {activityRecords.filter((r, i, arr) => fixedMemosMap[r.student.id] && arr.findIndex(a => a.student.id === r.student.id) === i).map(r => (
            <AppleTg key={r.id} sx={{ fontSize: '0.75rem', color: '#555', border: '1px solid #ddd', borderRadius: '1rem', padding: '0.2rem 0.6rem' }}>
              <strong>{r.student.name}</strong> {fixedMemosMap[r.student.id]}
            </AppleTg>
          ))}
        </FlexBox>
      )}

      <TableContainer className='non-overflow-scroll' sx={{
        border: '1px solid #ddd',
        borderRadius: '0.25rem',
        overflow: 'visible',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <Table sx={TABLE_STYLE}>
          <TableHead>
            <TableRow>
              <TableCell width="14%" align="center" sx={{ py: 1 }}><AppleTg>이름</AppleTg></TableCell>
              <TableCell width="12%" align="center" sx={{ py: 1 }}><AppleTg>출석</AppleTg></TableCell>
              <TableCell width="12%" align="center" sx={{ py: 1 }}><AppleTg>감상문</AppleTg></TableCell>
              <TableCell width="12%" align="center" sx={{ py: 1 }}><AppleTg>주간 레오</AppleTg></TableCell>
              <TableCell width="12%" align="center" sx={{ py: 1 }}><AppleTg>월간 레오</AppleTg></TableCell>
              <TableCell width="12%" align="center" sx={{ py: 1 }}><AppleTg>책 대여</AppleTg></TableCell>
              <TableCell align="center" sx={{ py: 1 }}><AppleTg>비고</AppleTg></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activityRecords.map((activityRecord) => {
              const tempMemos = activityRecord.student.notes.filter(n => n.type === 'temporary-memo').map(n => n.value.trim().replace(/\.$/, '')).join('. ');
              return (
              <TableRow key={activityRecord.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell align="center">
                  <FlexBox sx={{ position: 'relative', justifyContent: 'center' }}>
                    <AppleTg component="div" sx={{fontSize: '0.9rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '2lh'}} onClick={() => { setActivePopup(activePopup === activityRecord.id ? null : activityRecord.id); setMemoInput(''); }}>
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
                <TableCell align="center">
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
                <TableCell align="center">
                  <ActivityRecordButton 
                    value={activityRecord.report1} 
                    buttonTextOn="제출" 
                    buttonTextOff="제출 완료" 
                    onClick={() => handleWeeklyActivityRecordButtonClick({
                      activityId: activityRecord.id, 
                      activityKey: ActivityKey.REPORT1, 
                      value: !activityRecord.report1
                    })} 
                  />
                </TableCell>
                <TableCell align="center">
                  <ActivityRecordButton 
                    value={activityRecord.report2} 
                    buttonTextOn="제출" 
                    buttonTextOff="제출 완료" 
                    onClick={() => handleWeeklyActivityRecordButtonClick({
                      activityId: activityRecord.id, 
                      activityKey: ActivityKey.REPORT2, 
                      value: !activityRecord.report2
                    })} 
                  />
                </TableCell>
                <TableCell align="center">
                  <ActivityRecordButton 
                    value={activityRecord.monthlyProject && activityRecord.monthlyPreview && activityRecord.monthlyReport} 
                    buttonTextOn={monthlyProjectStatusText(activityRecord)} 
                    buttonTextOff="참여 완료"
                    onClick={() => handleMonthlyActivityRecordButtonClick({
                      activityId: activityRecord.id, 
                      activityKey: monthlyProjectNextKey(activityRecord), 
                      value: !activityRecord[monthlyProjectNextKey(activityRecord)]
                    })}
                  />
                </TableCell>
                <TableCell align="center">
                  <ActivityRecordButton
                    value={!!activityRecord.borrowedBook}
                    buttonTextOn="대여하기"
                    buttonTextOff="반납"
                    onClick={() => handleBookRentalButtonClick(activityRecord)}
                    mainBgColor="white"
                    disabledBgColor="grey.200" 
                    fontColor='black'
                  />
                </TableCell>
                <TableCell>
                  {tempMemos && <AppleTg sx={{ fontSize: '0.75rem', color: '#666' }}>{tempMemos}</AppleTg>}
                </TableCell>
              </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

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
              onFocus={(e) => { e.target.style.border = '1px solid #036635'; e.target.style.outline = 'none'; }}
              onBlur={(e) => { e.target.style.border = '1px solid #ddd'; }}
              style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '0.25rem', fontSize: '0.9rem' }}
            />
            <FlexBox justifyContent="flex-end" gap={0.5}>
              <Button size="small" onClick={() => { setMemoTargetStudentId(null); setMemoInput(''); }}>취소</Button>
              <Button size="small" variant="contained" onClick={() => memoTargetStudentId && handleAddTempMemo(memoTargetStudentId)}>추가</Button>
            </FlexBox>
          </FlexBox>
        </FlexBox>
      </Modal>

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
const ActivityRecordButton = ({ value, buttonTextOn, buttonTextOff, onClick, mainBgColor='white', disabledBgColor='grey.500', fontColor='black' }: ActivityRecordButtonProps) => (
  <Button 
    variant="contained" 
    size="small" 
    sx={{ width: '100%', backgroundColor: value ? disabledBgColor : mainBgColor, color: fontColor }} 
    onClick={onClick}
  >
    <AppleTg sx={{fontSize: '0.9rem'}}>{value ? buttonTextOff : buttonTextOn}</AppleTg>
  </Button>
);
