import React from "react";
import { useSearchParams } from "react-router";
import { Button, Tab } from "@mui/material";
import { AppTabs } from "~/components/app-tabs";

import { FlexBox, FlexContainer } from "~/components/styled-elements";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTab = (searchParams.get('tab') as 'student' | 'admin') || 'student';
  const [registerOpen, setRegisterOpen] = React.useState(false);

  const handleRegisterClick = () => setRegisterOpen(true);
  const handleRegisterClose = () => setRegisterOpen(false);

  return (
    <FlexContainer flexDirection="column" fullHeight fullWidth>
      <FlexBox justifyContent="space-between" alignItems="center" fullWidth sx={{ mb: 1.5 }}>
        <AppTabs
          value={selectedTab}
          onChange={(_, newValue) => { setSearchParams({ tab: newValue }); setRegisterOpen(false); }}
          sx={{ mb: 0 }}
        >
          <Tab label="학생 관리" value="student" />
          <Tab label="선생님 관리" value="admin" />
        </AppTabs>
        <Button variant="contained" size="small" onClick={handleRegisterClick} sx={{ py: 0.7, minWidth: '7rem' }}>
          <AppleTg>{selectedTab === 'student' ? '학생 등록' : '선생님 등록'}</AppleTg>
        </Button>
      </FlexBox>

      <FlexBox fullWidth>
        {selectedTab === 'student' && <StudentManagementPage registerOpen={registerOpen} onRegisterClose={handleRegisterClose} />}
        {selectedTab === 'admin' && <AdminManagementPage registerOpen={registerOpen} onRegisterClose={handleRegisterClose} />}
      </FlexBox>
    </FlexContainer>
  );
}
