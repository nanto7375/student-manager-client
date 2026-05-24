import React from "react";
import { useSearchParams } from "react-router";
import { FlexContainer, FlexBox } from "~/components/styled-elements";
import { AdminRegistrationForm, AdminRoleType, type AdminFormData } from "./admin-registration-form";
import { useGlobalToast } from "~/providers/toast-provider";
import { buildApi } from "~/lib/api-builder";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { AppleTg } from "~/components/typography";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Drawer, IconButton, TablePagination, Select, MenuItem } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";

// --- Types ---

type Admin = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: Date;
  deletedAt: Date | null;
};

// --- API ---

const getAdminListApi = buildApi<{ list: Admin[]; count: number }>({ path: '/admins', method: 'GET' });
export const adminListQueryKey = () => ['admin-list'] as const;

// --- Helpers ---

const toAdminFormData = (admin: Admin): AdminFormData => ({
  id: admin.id,
  name: admin.name,
  email: admin.email,
  phone: admin.phone ? admin.phone.split('-') : ['010', '', ''],
  password: '',
  role: admin.role as AdminRoleType,
});

// --- Constants ---

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50] as const;

// --- Component ---

type PageProps = {
  registerOpen?: boolean;
  onRegisterClose?: () => void;
  showDeleted?: boolean;
};

export const AdminManagementPage = ({ registerOpen, onRegisterClose, showDeleted }: PageProps) => {
  const { error: showError, success: showSuccess } = useGlobalToast();

  // Pagination & Sort (querystring 기반)
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 0; // 0-based (MUI TablePagination 기준)
  const rowsPerPage = Number(searchParams.get('limit')) || 20;
  const sort = searchParams.get('sort') || 'createdAt-asc';

  const setPage = (p: number) => setSearchParams(prev => { const params = new URLSearchParams(prev); p > 0 ? params.set('page', String(p)) : params.delete('page'); return params; }, { replace: true });

  // querystring 업데이트 헬퍼 (page 자동 리셋)
  const updateParams = (updater: (p: URLSearchParams) => void) => {
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      updater(p);
      p.delete('page');
      return p;
    }, { replace: true });
  };

  // Data
  const { data: adminListData, isLoading } = useQuery({
    queryKey: [...adminListQueryKey(), page, rowsPerPage, showDeleted, sort],
    queryFn: () => getAdminListApi({ query: { page: page + 1, limit: rowsPerPage, sort, ...(!showDeleted && { status: 'active' }) } }),
    placeholderData: keepPreviousData,
  });
  const adminList = adminListData?.list ?? [];
  const totalCount = adminListData?.count ?? 0;

  // Drawer state
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editData, setEditData] = React.useState<AdminFormData | null>(null);
  const [isDeleted, setIsDeleted] = React.useState(false);

  React.useEffect(() => {
    if (registerOpen) { setEditData(null); setIsDeleted(false); setDrawerOpen(true); }
  }, [registerOpen]);

  const openEditDrawer = (admin: Admin) => { setEditData(toAdminFormData(admin)); setIsDeleted(!!admin.deletedAt); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setEditData(null); setIsDeleted(false); onRegisterClose?.(); };

  // Render
  return (
    <FlexContainer>
      <FlexBox flexDirection="column" gap={1} fullWidth>
        {/* RowsPerPage + Pagination */}
        <FlexBox justifyContent="flex-end" alignItems="center" fullWidth gap={1}>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]}
            onRowsPerPageChange={() => {}}
            labelDisplayedRows={({ from, to, count }) => `${count} of ${from}-${to}`}
          />
          <Select size="small" value={sort} onChange={(e) => updateParams(p => p.set('sort', e.target.value))} sx={{ width: '9rem', textAlign: 'center', '& .MuiSelect-select': { py: '0.4rem' }, '& .MuiOutlinedInput-notchedOutline': { top: 0, legend: { display: 'none' } } }}>
            <MenuItem value="createdAt-asc" sx={{ justifyContent: 'center' }}>오래된 등록순</MenuItem>
            <MenuItem value="createdAt-desc" sx={{ justifyContent: 'center' }}>최근 등록순</MenuItem>
            <MenuItem value="name-asc" sx={{ justifyContent: 'center' }}>이름순</MenuItem>
          </Select>
          <Select size="small" value={rowsPerPage} onChange={(e) => updateParams(p => p.set('limit', String(e.target.value)))} sx={{ minWidth: '7rem', textAlign: 'center', '& .MuiSelect-select': { py: '0.4rem' }, '& .MuiOutlinedInput-notchedOutline': { top: 0, legend: { display: 'none' } } }}>
            {ROWS_PER_PAGE_OPTIONS.map(n => <MenuItem key={n} value={n} sx={{ justifyContent: 'center' }}>{n}개</MenuItem>)}
          </Select>
        </FlexBox>

        {/* Table */}
          <>
            <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 15rem)', overflow: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" width="5%">#</TableCell>
                    <TableCell align="center" width="12%">이름</TableCell>
                    <TableCell align="center" width="27%">이메일</TableCell>
                    <TableCell align="center" width="17%">연락처</TableCell>
                    <TableCell align="center" width="10%">권한</TableCell>
                    <TableCell align="center" width="20%">날짜</TableCell>
                    <TableCell align="center" width="9%">편집</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {adminList.map((admin, index) => (
                    <TableRow key={admin.id} sx={{ height: '4rem' }}>
                      <TableCell align="center">{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell align="center">{admin.name}</TableCell>
                      <TableCell align="center">{admin.email}</TableCell>
                      <TableCell align="center">{admin.phone}</TableCell>
                      <TableCell align="center">{admin.role}</TableCell>
                      <TableCell align="center">
                        <AppleTg sx={{ fontSize: '0.75rem' }}>등록일 {new Date(admin.createdAt).toLocaleDateString('ko-KR')}</AppleTg>
                        {admin.deletedAt && (
                          <AppleTg sx={{ fontSize: '0.75rem', color: 'red' }}>삭제일 {new Date(admin.deletedAt).toLocaleDateString('ko-KR')}</AppleTg>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton onClick={() => openEditDrawer(admin)} sx={{ width: '4rem', borderRadius: '0.25rem' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
      </FlexBox>

      <Drawer anchor="right" open={drawerOpen} onClose={() => {}}>
        <FlexBox flexDirection="column" gap={2} padding="2rem" width="25rem" sx={{ position: 'relative', height: '100%' }}>
          {/* 삭제된 항목: 오버레이로 편집 차단 (X 버튼만 zIndex로 클릭 가능) */}
          {isDeleted && <div style={{ position: 'absolute', inset: 0, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.5)' }} />}
          <FlexBox justifyContent="space-between" alignItems="center" fullWidth sx={{ mb: 2 }}>
            <AppleTg sx={{ fontSize: '1.2rem', fontWeight: 600 }}>{editData ? editData.name : '선생님 등록'}</AppleTg>
            <IconButton onClick={closeDrawer} sx={{ zIndex: 20 }}>
              <CloseIcon />
            </IconButton>
          </FlexBox>
          <AdminRegistrationForm
            showError={showError}
            showSuccess={showSuccess}
            editData={editData}
            onComplete={closeDrawer}
          />
        </FlexBox>
      </Drawer>
    </FlexContainer>
  );
};
