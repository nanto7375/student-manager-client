import React from "react";
import { useGlobalToast } from "~/providers/toast-provider";
import { StudentRegistrationForm } from "./student-registration-form";
import { FlexContainer, FlexBox } from "~/components/styled-elements";
import { AppleTg } from "~/components/typography";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Drawer, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TablePagination, Select, MenuItem } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { buildApi } from "~/lib/api-builder";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { StudentSearchFilter } from "../student/components/student-search-filter";
import { useScheduleList } from "../schedule/page";
import { formatTime12Hour, mapNumberToDayOfWeek } from "~/lib/utils/time.util";
import { FormSelect } from "./components/form-components";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs, { type Dayjs } from "dayjs";

// --- Types ---

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

type ScheduleForm = {
  scheduleDayOfWeek: number | undefined;
  scheduleId: number | undefined;
  dateForChange: Dayjs;
};

// --- API ---

const getStudentListApi = buildApi<{ list: Student[]; count: number }>({ path: '/students', method: 'GET' });
const changeScheduleApi = buildApi({ path: '/students/:studentId/schedules/:scheduleId', method: 'PATCH' }); // body: {dateForChange: string // YYYYMMDD}
export const studentListQueryKey = () => ['student-list'] as const;

// --- Constants ---

const STUDENT_TABLE_COLUMNS = ['이름', '학교', '학년', '연락처', '부모님 연락처'] as const;
const ROWS_PER_PAGE_OPTIONS = [10, 20, 50] as const;

const defaultScheduleForm = (): ScheduleForm => ({
  scheduleDayOfWeek: undefined,
  scheduleId: undefined,
  dateForChange: dayjs(),
});

const formatSchedule = (schedule: Student['schedule']) => {
  if (!schedule) return null;
  return `${mapNumberToDayOfWeek(schedule.dayOfWeek)} ${formatTime12Hour(schedule.startTime)}-${formatTime12Hour(schedule.endTime)}`;
};

// --- Component ---

