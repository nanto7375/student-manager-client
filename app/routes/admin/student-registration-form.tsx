import React from "react";
import dayjs from "dayjs";
import { Button, type SelectChangeEvent } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";

import { useScheduleList } from "../schedule/page";
import { FlexBox } from "~/components/styled-elements";
import { FormInput, FormPhone, FormSelect } from "./components/form-components";
import { formatTime12Hour, mapNumberToDayOfWeek } from "~/lib/utils/time.util";
import { AppleTg } from "~/components/typography";
import { buildApi } from "~/lib/api-builder";
import { studentListQueryKey } from "./student-management-page";
import { useConfirmModal } from "~/hooks/use-confirm-modal";

// --- Types ---

type StudentForm = {
  name: string;
  schoolName: string;
  schoolLevel: string;
  schoolGrade: string | undefined;
  birthYear: string | undefined;
  birthMonth: string | undefined;
  birthDay: string | undefined;
  phone: string[];
  parentPhone: string[];
  scheduleId: string | undefined;
  scheduleDayOfWeek: number | undefined;
  note: string;
};

// --- Helpers ---

const defaultStudentForm = (): StudentForm => ({
  name: '',
  schoolName: '',
  schoolLevel: '1',
  schoolGrade: undefined,
  birthYear: undefined,
  birthMonth: undefined,
  birthDay: undefined,
  phone: ['010', '', ''],
  parentPhone: ['010', '', ''],
  scheduleId: undefined,
  scheduleDayOfWeek: undefined,
  note: '',
});

const SCHOOL_GRADES: Record<string, number[]> = {
  '1': [1, 2, 3, 4, 5, 6],
  '2': [1, 2, 3],
  '3': [1, 2, 3],
};

const formatPhone = (phone: string[]) =>
  phone.filter(Boolean).length > 1 ? phone.join('-') : null;

const formatBirthDate = (month?: string, day?: string) => {
  if (!month || !day) return null;
  return `${month.padStart(2, '0')}${day.padStart(2, '0')}`;
};

const NOW_YEAR = dayjs().year();

// --- API ---

const registerStudentApi = buildApi({ path: '/students', method: 'POST' });
const updateStudentApi = buildApi({ path: '/students/:id', method: 'PATCH' });
const deleteStudentApi = buildApi({ path: '/students/:id', method: 'DELETE' });

// --- Component ---

type Props = {
  showError: (msg: string) => void;
  showSuccess: (msg: string) => void;
  editData?: any;
  onComplete?: () => void;
};

