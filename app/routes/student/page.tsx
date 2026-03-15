import React from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Card, CardContent, Button } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router";

import { FlexContainer, FlexBox } from "~/components/styled-elements";
import { buildApi } from "~/lib/api-builder";

type StudentInListType = {
  id: number;
  birthDate: string;  // MMYY
  birthYear: string; // YYYY
  name: string;
  schoolGrade: number;  // 학년
  schoolLevel: number;  // 1: 초등, 2: 중등, 3: 고등
  schoolName: string;
}
const getStudentListApi = buildApi<StudentInListType[]>({ path: '/students', method: 'GET' });

// schoolLevel, schedule, 

const DAY_OF_WEEKS = [{title: '화', value: 2}, {title: '수', value: 3}, {title: '목', value: 4}, {title: '금', value: 5}, {title: '토', value: 6}, {title: '일', value: 0}];
const SCHOOL_LEVELS = [{ title: '초등', value: 1 }, { title: '중등', value: 2 }, { title: '고등', value: 3 }];

const getStudnetListQueryKey = (name: string, schoolLevel: number | null, dayOfWeek: number | null, limit: number, page: number) => {
  return ['student-list', { name, schoolLevel, dayOfWeek, limit, page }];
}

export default function Student() {
  const navigate = useNavigate();
  const [searchParam, setSearchParam] = useSearchParams();

  const { schoolLevel, dayOfWeek, name } = React.useMemo(() => {
    const params = new URLSearchParams(searchParam);
    return {
      schoolLevel: Number(params.get('schoolLevel')) || undefined,
      dayOfWeek: Number(params.get('dayOfWeek')) || undefined,
      name: params.get('name') || undefined
    }
  }, [searchParam]);

  const limit = React.useMemo(() => 20, []);
  const [inputName, setInputName] = React.useState('');

  // TODO: 무한스크롤
  const { data: studentList, error: studentListError, isLoading: studentListLoading } = useQuery({
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

  React.useEffect(() => {
    console.log(studentList)
  }, [studentList])

  const handleStudentClick = React.useCallback((studentId: number) => {
    navigate(`/student/${studentId}`);
  }, [navigate]);

  const handleSearchElementButton = React.useCallback((key: string, value: any) => {
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
  
  if (studentListLoading) {
    return <FlexContainer fullHeight fullWidth center sx={{ padding: '1rem', flexDirection: 'column', gap: '1rem' }}>Loading...</FlexContainer>;
  }

  return (
    <FlexContainer fullHeight fullWidth sx={{ padding: '1rem', flexDirection: 'column', gap: '1rem' }}>

      <FlexBox id='student-filter-section' gap={1}>
        <FlexBox sx={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="이름으로 검색"
            value={inputName}
            onChange={handleSearchNameChange}
            style={{
              padding: '0.5rem',
              paddingRight: '2rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              width: '200px',
            }}
          />
          {inputName && (
            <button
              onClick={handleClearInput}
              style={{
                position: 'absolute',
                right: '0.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                fontSize: '1.2rem',
              }}
            >
              ×
            </button>
          )}
        </FlexBox>
        <FlexBox id='day-of-week-filter' gap={0.5}>
          {DAY_OF_WEEKS.map((day) => (
            <SearchElementButton key={day.value} title={day.title} rounded={true} onClick={() => handleSearchElementButton('dayOfWeek', day.value)} selected={dayOfWeek === day.value} />
          )) }
        </FlexBox>
        <FlexBox id='school-level-filter' gap={0.5}>
          {SCHOOL_LEVELS.map((level) => (
            <SearchElementButton key={level.value} title={level.title} rounded={false} onClick={() => handleSearchElementButton('schoolLevel', level.value)} selected={schoolLevel === level.value} />
          )) }
        </FlexBox>
      </FlexBox>

      <FlexBox sx={{ flexWrap: 'wrap' }}>
        {studentList?.map(student => (
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
      width: '10rem',
      height: '10rem',
      margin: '0.5rem',
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

const SearchElementButton = ({ title, onClick, selected, rounded=false }: { title: string; onClick: () => void; selected: boolean, rounded: boolean }) => {
  return (
    <Button
      variant={selected ? "contained" : "outlined"}
      onClick={onClick}
      sx={{
        minWidth: '3rem',
        padding: '0.25rem',
        backgroundColor: selected ? 'primary.main' : 'white',
        color: selected ? 'white' : 'grey.600',
        borderColor: 'grey.400',
        borderRadius: rounded ? '50%' : undefined,
        '&:hover': {
          backgroundColor: selected ? 'primary.dark' : 'action.hover',
          borderColor: 'grey.400',
        },
      }}
    >
        {title}
    </Button>
  );
}