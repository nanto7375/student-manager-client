import React from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import dayjs, { Dayjs } from "dayjs";
import { Chip } from "@mui/material";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

import type { ScheduleType } from "./const";
import { mapNumberToDay, ROUTES } from "~/constants";
import { FlexBox, FlexContainer } from "~/components/styled-elements";
import { AppleTg } from "~/components/typography";
import { formatTime12Hour, getDayOfWeekInKor } from "~/utils/time.util";

const today = dayjs();
const day = mapNumberToDay(today.day());

type ScheduleSidebarProps = {
  scheduleList: ScheduleType[];
  selectedScheduleId: number | null;
  setSelectedSchedule: (schedule: ScheduleType) => void;
  foldSidebar: () => void;
}
export default function ScheduleSidebar({ scheduleList, selectedScheduleId, setSelectedSchedule, foldSidebar }: ScheduleSidebarProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const date = searchParams.get('date');
  
  const [selectedDate, setSelectedDate] = React.useState(date ? dayjs(date, 'YYMMDD') : today);
  const [openDateCalendar, setOpenDateCalendar] = React.useState(false);
  const isTodaySelected = React.useMemo(() => selectedDate.isSame(today, 'date'), [selectedDate]);

  const todaySchedule = React.useMemo(() => {
    const day = mapNumberToDay(selectedDate.day());
    return scheduleList
    ?.filter((schedule) => schedule.dayOfWeek === day)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [scheduleList, selectedDate]);

  React.useEffect(() => {
    navigate(`${ROUTES.SCHEDULE}?date=${selectedDate.format('YYMMDD')}`);
    setSelectedSchedule(null);
    setOpenDateCalendar(false);
  }, [selectedDate])

  const handleGoTodayClick = React.useCallback(() => setSelectedDate(today), []);
  const handleDateChange = React.useCallback((date: Dayjs) => setSelectedDate(date), []);

  const handleScheduleClick = React.useCallback((schedule: ScheduleType) => {
    setSelectedSchedule(schedule);
    if (selectedScheduleId === schedule.id) foldSidebar();
  }, [selectedScheduleId]);

  return (
    <FlexContainer width="9.5rem" sx={{borderRight: '0.5px solid #e0e0e0'}} flexDirection="column" alignItems="center">

      <FlexBox flexDirection="column" gap={1} fullWidth>
        <FlexBox height="2.65rem" center sx={{position: 'relative'}}>
          {!isTodaySelected && <Chip 
            label={<AppleTg sx={{color: 'white', fontSize: '0.8rem'}}>오늘로 가고 싶어?</AppleTg>} 
            color='warning'
            sx={{position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: '-0.8rem', cursor: 'pointer'}} 
            onClick={handleGoTodayClick}
          />}
        </FlexBox>

        <FlexBox height="3rem" center fullWidth margin='0 0 1rem 0' padding='0 0.5rem' sx={{position: 'relative'}}>
          <Chip 
            label={<AppleTg>{selectedDate.format('M/D')}&nbsp;{getDayOfWeekInKor(selectedDate.day())}</AppleTg>} 
            color='info' 
            sx={{cursor: 'pointer', width: '100%'}} 
            onClick={()=>{setOpenDateCalendar(prev => !prev)}}
          />
          {openDateCalendar && <FlexBox 
            sx={{
              position: 'absolute', 
              top: '140%', 
              left: '0', 
              zIndex: 1000, 
              backgroundColor: 'white', 
              border: '1px solid #e0e0e0', 
              borderRadius: '0.25rem'
            }}
          >
            <DateCalendar value={selectedDate} onChange={handleDateChange} />
          </FlexBox>}
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
            <Link 
              to={`${ROUTES.SCHEDULE}/${schedule.id}?date=${selectedDate.format('YYMMDD')}`} 
              style= {{width: '100%', height: '100%', display: 'flex', alignItems: 'center', paddingLeft: '1.35rem', }}
            >
              <AppleTg 
                sx={{
                  color: selectedScheduleId === schedule.id ? 'secondary.main' : 'gray', 
                  fontWeight: selectedScheduleId === schedule.id ? '600' : '500',
                  paddingBottom: '0.2rem'
                }}
              >
                {formatTime12Hour(schedule.startTime)} - {formatTime12Hour(schedule.endTime)}
              </AppleTg>
              {selectedScheduleId === schedule.id && <ArrowForwardIosIcon sx={{fontSize: '0.9rem', color: 'gray', marginLeft: '0.2rem'}} />}
            </Link>
          </FlexBox>
        ))}
      </FlexBox>

    </FlexContainer>
  );
}