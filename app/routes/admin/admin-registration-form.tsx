import React from "react";
import { FlexBox } from "~/components/styled-elements";
import { FormInput, FormPhone } from "./components/form-components";
import { Button } from "@mui/material";
import { AppleTg } from "~/components/typography";
import { buildApi } from "~/lib/api-builder";


export enum AdminRoleType {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff',
}

export const getAdminRoleLevel = (role: AdminRoleType) => {
  switch (role) {
    case AdminRoleType.SUPER_ADMIN:
      return 4;
    case AdminRoleType.ADMIN:
      return 3;
    case AdminRoleType.MANAGER:
      return 2;
    case AdminRoleType.STAFF:
      return 1;
    default:
      return 0;
  }
};

const defaultAdminForm = () => ({
  name: '',
  email: '',
  phone: ['010', '', ''],
  password: '',
});

const registerAdminApi = buildApi({ path: '/admins', method: 'POST' });

export const AdminRegistrationForm = ({showSuccess, showError}) => {
  const [adminForm, setAdminForm] = React.useState(defaultAdminForm());

  const submitButtonDisabled = React.useMemo(() => {
    return !adminForm.name || !adminForm.email || !adminForm.phone || !adminForm.password;
  }, [adminForm]);
  
  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const copied = { ...adminForm };
    const value = e.target.value.trim();
    if (value.length > 30) return;
    copied[e.target.id] = value;
    setAdminForm(copied);
  }, [adminForm]);

  const handlePhoneChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 4) return;

    const copied = { ...adminForm };
    const id = e.target.id;
    const [field, phoneIndex] = id.split('/');
    copied[field][phoneIndex] = value;
    setAdminForm(copied);
  }, [adminForm]);
  
  const handleRegister = React.useCallback(async () => {
    if (submitButtonDisabled) return;

    // TODO: pasword hash
    try {
      const payload = {
        name: adminForm.name,
        email: adminForm.email,
        phone: adminForm.phone.join('-'),
        role: AdminRoleType.ADMIN,
        password: adminForm.password,
      }
      await registerAdminApi({ body: payload });
      setAdminForm(defaultAdminForm());
      showSuccess('관리자 등록이 완료되었습니다.');
    } catch (error) {
      console.log(error);
      if (error.message.includes('존재하는')) {
        showError('이미 존재하는 이메일입니다.');
        return;
      }
      showError('관리자 등록 중 오류가 발생했습니다.');
    }
  }, [adminForm, submitButtonDisabled, showError, showSuccess]);

  return (
    <FlexBox flexDirection="column" gap={1}>
      <FlexBox flexDirection="column">
        <FlexBox>관리자 등록</FlexBox>
      </FlexBox>

      <FlexBox flexDirection="column" gap={1.25} fullWidth>
        <FormInput id="name" label="이름" value={adminForm.name} onChange={handleInputChange} />
        <FormInput id="password" label="비밀번호" value={adminForm.password} onChange={handleInputChange} />
        <FormInput id="email" label="이메일" value={adminForm.email} onChange={handleInputChange} />
        <FormPhone id="phone" label="연락처" value={adminForm.phone} onChange={handlePhoneChange} />
      </FlexBox>
      <FlexBox>
        <Button 
          disabled={submitButtonDisabled} 
          variant="contained" 
          onClick={handleRegister}
        >
          <AppleTg>등록</AppleTg>
        </Button>
      </FlexBox>
    </FlexBox>
  );
}