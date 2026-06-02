import React from "react";
import { useLoaderData, useNavigate } from "react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Button, Modal } from "@mui/material";
import dayjs from "dayjs";

import { getActivityRecordsApi } from "~/lib/api/activities.api";
import { FlexBox, FlexContainer } from "~/components/styled-elements";
import { AppleTg } from "~/components/typography";
import { MakeupScheduleDialog } from "~/components/makeup-schedule-dialog";
import { CLASSROOMS } from "~/constants/student.type";

import type { ActivityRecordType } from "./activity-records.type";
import { activityRecordsQueryKey } from "./activity-records.type";
import { ClassroomTable } from "./components/classroom-table";
import { useMemoModal } from "./use-memo-modal";
import { useActivityRecordActions } from "./use-activity-record-actions";

export { activityRecordsQueryKey } from "./activity-records.type";

export const clientLoader = async ({ params, request }: { params: { scheduleId: string }; request: Request }) => {
  const date = new URL(request.url).searchParams.get('date') ?? dayjs().format('YYYYMMDD');
  return { scheduleId: params.scheduleId, date };
};

export default function StudentActivityRecords() {
  const { scheduleId, date } = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();

  const [activePopup, setActivePopup] = React.useState<number | null>(null);
  const [makeupTarget, setMakeupTarget] = React.useState<{ studentId: number } | null>(null);

  const { data: activityRecords, isLoading } = useQuery({
    queryKey: activityRecordsQueryKey(scheduleId, date),
    queryFn: () => getActivityRecordsApi({ query: { scheduleId, date } }),
    enabled: !!scheduleId && !!date,
    placeholderData: keepPreviousData,
  });

  const { invalidateRecords, handleWeeklyActivityRecordButtonClick, handleMonthlyActivityRecordButtonClick, handleBookRentalButtonClick, handleClassroomDrop } = useActivityRecordActions(scheduleId, date);
  const { memoInput, setMemoInput, memoTargetStudentId, setMemoTargetStudentId, memoType, setMemoType, closeMemoModal, handleAddMemo } = useMemoModal(invalidateRecords);

  const buildMemoMap = (type: 'fixed-memo' | 'temporary-memo') =>
    Object.fromEntries(
      activityRecords!.map(r => [r.student.id, r.student.notes.filter(n => n.type === type).map(n => n.value.trim().replace(/\.$/, '')).join('. ')])
    );

  const fixedMemosMap = React.useMemo(() => activityRecords ? buildMemoMap('fixed-memo') : {}, [activityRecords]);
  const tempMemosMap = React.useMemo(() => activityRecords ? buildMemoMap('temporary-memo') : {}, [activityRecords]);

  const recordsByClassroom = React.useMemo(() => {
    if (!activityRecords) return [];
    return CLASSROOMS.map(c => ({ classroom: c, records: activityRecords.filter(r => r.student.classroom.id === c.id) }));
  }, [activityRecords]);

  if (isLoading || !activityRecords) {
    return <FlexContainer padding="1rem" fullHeight fullWidth center></FlexContainer>;
  }

  return (
    <FlexContainer padding="1rem" fullWidth fullHeight flexDirection="column" gap={3} sx={{ '&::after': { content: '""', minHeight: '0.01px', flexShrink: 0 } }} onClick={() => setActivePopup(null)}>
      {recordsByClassroom.map(({ classroom, records }) => (
        <ClassroomTable key={classroom.id} classroom={classroom} records={records} fixedMemosMap={fixedMemosMap} tempMemosMap={tempMemosMap} activePopup={activePopup} setActivePopup={setActivePopup} setMemoInput={setMemoInput} navigate={navigate} setMakeupTarget={setMakeupTarget} setMemoTargetStudentId={setMemoTargetStudentId} setMemoType={setMemoType} handleWeeklyActivityRecordButtonClick={handleWeeklyActivityRecordButtonClick} handleMonthlyActivityRecordButtonClick={handleMonthlyActivityRecordButtonClick} handleBookRentalButtonClick={handleBookRentalButtonClick} handleClassroomDrop={handleClassroomDrop} fullWidth showNotes />
      ))}

      {/* 메모 추가 모달 */}
      <Modal open={!!memoTargetStudentId} onClose={closeMemoModal}>
        <FlexBox center fullWidth fullHeight>
          <FlexBox flexDirection="column" gap={1} sx={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', width: '20rem' }}>
            <AppleTg sx={{ fontWeight: 600 }}>{memoType === 'fixed-memo' ? '고정 메모 추가' : '변동 메모 추가'}</AppleTg>
            <input
              autoFocus
              placeholder="메모 입력"
              value={memoInput}
              onChange={(e) => setMemoInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && memoTargetStudentId) handleAddMemo(memoTargetStudentId); }}
              className="memo-input"
            />
            <FlexBox justifyContent="flex-end" gap={0.5}>
              <Button size="small" onClick={closeMemoModal}>취소</Button>
              <Button size="small" variant="contained" onClick={() => memoTargetStudentId && handleAddMemo(memoTargetStudentId)}>추가</Button>
            </FlexBox>
          </FlexBox>
        </FlexBox>
      </Modal>

      <div style={{ minHeight: '0.01px', flexShrink: 0 }} />

      <MakeupScheduleDialog
        open={!!makeupTarget}
        onClose={() => setMakeupTarget(null)}
        studentId={makeupTarget?.studentId ?? 0}
        onSuccess={invalidateRecords}
      />
    </FlexContainer>
  );
}
