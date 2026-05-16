import React from "react";
import { useGlobalToast } from "~/providers/toast-provider";
import { StudentRegistrationForm } from "./student-registration-form";
import { FlexContainer, FlexBox } from "~/components/styled-elements";
import { AppleTg } from "~/components/typography";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Drawer, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { buildApi } from "~/lib/api-builder";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useScheduleList } from "../schedule/page";
import { formatTime12Hour, mapNumberToDayOfWeek } from "~/lib/utils/time.util";
import { FormSelect } from "./components/form-components";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs, { type Dayjs } from "dayjs";

type Student = {
  id: string;
  name: string;
  schoolName: string;
  schoolGrade: number;
  phone: string;
  parentPhone: string;
  scheduleId: number;
  schedule?: { id: number; dayOfWeek: number; startTime: string; endTime: string };
};

const getStudentListApi = buildApi<{ list: Student[]; count: number }>({ path: '/students', method: 'GET' });
const changeScheduleApi = buildApi({ path: '/students/:studentId/schedules/:scheduleId', method: 'PATCH' });  // body: {dateForChange: string // YYYYMMDD}
export const studentListQueryKey = () => ['student-list'] as const;

export const StudentManagementPage = () => {
  const { error: showError, success: showSuccess } = useGlobalToast();
  const { data: studentListData, isLoading } = useQuery({
    queryKey: studentListQueryKey(),
    queryFn: () => getStudentListApi({query: {
        page: 1,
        limit: 20
    }}),
  });
  const studentList = React.useMemo(() => studentListData?.list || [], [studentListData]);

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editData, setEditData] = React.useState<Student | null>(null);
  const [scheduleDialogStudent, setScheduleDialogStudent] = React.useState<Student | null>(null);
  const [scheduleForm, setScheduleForm] = React.useState<{ scheduleDayOfWeek: any; scheduleId: any; dateForChange: Dayjs | null }>({ scheduleDayOfWeek: undefined, scheduleId: undefined, dateForChange: dayjs() });
  const queryClient = useQueryClient();
  const { scheduleList } = useScheduleList();

  const handleOpenRegister = () => {
    setEditData(null);
    setDrawerOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditData(student);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setEditData(null);
  };

  const handleOpenScheduleDialog = (student: Student) => {
    setScheduleDialogStudent(student);
    setScheduleForm({ scheduleDayOfWeek: undefined, scheduleId: undefined, dateForChange: dayjs() });
  };

  const handleScheduleSelect = (e: any, name: string) => {
    const copied = { ...scheduleForm };
    copied[name] = e.target.value;
    if (name === 'scheduleDayOfWeek') copied.scheduleId = undefined;
    setScheduleForm(copied);
  };

  const handleScheduleChange = async () => {
    if (!scheduleForm.scheduleId || !scheduleForm.dateForChange || !scheduleDialogStudent) return;
    try {
      await changeScheduleApi({
        params: { studentId: scheduleDialogStudent.id, scheduleId: scheduleForm.scheduleId },
        body: { dateForChange: scheduleForm.dateForChange.format('YYYYMMDD') },
      });
      showSuccess(scheduleForm.dateForChange.isAfter(dayjs(), 'day') ? '스케줄 변경이 예약되었습니다.' : '스케줄이 변경되었습니다.');
      queryClient.invalidateQueries({ queryKey: studentListQueryKey() });
      setScheduleDialogStudent(null);
    } catch {
      showError('스케줄 변경 중 오류가 발생했습니다.');
    }
  };

  return (
    <FlexContainer>
      <FlexBox flexDirection="column" gap={2} fullWidth>
        <FlexBox justifyContent="space-between" alignItems="center" fullWidth>
          <AppleTg>학생 목록</AppleTg>
          <Button variant="contained" size="small" onClick={handleOpenRegister}>
            <AppleTg>학생 등록</AppleTg>
          </Button>
        </FlexBox>
        {isLoading ? (
          <AppleTg>로딩 중...</AppleTg>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>이름</TableCell>
                  <TableCell>학교</TableCell>
                  <TableCell>학년</TableCell>
                  <TableCell>연락처</TableCell>
                  <TableCell>부모님 연락처</TableCell>
                  <TableCell align="center">스케줄</TableCell>
                  <TableCell align="center">편집</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studentList.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.schoolName}</TableCell>
                    <TableCell>{student.schoolGrade}</TableCell>
                    <TableCell>{student.phone}</TableCell>
                    <TableCell>{student.parentPhone}</TableCell>
                    <TableCell align="center">
                      {student.schedule && (
                        <AppleTg variant="caption">
                          {mapNumberToDayOfWeek(student.schedule.dayOfWeek)} {formatTime12Hour(student.schedule.startTime)}-{formatTime12Hour(student.schedule.endTime)}
                        </AppleTg>
                      )}
                      <Button size="small" onClick={() => handleOpenScheduleDialog(student)}>
                        <AppleTg variant="caption">변경</AppleTg>
                      </Button>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleOpenEdit(student)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </FlexBox>

      <Drawer anchor="right" open={drawerOpen} onClose={() => {}}>
        <FlexBox flexDirection="column" gap={2} padding="2rem" width="400px">
          <FlexBox justifyContent="space-between" alignItems="center" fullWidth>
            <AppleTg>{editData ? '학생 수정' : '학생 등록'}</AppleTg>
            <IconButton onClick={handleDrawerClose}>
              <CloseIcon />
            </IconButton>
          </FlexBox>
          <StudentRegistrationForm
            showError={showError}
            showSuccess={showSuccess}
            editData={editData}
            onComplete={handleDrawerClose}
          />
        </FlexBox>
      </Drawer>

      <Dialog open={!!scheduleDialogStudent} onClose={() => setScheduleDialogStudent(null)}>
        <DialogTitle>스케줄 변경 - {scheduleDialogStudent?.name}</DialogTitle>
        <DialogContent>
          <FlexBox flexDirection="column" gap={1} padding="1rem 0 0 0">
            <FormSelect
              value={[scheduleForm.scheduleDayOfWeek, scheduleForm.scheduleId]}
              onChange={handleScheduleSelect}
              items={[
                {
                  id: 'scheduleDayOfWeek',
                  placeholder: '수업 요일',
                  options: Array.from({ length: 7 }, (_, i) => i).map(num => ({
                    value: num,
                    label: mapNumberToDayOfWeek(num),
                  })),
                },
                {
                  id: 'scheduleId',
                  placeholder: '수업 시간',
                  options: (scheduleList || [])
                    .filter(s => s.dayOfWeek === scheduleForm.scheduleDayOfWeek)
                    .map(s => ({
                      value: s.id,
                      label: formatTime12Hour(s.startTime) + ' - ' + formatTime12Hour(s.endTime),
                    })),
                },
              ]}
            />
            <DateCalendar
              value={scheduleForm.dateForChange}
              onChange={(date: Dayjs) => setScheduleForm({ ...scheduleForm, dateForChange: date })}
            />
          </FlexBox>
        </DialogContent>
        <DialogActions sx={{ pb: 3 }}>
          <Button onClick={() => setScheduleDialogStudent(null)}><AppleTg>취소</AppleTg></Button>
          <Button variant="contained" disabled={!scheduleForm.scheduleId || !scheduleForm.dateForChange} onClick={handleScheduleChange}><AppleTg>변경</AppleTg></Button>
        </DialogActions>
      </Dialog>
    </FlexContainer>
  );
};
