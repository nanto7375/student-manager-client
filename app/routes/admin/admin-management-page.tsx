import { FlexContainer, FlexBox } from "~/components/styled-elements"
import { AdminRegistrationForm, type AdminFormData } from "./admin-registration-form"
import { useGlobalToast } from "~/providers/toast-provider";
import { buildApi } from "~/lib/api-builder";
import { useQuery } from "@tanstack/react-query";
import { AppleTg } from "~/components/typography";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Drawer, IconButton } from "@mui/material";
import React from "react";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";

type Admin = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
};

const getAdminListApi = buildApi<{list: Admin[]; count: number}>({ path: '/admins', method: 'GET' });
export const adminListQueryKey = () => ['admin-list'] as const;

export const AdminManagementPage = () => {
  const { error: showError, success: showSuccess } = useGlobalToast();
  const { data: adminListData, isLoading } = useQuery({
    queryKey: adminListQueryKey(),
    queryFn: () => getAdminListApi(),
  });
  const [adminList, count] = React.useMemo(() => {
    return [adminListData?.list || [], adminListData?.count || 0];
  }, [adminListData]);

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editData, setEditData] = React.useState<AdminFormData | null>(null);

  const handleOpenRegister = () => {
    setEditData(null);
    setDrawerOpen(true);
  };

  const handleOpenEdit = (admin: Admin) => {
    const phoneParts = admin.phone ? admin.phone.split('-') : ['010', '', ''];
    setEditData({ id: admin.id, name: admin.name, email: admin.email, phone: phoneParts, password: '' });
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setEditData(null);
  };

  return (
    <FlexContainer>
      <FlexBox flexDirection="column" gap={2} fullWidth>
        <FlexBox justifyContent="space-between" alignItems="center" fullWidth>
          <AppleTg>관리자 목록</AppleTg>
          <Button variant="contained" size="small" onClick={handleOpenRegister}>
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
                  <TableCell>이름</TableCell>
                  <TableCell>이메일</TableCell>
                  <TableCell>연락처</TableCell>
                  <TableCell>역할</TableCell>
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
                      <IconButton size="small" onClick={() => handleOpenEdit(admin)}>
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
            <IconButton onClick={handleDrawerClose}>
              <CloseIcon />
            </IconButton>
          </FlexBox>
          <AdminRegistrationForm
            showError={showError}
            showSuccess={showSuccess}
            editData={editData}
            onComplete={handleDrawerClose}
          />
        </FlexBox>
      </Drawer>
    </FlexContainer>
  )
}