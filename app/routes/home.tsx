import { Typography } from "@mui/material";
import { LEO_TITLE } from "~/constants";
import { FlexContainer } from "~/components/styled-elements/flex-container";

export default function Home() {
  return (
    <FlexContainer fullWidth fullHeight center>
      <Typography color="primary" variant="appleSDGothicNeoM" sx={{fontSize: '2rem'}}>{LEO_TITLE.kor}</Typography>
      <Typography color="secondary" variant="appleSDGothicNeoM" sx={{fontSize: '2rem'}}>&nbsp;{LEO_TITLE.eng}</Typography>
    </FlexContainer>
  );
}