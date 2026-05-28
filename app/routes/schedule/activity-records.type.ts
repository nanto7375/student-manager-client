import type { StudentInActivity as StudentInActivityDto } from "~/constants/student.type";

/**
 * isMakeup: 보충 수업 여부
 * attendance: 출석 여부
 * report: 감상문 제출 여부
 * report2: 주간 레오 제출 여부
 * monthlyProject: 월간 레오 참여 여부
 * monthlyPreview: 월간 레오 개요 제출 여부
 * monthlyReport: 월간 레오 감상문 제출 여부
 */
export type ActivityCheck = {
  attendance: boolean;
  report1: boolean;
  report2: boolean;
  monthlyProject: boolean;
  monthlyPreview: boolean;
  monthlyReport: boolean;
};

export type BookRental = {
  id: number;
  bookTitle: string | null;
  borrowedAt: Date;
};

export type ActivityRecordType = ActivityCheck & {
  id: number;
  student: StudentInActivityDto;
  date: string;
  isMakeup: boolean;
  borrowedBook: BookRental | null;
};

export const ActivityKey: Record<string, keyof ActivityCheck> = {
  ATTENDANCE: 'attendance',
  REPORT1: 'report1',
  REPORT2: 'report2',
  MONTHLY_PROJECT: 'monthlyProject',
  MONTHLY_PREVIEW: 'monthlyPreview',
  MONTHLY_REPORT: 'monthlyReport',
};

export const monthlyProjectStatusText = (record: ActivityRecordType) => {
  if (!record.monthlyProject) return '참여';
  if (!record.monthlyPreview) return '개요 제출';
  else if (!record.monthlyReport) return '감상문 제출';
};

export const monthlyProjectNextKey = (record: ActivityRecordType): keyof ActivityCheck => {
  if (!record.monthlyProject) return ActivityKey.MONTHLY_PROJECT;
  if (!record.monthlyPreview) return ActivityKey.MONTHLY_PREVIEW;
  else if (!record.monthlyReport) return ActivityKey.MONTHLY_REPORT;
  return ActivityKey.MONTHLY_PROJECT;
};

export const activityRecordsQueryKey = (scheduleId: string, date: string | null) =>
  ['activityRecords', scheduleId, date] as const;
