import React from "react";
import { useQuery } from "@tanstack/react-query";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import { buildApi } from "~/lib/api-builder";
import { ROUTES } from "~/constants";
import { FlexBox, FlexContainer } from "~/components/styled-elements";
import ScheduleSidebar from "./sidebar";
import { type ScheduleType } from "./const";
import { formatTime12Hour, getDayOfWeekInKor } from "~/lib/utils/time.util";
import { AppleTg } from "~/components/typography";
import { Outlet, useLocation } from "react-router";

const getScheduleListApi = buildApi<ScheduleType[]>({ path: '/schedules', method: 'GET' });

export default function Schedule() {
  const pathname = useLocation().pathname;
  const selectedScheduleId = React.useMemo(() => {
    const id = pathname.split(ROUTES.SCHEDULE).pop()?.split('/').pop();
    return Number(id) || null;
  }, [pathname]);
  const { data: scheduleList, error: scheduleListError, isLoading: scheduleListLoading } = useQuery({ queryKey: ['schedule-list'], queryFn: () => getScheduleListApi(), staleTime: Infinity });

  const [selectedSchedule, setSelectedSchedule] = React.useState<ScheduleType | null>(null);
  const [sidebarFolded, setSidebarFolded] = React.useState(false);

  if (scheduleListLoading || scheduleListError) {
    return (
      <FlexContainer center fullHeight fullWidth>
        <h1>Loading...</h1>
      </FlexContainer>
    );
  }

  return (
    <FlexContainer fullHeight fullWidth>
      {!sidebarFolded && 
        <ScheduleSidebar scheduleList={scheduleList} selectedScheduleId={selectedScheduleId} setSelectedSchedule={setSelectedSchedule} foldSidebar={() => setSidebarFolded(true)} />  
      }
      
      <FlexContainer flexDirection="column"> 
        {sidebarFolded && 
          <FlexBox 
            justifyContent="center" 
            width={selectedSchedule ? "8.5rem" : "3.5rem"} 
            button 
            sx={{ padding: '0.5rem 0' }} 
            onClick={() => setSidebarFolded(false)}
          >
            <FlexBox height="2rem" alignItems="center">
              <ArrowDropDownIcon sx={{fontSize: '1.2rem', color: 'gray', cursor: 'pointer', marginRight: '0.35rem'}} />
              {selectedSchedule && <AppleTg color='secondary.main' sx={{fontSize: '0.9rem', fontWeight: '600'}}>
                {getDayOfWeekInKor() + ' ' + formatTime12Hour(selectedSchedule.startTime)} - {formatTime12Hour(selectedSchedule.endTime)}
              </AppleTg>}
            </FlexBox>
          </FlexBox>
        }

        <FlexBox width="100%" height="100%" sx={{border: '1px solid blue'}}>
          <Outlet />
        </FlexBox>
      </FlexContainer>
    </FlexContainer>
  );
}