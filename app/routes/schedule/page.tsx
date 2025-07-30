import React from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import { buildApi } from "~/lib/api-builder";
import { mapNumberToDay } from "~/constants";
import { FlexBox, FlexContainer } from "~/components/styled-elements";
import ScheduleSidebar from "./sidebar";
import { type ScheduleType } from "./const";
import { formatTime12Hour } from "~/utils/time.util";
import { AppleTg } from "~/components/typography";

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

  const handleFoldSidebar = () => {
    if (!selectedSchedule) return;
    setSidebarFolded(true);
  }

  return (
    <FlexContainer fullHeight fullWidth>
      {!sidebarFolded && 
        <ScheduleSidebar 
          todaySchedule={todaySchedule} 
          selectedSchedule={selectedSchedule}
          selectSchedule={setSelectedSchedule}
          foldSidebar={handleFoldSidebar}
        />  
      }
      
      <FlexContainer flexDirection="column"> 
        {sidebarFolded && 
          <FlexBox justifyContent="center"  width={selectedSchedule ? "7.5rem" : "3.5rem"} button sx={{ padding: '0.5rem 0'}} onClick={() => setSidebarFolded(false)}>
            <FlexBox height="2rem" alignItems="center">
              <ArrowDropDownIcon sx={{fontSize: '1.2rem', color: 'gray', cursor: 'pointer', marginRight: '0.35rem'}} />
              {selectedSchedule && <AppleTg color='secondary.main' sx={{fontSize: '0.9rem', fontWeight: '600'}}>
                {formatTime12Hour(selectedSchedule.startTime)} - {formatTime12Hour(selectedSchedule.endTime)}
              </AppleTg>}
            </FlexBox>
          </FlexBox>
        }
        <FlexBox width="100%" height="100%" sx={{border: '1px solid blue'}}>
          Schedule
        </FlexBox>
      </FlexContainer>
    </FlexContainer>
  );
}