import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { updateWeeklyActivityRecordApi, updateMonthlyActivityRecordApi, borrowBookApi, returnBookApi } from "~/lib/api/activities.api";
import { changeClassroomApi } from "~/lib/api/students.api";
import { useGlobalToast } from "~/providers/toast-provider";

import type { ActivityCheck, ActivityRecordType } from "./activity-records.type";
import { activityRecordsQueryKey } from "./activity-records.type";

export const useActivityRecordActions = (scheduleId: string, date: string) => {
  const queryClient = useQueryClient();
  const toast = useGlobalToast();
  const [updating, setUpdating] = React.useState(false);

  const invalidateRecords = () => queryClient.invalidateQueries({ queryKey: activityRecordsQueryKey(scheduleId, date) });

  const withUpdating = async (fn: () => Promise<unknown>, errorMsg: string) => {
    if (updating) return;
    setUpdating(true);
    try {
      await fn();
      invalidateRecords();
    } catch (error: any) {
      console.error(error);
      toast.error(error.status >= 500 ? `서버에 문제가 발생했습니다.(${error.message})` : errorMsg);
    } finally {
      setTimeout(() => setUpdating(false), 300);
    }
  };

  const optimisticUpdate = async (updater: (prev: ActivityRecordType[]) => ActivityRecordType[], fn: () => Promise<unknown>, errorMsg: string) => {
    const qk = activityRecordsQueryKey(scheduleId, date);
    const prev = queryClient.getQueryData<ActivityRecordType[]>(qk);
    queryClient.setQueryData(qk, (old: ActivityRecordType[] | undefined) => old ? updater(old) : old);
    try {
      await fn();
      invalidateRecords();
    } catch (error: any) {
      queryClient.setQueryData(qk, prev);
      toast.error(error.status >= 500 ? `서버에 문제가 발생했습니다.(${error.message})` : errorMsg);
    }
  };

  const handleWeeklyActivityRecordButtonClick = ({ activityId, activityKey, value }: { activityId: number; activityKey: keyof ActivityCheck; value: boolean }) =>
    optimisticUpdate(
      records => records.map(r => r.id === activityId ? { ...r, [activityKey]: value } : r),
      () => updateWeeklyActivityRecordApi({ params: { activityId }, body: { [activityKey]: value } }),
      '활동 기록 업데이트에 실패했습니다.'
    );

  const handleMonthlyActivityRecordButtonClick = ({ activityId, activityKey, value }: { activityId: number; activityKey: keyof ActivityCheck | 'monthlyProject'; value: string | null }) =>
    optimisticUpdate(
      records => records.map(r => r.id === activityId ? { ...r, [activityKey]: value } : r),
      () => updateMonthlyActivityRecordApi({ params: { activityId }, body: { [activityKey]: value } }),
      '활동 기록 업데이트에 실패했습니다.'
    );

  const handleBookRentalButtonClick = (record: ActivityRecordType) =>
    optimisticUpdate(
      records => records.map(r => r.id === record.id ? { ...r, borrowedBook: record.borrowedBook ? null : { id: -1 } as any } : r),
      () => record.borrowedBook
        ? returnBookApi({ params: { bookRentalId: record.borrowedBook.id } })
        : borrowBookApi({ body: { studentId: record.student.id } }),
      '책 대여/반납 처리에 실패했습니다.'
    );

  const handleClassroomDrop = (studentId: number, classroomId: number) =>
    withUpdating(
      () => changeClassroomApi({ params: { studentId }, body: { classroomId } }),
      '강의실 변경에 실패했습니다.'
    );

  return { invalidateRecords, handleWeeklyActivityRecordButtonClick, handleMonthlyActivityRecordButtonClick, handleBookRentalButtonClick, handleClassroomDrop };
};
