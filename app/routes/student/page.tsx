import React from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Card, CardContent } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router";

import { FlexContainer, FlexBox } from "~/components/styled-elements";
import { buildApi } from "~/lib/api-builder";
import { StudentSearchFilter } from "./components/student-search-filter";

type StudentInListType = {
  id: number;
  birthDate: string;  // MMYY
  birthYear: string; // YYYY
  name: string;
  schoolGrade: number;  // 학년
  schoolLevel: number;  // 1: 초등, 2: 중등, 3: 고등
  schoolName: string;
}
const getStudentListApi = buildApi<{list: StudentInListType[]; count: number}>({ path: '/students', method: 'GET' });

// schoolLevel, schedule, 

const getStudnetListQueryKey = (name: string, schoolLevel: number | null, dayOfWeek: number | null, limit: number, page: number) => {
  return ['student-list', { name, schoolLevel, dayOfWeek, limit, page }];
}

export default function Student() {
  const navigate = useNavigate();
  const [searchParam, setSearchParam] = useSearchParams();

  const { schoolLevel, dayOfWeek, name } = React.useMemo(() => {
    const params = new URLSearchParams(searchParam);
    const dayOfWeek = params.get('dayOfWeek');
    return {
      schoolLevel: Number(params.get('schoolLevel')) || undefined,
      dayOfWeek: dayOfWeek ? Number(dayOfWeek) : undefined,
      name: params.get('name') || undefined
    }
  }, [searchParam]);

  const limit = React.useMemo(() => 20, []);
  const [inputName, setInputName] = React.useState('');

  // TODO: 무한스크롤
  const { data: studentData, error: studentListError, isLoading: studentListLoading } = useQuery({
    queryKey: getStudnetListQueryKey(name, schoolLevel, dayOfWeek, limit, 1),
    queryFn: () => getStudentListApi({ query: { 
      ...(name !== undefined && { name }),
      ...(schoolLevel !== undefined && { schoolLevel }),
      ...(dayOfWeek !== undefined && { dayOfWeek }),
      limit, 
      page: 1 
    } }),
    placeholderData: keepPreviousData,
    // staleTime: Infinity
  });

  const handleStudentClick = React.useCallback((studentId: number) => {
    navigate(`/student/${studentId}`);
  }, [navigate]);

  const handleSearchElementButton = React.useCallback((key: string, value: any) => {
    console.log('hi')
    const params = new URLSearchParams(searchParam);
    const alreadySelected = params.get(key) === String(value)
    alreadySelected ? params.delete(key) : params.set(key, value);
    setSearchParam(params.toString(), { replace: true });
  }, [searchParam, setSearchParam]);

  const handleSearchNameChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputName(e.target.value);
  }, []);

  const handleClearInput = React.useCallback(() => {
    setInputName('');
    const params = new URLSearchParams(searchParam);
    params.delete('name');
    setSearchParam(params.toString(), { replace: true });
  }, [searchParam, setSearchParam]);

  // 입력이 끝난 후 자동 검색 (debounce)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParam((prev) => {
        const params = new URLSearchParams(prev);
        if (inputName) params.set('name', inputName);
        else params.delete('name');
        return params.toString();
      }, { replace: true });
    }, 700);

    return () => clearTimeout(timer);
  }, [inputName, setSearchParam]);

  if (studentListLoading || !studentData) return (<FlexContainer padding="1rem" fullHeight fullWidth sx={{ flexDirection: 'column', gap: '1rem' }} center></FlexContainer>);
  return (
    <FlexContainer fullHeight fullWidth sx={{ flexDirection: 'column', gap: '1rem'}}>

      <FlexBox justifyContent="center" fullWidth sx={{ mb: 2 }}>
        <StudentSearchFilter
          inputName={inputName}
          onInputNameChange={(v) => setInputName(v)}
          onClearName={handleClearInput}
          dayOfWeek={dayOfWeek}
          onDayOfWeekChange={(v) => {
            const params = new URLSearchParams(searchParam);
            v === null ? params.delete('dayOfWeek') : params.set('dayOfWeek', String(v));
            setSearchParam(params.toString(), { replace: true });
          }}
          schoolLevel={schoolLevel}
          onSchoolLevelChange={(v) => {
            const params = new URLSearchParams(searchParam);
            v === null ? params.delete('schoolLevel') : params.set('schoolLevel', String(v));
            setSearchParam(params.toString(), { replace: true });
          }}
        />
      </FlexBox>

      <FlexBox gap={1} sx={{ flexWrap: 'wrap' }}>
        {studentData?.list.map(student => (
          <StudentCard 
            key={student.id} 
            student={student}
            onClick={handleStudentClick}
          />
        ))}
      </FlexBox>
    </FlexContainer>
  );
}

const StudentCard = ({ student, onClick }: { student: StudentInListType; onClick: (id: number) => void }) => {
  return (
    <Card
      variant="outlined"
      sx={{
      width: '9rem',
      height: '9rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      cursor: 'pointer',
      boxShadow: 2,
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        backgroundColor: 'action.hover',
        boxShadow: 6,
        transform: 'translateY(-2px)',
      },
      '&:active': {
        transform: 'translateY(0)',
        boxShadow: 3,
      }
      }}
      onClick={() => onClick(student.id)}
    >
      <CardContent sx={{ '& > *': { margin: '0.25rem 0', textAlign: 'center' } }}>
        <h2>{student.name}</h2>
        <p>{student.schoolName}</p>
        <p>({student.schoolGrade}학년, {student.schoolLevel === 1 ? '초등' : student.schoolLevel === 2 ? '중등' : '고등'})</p>
      </CardContent>
    </Card>
  );
}
