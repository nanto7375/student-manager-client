import React from "react";
import { useSearchParams } from "react-router";
import { Button } from "@mui/material";
import { Tab, Tabs } from "@mui/material";

import { FlexBox, FlexContainer } from "~/components/styled-elements";
import { useGlobalToast } from "~/providers/toast-provider";
import { StudentManagementPage } from "./student-management-page";
import { AdminManagementPage } from "./admin-management-page";
import { AppleTg } from "~/components/typography";

export type ShortAdminDto = {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export default function Admin() {
  const { error: showError, success: showSuccess } = useGlobalToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTab = (searchParams.get('tab') as 'student' | 'admin') || 'student';
  const [registerOpen, setRegisterOpen] = React.useState(false);

  const handleRegisterClick = () => setRegisterOpen(true);
  const handleRegisterClose = () => setRegisterOpen(false);

  return (
    <FlexContainer flexDirection="column" fullHeight fullWidth sx={{ padding: '1rem', paddingLeft: '2rem' }}>
      <FlexBox justifyContent="space-between" alignItems="center" fullWidth sx={{ marginBottom: '1rem' }}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => { setSearchParams({ tab: newValue }); setRegisterOpen(false); }}
        >
          <Tab label="학생 관리" value="student" />
          <Tab label="관리자 관리" value="admin" />
        </Tabs>
        <Button variant="contained" size="small" onClick={handleRegisterClick} sx={{ py: 1.2, minWidth: '7rem' }}>
          <AppleTg>{selectedTab === 'student' ? '학생 등록' : '관리자 등록'}</AppleTg>
        </Button>
      </FlexBox>

      <FlexBox fullWidth>
        {selectedTab === 'student' && <StudentManagementPage registerOpen={registerOpen} onRegisterClose={handleRegisterClose} />}
        {selectedTab === 'admin' && <AdminManagementPage registerOpen={registerOpen} onRegisterClose={handleRegisterClose} />}
      </FlexBox>
    </FlexContainer>
  );
}
