// HHMM -> HH:MM
// Convert from 24-hour to 12-hour format
export const formatTime12Hour = (time: string) => {
  const hour = parseInt(time.substring(0, 2));
  const minute = time.substring(2, 4);

  let displayHour = hour;
  if (hour > 12) displayHour = hour - 12;

  return `${displayHour}:${minute}`;
};
