import React from "react";
import { useLoaderData } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Button } from "@mui/material";
import dayjs from "dayjs";

import type { SchoolLevel } from "~/constants/type";
import { buildApi } from "~/lib/api-builder";
import { FlexContainer } from "~/components/styled-elements";
import { AppleTg } from "~/components/typography";
import { useGlobalToast } from "~/providers/toast-provider";

type StudentInActivityDto = {
  id: number;
  name: string;
  birthYear: string;
  birthDate: string;
  schoolName: string;
  schoolLevel: SchoolLevel;
  schoolGrade: number;
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

const updateActivityRecordApi = buildApi<ActivityRecordType>({ path: '/activities/:activityId', method: 'PATCH' });
const borrowBookApi = buildApi<void>({ path: '/book-rentals', method: 'POST' });
const updateBookRentalInfoApi = buildApi<void>({ path: '/book-rentals/:bookRentalId', method: 'PATCH' });
const returnBookApi = buildApi<void>({ path: '/book-rentals/:bookRentalId/return', method: 'PATCH' });

export default function StudentActivityRecords() {
  const queryClient = useQueryClient();
  const { scheduleId, date } = useLoaderData<typeof clientLoader>();
  const toast = useGlobalToast();

  const isAfterToday = React.useMemo(() => dayjs().isBefore(dayjs(date), 'date'), [date]); // 미래 여부
  const [updating, setUpdating] = React.useState(false);
  
  const { data: activityRecords = [], isLoading } = useQuery({
    queryKey: activityRecordsQueryKey(scheduleId, date),
    queryFn: () => getActivityRecords({ query: { scheduleId, date } }),
    enabled: !!scheduleId && !!date,
  });

  const updateActivityRecord = useMutation({
    mutationFn: updateActivityRecordApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityRecordsQueryKey(scheduleId, date) });
    },
  });
  const borrowBook = useMutation({
    mutationFn: borrowBookApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityRecordsQueryKey(scheduleId, date) });
    },
  });
  const returnBook = useMutation({
    mutationFn: returnBookApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityRecordsQueryKey(scheduleId, date) });
    },
  });

  const handleActivityRecordButtonClick = async ({activityId, activityKey, value}: {activityId: number; activityKey: keyof ActivityCheck; value: boolean}) => {
    if (updating) return;
    if (isAfterToday) return toast.info('미래 날짜의 활동은 업데이트할 수 없습니다.');
    
    setUpdating(true);
    try {
      const body = { activityKey: activityKey, activityValue: value };
      const isMonthlyProjectKey = [ActivityKey.MONTHLY_PREVIEW, ActivityKey.MONTHLY_REPORT, ActivityKey.MONTHLY_PROJECT].includes(activityKey);
      await updateActivityRecord.mutateAsync({ params: { activityId }, body, query: { monthly: isMonthlyProjectKey } });
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
        await borrowBook.mutateAsync({ body: { studentId: record.student.id } });
      } else {
        await returnBook.mutateAsync({ params: { bookRentalId: record.borrowedBook.id } });
      }
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

  // if (isLoading) return null; // 또는 로딩 UI

  return (
    <FlexContainer padding="1rem" fullWidth fullHeight>
      <TableContainer className='non-overflow-scroll' sx={{
        border: '1px solid #ddd',
        borderRadius: '0.25rem',
        overflowY: 'scroll',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell width="18%" align="center" sx={{ py: 1 }}><AppleTg>이름</AppleTg></TableCell>
              <TableCell width="17%" align="center" sx={{ py: 1 }}><AppleTg>출석</AppleTg></TableCell>
              <TableCell width="17%" align="center" sx={{ py: 1 }}><AppleTg>감상문</AppleTg></TableCell>
              <TableCell width="17%" align="center" sx={{ py: 1 }}><AppleTg>주간 레오</AppleTg></TableCell>
              <TableCell width="17%" align="center" sx={{ py: 1 }}><AppleTg>월간 레오</AppleTg></TableCell>
              <TableCell width="14%" align="center" sx={{ py: 1 }}>책 대여</TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{}}>
            {[...activityRecords, ...activityRecords, ...activityRecords, ...activityRecords, ...activityRecords, ...activityRecords].map((activityRecord) => (
              <TableRow key={activityRecord.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell align="center"><AppleTg sx={{fontSize: '0.9rem'}}><div>{activityRecord.student.name}</div><div>({activityRecord.student.schoolName.replace('초등학교', '초').replace('중학교', '중').replace('고등학교', '고')} {activityRecord.student.schoolGrade}학년)</div></AppleTg></TableCell>
                <TableCell align="center">
                  <ActivityRecordButton 
                    value={activityRecord.attendance} 
                    buttonTextOn={`출석${activityRecord.isMakeup ? ' (보강)' : ''}`} 
                    buttonTextOff={`${activityRecord.isMakeup ? '보강' : '출석'} 완료`}
                    onClick={() => handleActivityRecordButtonClick({
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
                    onClick={() => handleActivityRecordButtonClick({
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
                    onClick={() => handleActivityRecordButtonClick({
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
                    onClick={() => handleActivityRecordButtonClick({
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
                    buttonTextOff="반납하기"
                    onClick={() => handleBookRentalButtonClick(activityRecord)}
                    mainBgColor="white"
                    fontColor={!!activityRecord.borrowedBook ? 'white' : 'black'}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </FlexContainer>
  )
}

type ActivityRecordButtonProps = {
  value: boolean;
  buttonTextOn: string;
  buttonTextOff: string | React.ReactNode;
  onClick: () => void;
  mainBgColor?: string;
  fontColor?: string;
}
const ActivityRecordButton = ({ value, buttonTextOn, buttonTextOff, onClick, mainBgColor='primary', fontColor='white' }: ActivityRecordButtonProps) => {
  return (
    <Button 
      variant="contained" 
      size="small" 
      sx={{ width: '100%', backgroundColor: value ? 'grey.500' : mainBgColor, color: fontColor }} 
      onClick={onClick}
    >
      <AppleTg sx={{fontSize: '0.9rem'}}>{value ? buttonTextOff : buttonTextOn}</AppleTg>
    </Button>
  )
}