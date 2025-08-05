import dayjs from 'dayjs';

export const mapNumberToDay = (number: number) => {
  switch (number) {
    case 0:
      return '일';
    case 1:
      return '월';
    case 2:
      return '화';
    case 3:
      return '수';
    case 4:
      return '목';
    case 5:
      return '금';
    case 6:
      return '토';
  }
};

// HHMM -> HH:MM
// Convert from 24-hour to 12-hour format
export const formatTime12Hour = (time: string) => {
  const hour = parseInt(time.substring(0, 2));
  const minute = time.substring(2, 4);

  let displayHour = hour;
  if (hour > 12) displayHour = hour - 12;

  return `${displayHour}:${minute}`;
};

export const getDayOfWeekInKor = (day = dayjs().day()) => mapNumberToDay(day);
