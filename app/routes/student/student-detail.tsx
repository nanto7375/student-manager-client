import React from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLoaderData, useSearchParams } from "react-router";
import { Tab, Button } from "@mui/material";
import { AppTabs } from "~/components/app-tabs";

import { getStudentApi, createNoteApi, updateNoteApi, toggleNoteStatusApi } from "~/lib/api/students.api";
import { mapNumberToDayOfWeek } from "~/lib/utils/time.util";
import { FlexBox, FlexContainer } from "~/components/styled-elements";
import { AppleTg } from "~/components/typography";
import { useGlobalToast } from "~/providers/toast-provider";
import { MakeupScheduleDialog } from "~/components/makeup-schedule-dialog";
import { auth } from "~/lib/auth";
import { RecordNoteList } from "./components/record-note-list";
import { MemoNoteList } from "./components/memo-note-list";
import { ActivityRecordTab } from "./components/activity-record-tab";

import type { StudentNote as Note, NoteType } from "~/constants/student.type";
export type { Note, NoteType };
const studentQueryKey = (studentId: string) => ['student', studentId] as const;

const INFO_POPUP_SX = {
  position: 'absolute',
  top: '100%',
  marginTop: '0.5rem',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 10,
  backgroundColor: 'white',
  border: '1px solid #e0e0e0',
  borderRadius: '0.5rem',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  padding: '0.75rem 1.25rem',
  color: '#555',
  whiteSpace: 'nowrap',
} as const;

const MEMO_SIDEBAR_SX = {
  flex: 1,
  overflowY: 'hidden',
  height: 'calc(100% - 0.25rem)',
  backgroundColor: '#f9f9f9',
  backgroundImage: 'radial-gradient(circle, #ddd 1px, transparent 1px)',
  backgroundSize: '12px 12px',
  borderRadius: '0.5rem',
  border: '1px solid #e0e0e0',
  padding: '0.75rem',
  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
} as const;

export const clientLoader = async ({ params }: { params: { studentId: string } }) => {
  return { studentId: params.studentId };
}

