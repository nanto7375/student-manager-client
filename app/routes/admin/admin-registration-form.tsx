import React from "react";
import { FlexBox } from "~/components/styled-elements";
import { FormInput, FormPhone } from "./components/form-components";
import { Button } from "@mui/material";
import { AppleTg } from "~/components/typography";
import { buildApi } from "~/lib/api-builder";
import { useQueryClient } from "@tanstack/react-query";
import { adminListQueryKey } from "./admin-management-page";

// --- Types ---

export enum AdminRoleType {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff',
}

export type AdminFormData = {
  id?: string;
  name: string;
  email: string;
  phone: string[];
  password: string;
};

// --- Helpers ---

export const getAdminRoleLevel = (role: AdminRoleType) => {
  const levels: Record<AdminRoleType, number> = {
    [AdminRoleType.SUPER_ADMIN]: 4,
    [AdminRoleType.ADMIN]: 3,
    [AdminRoleType.MANAGER]: 2,
    [AdminRoleType.STAFF]: 1,
  };
  return levels[role] ?? 0;
};

const defaultAdminForm = (): AdminFormData => ({
  name: '',
  email: '',
  phone: ['010', '', ''],
  password: '',
});

const formatPhone = (phone: string[]) =>
  phone.filter(Boolean).length > 1 ? phone.join('-') : null;

// --- API ---

const registerAdminApi = buildApi({ path: '/admins', method: 'POST' });
const updateAdminApi = buildApi({ path: '/admins/:id', method: 'PUT' });

// --- Component ---

type Props = {
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
  editData?: AdminFormData | null;
  onComplete?: () => void;
};

export const AdminRegistrationForm = ({ showSuccess, showError, editData, onComplete }: Props) => {
  const queryClient = useQueryClient();
  const isEditMode = !!editData?.id;
  const [form, setForm] = React.useState<AdminFormData>(defaultAdminForm());

  React.useEffect(() => {
    setForm(editData ?? defaultAdminForm());
  }, [editData]);

  const isSubmitDisabled = isEditMode
    ? !form.name || !form.email
    : !form.name || !form.email || !form.password;

  const updateField = (id: string, value: string) => {
    setForm(prev => ({ ...prev, [id]: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (value.length > 30) return;
    updateField(e.target.id, value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 4) return;
    const [field, phoneIndex] = e.target.id.split('/');
    setForm(prev => {
      const phone = [...prev[field]];
      phone[phoneIndex] = value;
      return { ...prev, [field]: phone };
    });
  };

  const handleSubmit = async () => {
    if (isSubmitDisabled) return;

    const payload = {
      name: form.name || null,
      email: form.email || null,
      phone: formatPhone(form.phone),
      role: AdminRoleType.ADMIN,
      ...(form.password && { password: form.password }),
    };

    try {
      if (isEditMode) {
        await updateAdminApi({ params: { id: form.id! }, body: payload });
        showSuccess('관리자 정보가 수정되었습니다.');
      } else {
        await registerAdminApi({ body: payload });
        showSuccess('관리자 등록이 완료되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: adminListQueryKey() });
      setForm(defaultAdminForm());
      onComplete?.();
    } catch (error: any) {
      if (error.message?.includes('존재하는')) {
        showError('이미 존재하는 이메일입니다.');
        return;
      }
      showError(isEditMode ? '관리자 수정 중 오류가 발생했습니다.' : '관리자 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <FlexBox flexDirection="column" gap={1}>
      <FlexBox flexDirection="column" gap={1.25} fullWidth>
        <FormInput id="name" label="이름" value={form.name} onChange={handleInputChange} />
        {!isEditMode && <FormInput id="password" label="비밀번호" value={form.password} onChange={handleInputChange} />}
        <FormInput id="email" label="이메일" value={form.email} onChange={handleInputChange} />
        <FormPhone id="phone" label="연락처" value={form.phone} onChange={handlePhoneChange} />
      </FlexBox>
      <FlexBox>
        <Button disabled={isSubmitDisabled} variant="contained" onClick={handleSubmit}>
          <AppleTg>{isEditMode ? '수정' : '등록'}</AppleTg>
        </Button>
      </FlexBox>
    </FlexBox>
  );
};
