import React from "react";
import { createNoteApi } from "~/lib/api/students.api";
import { useGlobalToast } from "~/providers/toast-provider";

export const useMemoModal = (onSuccess: () => void) => {
  const toast = useGlobalToast();
  const [memoInput, setMemoInput] = React.useState('');
  const [memoTargetStudentId, setMemoTargetStudentId] = React.useState<number | null>(null);
  const [memoType, setMemoType] = React.useState<'fixed-memo' | 'temporary-memo'>('temporary-memo');

  const closeMemoModal = () => { setMemoTargetStudentId(null); setMemoInput(''); };

  const handleAddMemo = async (studentId: number) => {
    if (!memoInput.trim()) return;
    try {
      await createNoteApi({ params: { studentId }, body: { value: memoInput.trim(), type: memoType } });
      onSuccess();
      closeMemoModal();
    } catch (e) {
      console.error(e);
      toast.error('메모 추가에 실패했습니다.');
    }
  };

  return { memoInput, setMemoInput, memoTargetStudentId, setMemoTargetStudentId, memoType, setMemoType, closeMemoModal, handleAddMemo };
};
