import React from "react";

/** 강의실 간 드래그앤드롭 훅 */
export const useClassroomDrop = (classroomId: number, onDrop: (studentId: number, classroomId: number) => void) => {
  const [dragOver, setDragOver] = React.useState(false);

  const dropHandlers = {
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); },
    onDragLeave: () => setDragOver(false),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const studentId = Number(e.dataTransfer.getData('studentId'));
      const fromClassroomId = Number(e.dataTransfer.getData('classroomId'));
      if (studentId && fromClassroomId !== classroomId) onDrop(studentId, classroomId);
    },
  };

  return { dragOver, dropHandlers };
};

/** 드래그 핸들의 onDragStart: row 전체를 드래그 이미지로 사용 */
export const createDragStartHandler = (studentId: number, classroomId: number) =>
  (e: React.DragEvent) => {
    e.dataTransfer.setData('studentId', String(studentId));
    e.dataTransfer.setData('classroomId', String(classroomId));
    const row = (e.target as HTMLElement).closest('tr');
    if (row) {
      const rect = row.getBoundingClientRect();
      e.dataTransfer.setDragImage(row, e.clientX - rect.left, e.clientY - rect.top);
    }
  };