export const StudentRegistrationForm = ({ showError, showSuccess, editData, onComplete }: Props) => {
  const queryClient = useQueryClient();
  const isEditMode = !!editData?.id;
  const { scheduleList } = useScheduleList();
  const [form, setForm] = React.useState<StudentForm>(defaultStudentForm());
  const { ConfirmModal: DeleteModal, openConfirmModal: openDeleteModal, closeConfirmModal: closeDeleteModal } = useConfirmModal();

  const handleDelete = async () => {
    if (!editData?.id) return;
    try {
      await deleteStudentApi({ params: { id: editData.id } });
      showSuccess('학생이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: studentListQueryKey() });
      closeDeleteModal();
      onComplete?.();
    } catch {
      showError('학생 삭제 중 오류가 발생했습니다.');
    }
  };

  React.useEffect(() => {
    if (editData) {
      setForm({
        ...defaultStudentForm(),
        name: editData.name || '',
        schoolName: editData.schoolName || '',
        schoolLevel: editData.schoolLevel?.toString() || '1',
        schoolGrade: editData.schoolGrade?.toString(),
        phone: editData.phone ? editData.phone.split('-') : ['010', '', ''],
        parentPhone: editData.parentPhone ? editData.parentPhone.split('-') : ['010', '', ''],
        scheduleId: editData.scheduleId?.toString(),
        note: editData.note || '',
      });
    } else {
      setForm(defaultStudentForm());
    }
  }, [editData]);

  const isSubmitDisabled = isEditMode ? false : !form.name || !form.scheduleId;

  // --- Handlers ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (value.length > 30) return;
    setForm(prev => ({ ...prev, [e.target.id]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 4) return;
    const [field, phoneIndex] = e.target.id.split('/');
    setForm(prev => {
      const arr = [...prev[field]];
      arr[phoneIndex] = value;
      return { ...prev, [field]: arr };
    });
  };

  const handleSelect = (e: SelectChangeEvent, name: string) => {
    setForm(prev => ({
      ...prev,
      [name]: e.target.value,
      ...(name === 'schoolLevel' && { schoolGrade: undefined }),
      ...(name === 'scheduleDayOfWeek' && { scheduleId: undefined }),
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitDisabled) return;

    try {
      if (isEditMode) {
        await updateStudentApi({
          params: { id: editData.id },
          body: {
            schoolName: form.schoolName || null,
            schoolLevel: Number(form.schoolLevel) || null,
            schoolGrade: Number(form.schoolGrade) || null,
            birthYear: form.birthYear || null,
            birthDate: formatBirthDate(form.birthMonth, form.birthDay),
            phone: formatPhone(form.phone),
            parentPhone: formatPhone(form.parentPhone),
          },
        });
        showSuccess('학생 정보가 수정되었습니다.');
      } else {
        await registerStudentApi({
          body: {
            name: form.name,
            schoolName: form.schoolName || null,
            schoolLevel: Number(form.schoolLevel) || null,
            schoolGrade: Number(form.schoolGrade) || null,
            birthYear: form.birthYear || null,
            birthDate: formatBirthDate(form.birthMonth, form.birthDay),
            phone: formatPhone(form.phone),
            parentPhone: formatPhone(form.parentPhone),
            scheduleId: Number(form.scheduleId),
            note: form.note || null,
          },
        });
        showSuccess('학생 등록이 완료되었습니다.');
      }

      queryClient.invalidateQueries({ queryKey: studentListQueryKey() });
      setForm(defaultStudentForm());
      onComplete?.();
    } catch {
      showError(isEditMode ? '학생 수정 중 오류가 발생했습니다.' : '학생 등록 중 오류가 발생했습니다.');
    }
  };

  // --- Select options (declarative) ---

  const dayOfWeekOptions = Array.from({ length: 7 }, (_, i) => ({ value: i, label: mapNumberToDayOfWeek(i) }));

  const scheduleTimeOptions = (scheduleList ?? [])
    .filter(s => s.dayOfWeek === form.scheduleDayOfWeek)
    .map(s => ({ value: s.id, label: `${formatTime12Hour(s.startTime)} - ${formatTime12Hour(s.endTime)}` }));

  const schoolLevelOptions = [{ value: '1', label: '초등학교' }, { value: '2', label: '중학교' }, { value: '3', label: '고등학교' }];
  const schoolGradeOptions = (SCHOOL_GRADES[form.schoolLevel] ?? []).map(g => ({ value: g.toString(), label: g.toString() }));

  const birthYearOptions = Array.from({ length: 20 }, (_, i) => ({ value: (NOW_YEAR - i).toString(), label: (NOW_YEAR - i).toString() }));
  const birthMonthOptions = Array.from({ length: 12 }, (_, i) => ({ value: (i + 1).toString(), label: (i + 1).toString() }));
  const birthDayOptions = Array.from({ length: 31 }, (_, i) => ({ value: (i + 1).toString(), label: (i + 1).toString() }));

  // --- Render ---

  return (
    <FlexBox flexDirection="column" gap={1} fullHeight>
      <FlexBox flexDirection="column" gap={1.25} fullWidth>
        {/* 이름 (등록 시에만) */}
        {!isEditMode && <FormInput id="name" label="이름" value={form.name} onChange={handleInputChange} />}

        {/* 수업 선택 (편집 시 읽기 전용) */}
        {!isEditMode ? (
          <FormSelect
            value={[form.scheduleDayOfWeek, form.scheduleId]}
            onChange={handleSelect}
            items={[
              { id: 'scheduleDayOfWeek', placeholder: '수업 요일', options: dayOfWeekOptions },
              { id: 'scheduleId', placeholder: '수업 시간', options: scheduleTimeOptions },
            ]}
          />
        ) : null}

        {/* 학교 */}
        <FormSelect
          value={[form.schoolLevel, form.schoolGrade]}
          onChange={handleSelect}
          items={[
            { id: 'schoolLevel', defaultValue: '1', options: schoolLevelOptions },
            { id: 'schoolGrade', placeholder: '학년', options: schoolGradeOptions },
          ]}
        />
        <FormInput id="schoolName" label="학교명" value={form.schoolName} onChange={handleInputChange} />

        {/* 생년월일 */}
        <FormSelect
          value={[form.birthYear, form.birthMonth, form.birthDay]}
          onChange={handleSelect}
          items={[
            { id: 'birthYear', placeholder: '생년', options: birthYearOptions },
            { id: 'birthMonth', placeholder: '생월', options: birthMonthOptions },
            { id: 'birthDay', placeholder: '생일', options: birthDayOptions },
          ]}
        />

        {/* 연락처 */}
        <FormPhone id="parentPhone" label="부모님 연락처" value={form.parentPhone} onChange={handlePhoneChange} />
        <FormPhone id="phone" label="학생 연락처" value={form.phone} onChange={handlePhoneChange} />
      </FlexBox>

      <FlexBox flexDirection="column" alignItems="center" gap={0.75} sx={{ mt: 2 }}>
        <Button disabled={isSubmitDisabled} variant="contained" onClick={handleSubmit} sx={{ width: '20rem', height: '2.8rem' }}>
          <AppleTg>{isEditMode ? '수정' : '등록'}</AppleTg>
        </Button>
      </FlexBox>

      {/* 삭제 버튼 (하단 고정) */}
      {isEditMode && (
        <FlexBox justifyContent="center" sx={{ mt: 'auto' }}>
          <Button variant="outlined" color="error" onClick={openDeleteModal} sx={{ width: '20rem', height: '2.8rem' }}>
            <AppleTg>삭제</AppleTg>
          </Button>
        </FlexBox>
      )}

      <DeleteModal onConfirm={handleDelete} bodyText="삭제하시겠습니까?" />
    </FlexBox>
  );
};
