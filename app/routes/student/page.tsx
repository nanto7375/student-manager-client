import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router";

import { FlexContainer, FlexBox } from "~/components/styled-elements";
import { buildApi } from "~/lib/api-builder";
import { StudentSearchFilter } from "./components/student-search-filter";
import { useGlobalToast } from "~/providers/toast-provider";

type StudentInListType = {
  id: number;
  birthDate: string;
  birthYear: string;
  name: string;
  schoolGrade: number;
  schoolLevel: number;
  schoolName: string;
}
const getStudentListApi = buildApi<{ list: StudentInListType[]; count: number }>({ path: '/students', method: 'GET' });

const LIMIT = 40;

export default function Student() {
  const navigate = useNavigate();
  const [searchParam, setSearchParam] = useSearchParams();
  const observerRef = React.useRef<HTMLDivElement>(null);
  const toast = useGlobalToast();

  const { schoolLevel, dayOfWeek, name } = React.useMemo(() => {
    const params = new URLSearchParams(searchParam);
    const dayOfWeek = params.get('dayOfWeek');
    return {
      schoolLevel: Number(params.get('schoolLevel')) || undefined,
      dayOfWeek: dayOfWeek ? Number(dayOfWeek) : undefined,
      name: params.get('name') || undefined,
    };
  }, [searchParam]);

  const [inputName, setInputName] = React.useState('');

  // 무한스크롤
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteQuery({
    queryKey: ['student-list-infinite', { name, schoolLevel, dayOfWeek }],
    queryFn: ({ pageParam = 1 }) => getStudentListApi({
      query: {
        ...(name !== undefined && { name }),
        ...(schoolLevel !== undefined && { schoolLevel }),
        ...(dayOfWeek !== undefined && { dayOfWeek }),
        status: 'active',
        limit: LIMIT,
        page: pageParam,
        sort: 'name-asc',
      },
    }),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.length * LIMIT;
      return totalFetched < lastPage.count ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    placeholderData: (prev) => prev,
  });

  const studentList = React.useMemo(() => data?.pages.flatMap(p => p.list) ?? [], [data]);

  React.useEffect(() => {
    if (isError) toast.error('학생 목록을 불러오는 데 실패했습니다.');
  }, [isError]);

  // IntersectionObserver로 하단 감지
  React.useEffect(() => {
    if (!observerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage(); },
      { threshold: 0.1 }
    );
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleStudentClick = React.useCallback((studentId: number) => {
    navigate(`/student/${studentId}`);
  }, [navigate]);

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

  if (isLoading) return <FlexContainer fullHeight fullWidth center />;
  return (
    <FlexContainer fullHeight fullWidth sx={{ flexDirection: 'column', gap: '1rem' }}>
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
          onReset={() => {
            setInputName('');
            const params = new URLSearchParams(searchParam);
            params.delete('name');
            params.delete('dayOfWeek');
            params.delete('schoolLevel');
            setSearchParam(params.toString(), { replace: true });
          }}
        />
      </FlexBox>

      <FlexBox gap={1} sx={{ flexWrap: 'wrap', overflow: 'auto', flex: 1 }}>
        {studentList.map(student => (
          <StudentCard key={student.id} student={student} onClick={handleStudentClick} />
        ))}
        {/* 무한스크롤 감지 영역 */}
        <div ref={observerRef} style={{ width: '100%', height: '1px' }} />
      </FlexBox>
    </FlexContainer>
  );
}

const StudentCard = ({ student, onClick }: { student: StudentInListType; onClick: (id: number) => void }) => (
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
      '&:hover': { backgroundColor: 'action.hover', boxShadow: 6, transform: 'translateY(-2px)' },
      '&:active': { transform: 'translateY(0)', boxShadow: 3 },
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