export const StudentManagementPage = () => {
  const { error: showError, success: showSuccess } = useGlobalToast();
  const queryClient = useQueryClient();
  const { scheduleList } = useScheduleList();

  // Search & Pagination
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(20);
  const [inputName, setInputName] = React.useState('');
  const [searchName, setSearchName] = React.useState('');
  const [searchSchoolLevel, setSearchSchoolLevel] = React.useState<number | null>(null);
  const [searchDayOfWeek, setSearchDayOfWeek] = React.useState<number | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => { setSearchName(inputName); setPage(0); }, 700);
    return () => clearTimeout(timer);
  }, [inputName]);

  // Data
  const { data: studentListData, isLoading } = useQuery({
    queryKey: [...studentListQueryKey(), page, rowsPerPage, searchName, searchSchoolLevel, searchDayOfWeek],
    queryFn: () => getStudentListApi({
      query: {
        page: page + 1,
        limit: rowsPerPage,
        ...(searchName && { name: searchName }),
        ...(searchSchoolLevel && { schoolLevel: searchSchoolLevel }),
        ...(searchDayOfWeek !== null && { dayOfWeek: searchDayOfWeek }),
      },
    }),
  });
  const studentList = studentListData?.list ?? [];
  const totalCount = studentListData?.count ?? 0;

  // Drawer state (등록/편집)
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editData, setEditData] = React.useState<Student | null>(null);

  const openRegisterDrawer = () => { setEditData(null); setDrawerOpen(true); };
  const openEditDrawer = (student: Student) => { setEditData(student); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setEditData(null); };

  // Schedule change dialog
  const [scheduleDialogStudent, setScheduleDialogStudent] = React.useState<Student | null>(null);
  const [scheduleForm, setScheduleForm] = React.useState<ScheduleForm>(defaultScheduleForm());

  const openScheduleDialog = (student: Student) => {
    setScheduleDialogStudent(student);
    setScheduleForm(defaultScheduleForm());
  };
  const closeScheduleDialog = () => setScheduleDialogStudent(null);

  const handleScheduleSelect = (e: any, name: string) => {
    setScheduleForm(prev => ({
      ...prev,
      [name]: e.target.value,
      ...(name === 'scheduleDayOfWeek' && { scheduleId: undefined }),
    }));
  };

  const handleScheduleChange = async () => {
    if (!scheduleForm.scheduleId || !scheduleDialogStudent) return;
    try {
      await changeScheduleApi({
        params: { studentId: scheduleDialogStudent.id, scheduleId: scheduleForm.scheduleId },
        body: { dateForChange: scheduleForm.dateForChange.format('YYYYMMDD') },
      });
      const isFuture = scheduleForm.dateForChange.isAfter(dayjs(), 'day');
      showSuccess(isFuture ? '스케줄 변경이 예약되었습니다.' : '스케줄이 변경되었습니다.');
      queryClient.invalidateQueries({ queryKey: studentListQueryKey() });
      closeScheduleDialog();
    } catch {
      showError('스케줄 변경 중 오류가 발생했습니다.');
    }
  };

  // Search handlers
  const resetPage = () => setPage(0);
  const handleClearName = () => { setInputName(''); setSearchName(''); resetPage(); };
  const handleDayOfWeekChange = (v: number | null) => { setSearchDayOfWeek(v); resetPage(); };
  const handleSchoolLevelChange = (v: number | null) => { setSearchSchoolLevel(v); resetPage(); };
  const handleRowsPerPageChange = (e: any) => { setRowsPerPage(Number(e.target.value)); resetPage(); };

  // Render
  return (
    <FlexContainer>
      <FlexBox flexDirection="column" gap={2} fullWidth>
        {/* Search Filters */}
        <StudentSearchFilter
          inputName={inputName}
          onInputNameChange={setInputName}
          onClearName={handleClearName}
          dayOfWeek={searchDayOfWeek}
          onDayOfWeekChange={handleDayOfWeekChange}
          schoolLevel={searchSchoolLevel}
          onSchoolLevelChange={handleSchoolLevelChange}
        >
          <FlexBox sx={{ marginLeft: 'auto' }}>
            <Select size="small" value={rowsPerPage} onChange={handleRowsPerPageChange} sx={{ '& .MuiOutlinedInput-notchedOutline legend': { display: 'none' } }}>
              {ROWS_PER_PAGE_OPTIONS.map(n => <MenuItem key={n} value={n}>{n}개</MenuItem>)}
            </Select>
          </FlexBox>
        </StudentSearchFilter>

        {/* Table */}
        {isLoading ? (
          <AppleTg>로딩 중...</AppleTg>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {STUDENT_TABLE_COLUMNS.map(col => <TableCell key={col}>{col}</TableCell>)}
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
                        {student.schedule && <AppleTg variant="caption">{formatSchedule(student.schedule)}</AppleTg>}
                        <Button size="small" onClick={() => openScheduleDialog(student)}>
                          <AppleTg variant="caption">변경</AppleTg>
                        </Button>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => openEditDrawer(student)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination + Register */}
            <FlexBox alignItems="center" justifyContent="center" fullWidth sx={{ position: 'relative', mt: -1 }}>
              <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[]}
                onRowsPerPageChange={() => {}}
              />
              <Button variant="contained" size="small" onClick={openRegisterDrawer} sx={{ position: 'absolute', right: 0, py: 1.2 }}>
                <AppleTg>학생 등록</AppleTg>
              </Button>
            </FlexBox>
          </>
        )}
      </FlexBox>

      {/* Edit/Register Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => {}}>
        <FlexBox flexDirection="column" gap={2} padding="2rem" width="400px">
          <FlexBox justifyContent="space-between" alignItems="center" fullWidth>
            <AppleTg>{editData ? '학생 수정' : '학생 등록'}</AppleTg>
            <IconButton onClick={closeDrawer}>
              <CloseIcon />
            </IconButton>
          </FlexBox>
          <StudentRegistrationForm
            showError={showError}
            showSuccess={showSuccess}
            editData={editData}
            onComplete={closeDrawer}
          />
        </FlexBox>
      </Drawer>

      {/* Schedule Change Dialog */}
      <Dialog open={!!scheduleDialogStudent} onClose={closeScheduleDialog}>
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
                  options: Array.from({ length: 7 }, (_, i) => ({ value: i, label: mapNumberToDayOfWeek(i) })),
                },
                {
                  id: 'scheduleId',
                  placeholder: '수업 시간',
                  options: (scheduleList ?? [])
                    .filter(s => s.dayOfWeek === scheduleForm.scheduleDayOfWeek)
                    .map(s => ({ value: s.id, label: `${formatTime12Hour(s.startTime)} - ${formatTime12Hour(s.endTime)}` })),
                },
              ]}
            />
            <DateCalendar
              value={scheduleForm.dateForChange}
              onChange={(date: Dayjs) => setScheduleForm(prev => ({ ...prev, dateForChange: date }))}
            />
          </FlexBox>
        </DialogContent>
        <DialogActions sx={{ pb: 3 }}>
          <Button onClick={closeScheduleDialog}><AppleTg>취소</AppleTg></Button>
          <Button variant="contained" disabled={!scheduleForm.scheduleId} onClick={handleScheduleChange}>
            <AppleTg>변경</AppleTg>
          </Button>
        </DialogActions>
      </Dialog>
    </FlexContainer>
  );
};
