import { Link } from "react-router";
import { ROUTES } from "~/constants";
import { FlexBox, FlexContainer } from "./components/styled-elements";
import { Typography } from "@mui/material";

export default function NotFound() {
  return (
    <FlexContainer center flexDirection="column">
      <p>요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.</p>
      <FlexBox gap={1}>
        <Link 
          to={ROUTES.HOME} 
        >
          <Typography variant="appleSDGothicNeoM" color="primary">홈으로 돌아가기</Typography>
        </Link>
        <Link 
          to={ROUTES.SIGNIN} 
        >
          <Typography variant="appleSDGothicNeoM" color="secondary">로그인 <span aria-hidden="true">&nbsp;&rarr;</span></Typography>
        </Link>
      </FlexBox>
    </FlexContainer>
  );
}