import React from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLoaderData } from "react-router";
import { Button, Tab, Tabs } from "@mui/material";

import { buildApi } from "~/lib/api-builder";
import { FlexBox, FlexContainer } from "~/components/styled-elements";
import type { ShortAdminDto } from "../admin/page";
import { useConfirmModal } from "~/hooks/use-confirm-modal";

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
    <FlexContainer ref={assessmentListContainerRef} fullHeight fullWidth sx={{ flexDirection: 'column', overflow: 'auto', paddingLeft: '1rem' }}>
      <FlexBox
        flexDirection='column'
        padding="1rem 1rem 0 0"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: 'white',
        }}
      >
        {/* 학생 기본 정보 */}
        <FlexBox alignItems="flex-end" center sx={{ gap: '0.5rem' }}>
          <FlexBox sx={{fontWeight: 'bold', fontSize: '1.5rem'}}>{student.name}</FlexBox>
          <FlexBox sx={{ color: '#666' }}>{student.schoolName} {student.schoolGrade}학년</FlexBox>
          <FlexBox sx={{ color: '#666' }}>({student.schoolLevel === 1 ? '초등' : student.schoolLevel === 2 ? '중등' : '고등'})</FlexBox>
        </FlexBox>
        <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)} sx={{ marginTop: '1rem' }}>
          <Tab label="학생 기록" value="assessment" sx={{ fontSize: '1rem' }} />
          <Tab label="상담 기록" value="parent-counseling" sx={{ fontSize: '1rem' }} />
        </Tabs>
      </FlexBox>

      {/* 평가 목록 */}
      <FlexBox flexDirection='column' gap={1} padding='1rem' alignItems='flex-start' width="70%">

        {/* 기록 추가 영역 */}
        {(isAdding ? (
          <FlexBox width="100%" sx={{ flexDirection: 'column', gap: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}>
            <NoteEditBox
              value={recordingNote.value}
              onChange={handleTextareaChange}
              onSave={handleSaveClick}
              onCancel={handleCancelButtonClick}
              placeholder="기록을 입력하세요"
              isInline={false}
            />
          </FlexBox>
        ) : (
          <AddAssessmentButton onClick={handleAddClick} disabled={!!editingId} />
        ))}

        {notes.map(note => (
          <FlexBox 
            key={note.id} 
            width="100%"
            padding="1rem"
            position="relative"
            flexDirection="column"
            gap={0.5}
            sx={{ border: '1px solid #ddd', borderRadius: '0.5rem' }}
          >
            {editingId === note.id ? (
              <NoteEditBox
                value={recordingNote.value}
                onChange={handleTextareaChange}
                onSave={handleSaveClick}
                onCancel={handleCancelButtonClick}
                isInline={true}
              />
            ) : (
              <>
                <FlexBox alignItems="flex-start" justifyContent="space-between" height="3rem">
                  <div style={{ fontSize: '0.875rem', color: '#999' }}>
                    <div>작성일: {new Date(note.createdAt).toLocaleString('ko-KR')}</div>
                    <div>수정일: {new Date(note.updatedAt).toLocaleString('ko-KR')}&nbsp;({note.lastCommenter.name})
                    </div>
                  </div>
                  {!(isAdding || editingId) && (
                    <div>
                      <NoteBoxFooterButton title="편집" onClick={() => handleEditClick(note)} />
                      <NoteBoxFooterButton title="삭제" onClick={() => handleDeleteButtonClick(note.id)} />
                    </div>
                  )}
                </FlexBox>
                <FlexBox className="draggable">{note.value}</FlexBox>
              </>
            )}
          </FlexBox>
        ))}
      </FlexBox>

      <DeleteModal onConfirm={handleDeleteAssessment} bodyText='삭제하시겠습니까?' />
      <CancelModal onConfirm={handleEditCancel} bodyText='취소하시겠습니까?' />
    </FlexContainer>
  );
}

const NoteEditBox = ({
  value,
  onChange,
  onSave,
  onCancel,
  placeholder,
  isInline = false
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSave: () => void;
  onCancel: () => void;
  placeholder?: string;
  isInline?: boolean;
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  return (
    <div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus
        style={{
          width: '100%',
          minHeight: '6.25rem',
          padding: isInline ? '0' : '1rem',
          margin: 0,
          border: 'none',
          borderRadius: '0.25rem',
          resize: 'none',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit',
          letterSpacing: 'inherit',
          wordSpacing: 'inherit',
          whiteSpace: 'pre-wrap',
          outline: 'none',
          overflow: 'hidden',
        }}
      />
      <FlexBox alignItems='flex-end' justifyContent='flex-end' sx={{ gap: '1rem', height: '3rem' }}>
        <Button variant="contained" onClick={onSave} sx={{ width: '3rem', height: '2.5rem' }}>
          저장
        </Button>
        <Button variant="outlined" onClick={onCancel} sx={{ width: '3rem', height: '2.5rem' }}>
          취소
        </Button>
      </FlexBox>
    </div>
  );
};

const NoteBoxFooterButton = ({title, onClick}) => {
  return <Button
    size="small"
    variant="text"
    onClick={onClick}
    sx={{
      fontSize: '0.75rem',
      color: '#666',
      padding: '0.25rem 0.5rem',
      minWidth: 'auto',
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
      }
    }}
  >
    {title}
  </Button>
}

const AddAssessmentButton = ({ onClick, disabled=false }: { onClick: () => void; disabled?: boolean }) => {
  return (
    <Button
      variant="outlined"
      onClick={onClick}
      disabled={disabled}
      sx={{
        width: '100%',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #ddd',
        color: '#666',
        '&:hover': {
          border: '1px solid #999',
          backgroundColor: 'action.hover',
        },
        '&.Mui-disabled': {
          border: '1px solid #e0e0e0',
          color: '#bbb',
          cursor: 'not-allowed',
        }
      }}
    >
      + 기록 추가
    </Button>
  );
}