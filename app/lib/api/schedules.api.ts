import { buildApi } from "~/lib/api-builder";
import type { Schedule } from "~/constants/student.type";

export type ScheduleType = Schedule;

export const getScheduleListApi = buildApi<ScheduleType[]>({ path: '/schedules', method: 'GET' });
