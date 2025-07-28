import { Typography } from "@mui/material";
import { TITLE } from "~/constants";
import { FlexContainer } from "~/components/styled-elements/flex-container";
import React from "react";

export default function Home() {
  React.useEffect(() => {
    console.log(4)
  }, [])
  return (
    <FlexContainer fullWidth fullHeight center>
      <Typography color="primary" variant="appleSDGothicNeoM" sx={{fontSize: '2rem'}}>{TITLE.kor}</Typography>
      <Typography color="secondary" variant="appleSDGothicNeoM" sx={{fontSize: '2rem'}}>&nbsp;{TITLE.eng}</Typography>
    </FlexContainer>
  );
}