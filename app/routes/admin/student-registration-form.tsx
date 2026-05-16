import React from "react";
import { Button, type SelectChangeEvent } from "@mui/material";
import { useScheduleList } from "../schedule/page";
import { FlexBox } from "~/components/styled-elements";
import { FormInput, FormPhone, FormSelect } from "./components/form-components";
import { formatTime12Hour, mapNumberToDayOfWeek } from "~/lib/utils/time.util";
import { AppleTg } from "~/components/typography";
import dayjs from "dayjs";
import { buildApi } from "~/lib/api-builder";
import { useQueryClient } from "@tanstack/react-query";
import { studentListQueryKey } from "./student-management-page";

type RegisterStudentPayload = {
  name: string;
  schoolName: string;
  schoolLevel: number;
  schoolGrade: number;
  birthYear: string;
  birthDate: string;
  phone: string;
  parentPhone: string;
  scheduleId: number;
  note: string;
};


const defaultStudentForm = () => ({
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

const getSchoolGradeList = (level: string): number[] => {
  switch (level) {
    case '1':
      return [1, 2, 3, 4, 5, 6];
    case '2':
      return [1, 2, 3];
    case '3':
      return [1, 2, 3];
    default:
      return [];
  }
}

const registerStudentApi = buildApi({ path: '/students', method: 'POST' });
const updateStudentApi = buildApi({ path: '/students/:id', method: 'PATCH' });

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
  const nowYear = React.useMemo(() => dayjs().year(), []);
  const [studentForm, setStudentForm] = React.useState(defaultStudentForm());

  React.useEffect(() => {
    if (editData) {
      const phoneParts = editData.phone ? editData.phone.split('-') : ['010', '', ''];
      const parentPhoneParts = editData.parentPhone ? editData.parentPhone.split('-') : ['010', '', ''];
      setStudentForm({
        ...defaultStudentForm(),
        name: editData.name || '',
        schoolName: editData.schoolName || '',
        schoolLevel: editData.schoolLevel?.toString() || '1',
        schoolGrade: editData.schoolGrade?.toString(),
        phone: phoneParts,
        parentPhone: parentPhoneParts,
        scheduleId: editData.scheduleId?.toString(),
        note: editData.note || '',
      });
    } else {
      setStudentForm(defaultStudentForm());
    }
  }, [editData]);

  const submitButtonDisabled = React.useMemo(() => {
    if (isEditMode) return false;
    return !studentForm.name || !studentForm.scheduleId;
  }, [studentForm, isEditMode]);
  
  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const copied = { ...studentForm };
    const value = e.target.value.trim();
    if (value.length > 30) return;
    copied[e.target.id] = value;
    setStudentForm(copied);
  }, [studentForm]);

  const handlePhoneChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 4) return;

    const copied = { ...studentForm };
    const id = e.target.id;
    const [field, phoneIndex] = id.split('/');
    copied[field][phoneIndex] = value;
    setStudentForm(copied);
  }, [studentForm]);

  const handleSelect = React.useCallback((e: SelectChangeEvent, name: string) => {
    const copied = { ...studentForm };
    copied[name] = e.target.value;
    if (name === 'schoolLevel') {
      copied.schoolGrade = undefined;
    } 
    if (name === 'scheduleDayOfWeek') {
      console.log(e.target.value)
      copied.scheduleId = undefined;
    } 
    setStudentForm(copied);
  }, [studentForm]);

  const handleSubmit = React.useCallback(async () => {
    if (submitButtonDisabled) return;

    try {
      if (isEditMode) {
        const payload = {
          schoolName: studentForm.schoolName || null,
          schoolLevel: Number(studentForm.schoolLevel) || null,
          schoolGrade: Number(studentForm.schoolGrade) || null,
          birthYear: studentForm.birthYear || null,
          birthDate: (studentForm.birthMonth && studentForm.birthDay) ? `${studentForm.birthMonth < 10 ? '0' + studentForm.birthMonth : studentForm.birthMonth}${studentForm.birthDay < 10 ? '0' + studentForm.birthDay : studentForm.birthDay}` : null,
          phone: studentForm.phone.filter(Boolean).length > 1 ? studentForm.phone.join('-') : null,
          parentPhone: studentForm.parentPhone.filter(Boolean).length > 1 ? studentForm.parentPhone.join('-') : null,
        };
        await updateStudentApi({ params: { id: editData.id }, body: payload });
        showSuccess('학생 정보가 수정되었습니다.');
      } else {
        const payload: RegisterStudentPayload = {
          name: studentForm.name,
          schoolName: studentForm.schoolName || null,
          schoolLevel: Number(studentForm.schoolLevel) || null,
          schoolGrade: Number(studentForm.schoolGrade) || null,
          birthYear: studentForm.birthYear || null,
          birthDate: (studentForm.birthMonth && studentForm.birthDay) ? `${studentForm.birthMonth < 10 ? '0' + studentForm.birthMonth : studentForm.birthMonth}${studentForm.birthDay < 10 ? '0' + studentForm.birthDay : studentForm.birthDay}` : null,
          phone: studentForm.phone.filter(Boolean).length > 1 ? studentForm.phone.join('-') : null,
          parentPhone: studentForm.parentPhone.filter(Boolean).length > 1 ? studentForm.parentPhone.join('-') : null,
          scheduleId: Number(studentForm.scheduleId),
          note: studentForm.note || null,
        };
        await registerStudentApi({ body: payload });
        showSuccess('학생 등록이 완료되었습니다.');
      }

      queryClient.invalidateQueries({ queryKey: studentListQueryKey() });
      setStudentForm(defaultStudentForm());
      onComplete?.();
    } catch (error) {
      console.log(error);
      showError(isEditMode ? '학생 수정 중 오류가 발생했습니다.' : '학생 등록 중 오류가 발생했습니다.');
    }
  }, [studentForm, submitButtonDisabled, showError, showSuccess, isEditMode, queryClient, onComplete, editData]);

  return (
    <FlexBox flexDirection="column" gap={1}>
      <FlexBox flexDirection="column" gap={1.25} fullWidth>
        {!isEditMode ? (
          <FormInput id="name" label="이름" value={studentForm.name} onChange={handleInputChange} />
        ) : (
          <AppleTg>{editData.name}</AppleTg>
        )}

        {!isEditMode ? (
          <FormSelect 
            value={[studentForm.scheduleDayOfWeek, studentForm.scheduleId]} 
            onChange={handleSelect} 
            items={[
              {
                id: 'scheduleDayOfWeek', 
                placeholder: '수업 요일', 
                options: (Array.from({length: 7}, (_, i) => i))
                  .map(num => ({
                    value: num, 
                    label: mapNumberToDayOfWeek(num)
                  })
                )
              },
              {
                id: 'scheduleId', 
                placeholder: '수업 시간', 
                options: (scheduleList || [] )
                  .filter(schedule => schedule.dayOfWeek === studentForm.scheduleDayOfWeek)
                  .map(schedule => ({
                    value: schedule.id, 
                    label: formatTime12Hour(schedule.startTime) + ' - ' + formatTime12Hour(schedule.endTime)
                  })
                )
              }
            ]} 
          />
        ) : (
          <AppleTg>{editData.schedule ? `${mapNumberToDayOfWeek(editData.schedule.dayOfWeek)} ${formatTime12Hour(editData.schedule.startTime)} - ${formatTime12Hour(editData.schedule.endTime)}` : '-'}</AppleTg>
        )}

        <FormSelect 
          value={[studentForm.schoolLevel, studentForm.schoolGrade]} 
          onChange={handleSelect} 
          items={[
            {id: 'schoolLevel', defaultValue: '1', options: [{value: '1', label: '초등학교'}, {value: '2', label: '중학교'}, {value: '3', label: '고등학교'}]},
            {id: 'schoolGrade' , placeholder: '학년', options: getSchoolGradeList(studentForm.schoolLevel).map(grade => ({value: grade.toString(), label: grade.toString()}))}
          ]} 
        />

        <FormInput id="schoolName" label="학교명" value={studentForm.schoolName} onChange={handleInputChange} />

        <FormSelect 
          value={[studentForm.birthYear, studentForm.birthMonth, studentForm.birthDay]} 
          onChange={handleSelect} 
          items={[
            {id: 'birthYear', placeholder: '생년', options: Array.from({length: 20}, (_, i) => i).map(aaa => ({value: (nowYear - aaa).toString(), label: (nowYear - aaa).toString()}))},
            {id: 'birthMonth', placeholder: '생월', options: Array.from({length: 12}, (_, i) => i + 1).map(month => ({value: month.toString(), label: month.toString()}))}, 
            {id: 'birthDay', placeholder: '생일', options: Array.from({length: 31}, (_, i) => i + 1).map(day => ({value: day.toString(), label: day.toString()}))}] 
          } 
        />
        
        <FormPhone id="parentPhone" label="부모님 연락처" value={studentForm.parentPhone} onChange={handlePhoneChange} />

        <FormPhone id="phone" label="학생 연락처" value={studentForm.phone} onChange={handlePhoneChange} />
      </FlexBox>
      <FlexBox>
        <Button disabled={submitButtonDisabled} variant="contained" onClick={handleSubmit}><AppleTg>{isEditMode ? '수정' : '등록'}</AppleTg></Button>
      </FlexBox>
    </FlexBox>
  );
}