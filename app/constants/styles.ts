/** 공통 테이블 스타일: 짝수 row 배경 + 헤더 배경 */
export const TABLE_STYLE = {
  '& tbody tr:nth-of-type(even)': { backgroundColor: '#fafafa' },
  '& thead th': { backgroundColor: '#f5f5f5' },
  '& tbody tr:last-of-type td': { borderBottom: 'none' },
} as const;

export const TABLE_CONTAINER_STYLE = {
  maxHeight: 'calc(100vh - 15rem)',
  overflow: 'auto',
  border: '1px solid #e0e0e0',
} as const;

/** 공통 Select sx: 관리 페이지 정렬/페이지 크기 셀렉트 */
export const ADMIN_SELECT_SX = {
  textAlign: 'center',
  '& .MuiSelect-select': { py: '0.4rem' },
  '& .MuiOutlinedInput-notchedOutline': { top: 0, legend: { display: 'none' } },
} as const;
