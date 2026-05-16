import React from "react";
import { FlexContainer, FlexBox } from "~/components/styled-elements";
import { AdminRegistrationForm, type AdminFormData } from "./admin-registration-form";
import { useGlobalToast } from "~/providers/toast-provider";
import { buildApi } from "~/lib/api-builder";
import { useQuery } from "@tanstack/react-query";
import { AppleTg } from "~/components/typography";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Drawer, IconButton } from "@mui/material";
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
});

// --- Constants ---

const ADMIN_TABLE_COLUMNS = ['이름', '이메일', '연락처', '역할'] as const;

// --- Component ---

export const AdminManagementPage = () => {
  const { error: showError, success: showSuccess } = useGlobalToast();

  // Data
  const { data: adminListData, isLoading } = useQuery({
    queryKey: adminListQueryKey(),
    queryFn: () => getAdminListApi(),
  });
  const adminList = adminListData?.list ?? [];

  // Drawer state
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editData, setEditData] = React.useState<AdminFormData | null>(null);

  const openRegisterDrawer = () => { setEditData(null); setDrawerOpen(true); };
  const openEditDrawer = (admin: Admin) => { setEditData(toAdminFormData(admin)); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setEditData(null); };

  // Render
  return (
    <FlexContainer>
      <FlexBox flexDirection="column" gap={2} fullWidth>
        <FlexBox justifyContent="space-between" alignItems="center" fullWidth>
          <AppleTg>관리자 목록</AppleTg>
          <Button variant="contained" size="small" onClick={openRegisterDrawer}>
            <AppleTg>관리자 등록</AppleTg>
          </Button>
        </FlexBox>

        {isLoading ? (
          <AppleTg>로딩 중...</AppleTg>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {ADMIN_TABLE_COLUMNS.map((col) => <TableCell key={col}>{col}</TableCell>)}
                  <TableCell align="center">편집</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {adminList.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.phone}</TableCell>
                    <TableCell>{admin.role}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => openEditDrawer(admin)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </FlexBox>

      <Drawer anchor="right" open={drawerOpen} onClose={() => {}}>
        <FlexBox flexDirection="column" gap={2} padding="2rem" width="400px">
          <FlexBox justifyContent="space-between" alignItems="center" fullWidth>
            <AppleTg>{editData ? '관리자 수정' : '관리자 등록'}</AppleTg>
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
