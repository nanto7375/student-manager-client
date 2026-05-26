import React from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs, { type Dayjs } from "dayjs";

import { FlexBox } from "~/components/styled-elements";
import { createMakeupScheduleApi } from "~/lib/api/students.api";
import { useGlobalToast } from "~/providers/toast-provider";
import { useScheduleList } from "~/routes/schedule/page";
import { formatTime12Hour, mapNumberToDayOfWeek } from "~/lib/utils/time.util";
import { FormSelect } from "~/components/form/form-components";

// --- Types ---

type Props = {
  open: boolean;
  onClose: () => void;
  studentId: number | string;
  onSuccess?: () => void;
};

// --- Component ---

export const MakeupScheduleDialog = ({ open, onClose, studentId, onSuccess }: Props) => {
  const toast = useGlobalToast();
  const { scheduleList } = useScheduleList();
  const [makeupDate, setMakeupDate] = React.useState<Dayjs>(dayjs());
  const [makeupScheduleId, setMakeupScheduleId] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    if (open) { setMakeupDate(dayjs()); setMakeupScheduleId(undefined); }
  }, [open]);

  const handleCreate = async () => {
    if (!makeupScheduleId) return;
    try {
      await createMakeupScheduleApi({ params: { studentId }, body: { scheduleId: makeupScheduleId, dateForMakeup: makeupDate.format('YYYYMMDD') } });
      toast.success('보강이 추가되었습니다.');
      setMakeupDate(dayjs());
      setMakeupScheduleId(undefined);
      onClose();
      onSuccess?.();
    } catch (e) {
      console.error(e);
      toast.error('보강 추가에 실패했습니다.');
    }
  };

  const scheduleOptions = (scheduleList ?? [])
    .filter(s => s.dayOfWeek === makeupDate.day())
    .map(s => ({ value: s.id, label: `${mapNumberToDayOfWeek(s.dayOfWeek)} ${formatTime12Hour(s.startTime)} - ${formatTime12Hour(s.endTime)}` }));

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>보강 날짜 및 스케줄 선택</DialogTitle>
      <DialogContent>
        <FlexBox flexDirection="column" gap={1} padding="1rem 0 0 0">
          <FormSelect
            value={[makeupScheduleId]}
            onChange={(e) => setMakeupScheduleId(Number(e.target.value))}
            items={[{ id: 'makeupScheduleId', placeholder: '수업 시간', options: scheduleOptions }]}
          />
          <DateCalendar value={makeupDate} minDate={dayjs()} onChange={(d: Dayjs) => { setMakeupDate(d); setMakeupScheduleId(undefined); }} />
        </FlexBox>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" disabled={!makeupScheduleId} onClick={handleCreate}>추가</Button>
      </DialogActions>
    </Dialog>
  );
};