export default function StudentDetail() {
  const { studentId } = useLoaderData<typeof clientLoader>();
  const queryClient = useQueryClient();
  const toast = useGlobalToast();

  const {data: student, error: studentDetailError, isLoading: studentDetailLoading } = useQuery({
    queryKey: studentQueryKey(studentId),
    queryFn: () => getStudentApi({ params: { studentId } }),
    enabled: !!studentId,
    placeholderData: keepPreviousData,
  });

  const notes = React.useMemo(() => {
    return student?.notes || [];
  }, [student]);

  const [infoOpen, setInfoOpen] = React.useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTab = (searchParams.get('tab') as 'assessment' | 'parent-counseling' | 'activity') || 'assessment';

  const createNote = async ({value, type}: {value: string, type: NoteType}) => {
    try {
      const note = await createNoteApi({ params: { studentId }, body: { value, type } });
      queryClient.invalidateQueries({ queryKey: studentQueryKey(studentId) });
      return note;
    } catch (e) {
      console.error(e);
      toast.error('기록 추가에 실패했습니다.');
    }
  }

  const updateNote = async ({id, value}: {id: number, value: string}) => {
    try {
      await updateNoteApi({ params: { studentId, noteId: id }, body: { value } });
      queryClient.invalidateQueries({ queryKey: studentQueryKey(studentId) });
    } catch (e) {
      console.error(e);
      toast.error('기록 수정에 실패했습니다.');
    }
  }

  const deleteNote = React.useCallback(async (noteId: number) => {
    try {
      await toggleNoteStatusApi({params: {studentId, noteId}});
      queryClient.invalidateQueries({ queryKey: studentQueryKey(studentId) });
    } catch (e) {
      console.error(e);
      toast.error('기록 삭제에 실패했습니다.');
    }
  }, [studentId])

  // 메모 상태 토글: invalidate 없이 API만 호출 (화면에 체크 상태로 유지)
  const toggleMemoNoteStatus = React.useCallback(async (noteId: number) => {
    try {
      await toggleNoteStatusApi({params: {studentId, noteId}});
    } catch (e) {
      console.error(e);
      toast.error('메모 상태 변경에 실패했습니다.');
    }
  }, [studentId])

  // 보강 추가
  const [makeupOpen, setMakeupOpen] = React.useState(false);

  if (studentDetailError || studentDetailLoading) return <FlexContainer padding="1rem" fullHeight fullWidth center></FlexContainer>;

  return (
    <FlexContainer fullHeight fullWidth sx={{ flexDirection: 'column' }} style={{overflowX: 'auto'}}>
        <FlexBox
          fullWidth
          padding="1rem 1rem 0 0"
          sx={{ position: 'relative', justifyContent: 'center' }}
        >
          {/* 학생 기본 정보 */}
          <FlexBox alignItems="flex-end" sx={{ gap: '0.5rem', cursor: 'pointer', width: 'fit-content' }} onClick={() => setInfoOpen(!infoOpen)}>
            <FlexBox sx={{fontWeight: 'bold', fontSize: '1.5rem'}}>{student.name}</FlexBox>
            {(student.schoolName || student.schoolGrade) && <FlexBox sx={{ color: '#666' }}>{student.schoolName} {student.schoolGrade && `${student.schoolGrade}학년`}</FlexBox>}

            {student.schedule && (
              <FlexBox sx={{ color: '#555', fontSize: '0.85rem' }}>
                📅 {mapNumberToDayOfWeek(student.schedule.dayOfWeek)} {student.schedule.startTime.slice(0,2)}:{student.schedule.startTime.slice(2)}-{student.schedule.endTime.slice(0,2)}:{student.schedule.endTime.slice(2)}
                {student.scheduleReserved && <span style={{ color: 'red' }}> → {mapNumberToDayOfWeek(student.scheduleReserved.schedule.dayOfWeek)} {student.scheduleReserved.schedule.startTime.slice(0,2)}:{student.scheduleReserved.schedule.startTime.slice(2)}-{student.scheduleReserved.schedule.endTime.slice(0,2)}:{student.scheduleReserved.schedule.endTime.slice(2)}</span>}
              </FlexBox>
            )}
          </FlexBox>
          {infoOpen && (
            <FlexBox
              gap={2}
              alignItems="center"
              sx={INFO_POPUP_SX}
            >
              {student.birthYear && <AppleTg sx={{ fontSize: '0.85rem' }}>{student.birthYear}년생 {student.birthDate ? `${student.birthDate.slice(0,2)}/${student.birthDate.slice(2)}` : ''}</AppleTg>}
              {student.phone && <AppleTg sx={{ fontSize: '0.85rem' }}>📱 {student.phone}</AppleTg>}
              {student.parentPhone && <AppleTg sx={{ fontSize: '0.85rem' }}>📞 {student.parentPhone}</AppleTg>}
            </FlexBox>
          )}
        </FlexBox>
      
      <FlexBox fullHeight fullWidth style={{paddingLeft: '1rem', paddingRight: '0.5rem', overflowY: 'hidden', overflowX: 'auto', marginTop: '1rem'}}>
        <FlexBox gap={1.5} fullHeight style={{margin: '0 auto', minWidth: '50rem', maxWidth: '95rem', width: '100%'}}>
          <FlexBox maxWidth="60rem" minWidth="30rem" fullHeight style={{width: '70%'}} flexDirection="column">
            <AppTabs
              value={selectedTab}
              onChange={(_, newValue) => setSearchParams({ tab: newValue }, { replace: true })}
              sx={{ mb: 1 }}
            >
              <Tab label="학생 기록" value="assessment" sx={{ fontSize: '1rem' }} />
              <Tab label="상담 기록" value="parent-counseling" sx={{ fontSize: '1rem' }} />
              <Tab label="활동 기록" value="activity" sx={{ fontSize: '1rem' }} />
            </AppTabs>
            {selectedTab !== 'activity' ? (
              <RecordNoteList
                createNote={createNote}
                updateNote={updateNote}
                deleteNote={deleteNote}
                notes={notes}
                selectedTab={selectedTab}
                disabled={!!student.deletedAt}
              />
            ) : (
              <ActivityRecordTab studentId={studentId} />
            )}
          </FlexBox>

          <FlexBox maxWidth="35rem" minWidth="25rem" flexDirection="column" sx={MEMO_SIDEBAR_SX}>
            {(auth.getMyInfo()?.level ?? 0) >= 3 && <Button onClick={() => setMakeupOpen(true)} sx={{ mt: 1, mb: 3, width: '100%', height: '3.5rem', backgroundColor: 'white', border: '1px solid #ddd', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', borderRadius: '0.5rem', color: '#666', '&:hover': { backgroundColor: '#fafafa', boxShadow: '0 3px 6px rgba(0,0,0,0.12)' } }}>
              보강 추가
            </Button>}
            <MemoNoteList 
              notes={notes} 
              createNote={createNote} 
              deleteNote={deleteNote}
              toggleMemoNoteStatus={toggleMemoNoteStatus}
              disabled={!!student.deletedAt}
            />
          </FlexBox>
        </FlexBox>
      </FlexBox>
      <MakeupScheduleDialog open={makeupOpen} onClose={() => setMakeupOpen(false)} studentId={studentId} />
    </FlexContainer>
  );
}