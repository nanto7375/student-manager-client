import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLoaderData } from "react-router";

import { buildApi } from "~/lib/api-builder";
import { FlexContainer } from "~/components/styled-elements";
import { AppleTg } from "~/components/typography";
import type { ShortAdminDto } from "../admin/page";

type Assessment = {
  id: number;
  lastCommentor: ShortAdminDto;
  value: string;
  updatedAt: Date;
}

const getStudentAssessmentListApi = buildApi<Assessment[]>({ path: '/students/:studentId/assessments', method: 'GET' });

const assessmentListKey = (studentId: string) => ['assessment-list', studentId] as const;

export const clientLoader = async ({ params }: { params: { studentId: string } }) => {
  return { studentId: params.studentId };
}

export default function StudentDetail() {
  const { studentId } = useLoaderData<typeof clientLoader>();
  const { data: assessmentList } = useQuery({
    queryKey: assessmentListKey(studentId),
    queryFn: () => getStudentAssessmentListApi({ params: { studentId } }),
    staleTime: Infinity,
  });

  React.useEffect(() => {
    console.log(assessmentList);
  }, [assessmentList])  

  return (        
    <FlexContainer center fullHeight fullWidth>
      <AppleTg>학생 상세 페이지 {studentId}</AppleTg>
    </FlexContainer>
  );
}