import React from "react";
import { useLoaderData, useSearchParams } from "react-router";
import type { SchoolLevel } from "~/constants/type";
import { buildApi } from "~/lib/api-builder";

type StudentInActivityDto = {
  id: number;
  name: string;
  birthYear: string;
  birthDate: string;
  schoolName: string;
  schoolLevel: SchoolLevel;
  schoolGrade: number;
};

type DailyActivityRecordType = {
  id: number;
  student: StudentInActivityDto;
  date: string;
  isMakeup: boolean;
  attended: boolean;
  report: boolean;
  report2: boolean;
};

const getDailyActivityRecords = buildApi<DailyActivityRecordType[]>({ path: '/activities', method: 'GET' });

export const clientLoader = async ({ params, request }: { params: { scheduleId: string }; request: Request }) => {
  const url = new URL(request.url);
  const date = url.searchParams.get('date'); // YYYYMMDD
  const dailyActivityRecords = await getDailyActivityRecords({ query: { scheduleId: params.scheduleId, date } });
  return { scheduleId: params.scheduleId, date, activityRecords: dailyActivityRecords };
}

export default function ScheduleId() {
  const { activityRecords } = useLoaderData<typeof clientLoader>();
  return (
    <div>
      <h1>{activityRecords.length}</h1>
    </div>
  )
}