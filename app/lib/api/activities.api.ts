import { buildApi } from "~/lib/api-builder";
import type { ActivityRecordType } from "~/routes/schedule/activity-records.type";

export type { ActivityRecordType };

export const getActivityRecordsApi = buildApi<ActivityRecordType[]>({ path: '/activities', method: 'GET' });
export const updateWeeklyActivityRecordApi = buildApi<ActivityRecordType>({ path: '/activities/:activityId', method: 'PATCH' });
export const updateMonthlyActivityRecordApi = buildApi<ActivityRecordType>({ path: '/activities/:activityId/monthly', method: 'PATCH' });

// --- 책 대여 ---
export const borrowBookApi = buildApi<void>({ path: '/book-rentals', method: 'POST' });
export const returnBookApi = buildApi<void>({ path: '/book-rentals/:bookRentalId/return', method: 'PATCH' });
