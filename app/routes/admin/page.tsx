import React from "react";
import dayjs from "dayjs";

import { FlexBox, FlexContainer } from "~/components/styled-elements";
import { useScheduleList } from "../schedule/page";
import { formatTime12Hour, mapNumberToDayOfWeek } from "~/lib/utils/time.util";
import { useGlobalToast } from "~/providers/toast-provider";
import { useMutation } from "@tanstack/react-query";
import { buildApi } from "~/lib/api-builder";

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

const registerStudentApi = buildApi({ path: '/students', method: 'POST' });

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

const defaultStudentForm = {
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
}

export default function Admin() {
  const { scheduleList } = useScheduleList();
  const nowYear = React.useMemo(() => dayjs().year(), []);
  const registerStudent = useMutation({ mutationFn: registerStudentApi });
  const { error: showError, success: showSuccess } = useGlobalToast();

  const [studentForm, setStudentForm] = React.useState(defaultStudentForm);

  const submitButtonDisabled = React.useMemo(() => {
    return !studentForm.name || !studentForm.scheduleId;
  }, [studentForm]);
  
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

  const handleSelectBirth = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const copied = { ...studentForm };
    copied[e.target.id] = value;
    setStudentForm(copied);
  }, [studentForm]);

  const handleSelectSchool = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const copied = { ...studentForm };
    copied[e.target.id] = value;
    setStudentForm(copied);
  }, [studentForm]);

  const handleSelectSchedule = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const copied = { ...studentForm };
    copied[e.target.id] = value;
    setStudentForm(copied);
  }, [studentForm]);

  const handleSubmit = React.useCallback(async () => {
    if (submitButtonDisabled) return;

    try {
      const payload: RegisterStudentPayload = {
        name: studentForm.name,
        schoolName: studentForm.schoolName,
        schoolLevel: Number(studentForm.schoolLevel) || null,
        schoolGrade: Number(studentForm.schoolGrade) || null,
        birthYear: studentForm.birthYear,
        birthDate: `${studentForm.birthMonth && (studentForm.birthMonth < 10 ? '0' + studentForm.birthMonth : studentForm.birthMonth)}${studentForm.birthDay && (studentForm.birthDay < 10 ? '0' + studentForm.birthDay : studentForm.birthDay)}`,
        phone: studentForm.phone.join('-'),
        parentPhone: studentForm.parentPhone.join('-'),
        scheduleId: Number(studentForm.scheduleId),
        note: studentForm.note,
      }
    
      const result = await registerStudent.mutateAsync({ body: payload });
      setStudentForm({...defaultStudentForm});
      showSuccess('학생 등록이 완료되었습니다.');
    } catch (error) {
      console.log(error);
      showError('학생 등록 중 오류가 발생했습니다.');
    }
  }, [studentForm, submitButtonDisabled, registerStudent, showError, showSuccess]);

  return (
    <FlexContainer flexDirection="column" fullHeight fullWidth sx={{padding: '1rem'}}>
      <FlexBox width="100%" height="3rem">Admin</FlexBox>

      <FlexBox flexDirection="column">
        <FlexBox>학생등록</FlexBox>
      </FlexBox>
        <FlexBox flexDirection="column" gap={1} fullWidth>
          <FormInput id="name" label="이름" value={studentForm.name} onChange={handleInputChange} />

          <FormSelect 
            label="수업시간" 
            value={[studentForm.scheduleDayOfWeek, studentForm.scheduleId]} 
            onChange={handleSelectSchedule} 
            items={[
              {id: 'scheduleDayOfWeek', placeholder: '요일', options: (Array.from({length: 7}, (_, i) => i + 1)).map(num => ({value: mapNumberToDayOfWeek(num), label: mapNumberToDayOfWeek(num)}))},
              {id: 'scheduleId', placeholder: '시간', options: (scheduleList || [] ).filter(schedule => schedule.dayOfWeek === studentForm.scheduleDayOfWeek).map(schedule => ({value: schedule.id, label: formatTime12Hour(schedule.startTime) + ' - ' + formatTime12Hour(schedule.endTime)}))}
            ]} 
          />

          <FormSelect 
            label="학년" 
            value={[studentForm.schoolLevel, studentForm.schoolGrade]} 
            onChange={handleSelectSchool} 
            items={[
              {id: 'schoolLevel', defaultValue: '1', options: [{value: '1', label: '초등학교'}, {value: '2', label: '중학교'}, {value: '3', label: '고등학교'}]},
              {id: 'schoolGrade' , placeholder: '학년', options: getSchoolGradeList(studentForm.schoolLevel).map(grade => ({value: grade.toString(), label: grade.toString()}))}
            ]} 
          />

          <FormInput id="schoolName" label="학교명" value={studentForm.schoolName} onChange={handleInputChange} />

          <FormSelect 
            label="생년월일" 
            value={[studentForm.birthYear, studentForm.birthMonth, studentForm.birthDay]} 
            onChange={handleSelectBirth} 
            items={[
              {id: 'birthYear', placeholder: '년', options: Array.from({length: 20}, (_, i) => i).map(aaa => ({value: (nowYear - aaa).toString(), label: (nowYear - aaa).toString()}))},
              {id: 'birthMonth', placeholder: '월', options: Array.from({length: 12}, (_, i) => i + 1).map(month => ({value: month.toString(), label: month.toString()}))}, 
              {id: 'birthDay', placeholder: '일', options: Array.from({length: 31}, (_, i) => i + 1).map(day => ({value: day.toString(), label: day.toString()}))}] 
            } 
          />

          <FormPhone id="phone" label="학생 연락처" value={studentForm.phone} onChange={handlePhoneChange} />
          
          <FormPhone id="parentPhone" label="부모님 연락처" value={studentForm.parentPhone} onChange={handlePhoneChange} />
        </FlexBox>
        <FlexBox>
          <FlexBox button onClick={handleSubmit}>등록</FlexBox>
        </FlexBox>
    </FlexContainer>
  );
}

