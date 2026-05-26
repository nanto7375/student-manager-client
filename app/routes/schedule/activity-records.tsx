import React from "react";
import { useLoaderData, useNavigate } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Button, Modal } from "@mui/material";
import dayjs from "dayjs";

import type { SchoolLevel } from "~/constants/type";
import { buildApi } from "~/lib/api-builder";
import { FlexBox, FlexContainer } from "~/components/styled-elements";
import { AppleTg } from "~/components/typography";
import { useGlobalToast } from "~/providers/toast-provider";
import { MakeupScheduleDialog } from "~/components/makeup-schedule-dialog";

type StudentInActivityDto = {
  id: number;
  name: string;
  schoolName: string;
  schoolLevel: SchoolLevel;
  schoolGrade: number;
  notes: { id: number; type: 'fixed-memo' | 'temporary-memo'; value: string; }[];
  deletedAt: Date | null;
};

/**
 * isMakeup: 보충 수업 여부
 * attendance: 출석 여부
 * report: 감상문 제출 여부
 * report2: 주간 레오 제출 여부
 * monthlyProject: 월간 레오 참여 여부
 * monthlyPreview: 월간 레오 개요 제출 여부
 * monthlyReport: 월간 레오 감상문 제출 여부
 */
type ActivityCheck = {
  attendance: boolean;
  report1: boolean;
  report2: boolean;
  monthlyProject: boolean;
  monthlyPreview: boolean;
  monthlyReport: boolean;
};
type BookRental = {
  id: number;
  bookTitle: string | null;
  borrowedAt: Date;
}
type ActivityRecordType = ActivityCheck & {
  id: number;
  student: StudentInActivityDto;
  date: string;
  isMakeup: boolean;
  borrowedBook: BookRental | null;
};

const ActivityKey: Record<string, keyof ActivityCheck> = {
  ATTENDANCE: 'attendance',
  REPORT1: 'report1',
  REPORT2: 'report2',
  MONTHLY_PROJECT: 'monthlyProject',
  MONTHLY_PREVIEW: 'monthlyPreview',
  MONTHLY_REPORT: 'monthlyReport',
}

const getActivityRecords = buildApi<ActivityRecordType[]>({ path: '/activities', method: 'GET' });

const monthlyProjectStatusText = (record: ActivityRecordType) => {
  if (!record.monthlyProject) return '참여';
  if (!record.monthlyPreview) return '개요 제출';
  else if (!record.monthlyReport) return '감상문 제출';
}

const monthlyProjectNextKey = (record: ActivityRecordType): keyof ActivityCheck => {
  if (!record.monthlyProject) return ActivityKey.MONTHLY_PROJECT;
  if (!record.monthlyPreview) return ActivityKey.MONTHLY_PREVIEW;
  else if (!record.monthlyReport) return ActivityKey.MONTHLY_REPORT;
  return ActivityKey.MONTHLY_PROJECT; // 이미 모두 완료된 경우 다시 참여로 변경 가능
}

const activityRecordsQueryKey = (scheduleId: string, date: string | null) =>
  ['activityRecords', scheduleId, date] as const;

export const clientLoader = async ({ params, request }: { params: { scheduleId: string }; request: Request }) => {
  const date = new URL(request.url).searchParams.get('date') ?? dayjs().format('YYYYMMDD'); // YYYYMMDD
  return { scheduleId: params.scheduleId, date };
}

