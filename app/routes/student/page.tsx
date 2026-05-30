import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Card } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router";

import { FlexContainer, FlexBox } from "~/components/styled-elements";
import { getStudentListApi } from "~/lib/api/students.api";
import { StudentSearchFilter } from "./components/student-search-filter";
import { useGlobalToast } from "~/providers/toast-provider";
import { useInfiniteScroll } from "~/hooks/use-infinite-scroll";
import { useDebouncedValue } from "~/hooks/use-debounced-value";
import type { StudentInList as StudentInListType } from "~/constants/student.type";

const LIMIT = 40;

export default function Student() {
  const navigate = useNavigate();
  const [searchParam, setSearchParam] = useSearchParams();
  const toast = useGlobalToast();

  const { schoolLevel, dayOfWeek, name } = React.useMemo(() => {
    const params = new URLSearchParams(searchParam);
    const dayOfWeekRaw = params.get('dayOfWeek');
    const schoolLevelRaw = params.get('schoolLevel');
    return {
      schoolLevel: schoolLevelRaw ? Number(schoolLevelRaw) : null,
      dayOfWeek: dayOfWeekRaw ? Number(dayOfWeekRaw) : null,
      name: params.get('name') || undefined,
    };
  }, [searchParam]);

  const [inputName, setInputName] = React.useState('');
  const debouncedName = useDebouncedValue(inputName, 700);

  // 무한스크롤
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteQuery({
    queryKey: ['student-list-infinite', { name, schoolLevel, dayOfWeek }],
    queryFn: ({ pageParam = 1 }) => getStudentListApi({
      query: {
        ...(name !== undefined && { name }),
        ...(schoolLevel !== null && { schoolLevel }),
        ...(dayOfWeek !== null && { dayOfWeek }),
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
  const observerRef = useInfiniteScroll(fetchNextPage, !!hasNextPage, isFetchingNextPage);

  const handleStudentClick = React.useCallback((studentId: number) => {
    navigate(`/student/${studentId}`);
  }, [navigate]);

  const handleClearInput = React.useCallback(() => {
    setInputName('');
    setSearchParam((prev) => {
      const params = new URLSearchParams(prev);
      params.delete('name');
      return params.toString();
    }, { replace: true });
  }, [setSearchParam]);

  // debounce된 이름으로 검색 파라미터 업데이트
  React.useEffect(() => {
    setSearchParam((prev) => {
      const params = new URLSearchParams(prev);
      if (debouncedName) params.set('name', debouncedName);
      else params.delete('name');
      return params.toString();
    }, { replace: true });
  }, [debouncedName, setSearchParam]);

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
            setSearchParam((prev) => {
              const params = new URLSearchParams(prev);
              v === null ? params.delete('dayOfWeek') : params.set('dayOfWeek', String(v));
              return params.toString();
            }, { replace: true });
          }}
          schoolLevel={schoolLevel}
          onSchoolLevelChange={(v) => {
            setSearchParam((prev) => {
              const params = new URLSearchParams(prev);
              v === null ? params.delete('schoolLevel') : params.set('schoolLevel', String(v));
              return params.toString();
            }, { replace: true });
          }}
          onReset={() => {
            setInputName('');
            setSearchParam((prev) => {
              const params = new URLSearchParams(prev);
              params.delete('name');
              params.delete('dayOfWeek');
              params.delete('schoolLevel');
              return params.toString();
            }, { replace: true });
          }}
        />
      </FlexBox>

      <FlexBox sx={{ overflow: 'auto', flex: 1, justifyContent: 'center' }}>
        <FlexBox gap={2} sx={{ flexWrap: 'wrap', alignContent: 'flex-start', width: '100%', rowGap: 3 }}>
          {studentList.map(student => (
            <StudentCard key={student.id} student={student} onClick={handleStudentClick} />
          ))}
          {/* 무한스크롤 감지 영역 */}
          <div ref={observerRef} style={{ height: '1px' }} />
        </FlexBox>
      </FlexBox>
    </FlexContainer>
  );
}

const SCHOOL_LEVEL_COLOR: Record<number, string> = {
  1: '#4caf50',  // 초등
  2: '#2196f3',  // 중등
  3: '#ff9800',  // 고등
};

const studentCardSx = {
  width: '13rem',
  height: '3.5rem',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  borderRadius: '8px',
  overflow: 'hidden',
  border: '1px solid rgba(0,0,0,0.08)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  transition: 'all 0.15s ease-in-out',
  '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.18)', transform: 'translateY(-2px)' },
  '&:active': { transform: 'translateY(0)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
} as const;

const StudentCard = ({ student, onClick }: { student: StudentInListType; onClick: (id: number) => void }) => {
  const levelColor = SCHOOL_LEVEL_COLOR[student.schoolLevel] ?? '#9e9e9e';
  const schoolInfo = student.schoolName
    ? `(${student.schoolName}${student.schoolGrade ? ` ${student.schoolGrade}학년` : ''})`
    : null;

  return (
    <Card elevation={0} sx={studentCardSx} onClick={() => onClick(student.id)}>
      <div className="student-card-level-bar" style={{ backgroundColor: levelColor }} />
      <span className="student-card-name">
        {student.name}
        {schoolInfo && <span className="student-card-school-info">{schoolInfo}</span>}
      </span>
    </Card>
  );
};
