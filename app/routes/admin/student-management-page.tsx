import React from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useGlobalToast } from "~/providers/toast-provider";
import { StudentRegistrationForm } from "./student-registration-form";
import { FlexContainer, FlexBox } from "~/components/styled-elements";
import { AppleTg } from "~/components/typography";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Drawer, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TablePagination, Select, MenuItem } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { getStudentListForManagementApi, changeScheduleApi, cancelReservedScheduleApi } from "~/lib/api/students.api";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { StudentSearchFilter } from "../student/components/student-search-filter";
import { TABLE_STYLE, TABLE_CONTAINER_STYLE } from "~/constants/styles";
import { useScheduleList } from "../schedule/page";
import { formatTime12Hour, mapNumberToDayOfWeek } from "~/lib/utils/time.util";
import { FormSelect } from "~/components/form/form-components";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs, { type Dayjs } from "dayjs";
import { useConfirmModal } from "~/hooks/use-confirm-modal";
import { DrawerTitle } from "./components/drawer-title";

// --- Types ---
import type { StudentInManagement as Student, Schedule } from "~/constants/student.type";

type ScheduleForm = {
  scheduleDayOfWeek: number | undefined;
  scheduleId: number | undefined;
  dateForChange: Dayjs;
};

// --- API ---

const getStudentListApi = getStudentListForManagementApi;
export const studentListQueryKey = () => ['student-list'] as const;

// --- Constants ---

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50] as const;

const defaultScheduleForm = (): ScheduleForm => ({
  scheduleDayOfWeek: undefined,
  scheduleId: undefined,
  dateForChange: dayjs(),
});

const formatSchedule = (schedule: Schedule | undefined) => {
  if (!schedule) return null;
  return `${mapNumberToDayOfWeek(schedule.dayOfWeek)} ${formatTime12Hour(schedule.startTime)}-${formatTime12Hour(schedule.endTime)}`;
};

// --- Component ---

type PageProps = {
  registerOpen?: boolean;
  onRegisterClose?: () => void;
  showDeleted?: boolean;
};

