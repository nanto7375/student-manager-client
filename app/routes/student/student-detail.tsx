import React from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLoaderData, useSearchParams } from "react-router";
import { Tab } from "@mui/material";
import { AppTabs } from "~/components/app-tabs";

import { buildApi } from "~/lib/api-builder";
import { FlexBox, FlexContainer } from "~/components/styled-elements";
import { AppleTg } from "~/components/typography";
import type { ShortAdminDto } from "../admin/page";
import { RecordNoteList } from "./components/record-note-list";
import { MemoNoteList } from "./components/memo-note-list";

type StudentInListType = {
  id: number;
  birthDate: string;
  birthYear: string;
  name: string;
  schoolGrade: number;
  schoolLevel: number;
  schoolName: string;
  phone: string;
  parentPhone: string;
  schedule: { id: number; dayOfWeek: number; startTime: string; endTime: string };
  reservedSchedule?: { id: number; schedule: { id: number; dayOfWeek: number; startTime: string; endTime: string }; date: string };
  notes: Note[];
}

export type NoteType = 'note' | 'parent-counseling' | 'fixed-memo' | 'temporary-memo';

export type Note = {
  id: number;
  value: string;
  type: NoteType;
  lastCommenter: ShortAdminDto;
  createdAt: Date;
  updatedAt: Date;
}

const getStudentApi = buildApi<StudentInListType>({ path: '/students/:studentId', method: 'GET' });
const createNoteApi = buildApi<Note>({ path: '/students/:studentId/notes', method: 'POST' });
const updateNoteApi = buildApi<Note>({ path: '/students/:studentId/notes/:noteId', method: 'PATCH' });
const deleteNoteApi = buildApi<boolean>({path: '/students/:studentId/notes/:noteId', method: 'DELETE'});

const studentQueryKey = (studentId: string) => ['student', studentId] as const;

export const clientLoader = async ({ params }: { params: { studentId: string } }) => {
  return { studentId: params.studentId };
}

export default function StudentDetail() {
  const { studentId } = useLoaderData<typeof clientLoader>();
  const queryClient = useQueryClient();

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
  const selectedTab = (searchParams.get('tab') as 'assessment' | 'parent-counseling') || 'assessment';

  const createNote = async ({value, type}: {value: string, type: NoteType}) => {
    const note = await createNoteApi({ 
      params: { studentId }, 
      body: { value, type } 
    });
    queryClient.invalidateQueries({ queryKey: studentQueryKey(studentId) })
    return note;
  }

  const updateNote = async ({id, value}: {id: number, value: string}) => {
    await updateNoteApi({ 
      params: { studentId, noteId: id }, 
      body: { value } 
    });
    queryClient.invalidateQueries({ queryKey: studentQueryKey(studentId) })
  }

  const deleteNote = React.useCallback(async (noteId: number) => {
    await deleteNoteApi({params: {studentId, noteId}});
    queryClient.invalidateQueries({ queryKey: studentQueryKey(studentId) })
  }, [studentId])

  if (studentDetailError || studentDetailLoading) return <FlexContainer padding="1rem" fullHeight fullWidth center></FlexContainer>;

  const schoolLevelLabel = student.schoolLevel === 1 ? '초등' : student.schoolLevel === 2 ? '중등' : '고등';

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
            <FlexBox sx={{ color: '#666' }}>{student.schoolName} {student.schoolGrade}학년</FlexBox>
            <FlexBox sx={{ color: '#666' }}>({schoolLevelLabel})</FlexBox>
          </FlexBox>
          {infoOpen && (
            <FlexBox
              gap={2}
              alignItems="center"
              sx={{
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
              }}
            >
              {student.birthYear && <AppleTg>{student.birthYear}년생 {student.birthDate ? `${student.birthDate.slice(0,2)}/${student.birthDate.slice(2)}` : ''}</AppleTg>}
              {student.schedule && <AppleTg>📅 {student.schedule.startTime.slice(0,2)}:{student.schedule.startTime.slice(2)}-{student.schedule.endTime.slice(0,2)}:{student.schedule.endTime.slice(2)}</AppleTg>}
              {student.reservedSchedule && <AppleTg sx={{ color: 'red' }}>예약 {student.reservedSchedule.schedule.startTime.slice(0,2)}:{student.reservedSchedule.schedule.startTime.slice(2)}-{student.reservedSchedule.schedule.endTime.slice(0,2)}:{student.reservedSchedule.schedule.endTime.slice(2)}</AppleTg>}
              {student.phone && <AppleTg>📱 {student.phone}</AppleTg>}
              {student.parentPhone && <AppleTg>📞 {student.parentPhone}</AppleTg>}
            </FlexBox>
          )}
        </FlexBox>
      
      <AppTabs
        value={selectedTab}
        onChange={(_, newValue) => setSearchParams({ tab: newValue })}
        centered
        sx={{
          position: 'relative',
          zIndex: 1,
          mt: 2,
        }}
      >
        <Tab label="학생 기록" value="assessment" sx={{ fontSize: '1rem' }} />
        <Tab label="상담 기록" value="parent-counseling" sx={{ fontSize: '1rem' }} />
      </AppTabs>

      <FlexBox fullHeight fullWidth style={{paddingLeft: '1rem', paddingRight: '0.5rem', overflowY: 'hidden', overflowX: 'auto'}}>
        <FlexBox gap={1.5} fullHeight style={{margin: '0 auto', minWidth: '50rem', maxWidth: '95rem', width: '100%'}}>
          <FlexBox maxWidth="60rem" minWidth="30rem" fullHeight style={{width: '70%'}} flexDirection="column">
            <RecordNoteList
              createNote={createNote}
              updateNote={updateNote}
              deleteNote={deleteNote}
              notes={notes}
              selectedTab={selectedTab}
            />
          </FlexBox>

          <FlexBox maxWidth="35rem" minWidth="25rem" height='80%' sx={{ flex:1, overflowY: 'hidden'}}>
            <MemoNoteList 
              notes={notes} 
              createNote={createNote} 
              deleteNote={deleteNote} 
            />
          </FlexBox>
        </FlexBox>
      </FlexBox>
    </FlexContainer>
  );
}