import React from "react";
import { useQuery } from "@tanstack/react-query";

import { getScheduleListApi } from "~/lib/api/schedules.api";
import { ROUTES } from "~/constants";
import { FlexBox, FlexContainer } from "~/components/styled-elements";
import ScheduleSidebar from "./sidebar";
import { type ScheduleType } from "./const";
import { Outlet, useLocation } from "react-router";
import { useGlobalToast } from "~/providers/toast-provider";

export const useScheduleList = () => {
  const { data: scheduleList, error: scheduleListError, isLoading: scheduleListLoading } = useQuery({ queryKey: ['schedule-list'], queryFn: () => getScheduleListApi(), staleTime: Infinity });
  const toast = useGlobalToast();

  React.useEffect(() => {
    if (!scheduleListError) return;
    console.error(scheduleListError);
    toast.error('스케줄 목록을 불러오는 데 실패했습니다.');
  }, [scheduleListError])

  return { scheduleList, scheduleListError, scheduleListLoading };
}

export default function Schedule() {
  const pathname = useLocation().pathname;
  const selectedScheduleId = React.useMemo(() => {
    const id = pathname.split(ROUTES.SCHEDULE).pop()?.split('/').pop();
    return Number(id) || null;
  }, [pathname]);
  const { scheduleList, scheduleListLoading } = useScheduleList();

  const [selectedSchedule, setSelectedSchedule] = React.useState<ScheduleType | null>(null);

  if (scheduleListLoading || !scheduleList) return (<FlexContainer center fullHeight fullWidth></FlexContainer>);
  return (
    <FlexContainer fullHeight fullWidth>
      <ScheduleSidebar 
        scheduleList={scheduleList || []} 
        selectedScheduleId={selectedScheduleId} 
        setSelectedSchedule={setSelectedSchedule} 
      />  
      
      <FlexContainer flexDirection="column" sx={{ flex: 1 }}> 
        <FlexBox fullHeight fullWidth sx={{ overflow: 'auto' }}>
          <Outlet />
        </FlexBox>
      </FlexContainer>
    </FlexContainer>
  );
}