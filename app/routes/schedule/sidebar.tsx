import React from "react";
import dayjs from "dayjs";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import type { ScheduleType } from "./const";
import { FlexBox, FlexContainer } from "~/components/styled-elements";
import { AppleTg } from "~/components/typography";
import { formatTime12Hour } from "~/utils/time.util";
import { mapNumberToDay } from "~/constants";

type ScheduleSidebarProps = {
  todaySchedule: ScheduleType[];
  foldSidebar: () => void;
  selectSchedule: (schedule: ScheduleType) => void;
  selectedSchedule: ScheduleType | null;
}


const buttonHoverEffect = {
  transition: 'all',
  borderRadius: '0.25rem',
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    transform: 'scale(1.02)',
  }
}

export default function ScheduleSidebar({
  todaySchedule, 
  foldSidebar, 
  selectSchedule, 
  selectedSchedule
}: ScheduleSidebarProps) {
  const handleScheduleClick = (schedule: ScheduleType) => {
    if (selectedSchedule?.id === schedule.id) return foldSidebar();
    selectSchedule(schedule);
  };

  return (
    <FlexContainer width="9.5rem" sx={{borderRight: '0.5px solid #e0e0e0'}} flexDirection="column" alignItems="center">
      <FlexBox height="2.5rem" center sx={{margin: '1rem 0', padding: '0 1.1rem'}}>
        <AppleTg>{dayjs().format('M. D') + ' ' + mapNumberToDay(dayjs().day())}</AppleTg>
      </FlexBox>

      <FlexBox flexDirection="column" fullWidth>
        {todaySchedule.map((schedule) => (
          <FlexBox 
            key={schedule.id} 
            height="3rem" 
            alignItems="center"
            justifyContent="flex-start" 
            button 
            sx={{paddingLeft: '1.35rem', lineHeight: '1.2rem', ...buttonHoverEffect}}
            onClick={() => handleScheduleClick(schedule)}
          >
            <AppleTg 
              sx={{
                color: selectedSchedule?.id === schedule.id ? 'secondary.main' : 'gray', 
                fontWeight: selectedSchedule?.id === schedule.id ? '600' : '500',
                paddingBottom: '0.2rem'
              }}
            >
              {formatTime12Hour(schedule.startTime)} - {formatTime12Hour(schedule.endTime)}
            </AppleTg>
            {selectedSchedule?.id === schedule.id && <ArrowForwardIosIcon sx={{fontSize: '0.9rem', color: 'gray', marginLeft: '0.2rem'}} />}
          </FlexBox>
        ))}
      </FlexBox>
    </FlexContainer>
  );
}