const FormInput = ({ id, label, value, onChange }: { id: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
  return (
    <FlexBox gap={1}>
      <FlexBox center sx={{width: '10rem', border: '1px solid red'}}>{label}</FlexBox>
      <FlexBox sx={{width: '20rem'}}><input type="text" id={id} value={value} onChange={onChange} style={{width: '100%'}} /></FlexBox>
    </FlexBox>
  )
};

const FormPhone = ({ id, label, value, onChange }: { id: string, label: string, value: string[], onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
  return (
    <FlexBox gap={1}>
      <FlexBox center sx={{width: '10rem', border: '1px solid red'}}>{label}</FlexBox>
      <FlexBox>
        <FlexBox sx={{width: '4rem'}}><input type="text" id={id + '/0'} value={value[0]} onChange={onChange} style={{width: '100%', textAlign: 'center'}} /></FlexBox>
        &nbsp;-&nbsp;
        <FlexBox sx={{width: '4rem'}}><input type="text" id={id + '/1'} value={value[1]} onChange={onChange} style={{width: '100%', textAlign: 'center'}} /></FlexBox>
        &nbsp;-&nbsp;
        <FlexBox sx={{width: '4rem'}}><input type="text" id={id + '/2'} value={value[2]} onChange={onChange} style={{width: '100%', textAlign: 'center'}} /></FlexBox>
      </FlexBox>
    </FlexBox>
  )
};

type SelectItemProps = {
  id: string;
  defaultValue?: string | number | undefined;
  placeholder?: string;
  options: { value: string | number, label: string }[];
}
type FormSelectProps = {
  label: string;
  value: string[] | (string | number | undefined)[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  items: SelectItemProps[];
}
const FormSelect = ({ label, value, onChange, items }: FormSelectProps) => {
  return (
    <FlexBox gap={1}>
      <FlexBox center sx={{width: '10rem', border: '1px solid red'}}>{label}</FlexBox>
      <FlexBox sx={{width: '20rem'}}>
        {items.map((item, index) => (
          <select key={item.id} id={item.id} value={value[index] || item.defaultValue || ''} onChange={onChange} style={{width: '100%', textAlign: 'center'}}>  
            {item.placeholder && <option value="" style={{textAlign: 'center'}}>{item.placeholder}</option>}
            {item.options.map(option => (
              <option key={option.value} value={option.value} style={{textAlign: 'center'}}>{option.label}</option>
            ))}
          </select>
        ))}
      </FlexBox>
    </FlexBox>
  )
};

