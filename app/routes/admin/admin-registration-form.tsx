import React from "react";
import { FlexBox } from "~/components/styled-elements";
import { FormInput, FormPhone } from "./components/form-components";
import { Button } from "@mui/material";
import { AppleTg } from "~/components/typography";
import { buildApi } from "~/lib/api-builder";
import { useQueryClient } from "@tanstack/react-query";
import { adminListQueryKey } from "./admin-management-page";

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

export type AdminFormData = {
  id?: string;
  name: string;
  email: string;
  phone: string[];
  password: string;
};

const defaultAdminForm = (): AdminFormData => ({
  name: '',
  email: '',
  phone: ['010', '', ''],
  password: '',
});

const registerAdminApi = buildApi({ path: '/admins', method: 'POST' });
const updateAdminApi = buildApi({ path: '/admins/:id', method: 'PUT' });

type Props = {
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
  editData?: AdminFormData | null;
  onComplete?: () => void;
};

export const AdminRegistrationForm = ({ showSuccess, showError, editData, onComplete }: Props) => {
  const queryClient = useQueryClient();
  const isEditMode = !!editData?.id;

  const [adminForm, setAdminForm] = React.useState<AdminFormData>(defaultAdminForm());

  React.useEffect(() => {
    if (editData) {
      setAdminForm(editData);
    } else {
      setAdminForm(defaultAdminForm());
    }
  }, [editData]);

  const submitButtonDisabled = React.useMemo(() => {
    if (isEditMode) return !adminForm.name || !adminForm.email;
    return !adminForm.name || !adminForm.email || !adminForm.password;
  }, [adminForm, isEditMode]);
  
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
  
  const handleSubmit = React.useCallback(async () => {
    if (submitButtonDisabled) return;

    try {
      const payload = {
        name: adminForm.name || null,
        email: adminForm.email || null,
        phone: adminForm.phone.filter(Boolean).length > 1 ? adminForm.phone.join('-') : null,
        role: AdminRoleType.ADMIN,
        ...(adminForm.password && { password: adminForm.password }),
      };

      if (isEditMode) {
        await updateAdminApi({ params: { id: adminForm.id! }, body: payload });
        showSuccess('관리자 정보가 수정되었습니다.');
      } else {
        await registerAdminApi({ body: payload });
        showSuccess('관리자 등록이 완료되었습니다.');
      }

      queryClient.invalidateQueries({ queryKey: adminListQueryKey() });
      setAdminForm(defaultAdminForm());
      onComplete?.();
    } catch (error: any) {
      if (error.message?.includes('존재하는')) {
        showError('이미 존재하는 이메일입니다.');
        return;
      }
      showError(isEditMode ? '관리자 수정 중 오류가 발생했습니다.' : '관리자 등록 중 오류가 발생했습니다.');
    }
  }, [adminForm, submitButtonDisabled, showError, showSuccess, isEditMode, queryClient, onComplete]);

  return (
    <FlexBox flexDirection="column" gap={1}>
      <FlexBox flexDirection="column" gap={1.25} fullWidth>
        <FormInput id="name" label="이름" value={adminForm.name} onChange={handleInputChange} />
        {!isEditMode && (
          <FormInput id="password" label="비밀번호" value={adminForm.password} onChange={handleInputChange} />
        )}
        <FormInput id="email" label="이메일" value={adminForm.email} onChange={handleInputChange} />
        <FormPhone id="phone" label="연락처" value={adminForm.phone} onChange={handlePhoneChange} />
      </FlexBox>
      <FlexBox>
        <Button 
          disabled={submitButtonDisabled} 
          variant="contained" 
          onClick={handleSubmit}
        >
          <AppleTg>{isEditMode ? '수정' : '등록'}</AppleTg>
        </Button>
      </FlexBox>
    </FlexBox>
  );
}