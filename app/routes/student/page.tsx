import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardActions } from "@mui/material";

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

export default function Student() {
  const [searchParam, setSearchParam] = React.useState('');
  const { name, schoolLevel } = React.useMemo(() => {
    const params = new URLSearchParams(searchParam);
    return {
      name: params.get('name') || '',
      schoolLevel: Number(params.get('level')) || null,
    }
  }, [searchParam]);
  const limit = React.useMemo(() => 20, []);

  // TODO: 무한스크롤
  const { data: studentList, error: studentListError, isLoading: studentListLoading } = useQuery({ 
    queryKey: ['student-list'], 
    queryFn: () => getStudentListApi({ query: { name, schoolLevel, limit, page: 1 } }), 
    staleTime: Infinity 
  });

  React.useEffect(() => {
    console.log(studentList)
  }, [studentList])


  return (
    <FlexContainer fullHeight fullWidth sx={{ padding: '1rem' }}>
      <FlexBox sx={{ flexWrap: 'wrap' }}>
        {studentList?.map(student => (
          <StudentCard key={student.id} student={student} />
        ))}
      </FlexBox>
    </FlexContainer>
  );
}

const StudentCard = ({ student }: { student: StudentInListType }) => {
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
      onClick={() => alert(`학생 ID: ${student.id}`)}
    >
      <CardContent sx={{ '& > *': { margin: '0.25rem 0', textAlign: 'center' } }}>
        <h2>{student.name}</h2>
        <p>{student.schoolName}</p>
        <p>({student.schoolGrade}학년, {student.schoolLevel === 1 ? '초등' : student.schoolLevel === 2 ? '중등' : '고등'})</p>
      </CardContent>
    </Card>
  );
}