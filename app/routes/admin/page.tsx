import React from "react";
import dayjs from "dayjs";

import { FlexBox, FlexContainer } from "~/components/styled-elements";
import { useScheduleList } from "../schedule/page";
import { formatTime12Hour, mapNumberToDayOfWeek } from "~/lib/utils/time.util";
import { useGlobalToast } from "~/providers/toast-provider";
import { useMutation } from "@tanstack/react-query";
import { buildApi } from "~/lib/api-builder";
import { Button, FormControl, InputLabel, MenuItem, Select, TextField, type SelectChangeEvent } from "@mui/material";
import { AppleTg } from "~/components/typography";

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

  const handleSelect = React.useCallback((e: SelectChangeEvent, name: string) => {
    const copied = { ...studentForm };
    copied[name] = e.target.value;
    if (name === 'schoolLevel') {
      copied.schoolGrade = undefined;
    } 
    if (name === 'scheduleDayOfWeek') {
      copied.scheduleId = undefined;
    } 
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
        <FlexBox flexDirection="column" gap={1.25} fullWidth>
          <FormInput id="name" label="이름" value={studentForm.name} onChange={handleInputChange} />

          <FormSelect 
            value={[studentForm.scheduleDayOfWeek, studentForm.scheduleId]} 
            onChange={handleSelect} 
            items={[
              {id: 'scheduleDayOfWeek', placeholder: '수업 요일', options: (Array.from({length: 7}, (_, i) => i + 1)).map(num => ({value: mapNumberToDayOfWeek(num), label: mapNumberToDayOfWeek(num)}))},
              {id: 'scheduleId', placeholder: '수업 시간', options: (scheduleList || [] ).filter(schedule => schedule.dayOfWeek === studentForm.scheduleDayOfWeek).map(schedule => ({value: schedule.id, label: formatTime12Hour(schedule.startTime) + ' - ' + formatTime12Hour(schedule.endTime)}))}
            ]} 
          />

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

          <FormPhone id="phone" label="학생 연락처" value={studentForm.phone} onChange={handlePhoneChange} />
          
          <FormPhone id="parentPhone" label="부모님 연락처" value={studentForm.parentPhone} onChange={handlePhoneChange} />
        </FlexBox>
        <FlexBox>
          <Button disabled={submitButtonDisabled} variant="contained" onClick={handleSubmit}><AppleTg>등록</AppleTg></Button>
        </FlexBox>
    </FlexContainer>
  );
}

const FormInput = ({ id, label, value, onChange }: { id: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
  return (
    <FlexBox sx={{width: '20rem'}}><TextField label={label} id={id} value={value} onChange={onChange} fullWidth /></FlexBox>
  )
};

const FormPhone = ({ id, label, value, onChange }: { id: string, label: string, value: string[], onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
  return (
    <FlexBox sx={{width: '20rem', gap: 1, justifyContent: 'center'}}>
      <TextField label={label} type="text" id={id + '/0'} value={value[0]} onChange={onChange} />
      <TextField type="text" id={id + '/1'} value={value[1]} onChange={onChange} />
      <TextField type="text" id={id + '/2'} value={value[2]} onChange={onChange} />
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
  value: string[] | (string | number | undefined)[];
  onChange: (e: SelectChangeEvent, name: string) => void;
  items: SelectItemProps[];
}
const FormSelect = ({ value, onChange, items }: FormSelectProps) => {
  return (
    <FlexBox sx={{width: '20rem', gap: 1}}>
      {items.map((item, index) => (
        <FormControl key={item.id} fullWidth sx={{minWidth: 0}}>
          <InputLabel id={item.id}>{item.placeholder}</InputLabel>
          <Select 
            labelId={item.id} 
            label={item.placeholder} 
            value={value[index] || item.defaultValue || ''} 
            onChange={(e: SelectChangeEvent) => onChange(e, item.id)} 
            sx={{
              width: '100%',
              textAlign: 'center',
              height: '3.5rem',
              '& .MuiSelect-select': {
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }
            }}
          >  
            {item.options.map(option => (
              <MenuItem key={option.value} value={option.value} sx={{textAlign: 'center'}}><AppleTg>{option.label}</AppleTg></MenuItem>
            ))}
          </Select>
        </FormControl>
      ))}
    </FlexBox>
  )
};

