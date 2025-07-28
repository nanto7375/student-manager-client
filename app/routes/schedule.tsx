import React from "react";
import { useQuery } from "@tanstack/react-query";
// import dayjs from "dayjs";
import { buildApi } from "~/lib/api-builder";
import { mapNumberToDay } from "~/constants";
import useToast from "~/hooks/use-toast";
import { FlexContainer } from "~/components/styled-elements";

type Schedule = {
  id: number;
  dayOfWeek: string;
  startTime: string; // HHMM
  endTime: string; // HHMM
};

const getScheduleListApi = buildApi<Schedule[]>({ path: '/schedules', method: 'GET' });

export default function Schedule() {
  const { showToast } = useToast();
  const { data: scheduleList, error: scheduleListError, isLoading: scheduleListLoading } = useQuery({ queryKey: ['schedule-list'], queryFn: () => getScheduleListApi(), staleTime: Infinity });

  // const day = React.useMemo(() => mapNumberToDay(dayjs().day() + 1), []);
  // console.log(scheduleList)
  // const todaySchedule = React.useMemo(() => {
  //   return scheduleList
  //     ?.filter((schedule) => schedule.dayOfWeek === day)
  //     .sort((a, b) => a.startTime.localeCompare(b.startTime));
  // }, [scheduleList, day]);

  if (scheduleListLoading || scheduleListError) {
    return (
      <FlexContainer center fullHeight fullWidth>
        <h1>Loading...</h1>
      </FlexContainer>
    );
  }

  return (
    <FlexContainer center fullHeight fullWidth>
      <h1>Schedule</h1>
    </FlexContainer>
  );
}