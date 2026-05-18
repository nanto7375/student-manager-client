import React from "react";
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

  // Pagination
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(20);

  // Data
  const { data: adminListData, isLoading } = useQuery({
    queryKey: [...adminListQueryKey(), page, rowsPerPage, showDeleted],
    queryFn: () => getAdminListApi({ query: { page: page + 1, limit: rowsPerPage, ...(!showDeleted && { status: 'active' }) } }),
    placeholderData: keepPreviousData,
  });
  const adminList = adminListData?.list ?? [];
  const totalCount = adminListData?.count ?? 0;

  // Drawer state
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editData, setEditData] = React.useState<AdminFormData | null>(null);

  React.useEffect(() => {
    if (registerOpen) { setEditData(null); setDrawerOpen(true); }
  }, [registerOpen]);

  const openEditDrawer = (admin: Admin) => { setEditData(toAdminFormData(admin)); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setEditData(null); onRegisterClose?.(); };

  // Render
  return (
    <FlexContainer>
      <FlexBox flexDirection="column" gap={1} fullWidth>
        {/* RowsPerPage + Pagination */}
        <FlexBox justifyContent="flex-end" alignItems="center" fullWidth>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]}
            onRowsPerPageChange={() => {}}
          />
          <Select size="small" value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }} sx={{ minWidth: '7rem', textAlign: 'center', '& .MuiSelect-select': { py: '0.4rem' }, '& .MuiOutlinedInput-notchedOutline': { top: 0, legend: { display: 'none' } } }}>
            {ROWS_PER_PAGE_OPTIONS.map(n => <MenuItem key={n} value={n}>{n}개</MenuItem>)}
          </Select>
        </FlexBox>

        {/* Table */}
          <>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" width="5%">#</TableCell>
                    <TableCell align="center" width="15%">이름</TableCell>
                    <TableCell align="center" width="30%">이메일</TableCell>
                    <TableCell align="center" width="20%">연락처</TableCell>
                    <TableCell align="center" width="15%">권한</TableCell>
                    <TableCell align="center" width="15%">편집</TableCell>
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
        <FlexBox flexDirection="column" gap={2} padding="2rem" width="25rem">
          <FlexBox justifyContent="space-between" alignItems="center" fullWidth sx={{ mb: 2 }}>
            <AppleTg sx={{ fontSize: '1.2rem', fontWeight: 600 }}>{editData ? editData.name : '선생님 등록'}</AppleTg>
            <IconButton onClick={closeDrawer}>
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
