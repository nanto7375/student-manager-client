import React from "react";
import { FlexBox } from "~/components/styled-elements";
import { FormInput, FormPhone } from "./components/form-components";
import { Button, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { AppleTg } from "~/components/typography";
import { buildApi } from "~/lib/api-builder";
import { useQueryClient } from "@tanstack/react-query";
import { adminListQueryKey } from "./admin-management-page";
import { auth } from "~/lib/auth";
import { hashPassword } from "~/lib/utils/crypto.util";
import { useConfirmModal } from "~/hooks/use-confirm-modal";

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
  role: AdminRoleType;
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
  role: AdminRoleType.ADMIN,
});

const formatPhone = (phone: string[]) =>
  phone.filter(Boolean).length > 1 ? phone.join('-') : null;

// --- API ---

const registerAdminApi = buildApi({ path: '/admins', method: 'POST' });
const updateAdminApi = buildApi({ path: '/admins/:id', method: 'PUT' });
const deleteAdminApi = buildApi({ path: '/admins/:id', method: 'DELETE' });
const resetPasswordApi = buildApi({ path: '/admins/:id/password', method: 'PATCH' });

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
  const [passwordConfirm, setPasswordConfirm] = React.useState('');
  const [errors, setErrors] = React.useState<{ password?: boolean; email?: boolean }>({});
  const { ConfirmModal: DeleteModal, openConfirmModal: openDeleteModal, closeConfirmModal: closeDeleteModal } = useConfirmModal();

  React.useEffect(() => {
    setForm(editData ?? defaultAdminForm());
  }, [editData]);

  const isSubmitDisabled = isEditMode
    ? !form.name || !form.email
    : !form.name || !form.email || !form.password || form.phone.filter(Boolean).length < 3;

  const updateField = (id: string, value: string) => {
    setForm(prev => ({ ...prev, [id]: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (value.length > 30) return;
    if (e.target.id === 'password' && /\s/.test(e.target.value)) return;
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

  const myLevel = auth.getMyInfo()?.level ?? 0;
  const isSelf = isEditMode && form.email === auth.getMyInfo()?.email;
  const canChangeRole = myLevel >= 4 && !isSelf;

  const handleDelete = async () => {
    if (!form.id) return;
    try {
      await deleteAdminApi({ params: { id: form.id } });
      showSuccess('선생님이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: adminListQueryKey() });
      closeDeleteModal();
      onComplete?.();
    } catch {
      showError('선생님 삭제 중 오류가 발생했습니다.');
    }
  };

  const [showPasswordChange, setShowPasswordChange] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = React.useState('');
  const [newPasswordError, setNewPasswordError] = React.useState(false);

  const handleResetPassword = async () => {
    if (!showPasswordChange) {
      setShowPasswordChange(true);
      return;
    }
    if (!form.id || !newPassword) return;
    if (newPassword !== newPasswordConfirm) {
      showError('비밀번호가 일치하지 않습니다.');
      setNewPasswordError(true);
      return;
    }
    setNewPasswordError(false);
    try {
      const hashedPassword = await hashPassword(newPassword);
      await resetPasswordApi({ params: { id: form.id }, body: { password: hashedPassword } });
      showSuccess('비밀번호가 변경되었습니다.');
      setShowPasswordChange(false);
      setNewPassword('');
      setNewPasswordConfirm('');
    } catch {
      showError('비밀번호 변경 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = async () => {
    if (isSubmitDisabled) return;
    setErrors({});

    if (!isEditMode && form.password !== passwordConfirm) {
      showError('비밀번호가 일치하지 않습니다.');
      setErrors(prev => ({ ...prev, password: true }));
      return;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      showError('올바른 이메일 형식을 입력해주세요.');
      setErrors(prev => ({ ...prev, email: true }));
      return;
    }

    const hashedPassword = form.password ? await hashPassword(form.password) : undefined;

    const payload = {
      // name: form.name || null,
      email: form.email || null,
      phone: formatPhone(form.phone),
      role: form.role,
      ...(hashedPassword && { password: hashedPassword }),
    };

    try {
      if (isEditMode) {
        await updateAdminApi({ params: { id: form.id! }, body: payload });
        showSuccess('선생님 정보가 수정되었습니다.');
      } else {
        await registerAdminApi({ body: payload });
        showSuccess('선생님 등록이 완료되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: adminListQueryKey() });
      setForm(defaultAdminForm());
      onComplete?.();
    } catch (error: any) {
      if (error.message?.includes('존재하는')) {
        showError('이미 존재하는 이메일입니다.');
        return;
      }
      showError(isEditMode ? '선생님 수정 중 오류가 발생했습니다.' : '선생님 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <FlexBox flexDirection="column" gap={1} alignItems="center">
      <FlexBox flexDirection="column" gap={1.25} alignItems="center" fullWidth>
        {!isEditMode && <FormInput id="name" label="이름" value={form.name} onChange={handleInputChange} />}
        {!isEditMode && <FormInput id="password" label="비밀번호" value={form.password} onChange={handleInputChange} type="password" error={errors.password} />}
        {!isEditMode && <FormInput id="passwordConfirm" label="비밀번호 확인" value={passwordConfirm} onChange={(e) => { if (/\s/.test(e.target.value)) return; setPasswordConfirm(e.target.value.trim()); }} type="password" error={errors.password} />}
        <FormInput id="email" label="이메일" value={form.email} onChange={handleInputChange} error={errors.email} />
        <FormPhone id="phone" label="연락처" value={form.phone} onChange={handlePhoneChange} />
        <FormControl sx={{ width: '20rem' }}>
          <InputLabel>권한</InputLabel>
          <Select
            label="권한"
            value={form.role}
            onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value as AdminRoleType }))}
            disabled={isEditMode && !canChangeRole}
            sx={{ textAlign: 'center' }}
          >
            <MenuItem value={AdminRoleType.SUPER_ADMIN}>Lv.4 슈퍼 관리자</MenuItem>
            <MenuItem value={AdminRoleType.ADMIN}>Lv.3 관리자</MenuItem>
            <MenuItem value={AdminRoleType.MANAGER}>Lv.2 매니저</MenuItem>
            <MenuItem value={AdminRoleType.STAFF}>Lv.1 스태프</MenuItem>
          </Select>
        </FormControl>
      </FlexBox>
      {showPasswordChange && (
        <FlexBox flexDirection="column" gap={1.25} alignItems="center" fullWidth sx={{ mt: 1 }}>
          <FormInput id="newPassword" label="새 비밀번호" value={newPassword} onChange={(e) => { if (/\s/.test(e.target.value)) return; setNewPassword(e.target.value.trim()); }} type="password" error={newPasswordError} />
          <FormInput id="newPasswordConfirm" label="새 비밀번호 확인" value={newPasswordConfirm} onChange={(e) => { if (/\s/.test(e.target.value)) return; setNewPasswordConfirm(e.target.value.trim()); }} type="password" error={newPasswordError} />
        </FlexBox>
      )}
      <FlexBox flexDirection="column" alignItems="center" gap={0.75} sx={{ mt: 2 }}>
        <Button disabled={isSubmitDisabled} variant="contained" onClick={handleSubmit} sx={{ width: '20rem', height: '2.8rem' }}>
          <AppleTg>{isEditMode ? '수정' : '등록'}</AppleTg>
        </Button>
        {isEditMode && myLevel >= 3 && (
          <Button variant="outlined" onClick={handleResetPassword} disabled={showPasswordChange && (!newPassword || !newPasswordConfirm)} sx={{ width: '20rem', height: '2.8rem' }}>
            <AppleTg>비밀번호 변경</AppleTg>
          </Button>
        )}
        {isEditMode && myLevel >= 3 && (
          <Button variant="outlined" color="error" onClick={openDeleteModal} sx={{ width: '20rem', height: '2.8rem' }}>
            <AppleTg>삭제</AppleTg>
          </Button>
        )}
      </FlexBox>

      <DeleteModal onConfirm={handleDelete} bodyText="삭제하시겠습니까?" />
    </FlexBox>
  );
};
