import React from "react";
import dayjs from "dayjs";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Chip } from "@mui/material";

import type { ScheduleType } from "./const";
import { FlexBox, FlexContainer } from "~/components/styled-elements";
import { AppleTg } from "~/components/typography";
import { formatTime12Hour, getDayOfWeekInKor } from "~/utils/time.util";

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
  const [selectedDay, setSelectedDay] = React.useState(dayjs().day());
  const [selectedDate, setSelectedDate] = React.useState(dayjs());
  const [isDaySelected, setIsDaySelected] = React.useState(false);
  const [isDateSelected, setIsDateSelected] = React.useState(true);

  const handleGoTodayClick = React.useCallback(() => {
    const today = dayjs();
    setSelectedDay(today.day());
    setSelectedDate(today);
    setIsDaySelected(false);
    setIsDateSelected(false);
  }, []);

  // TODO: schedule 선택 시 querystring으로 저장
  const handleScheduleClick = (schedule: ScheduleType) => {
    if (selectedSchedule?.id === schedule.id) return foldSidebar();
    selectSchedule(schedule);
  };

  return (
    <FlexContainer width="9.5rem" sx={{borderRight: '0.5px solid #e0e0e0'}} flexDirection="column" alignItems="center">

      <FlexBox flexDirection="column" gap={1} fullWidth>
        <FlexBox height="2.65rem" center sx={{position: 'relative'}}>
          {(isDateSelected || isDaySelected ) && <Chip 
            label={<AppleTg sx={{color: 'white', fontSize: '0.8rem'}}>오늘로 가고 싶어?</AppleTg>} 
            color='warning'
            sx={{position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: '-0.8rem', cursor: 'pointer'}} 
            onClick={handleGoTodayClick}
          />}
        </FlexBox>

        <FlexBox height="3rem" alignItems="center" fullWidth justifyContent="space-between" margin='0 0 1rem 0' padding='0 0.5rem' >
          <FlexBox width={'50%'} center>
            {!isDaySelected && <Chip 
              label={<AppleTg>{dayjs().format('M/D')}</AppleTg>} 
              color='info' 
              sx={{cursor: 'pointer'}} 
              onClick={()=>{}}
            />}
          </FlexBox>
          <FlexBox width={'50%'} center>
            <Chip 
              label={<AppleTg>&nbsp;{getDayOfWeekInKor(selectedDay)}&nbsp;</AppleTg>} 
              color='info' 
              sx={{cursor: 'pointer'}} 
              onClick={()=>{}}
            />
          </FlexBox>
        </FlexBox>
      </FlexBox>

      <FlexBox flexDirection="column" fullWidth>
        {todaySchedule.map((schedule) => (
          <FlexBox 
            key={schedule.id} 
            height="3rem" 
            alignItems="center"
            justifyContent="flex-start" 
            button 
            sx={{
              paddingLeft: '1.35rem', 
              lineHeight: '1.2rem', 
              transition: 'all',
              borderRadius: '0.25rem',
              '&:hover': {
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                transform: 'scale(1)',
              }
            }}
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