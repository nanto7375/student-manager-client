import type { StudentInActivity as StudentInActivityDto } from "~/constants/student.type";

export type ActivityStatus = 'pending' | 'completed' | 'failed';
export type MonthlyStatus = 'pending' | 'participated' | 'preview' | 'completed' | 'failed' | 'none';

export type ActivityCheck = {
  attendance: ActivityStatus;
  report1: ActivityStatus;
  report2: ActivityStatus;
  monthlyProject: MonthlyStatus;
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
  borrowedBooks: BookRental[];
};

export const ActivityKey: Record<string, keyof ActivityCheck> = {
  ATTENDANCE: 'attendance',
  REPORT1: 'report1',
  REPORT2: 'report2',
  MONTHLY_PROJECT: 'monthlyProject',
};

export const activityRecordsQueryKey = (scheduleId: string, date: string | null) =>
  ['activityRecords', scheduleId, date] as const;

const STATUS_CYCLE: Record<ActivityStatus, ActivityStatus> = { pending: 'completed', completed: 'failed', failed: 'pending' };
export const nextStatus = (current: ActivityStatus): ActivityStatus => STATUS_CYCLE[current];

const MONTHLY_CYCLE: Record<MonthlyStatus, MonthlyStatus> = { pending: 'participated', participated: 'preview', preview: 'completed', completed: 'failed', failed: 'none', none: 'pending' };
export const nextMonthlyStatus = (current: MonthlyStatus): MonthlyStatus => MONTHLY_CYCLE[current];

export const ACTIVITY_BUTTON_TEXT: Record<'attendance' | 'report1' | 'report2', Record<ActivityStatus, string>> = {
  attendance: { pending: '출석', completed: '출석 완료', failed: '결석' },
  report1: { pending: '감상문', completed: '감상문 완료', failed: '감상문 미제출' },
  report2: { pending: '주간 레오', completed: '주간 완료', failed: '주간 미제출' },
};

export const MONTHLY_BUTTON_TEXT: Record<MonthlyStatus, string> = {
  pending: '월간 레오',
  participated: '월간 참여',
  preview: '개요 제출',
  completed: '월간 완료',
  failed: '월간 포기',
  none: '월간 미참여',
};
