// --- 공통 스케줄 타입 ---

export type Schedule = {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type ScheduleReserved = {
  id: number;
  schedule: Schedule;
  date: string; // YYYYMMDD
};

// --- 반 타입 ---

export type Classroom = {
  id: number;
  name: string;
};

export const CLASSROOMS = [
  { id: 1, name: '1강의실' },
  { id: 2, name: '2강의실' },
  { id: 3, name: '3강의실' },
  { id: 4, name: '자습실' },
] as const satisfies readonly Classroom[];

// --- 학생 타입 (API 응답별) ---

/** 학생 목록 카드용 (student/page) */
export type StudentInList = {
  id: number;
  birthDate: string;
  birthYear: string;
  name: string;
  schoolGrade: number | null;
  schoolLevel: number;
  schoolName: string | null;
  classroom: Classroom;
};

/** 학생 관리 테이블용 (admin/student-management) */
export type StudentInManagement = {
  id: string;
  name: string;
  schoolName: string | null;
  schoolGrade: number | null;
  phone: string;
  parentPhone: string;
  scheduleId: number;
  schedule?: Schedule;
  scheduleReserved?: ScheduleReserved;
  classroom: Classroom;
  registeredAt: Date;
  deletedAt: Date;
};

/** 학생 상세용 (student/student-detail) */
export type StudentDetail = {
  id: number;
  birthDate: string;
  birthYear: string;
  name: string;
  schoolGrade: number | null;
  schoolLevel: number;
  schoolName: string | null;
  phone: string;
  parentPhone: string;
  schedule: Schedule;
  scheduleReserved?: ScheduleReserved;
  classroom: Classroom;
  notes: StudentNote[];
  registeredAt: Date;
  deletedAt: Date | null;
};

/** 활동 기록 내 학생 정보 */
export type StudentInActivity = {
  id: number;
  name: string;
  schoolName: string | null;
  schoolLevel: number;
  schoolGrade: number | null;
  classroom: Classroom;
  notes: { id: number; type: 'fixed-memo' | 'temporary-memo'; value: string }[];
  deletedAt: Date | null;
};

// --- 노트 타입 ---

export type NoteType = 'note' | 'parent-counseling' | 'fixed-memo' | 'temporary-memo';

export type StudentNote = {
  id: number;
  value: string;
  type: NoteType;
  lastCommenter: { id: number; name: string; email: string; role: string; isActive: boolean };
  createdAt: Date;
  updatedAt: Date;
};
