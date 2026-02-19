import React from "react";
import { useLoaderData } from "react-router";
import dayjs from "dayjs";
import type { SchoolLevel } from "~/constants/type";
import { buildApi } from "~/lib/api-builder";
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Button } from "@mui/material";
import { FlexContainer } from "~/components/styled-elements";
import { AppleTg } from "~/components/typography";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
 */
type DailyActivityRecordType = {
  id: number;
  student: StudentInActivityDto;
  date: string;
  isMakeup: boolean;  
  attendance: boolean;  
  report1: boolean;   
  report2: boolean;  
};

const getDailyActivityRecords = buildApi<DailyActivityRecordType[]>({ path: '/activities', method: 'GET' });

const dailyActivityRecordsQueryKey = (scheduleId: string, date: string | null) =>
  ['dailyActivityRecords', scheduleId, date] as const;

export const clientLoader = async ({ params, request }: { params: { scheduleId: string }; request: Request }) => {
  const date = new URL(request.url).searchParams.get('date') ?? dayjs().format('YYYYMMDD'); // YYYYMMDD
  return { scheduleId: params.scheduleId, date };
}

const updateDailyActivityRecordApi = buildApi<DailyActivityRecordType>({ path: '/activities/:activityId', method: 'PATCH' });

export default function StudentActivityRecords() {
  const queryClient = useQueryClient();
  const { scheduleId, date } = useLoaderData<typeof clientLoader>();
  const toast = useGlobalToast();

  const isAfterToday = React.useMemo(() => dayjs().isBefore(dayjs(date), 'date'), [date]); // 미래 여부
  const [updating, setUpdating] = React.useState(false);
  
  const { data: activityRecords = [], isLoading } = useQuery({
    queryKey: dailyActivityRecordsQueryKey(scheduleId, date),
    queryFn: () => getDailyActivityRecords({ query: { scheduleId, date } }),
    enabled: !!scheduleId && !!date,
  });

  const updateDailyActivityRecord = useMutation({
    mutationFn: updateDailyActivityRecordApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dailyActivityRecordsQueryKey(scheduleId, date) });
    },
  });

  const handleActivityRecordButtonClick = async ({activityId, activityKey, value}: {activityId: number; activityKey: 'attendance' | 'report1' | 'report2'; value: boolean}) => {
    if (updating ) return;
    if (isAfterToday) return toast.info('미래의 날짜는 활동을 업데이트할 수 없습니다.');
    
    setUpdating(true);
    try {
      const body = { activityKey: activityKey, activityValue: value };
      await updateDailyActivityRecord.mutateAsync({ params: { activityId }, body });
    } catch (error) {
      console.error(error);
      toast.error(error.status >= 500 ? 
        `서버에 문제가 발생했습니다.(${error.message})` : 
        '출석 기록 업데이트에 실패했습니다.'
      );
    } finally {
      setUpdating(false);
    }
  }

  // if (isLoading) return null; // 또는 로딩 UI

  return (
    <FlexContainer padding="1rem">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="20%" align="center"><AppleTg>이름</AppleTg></TableCell>
              <TableCell width="20%" align="center"><AppleTg>출석</AppleTg></TableCell>
              <TableCell width="20%" align="center"><AppleTg>감상문</AppleTg></TableCell>
              <TableCell width="20%" align="center"><AppleTg>주간 레오</AppleTg></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activityRecords.map((activityRecord) => (
              <TableRow key={activityRecord.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell align="center"><AppleTg sx={{fontSize: '0.9rem'}}>{activityRecord.student.name} ({activityRecord.student.schoolName} {activityRecord.student.schoolGrade}학년)</AppleTg></TableCell>
                <TableCell align="center">
                  <ActivityRecordButton 
                    value={activityRecord.attendance} 
                    buttonTextOn="출석" 
                    buttonTextOff="출석 완료" 
                    onClick={() => handleActivityRecordButtonClick({activityId: activityRecord.id, activityKey: 'attendance', value: !activityRecord.attendance})} 
                  />
                </TableCell>
                <TableCell align="center">
                  <ActivityRecordButton 
                    value={activityRecord.report1} 
                    buttonTextOn="제출" 
                    buttonTextOff="제출 완료" 
                    onClick={() => handleActivityRecordButtonClick({activityId: activityRecord.id, activityKey: 'report1', value: !activityRecord.report1})} 
                  />
                </TableCell>
                <TableCell align="center">
                  <ActivityRecordButton 
                    value={activityRecord.report2} 
                    buttonTextOn="제출" 
                    buttonTextOff="제출 완료" 
                    onClick={() => handleActivityRecordButtonClick({activityId: activityRecord.id, activityKey: 'report2', value: !activityRecord.report2})} 
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
  buttonTextOff: string;
  onClick: () => void;
}
const ActivityRecordButton = ({ value, buttonTextOn, buttonTextOff, onClick }: ActivityRecordButtonProps) => {
  return (
    <Button 
      variant="contained" 
      size="small" 
      sx={{ width: '50%', backgroundColor: value ? 'grey.500' : 'primary' }} 
      onClick={onClick}
    >
      <AppleTg sx={{fontSize: '0.9rem'}}>
        {value ? buttonTextOff : buttonTextOn}
      </AppleTg>
    </Button>
  )
}