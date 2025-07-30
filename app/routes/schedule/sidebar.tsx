import React from "react";
import dayjs from "dayjs";

import type { ScheduleType } from "./const";
import { FlexBox, FlexContainer } from "~/components/styled-elements";
import { AppleTg } from "~/components/typography";

// HHMM -> HH:MM
// Convert from 24-hour to 12-hour format
const transformTime = (time: string) => {
  const hour = parseInt(time.substring(0, 2));
  const minute = time.substring(2, 4);
  
  let displayHour = hour;
  if (hour > 12) displayHour = hour - 12;
  
  return `${displayHour}:${minute}`;
};

type ScheduleSidebarProps = {
  todaySchedule: ScheduleType[];
  foldSidebar: () => void;
  selectSchedule: (schedule: ScheduleType) => void;
  selectedSchedule: ScheduleType | null;
}

export default function ScheduleSidebar({
  todaySchedule, 
  foldSidebar, 
  selectSchedule, 
  selectedSchedule
}: ScheduleSidebarProps) {
  const handleScheduleClick = React.useCallback((schedule: ScheduleType) => {
    selectSchedule(schedule);
  }, [selectSchedule]);

  return (
    <FlexContainer width="9rem" sx={{borderRight: '0.5px solid #e0e0e0'}} flexDirection="column" alignItems="center">
      <FlexBox 
        button 
        height="2.5rem" 
        center 
        sx={{margin: '1rem 0', padding: '0 1.1rem'}} 
        onClick={foldSidebar}
      >
        <AppleTg>{dayjs().format('M. D')}</AppleTg>
      </FlexBox>

      <FlexBox flexDirection="column" fullWidth gap={0.7}>
        {todaySchedule.map((schedule) => (
          <FlexBox 
            key={schedule.id} 
            height="2.8rem" 
            center 
            button 
            onClick={() => handleScheduleClick(schedule)}
          >
            <AppleTg 
              sx={{
                color: selectedSchedule?.id === schedule.id ? 'secondary.main' : 'gray', 
                fontWeight: selectedSchedule?.id === schedule.id ? '600' : '500'
              }}
            >
              {transformTime(schedule.startTime)} - {transformTime(schedule.endTime)}
            </AppleTg>
          </FlexBox>
        ))}
      </FlexBox>
    </FlexContainer>
  );
}