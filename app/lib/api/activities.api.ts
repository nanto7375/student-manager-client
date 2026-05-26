import { buildApi } from "~/lib/api-builder";

export type ActivityRecordType = {
  id: number;
  student: any;
  date: string;
  isMakeup: boolean;
  attendance: boolean;
  report1: boolean;
  report2: boolean;
  monthlyProject: boolean;
  monthlyPreview: boolean;
  monthlyReport: boolean;
  borrowedBook: { id: number; bookTitle: string | null; borrowedAt: Date } | null;
};

export const getActivityRecordsApi = buildApi<ActivityRecordType[]>({ path: '/activities', method: 'GET' });
export const updateWeeklyActivityRecordApi = buildApi<ActivityRecordType>({ path: '/activities/:activityId', method: 'PATCH' });
export const updateMonthlyActivityRecordApi = buildApi<ActivityRecordType>({ path: '/activities/:activityId/monthly', method: 'PATCH' });

// --- 책 대여 ---
export const borrowBookApi = buildApi<void>({ path: '/book-rentals', method: 'POST' });
export const returnBookApi = buildApi<void>({ path: '/book-rentals/:bookRentalId/return', method: 'PATCH' });
