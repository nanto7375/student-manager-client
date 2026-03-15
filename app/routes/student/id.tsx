import React from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLoaderData } from "react-router";
import { Button, Tab, Tabs } from "@mui/material";

import { buildApi } from "~/lib/api-builder";
import { FlexBox, FlexContainer } from "~/components/styled-elements";
import type { ShortAdminDto } from "../admin/page";

type StudentInListType = {
  id: number;
  birthDate: string;
  birthYear: string;
  name: string;
  schoolGrade: number;
  schoolLevel: number;
  schoolName: string;
}

type Assessment = {
  id: number;
  value: string;
  lastCommenter: ShortAdminDto;
  createdAt: Date;
  updatedAt: Date;
}

const getStudentDetailApi = buildApi<StudentInListType>({ path: '/students/:studentId', method: 'GET' });
const getStudentAssessmentListApi = buildApi<Assessment[]>({ path: '/students/:studentId/assessments', method: 'GET' });
const createAssessmentApi = buildApi<Assessment>({ path: '/students/:studentId/assessments', method: 'POST' });
const updateAssessmentApi = buildApi<Assessment>({ path: '/students/:studentId/assessments/:assessmentId', method: 'PATCH' });

const studentDetailQueryKey = (studentId: string) => ['student-detail', studentId] as const;
const assessmentListKey = (studentId: string) => ['assessment-list', studentId] as const;

const initAccessment = () => ({ id: -1, value: '' })

export const clientLoader = async ({ params }: { params: { studentId: string } }) => {
  return { studentId: params.studentId };
}

export default function StudentDetail() {
  const { studentId } = useLoaderData<typeof clientLoader>();
  const queryClient = useQueryClient();

  const {data: student, error: studentDetailError, isLoading: studentDetailLoading } = useQuery({
    queryKey: studentDetailQueryKey(studentId),
    queryFn: () => getStudentDetailApi({ params: { studentId } }),
    enabled: !!studentId,
    staleTime: Infinity,
  });
  const { data: assessmentList, error: assessmentListError, isLoading: assessmentListLoading } = useQuery({
    queryKey: assessmentListKey(studentId),
    queryFn: () => getStudentAssessmentListApi({ params: { studentId } }),
    placeholderData: keepPreviousData,
  });
  const createAssessmentMutation = useMutation({ mutationFn: createAssessmentApi });
  const updateAssessmentMutation = useMutation({ mutationFn: updateAssessmentApi });

  const assessmentListContainerRef = React.useRef<HTMLDivElement>(null);
  const [isAdding, setIsAdding] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [recordingAssessment, setRecordingAssessment] = React.useState<{ id: number, value: string }>(initAccessment());

  const handleAddClick = React.useCallback(() => {
    setIsAdding(true);
  }, []);

  const handleEditClick = React.useCallback((assessment: Assessment) => {
    setRecordingAssessment({ id: assessment.id, value: assessment.value });
    setEditingId(assessment.id);
  }, []); 

  const handleCancel = React.useCallback(() => {
    setIsAdding(false);
    setEditingId(null);
    setRecordingAssessment(initAccessment());
  }, []);

  const saveAssessment = React.useCallback(async (isNew: boolean) => {
    if (isNew) {
      const assessment = await createAssessmentMutation.mutateAsync({ 
        params: { studentId }, 
        body: { value: recordingAssessment.value } 
      });
      setRecordingAssessment(prev => ({ ...prev, id: assessment.id }));
    } else {
      const currentAssessment = assessmentList?.find(a => a.id === recordingAssessment.id);
      if (recordingAssessment.value === currentAssessment?.value) return;
      await updateAssessmentMutation.mutateAsync({ 
        params: { studentId, assessmentId: recordingAssessment.id }, 
        body: { value: recordingAssessment.value } 
      });
    }
  }, [createAssessmentMutation, updateAssessmentMutation, studentId, recordingAssessment, assessmentList]);

  const handleSave = async () => {
    const isNewAssessment = recordingAssessment.id === -1;
    await saveAssessment(isNewAssessment)
    setIsAdding(false);
    setEditingId(null);
    setRecordingAssessment(initAccessment());

    queryClient.invalidateQueries({ queryKey: assessmentListKey(studentId) }).then(() => {
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
    setRecordingAssessment(prev => ({ ...prev, value: e.target.value }));
    // 자동으로 높이 조절
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  if (!student || !assessmentList) return <FlexContainer padding="1rem" fullHeight fullWidth center></FlexContainer>;
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
        <Tabs value="학생 기록">
          <Tab label="학생 기록" value="학생 기록" sx={{ fontSize: '1rem' }} />
        </Tabs>
      </FlexBox>

      {/* 평가 목록 */}
      <FlexBox flexDirection='column' gap={1} padding='1rem' alignItems='flex-start' width="70%">

        {/* 기록 추가 영역 */}
        {(isAdding ? (
          <FlexBox width="100%" sx={{ flexDirection: 'column', gap: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}>
            <AssessmentEditBox
              value={recordingAssessment.value}
              onChange={handleTextareaChange}
              onSave={handleSave}
              onCancel={handleCancel}
              placeholder="기록을 입력하세요"
              isInline={false}
            />
          </FlexBox>
        ) : (
          <AddAssessmentButton onClick={handleAddClick} disabled={!!editingId} />
        ))}

        {assessmentList.map(assessment => (
          <FlexBox 
            key={assessment.id} 
            width="100%"
            padding="1rem"
            position="relative"
            flexDirection="column"
            gap={0.5}
            sx={{ border: '1px solid #ddd', borderRadius: '0.5rem' }}
          >
            {editingId === assessment.id ? (
              <AssessmentEditBox
                value={recordingAssessment.value}
                onChange={handleTextareaChange}
                onSave={handleSave}
                onCancel={handleCancel}
                isInline={true}
              />
            ) : (
              <>
                <FlexBox alignItems="flex-start" justifyContent="space-between" height="3rem">
                  <div style={{ fontSize: '0.875rem', color: '#999' }}>
                    <div>작성일: {new Date(assessment.createdAt).toLocaleString('ko-KR')}</div>
                    <div>수정일: {new Date(assessment.updatedAt).toLocaleString('ko-KR')}&nbsp;({assessment.lastCommenter.name})
                    </div>
                  </div>
                  {!(isAdding || editingId) && (
                    <div>
                      <AssessmentBoxFooterButton title="편집" onClick={() => handleEditClick(assessment)} />
                      <AssessmentBoxFooterButton title="삭제" onClick={() => {}} />
                    </div>
                  )}
                </FlexBox>
                <FlexBox className="draggable">{assessment.value}</FlexBox>
              </>
            )}
          </FlexBox>
        ))}

      </FlexBox>
    </FlexContainer>
  );
}

const AssessmentEditBox = ({
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

const AssessmentBoxFooterButton = ({title, onClick}) => {
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