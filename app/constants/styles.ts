/** 공통 테이블 스타일: 짝수 row 배경 + 헤더 배경 */
export const TABLE_STYLE = {
  '& tbody tr:nth-of-type(even)': { backgroundColor: '#fafafa' },
  '& thead th': { backgroundColor: '#f5f5f5' },
} as const;

export const TABLE_CONTAINER_STYLE = {
  maxHeight: 'calc(100vh - 15rem)',
  overflow: 'auto',
  border: '1px solid #e0e0e0',
} as const;