const updateWeeklyActivityRecordApi = buildApi<ActivityRecordType>({ path: '/activities/:activityId', method: 'PATCH' });
const updateMonthlyActivityRecordApi = buildApi<ActivityRecordType>({ path: '/activities/:activityId/monthly', method: 'PATCH' });
const borrowBookApi = buildApi<void>({ path: '/book-rentals', method: 'POST' });
const returnBookApi = buildApi<void>({ path: '/book-rentals/:bookRentalId/return', method: 'PATCH' });
const createNoteApi = buildApi<void>({ path: '/students/:studentId/notes', method: 'POST' });
export default function StudentActivityRecords() {
  const queryClient = useQueryClient();
  const { scheduleId, date } = useLoaderData<typeof clientLoader>();
  const toast = useGlobalToast();
  const navigate = useNavigate();

  const isAfterToday = React.useMemo(() => dayjs().isBefore(dayjs(date), 'date'), [date]); // 미래 여부
  const [updating, setUpdating] = React.useState(false);
  const [activePopup, setActivePopup] = React.useState<number | null>(null); // 이름 클릭 시 팝업 표시할 학생 id
  const [memoInput, setMemoInput] = React.useState('');
  const [memoTargetStudentId, setMemoTargetStudentId] = React.useState<number | null>(null);
  const [memoType, setMemoType] = React.useState<'fixed-memo' | 'temporary-memo'>('temporary-memo');
  const [makeupTarget, setMakeupTarget] = React.useState<{ studentId: number } | null>(null);

  const handleAddTempMemo = async (studentId: number) => {
    if (!memoInput.trim()) return;
    try {
      await createNoteApi({ params: { studentId }, body: { value: memoInput.trim(), type: memoType } });
      queryClient.invalidateQueries({ queryKey: activityRecordsQueryKey(scheduleId, date) });
      setMemoInput('');
      setMemoTargetStudentId(null);
    } catch (e) {
      console.error(e);
      toast.error('메모 추가에 실패했습니다.');
    }
  };
  
  const { data: activityRecords, isLoading } = useQuery({
    queryKey: activityRecordsQueryKey(scheduleId, date),
    queryFn: () => getActivityRecords({ query: { scheduleId, date } }),
    enabled: !!scheduleId && !!date,
  });

  // 학생별 고정 메모
  const fixedMemosMap = React.useMemo(() => {
    if (!activityRecords) return {};
    return Object.fromEntries(
      activityRecords.map(r => [r.student.id, r.student.notes.filter(n => n.type === 'fixed-memo').map(n => n.value.trim().replace(/\.$/, '')).join('. ')])
    );
  }, [activityRecords]);

  const handleWeeklyActivityRecordButtonClick = async ({activityId, activityKey, value}: {activityId: number; activityKey: keyof ActivityCheck; value: boolean}) => {
    if (updating) return;
    // if (isAfterToday) return toast.info('미래 날짜의 활동은 업데이트할 수 없습니다.');
    
    setUpdating(true);
    try {
      await updateWeeklyActivityRecordApi({ params: { activityId }, body: { [activityKey]: value } });
      queryClient.invalidateQueries({ queryKey: activityRecordsQueryKey(scheduleId, date) });
    } catch (error) {
      console.error(error);
      toast.error(error.status >= 500 ? 
        `서버에 문제가 발생했습니다.(${error.message})` : 
        '활동 기록 업데이트에 실패했습니다.'
      );
    } finally {
      setTimeout(() => setUpdating(false), 300);
    }
  }

  const handleMonthlyActivityRecordButtonClick = async ({activityId, activityKey, value}: {activityId: number; activityKey: keyof ActivityCheck; value: boolean}) => {
    if (updating) return;
    // if (isAfterToday) return toast.info('미래 날짜의 활동은 업데이트할 수 없습니다.');
    
    setUpdating(true);
    try {
      await updateMonthlyActivityRecordApi({ params: { activityId }, body: { [activityKey]: value } });
      queryClient.invalidateQueries({ queryKey: activityRecordsQueryKey(scheduleId, date) });
    } catch (error) {
      console.error(error);
      toast.error(error.status >= 500 ? 
        `서버에 문제가 발생했습니다.(${error.message})` : 
        '활동 기록 업데이트에 실패했습니다.'
      );
    } finally {
      setTimeout(() => setUpdating(false), 300);
    }
  }

  const handleBookRentalButtonClick = async (record: ActivityRecordType) => {
    if (updating) return;
    setUpdating(true);
    try {
      if (!record.borrowedBook) {
        await borrowBookApi({ body: { studentId: record.student.id } });
      } else {
        await returnBookApi({ params: { bookRentalId: record.borrowedBook.id } });
      }
      queryClient.invalidateQueries({ queryKey: activityRecordsQueryKey(scheduleId, date) });
    } catch (error) {
      console.error(error);
      toast.error(error.status >= 500 ? 
        `서버에 문제가 발생했습니다.(${error.message})` : 
        '책 대여/반납 처리에 실패했습니다.'
      );
    } finally {
      setTimeout(() => setUpdating(false), 300);
    }
  }

  if (isLoading || !activityRecords) {
    return <FlexContainer padding="1rem" fullHeight fullWidth center></FlexContainer>;
  }
  return (
    <FlexContainer padding="1rem" fullWidth fullHeight flexDirection="column" gap={1}>
      {/* 학생별 고정 메모 */}
      {Object.entries(fixedMemosMap).some(([, memo]) => memo) && (
        <FlexBox justifyContent="flex-end" gap={0.5} sx={{ flexWrap: 'wrap' }}>
          {activityRecords.filter(r => fixedMemosMap[r.student.id]).map(r => (
            <AppleTg key={r.student.id} sx={{ fontSize: '0.75rem', color: '#555', border: '1px solid #ddd', borderRadius: '1rem', padding: '0.2rem 0.6rem' }}>
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
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="14%" align="center" sx={{ py: 1 }}><AppleTg>이름</AppleTg></TableCell>
              <TableCell width="12%" align="center" sx={{ py: 1 }}><AppleTg>출석</AppleTg></TableCell>
              <TableCell width="12%" align="center" sx={{ py: 1 }}><AppleTg>감상문</AppleTg></TableCell>
              <TableCell width="12%" align="center" sx={{ py: 1 }}><AppleTg>주간 레오</AppleTg></TableCell>
              <TableCell width="12%" align="center" sx={{ py: 1 }}><AppleTg>월간 레오</AppleTg></TableCell>
              <TableCell width="12%" align="center" sx={{ py: 1 }}>책 대여</TableCell>
              <TableCell align="center" sx={{ py: 1 }}><AppleTg>비고</AppleTg></TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{}}>
            {activityRecords.map((activityRecord) => {
              const tempMemos = activityRecord.student.notes.filter(n => n.type === 'temporary-memo').map(n => n.value.trim().replace(/\.$/, '')).join('. ');
              return (
              <TableRow key={activityRecord.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell align="center">
                  <FlexBox sx={{ position: 'relative', justifyContent: 'center' }}>
                    <AppleTg component="div" sx={{fontSize: '0.9rem', cursor: 'pointer'}} onClick={() => { setActivePopup(activePopup === activityRecord.id ? null : activityRecord.id); setMemoInput(''); }}>
                      <div>{activityRecord.student.name}{activityRecord.isMakeup && <span style={{ color: '#e65100' }}> (보강)</span>}</div>
                      <div>({activityRecord.student.schoolName.replace('초등학교', '초').replace('중학교', '중').replace('고등학교', '고')} {activityRecord.student.schoolGrade}학년)</div>
                    </AppleTg>
                    {activePopup === activityRecord.id && (
                      <FlexBox flexDirection="column" sx={{
                        position: 'absolute', top: 'calc(100% + 0.5rem)', left: '50%', transform: 'translateX(-50%)',
                        zIndex: 1000, backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '0.5rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)', padding: '0.25rem', whiteSpace: 'nowrap',
                        '&::before': { content: '""', position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)', borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '6px solid #e0e0e0' },
                        '&::after': { content: '""', position: 'absolute', top: '-5px', left: '50%', transform: 'translateX(-50%)', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '5px solid white' },
                      }}>
                        <Button size="small" sx={{ color: 'black' }} onClick={() => { navigate(`/student/${activityRecord.student.id}`); setActivePopup(null); }}>상세로 이동</Button>
                        <Button size="small" sx={{ color: 'black' }} onClick={() => { setMakeupTarget({ studentId: activityRecord.student.id }); setActivePopup(null); }}>보강 추가</Button>
                        <Button size="small" sx={{ color: 'black' }} onClick={() => { setMemoTargetStudentId(activityRecord.student.id); setMemoType('fixed-memo'); setActivePopup(null); }}>고정 메모 추가</Button>
                        <Button size="small" sx={{ color: 'black' }} onClick={() => { setMemoTargetStudentId(activityRecord.student.id); setMemoType('temporary-memo'); setActivePopup(null); }}>변동 메모 추가</Button>
                      </FlexBox>
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
        onSuccess={() => queryClient.invalidateQueries({ queryKey: activityRecordsQueryKey(scheduleId, date) })}
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
const ActivityRecordButton = ({ value, buttonTextOn, buttonTextOff, onClick, mainBgColor='white', disabledBgColor='grey.500', fontColor='black' }: ActivityRecordButtonProps) => {
  return (
    <Button 
      variant="contained" 
      size="small" 
      sx={{ width: '100%', backgroundColor: value ? disabledBgColor : mainBgColor, color: fontColor }} 
      onClick={onClick}
    >
      <AppleTg sx={{fontSize: '0.9rem'}}>{value ? buttonTextOff : buttonTextOn}</AppleTg>
    </Button>
  )
}