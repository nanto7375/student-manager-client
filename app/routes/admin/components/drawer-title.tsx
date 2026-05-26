import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { FlexBox } from "~/components/styled-elements";
import { AppleTg } from "~/components/typography";
import type { StudentInManagement, Schedule } from "~/constants/student.type";
import { formatTime12Hour, mapNumberToDayOfWeek } from "~/lib/utils/time.util";

const formatSchedule = (schedule: Schedule | undefined) => {
  if (!schedule) return null;
  return `${mapNumberToDayOfWeek(schedule.dayOfWeek)} ${formatTime12Hour(schedule.startTime)}-${formatTime12Hour(schedule.endTime)}`;
};

type Props = {
  editData: StudentInManagement | null;
  onEditSchedule: (student: StudentInManagement) => void;
  onCancelReserved: () => void;
  onClose: () => void;
};

export const DrawerTitle = ({ editData, onEditSchedule, onCancelReserved, onClose }: Props) => (
  <FlexBox justifyContent="space-between" alignItems="flex-start" fullWidth sx={{ mb: 1 }}>
    <FlexBox flexDirection="column">
      <AppleTg sx={{ fontSize: '1.2rem', fontWeight: 600, mb: 0.75 }}>{editData ? editData.name : '학생 등록'}</AppleTg>
      {editData?.schedule && (
        <FlexBox alignItems="center" gap={0.5}>
          <AppleTg sx={{ fontSize: '0.85rem', color: '#666' }}>{formatSchedule(editData.schedule)}</AppleTg>
          <IconButton size="small" onClick={(e) => { (e.currentTarget as HTMLElement).blur(); onEditSchedule(editData); }}>
            <EditIcon style={{ fontSize: '1rem' }} htmlColor="#999" />
          </IconButton>
        </FlexBox>
      )}
      {editData?.scheduleReserved && (
        <FlexBox alignItems="center" gap={0.5}>
          <AppleTg sx={{ fontSize: '0.8rem', color: 'red' }}>
            {formatSchedule(editData.scheduleReserved.schedule)} ({editData.scheduleReserved.date.slice(0,4)}. {editData.scheduleReserved.date.slice(4,6)}. {editData.scheduleReserved.date.slice(6,8)} 부터)
          </AppleTg>
          <IconButton size="small" onClick={onCancelReserved}>
            <CloseIcon style={{ fontSize: '1rem' }} htmlColor="#e57373" />
          </IconButton>
        </FlexBox>
      )}
    </FlexBox>
    <IconButton onClick={onClose} sx={{ zIndex: 20 }}>
      <CloseIcon />
    </IconButton>
  </FlexBox>
);