export const StudentManagementPage = ({ registerOpen, onRegisterClose, showDeleted }: PageProps) => {
  const { error: showError, success: showSuccess } = useGlobalToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { scheduleList } = useScheduleList();

  // Search & Pagination (querystring 기반)
  const [searchParams, setSearchParams] = useSearchParams();
  const searchName = searchParams.get('name') || '';
  const searchSchoolLevel = searchParams.get('schoolLevel') ? Number(searchParams.get('schoolLevel')) : null;
  const searchDayOfWeek = searchParams.has('dayOfWeek') ? Number(searchParams.get('dayOfWeek')) : null;
  const page = Number(searchParams.get('page')) || 0; // 0-based (MUI TablePagination 기준)
  const rowsPerPage = Number(searchParams.get('limit')) || 20;
  const sort = searchParams.get('sort') || 'name-asc';

  const [inputName, setInputName] = React.useState(searchName);

  // querystring 업데이트 헬퍼 (page 자동 리셋)
  const updateParams = (updater: (p: URLSearchParams) => void) => {
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      updater(p);
      p.delete('page');
      return p;
    }, { replace: true });
  };
  const setPage = (p: number) => setSearchParams(prev => { const params = new URLSearchParams(prev); p > 0 ? params.set('page', String(p)) : params.delete('page'); return params; }, { replace: true });

  // 이름 검색 debounce
  const prevInputName = React.useRef(inputName);
  React.useEffect(() => {
    if (prevInputName.current === inputName) return;
    prevInputName.current = inputName;
    const timer = setTimeout(() => {
      updateParams(p => inputName ? p.set('name', inputName) : p.delete('name'));
    }, 700);
    return () => clearTimeout(timer);
  }, [inputName]);

  // Filter handlers
  const handleClearName = () => { setInputName(''); updateParams(p => p.delete('name')); };
  const handleDayOfWeekChange = (v: number | null) => updateParams(p => v !== null ? p.set('dayOfWeek', String(v)) : p.delete('dayOfWeek'));
  const handleSchoolLevelChange = (v: number | null) => updateParams(p => v !== null ? p.set('schoolLevel', String(v)) : p.delete('schoolLevel'));
  const handleRowsPerPageChange = (e: any) => updateParams(p => p.set('limit', e.target.value));

  // Data
  const { data: studentListData, isLoading } = useQuery({
    queryKey: [...studentListQueryKey(), page, rowsPerPage, searchName, searchSchoolLevel, searchDayOfWeek, showDeleted, sort],
    queryFn: () => getStudentListApi({
      query: {
        page: page + 1,
        limit: rowsPerPage,
        sort,
        ...(searchName && { name: searchName }),
        ...(searchSchoolLevel && { schoolLevel: searchSchoolLevel }),
        ...(searchDayOfWeek !== null && { dayOfWeek: searchDayOfWeek }),
        ...(!showDeleted && { status: 'active' }),
      },
    }),
    placeholderData: keepPreviousData,
  });
  const studentList = studentListData?.list ?? [];
  const totalCount = studentListData?.count ?? 0;

  // Drawer state (등록/편집)
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editData, setEditData] = React.useState<Student | null>(null);

  React.useEffect(() => {
    if (registerOpen) { setEditData(null); setDrawerOpen(true); }
  }, [registerOpen]);

  const openEditDrawer = (student: Student) => { setEditData(student); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setEditData(null); onRegisterClose?.(); };

  // Cancel reserved schedule
  const { ConfirmModal: CancelScheduleModal, openConfirmModal: openCancelScheduleModal, closeConfirmModal: closeCancelScheduleModal } = useConfirmModal();
  const handleCancelReservedSchedule = async () => {
    if (!editData?.scheduleReserved) return;
    try {
      await cancelReservedScheduleApi({ params: { reservedId: editData.scheduleReserved.id } });
      showSuccess('예약 스케줄이 취소되었습니다.');
      queryClient.invalidateQueries({ queryKey: studentListQueryKey() });
      closeCancelScheduleModal();
      closeDrawer();
    } catch {
      showError('예약 스케줄 취소 중 오류가 발생했습니다.');
    }
  };

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
        params: { studentId: scheduleDialogStudent.id },
        body: { scheduleId: scheduleForm.scheduleId, dateForChange: scheduleForm.dateForChange.format('YYYYMMDD') },
      });
      const isFuture = scheduleForm.dateForChange.isAfter(dayjs(), 'day');
      showSuccess(isFuture ? '스케줄 변경이 예약되었습니다.' : '스케줄이 변경되었습니다.');
      queryClient.invalidateQueries({ queryKey: studentListQueryKey() });
      closeScheduleDialog();
      closeDrawer();
    } catch {
      showError('스케줄 변경 중 오류가 발생했습니다.');
    }
  };

  // Render
  return (
    <FlexContainer>
      <FlexBox flexDirection="column" gap={1} fullWidth>
        {/* Search Filters */}
        <StudentSearchFilter
          inputName={inputName}
          onInputNameChange={setInputName}
          onClearName={handleClearName}
          dayOfWeek={searchDayOfWeek}
          onDayOfWeekChange={handleDayOfWeekChange}
          schoolLevel={searchSchoolLevel}
          onSchoolLevelChange={handleSchoolLevelChange}
          onReset={() => { setInputName(''); updateParams(p => { p.delete('name'); p.delete('dayOfWeek'); p.delete('schoolLevel'); }); }}
        >
          <FlexBox sx={{ marginLeft: 'auto' }} alignItems="center" gap={1}>
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[]}
              onRowsPerPageChange={() => {}}
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
              sx={{ '& .MuiTablePagination-displayedRows': { fontSize: '1rem' } }}
            />
            <Select size="small" value={sort} onChange={(e) => updateParams(p => p.set('sort', e.target.value))} sx={{ width: '9rem', textAlign: 'center', '& .MuiSelect-select': { py: '0.4rem' }, '& .MuiOutlinedInput-notchedOutline': { top: 0, legend: { display: 'none' } } }}>
              <MenuItem value="name-asc" sx={{ justifyContent: 'center' }}>이름순</MenuItem>
              <MenuItem value="registeredAt-asc" sx={{ justifyContent: 'center' }}>오래된 등록순</MenuItem>
              <MenuItem value="registeredAt-desc" sx={{ justifyContent: 'center' }}>최근 등록순</MenuItem>
            </Select>
            <Select size="small" value={rowsPerPage} onChange={handleRowsPerPageChange} sx={{ minWidth: '7rem', textAlign: 'center', '& .MuiSelect-select': { py: '0.4rem' }, '& .MuiOutlinedInput-notchedOutline': { top: 0, legend: { display: 'none' } } }}>
              {ROWS_PER_PAGE_OPTIONS.map(n => <MenuItem key={n} value={n} sx={{ justifyContent: 'center' }}>{n}개</MenuItem>)}
            </Select>
          </FlexBox>
        </StudentSearchFilter>

        {/* Table */}
        {isLoading ? (
          <AppleTg>로딩 중...</AppleTg>
        ) : (
          <>
            <TableContainer component={Paper} sx={TABLE_CONTAINER_STYLE}>
              <Table size="small" stickyHeader sx={TABLE_STYLE}>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" width="5%">#</TableCell>
                    <TableCell align="center" width="10%">이름</TableCell>
                    <TableCell align="center" width="12%">학교</TableCell>
                    <TableCell align="center" width="8%">학년</TableCell>
                    <TableCell align="center" width="15%">연락처</TableCell>
                    <TableCell align="center" width="15%">부모님 연락처</TableCell>
                    <TableCell align="center" width="18%">스케줄</TableCell>
                    <TableCell align="center" width="14%">날짜</TableCell>
                    <TableCell align="center" width="8%">편집</TableCell>
                    <TableCell align="center" width="8%">상세</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentList.map((student, index) => (
                    <TableRow key={student.id} sx={{ height: '4rem' }}>
                      <TableCell align="center">{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell align="center">{student.name}</TableCell>
                      <TableCell align="center">{student.schoolName ?? '-'}</TableCell>
                      <TableCell align="center">{student.schoolGrade ?? '-'}</TableCell>
                      <TableCell align="center">{student.phone && !student.phone.match(/^010-*$/) ? student.phone : '-'}</TableCell>
                      <TableCell align="center">{student.parentPhone && !student.parentPhone.match(/^010-*$/) ? student.parentPhone : '-'}</TableCell>
                      <TableCell align="center">
                        <FlexBox flexDirection="column" alignItems="center">
                          {student.schedule && <AppleTg sx={{ fontSize: '0.85rem' }}>{formatSchedule(student.schedule)}</AppleTg>}
                          {student.scheduleReserved && (
                            <AppleTg sx={{ fontSize: '0.85rem', color: 'red' }}>
                              {formatSchedule(student.scheduleReserved.schedule)}
                            </AppleTg>
                          )}
                        </FlexBox>
                      </TableCell>
                      <TableCell align="center">
                        <AppleTg sx={{ fontSize: '0.75rem' }}>등록일 {new Date(student.registeredAt).toLocaleDateString('ko-KR')}</AppleTg>
                        {student.deletedAt && (
                          <AppleTg sx={{ fontSize: '0.75rem', color: 'red' }}>휴원일 {new Date(student.deletedAt).toLocaleDateString('ko-KR')}</AppleTg>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton onClick={() => openEditDrawer(student)} sx={{ width: '4rem', borderRadius: '0.25rem' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton onClick={() => navigate(`/student/${student.id}`)} sx={{ width: '4rem', borderRadius: '0.25rem' }}>
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </FlexBox>

      {/* Edit/Register Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => {}} disableEnforceFocus>
        <FlexBox flexDirection="column" alignItems="center" gap={2} padding="2rem" width="25rem" sx={{ position: 'relative', height: '100%' }}>
          {/* 삭제된 항목: 오버레이로 편집 차단 (X 버튼만 zIndex로 클릭 가능) */}
          {editData?.deletedAt && <div style={{ position: 'absolute', inset: 0, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.5)' }} />}
          <DrawerTitle
            editData={editData}
            onEditSchedule={openScheduleDialog}
            onCancelReserved={openCancelScheduleModal}
            onClose={closeDrawer}
          />
          <StudentRegistrationForm
            showError={showError}
            showSuccess={showSuccess}
            editData={editData}
            onComplete={closeDrawer}
          />
        </FlexBox>
      </Drawer>

      {/* Schedule Change Dialog */}
      <Dialog open={!!scheduleDialogStudent} onClose={closeScheduleDialog} disableRestoreFocus>
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
              onChange={(date: Dayjs) => setScheduleForm(prev => ({ ...prev, dateForChange: date, scheduleDayOfWeek: date.day(), scheduleId: undefined }))}
              slotProps={{ day: (ownerState) => ({ sx: { ...(ownerState.day.day() === 0 && { color: 'red' }), ...(ownerState.day.day() === 6 && { color: 'blue' }) } }) }}
              sx={{ '& .MuiDayCalendar-weekDayLabel:first-of-type': { color: 'red' }, '& .MuiDayCalendar-weekDayLabel:last-of-type': { color: 'blue' } }}
            />
          </FlexBox>
        </DialogContent>
        <DialogActions sx={{ pb: 3, justifyContent: 'center', gap: 1 }}>
          <Button onClick={closeScheduleDialog} variant="outlined" sx={{ minWidth: '7rem' }}><AppleTg>취소</AppleTg></Button>
          <Button variant="contained" disabled={!scheduleForm.scheduleId} onClick={handleScheduleChange} sx={{ minWidth: '7rem' }}>
            <AppleTg>변경</AppleTg>
          </Button>
        </DialogActions>
      </Dialog>

      <CancelScheduleModal onConfirm={handleCancelReservedSchedule} bodyText="예약된 스케줄 변경을 취소하시겠습니까?" />
    </FlexContainer>
  );
};
