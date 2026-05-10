import React from "react";

import { FlexBox, FlexContainer } from "~/components/styled-elements";
import { useGlobalToast } from "~/providers/toast-provider";
import { StudentRegistrationForm } from "./student-registration-form";
import { AdminRegistrationForm } from "./admin-registration-form";

export type ShortAdminDto = {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export default function Admin() {
  const {error: showError, success: showSuccess } = useGlobalToast();

  return (
    <FlexContainer flexDirection="column" fullHeight fullWidth sx={{padding: '1rem'}}>
      <FlexBox width="100%" height="3rem">Admin</FlexBox>

      <FlexBox fullWidth fullHeight padding={'1rem'} gap={4}>
        <StudentRegistrationForm showError={showError} showSuccess={showSuccess} />
        <AdminRegistrationForm showError={showError} showSuccess={showSuccess} /> 
      </FlexBox>

    </FlexContainer>
  );
}