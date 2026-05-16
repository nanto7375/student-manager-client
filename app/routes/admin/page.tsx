import { useSearchParams } from "react-router";

import { FlexBox, FlexContainer } from "~/components/styled-elements";
import { useGlobalToast } from "~/providers/toast-provider";
import { StudentManagementPage } from "./student-management-page";
import { AdminManagementPage } from "./admin-management-page";
import { Tab, Tabs } from "@mui/material";

export type ShortAdminDto = {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export default function Admin() {
  const {error: showError, success: showSuccess } = useGlobalToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTab = (searchParams.get('tab') as 'student' | 'admin') || 'student';

  return (
    <FlexContainer flexDirection="column" fullHeight fullWidth sx={{padding: '1rem', paddingLeft: '2rem'}}>
      <Tabs 
        value={selectedTab} 
        onChange={(_, newValue) => setSearchParams({ tab: newValue })} 
        sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: '1rem'}}
      >
        <Tab label="학생 관리" value="student" />
        <Tab label="관리자 관리" value="admin" />
      </Tabs>

      <FlexBox>
        {selectedTab === 'student' && <StudentManagementPage />}
        {selectedTab === 'admin' && <AdminManagementPage />}
      </FlexBox>

    </FlexContainer>
  );
}