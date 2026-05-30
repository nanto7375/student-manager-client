import { buildApi } from "~/lib/api-builder";
import type { StudentInList, StudentInManagement, StudentDetail, StudentNote } from "~/constants/student.type";

// --- 학생 CRUD ---
export const getStudentListApi = buildApi<{ list: StudentInList[]; count: number }>({ path: '/students', method: 'GET' });
export const getStudentListForManagementApi = buildApi<{ list: StudentInManagement[]; count: number }>({ path: '/students', method: 'GET' });
export const getStudentApi = buildApi<StudentDetail>({ path: '/students/:studentId', method: 'GET' });
export const registerStudentApi = buildApi({ path: '/students', method: 'POST' });
export const updateStudentApi = buildApi({ path: '/students/:id', method: 'PATCH' });
export const deleteStudentApi = buildApi({ path: '/students/:id', method: 'DELETE' });

// --- 스케줄 변경 ---
export const changeScheduleApi = buildApi({ path: '/students/:studentId/schedule', method: 'PATCH' });
export const cancelReservedScheduleApi = buildApi({ path: '/schedules/reserved/:reservedId', method: 'DELETE' });
export const createMakeupScheduleApi = buildApi<void>({ path: '/students/:studentId/makeup', method: 'POST' });

// --- 노트 ---
export const createNoteApi = buildApi<StudentNote>({ path: '/students/:studentId/notes', method: 'POST' });
export const updateNoteApi = buildApi<StudentNote>({ path: '/students/:studentId/notes/:noteId', method: 'PATCH' });
export const toggleNoteStatusApi = buildApi<boolean>({ path: '/students/:studentId/notes/:noteId/status', method: 'PATCH' });

// --- 강의실 변경 ---
export const changeClassroomApi = buildApi({ path: '/students/:studentId/classroom', method: 'PATCH' });