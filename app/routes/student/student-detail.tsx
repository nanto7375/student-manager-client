import React from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLoaderData } from "react-router";

import { buildApi } from "~/lib/api-builder";
import { FlexBox, FlexContainer } from "~/components/styled-elements";
import type { ShortAdminDto } from "../admin/page";
import { useConfirmModal } from "~/hooks/use-confirm-modal";
import { RecordNoteList } from "./components/record-note-list";

type StudentInListType = {
  id: number;
  birthDate: string;
  birthYear: string;
  name: string;
  schoolGrade: number;
  schoolLevel: number;
  schoolName: string;
  notes: Note[];
}

type NoteType = 'note' | 'parent-counseling' | 'fixed-memo' | 'temporary-memo';

type Note = {
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
const initNote = () => ({ id: -1, value: '', type: 'note' as NoteType })

export const clientLoader = async ({ params }: { params: { studentId: string } }) => {
  return { studentId: params.studentId };
}

export default function StudentDetail() {
  const { studentId } = useLoaderData<typeof clientLoader>();
  const queryClient = useQueryClient();

  const {ConfirmModal: DeleteModal, openConfirmModal: openDeleteModal, closeConfirmModal: closeDeleteModal} = useConfirmModal();
  const {ConfirmModal: CancelModal, openConfirmModal: openCancelModal, closeConfirmModal: closeCancelModal} = useConfirmModal();

  const assessmentListContainerRef = React.useRef<HTMLDivElement>(null);

  const [isAdding, setIsAdding] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);

  const [selectedTab, setSelectedTab] = React.useState<'assessment' | 'parent-counseling'>('assessment');
  const [recordingNote, setRecordingNote] = React.useState<{ id: number, value: string }>(initNote());

  const {data: student, error: studentDetailError, isLoading: studentDetailLoading } = useQuery({
    queryKey: studentQueryKey(studentId),
    queryFn: () => getStudentApi({ params: { studentId } }),
    enabled: !!studentId,
    placeholderData: keepPreviousData,
  });

  const notes = React.useMemo(() => {
    if (!student) return [];
    return student.notes.filter(note => note.type === selectedTab);
  }, [student, selectedTab]);

  const handleAddClick = React.useCallback(() => {
    setIsAdding(true);
  }, []);

  const handleEditClick = React.useCallback((note: Note) => {
    setRecordingNote({ id: note.id, value: note.value });
    setEditingId(note.id);
  }, []); 

  const handleCancelButtonClick = React.useCallback(() => {
    openCancelModal();
  }, [])

  const handleEditCancel = React.useCallback(() => {
    setIsAdding(false);
    setEditingId(null);
    setRecordingNote(initNote());
    closeCancelModal();
  }, []);

  const handleDeleteButtonClick = React.useCallback(async (noteId: number) => {
    setDeletingId(noteId)
    openDeleteModal()
  }, [])

  const handleDeleteAssessment = React.useCallback(async () => {
    await deleteNoteApi({params: {studentId, noteId: deletingId}});
    queryClient.invalidateQueries({ queryKey: studentQueryKey(studentId) })
    setDeletingId(null);
    closeDeleteModal();
  }, [studentId, deletingId])

  const saveAssessment = React.useCallback(async (isNew: boolean) => {
    if (isNew) {
      const note = await createNoteApi({ 
        params: { studentId }, 
        body: { value: recordingNote.value, type: selectedTab } 
      });
      setRecordingNote(prev => ({ ...prev, id: note.id }));
    } else {
      const currentAssessment = notes.find(a => a.id === recordingNote.id);
      if (recordingNote.value === currentAssessment?.value) return;
      await updateNoteApi({ 
        params: { studentId, noteId: recordingNote.id }, 
        body: { value: recordingNote.value } 
      });
    }
  }, [studentId, recordingNote, student, notes, selectedTab]);

  const handleSaveClick = async () => {
    const isNewAssessment = recordingNote.id === -1;
    await saveAssessment(isNewAssessment)
    setIsAdding(false);
    setEditingId(null);
    setRecordingNote(initNote());

    queryClient.invalidateQueries({ queryKey: studentQueryKey(studentId) }).then(() => {
      if (!isNewAssessment) return;
      setTimeout(() => {
        if (assessmentListContainerRef.current) {
          assessmentListContainerRef.current.scrollTo({
            top: assessmentListContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
    });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRecordingNote(prev => ({ ...prev, value: e.target.value }));
    // 자동으로 높이 조절
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  if (studentDetailError || studentDetailLoading) return <FlexContainer padding="1rem" fullHeight fullWidth center></FlexContainer>;
  return (
    <FlexContainer ref={assessmentListContainerRef} fullHeight fullWidth sx={{ flexDirection: 'column', paddingLeft: '1rem' }}>
        <FlexBox
          flexDirection='column'
          padding="1rem 1rem 0 0"
        >
          {/* 학생 기본 정보 */}
          <FlexBox alignItems="flex-end" center sx={{ gap: '0.5rem' }}>
            <FlexBox sx={{fontWeight: 'bold', fontSize: '1.5rem'}}>{student.name}</FlexBox>
            <FlexBox sx={{ color: '#666' }}>{student.schoolName} {student.schoolGrade}학년</FlexBox>
            <FlexBox sx={{ color: '#666' }}>({student.schoolLevel === 1 ? '초등' : student.schoolLevel === 2 ? '중등' : '고등'})</FlexBox>
          </FlexBox>
        </FlexBox>
      
      <RecordNoteList
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        isAdding={isAdding}
        editingId={editingId}
        recordingNote={recordingNote}
        handleTextareaChange={handleTextareaChange}
        handleSaveClick={handleSaveClick}
        handleCancelButtonClick={handleCancelButtonClick}
        handleAddClick={handleAddClick}
        handleEditClick={handleEditClick}
        handleDeleteButtonClick={handleDeleteButtonClick}
        notes={notes}
      />

      <DeleteModal onConfirm={handleDeleteAssessment} bodyText='삭제하시겠습니까?' />
      <CancelModal onConfirm={handleEditCancel} bodyText='취소하시겠습니까?' />
    </FlexContainer>
  );
}