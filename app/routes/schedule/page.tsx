import React from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { buildApi } from "~/lib/api-builder";
import { mapNumberToDay } from "~/constants";
import useToast from "~/hooks/use-toast";
import { FlexBox, FlexContainer } from "~/components/styled-elements";
import ScheduleSidebar from "./sidebar";
import { type ScheduleType } from "./const";

const getScheduleListApi = buildApi<ScheduleType[]>({ path: '/schedules', method: 'GET' });

export default function Schedule() {
  const { data: scheduleList, error: scheduleListError, isLoading: scheduleListLoading } = useQuery({ queryKey: ['schedule-list'], queryFn: () => getScheduleListApi(), staleTime: Infinity });
  const [sidebarFolded, setSidebarFolded] = React.useState(false);
  const [selectedSchedule, setSelectedSchedule] = React.useState<ScheduleType | null>(null);

  const day = React.useMemo(() => mapNumberToDay(dayjs().day()), []);
  const todaySchedule = React.useMemo(() => scheduleList
    ?.filter((schedule) => schedule.dayOfWeek === day)
    .sort((a, b) => a.startTime.localeCompare(b.startTime)), 
  [scheduleList, day]);

  if (scheduleListLoading || scheduleListError) {
    return (
      <FlexContainer center fullHeight fullWidth>
        <h1>Loading...</h1>
      </FlexContainer>
    );
  }

  console.log(selectedSchedule);

  return (
    <FlexContainer fullHeight fullWidth>
      {!sidebarFolded ? 
        <ScheduleSidebar 
          todaySchedule={todaySchedule} 
          selectedSchedule={selectedSchedule}
          selectSchedule={setSelectedSchedule}
          foldSidebar={() => setSidebarFolded(true)}
        /> : 
        <FlexBox onClick={() => setSidebarFolded(false)}>
          열기
        </FlexBox>
      } 
      
      <FlexContainer>
        
        Schedule
      </FlexContainer>
    </FlexContainer>
  );
}