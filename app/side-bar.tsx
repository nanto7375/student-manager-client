import { Link, useLocation, useNavigate } from "react-router";
import { ROUTES, LEO_TITLE } from "./constants";
import { useState } from "react";
import { useAuth } from "./providers/use-auth";
import { AdminRoleType } from "./common/type";
import React from "react";
import { FlexBox, FlexContainer } from "./components/styled-elements";
import { styled } from "@mui/material";
import { AppleTg } from "./components/typography";
import { ConfirmModal } from "./components/confirm-modal";

const LinkFullSize = styled(Link)({
  width: '100%',
  height: '100%',
});

const buttonHoverEffect = {
  transition: 'all',
  borderRadius: '0.25rem',
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    transform: 'scale(1)',
  }
}

const MENU_LIST = [
  {
    name: "schedule",
    label: "스케쥴",
    path: ROUTES.SCHEDULE,
  },
  {
    name: "consult",
    label: "상담 기록",
    path: ROUTES.CONSULT,
  },
  {
    name: "payment",
    label: "수납",
    path: ROUTES.PAYMENT,
  },
];
const ADMIN_PAGE = {
  name: "admin",
  label: "관리자 페이지",
  path: ROUTES.ADMIN,
}

export default function SideBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState<string>(location.pathname.split("/")[1]);
  const { user, signout } = useAuth();
  const [isSignoutOpen, setIsSignoutOpen] = useState(false);
  const isAdmin = React.useMemo(() => {
    return user?.role === AdminRoleType.SUPER_ADMIN || user?.role === AdminRoleType.ADMIN;
  }, [user]);

  React.useEffect(() => {
    setSelectedMenu(location.pathname.split("/")[1]);
  }, [location.pathname]);

  const handleSignoutClick = React.useCallback(() => {
    setIsSignoutOpen(true);
  }, []);

  const handleSignout = React.useCallback(async () => {
    try {
      await signout();
      setIsSignoutOpen(false);
      navigate(ROUTES.SIGNIN);
    } catch (error) {
      console.error(error);
    }
  }, [signout]);

  return (
    <FlexContainer width="10rem" fullHeight flexDirection="column" justifyContent="space-between" alignItems="center" sx={{boxShadow: '2px 0 8px rgba(0,0,0,0.1)'}}>

      <FlexBox fullWidth flexDirection="column" center>
        <FlexBox fullWidth height="3rem" center sx={{marginBottom: '0.5rem', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}}>
          <Link to={ROUTES.HOME} style={{cursor: 'pointer'}}>
            <AppleTg sx={{fontSize: '1.1rem', color: 'primary.main', fontWeight: '600'}}>{LEO_TITLE.kor}</AppleTg>
          </Link>
        </FlexBox>
        <FlexBox flexDirection="column" fullWidth center>
          {MENU_LIST.map((menu) => (<LinkFullSize to={menu.path} key={menu.name}>
            <FlexBox width="100%" height="3rem" center cursor sx={{...buttonHoverEffect, backgroundColor: selectedMenu === menu.name ? '#e9e9e9' : 'white'}}>
              <AppleTg  sx={{fontSize: '1rem', color: selectedMenu === menu.name ? 'black' : 'gray'}}>{menu.label}</AppleTg>
            </FlexBox>
          </LinkFullSize>))}
        </FlexBox>
      </FlexBox>

      <FlexBox flexDirection="column" fullWidth center sx={{marginBottom: '0.5rem'}}>
        <FlexBox sx={{marginBottom: '0.2rem'}}>
          <AppleTg  color="secondary.main" sx={{fontSize: '0.9rem', fontWeight: '600'}}>
            {user?.email.split("@")[0]}
          </AppleTg>
        </FlexBox>
        {isAdmin && <LinkFullSize to={ADMIN_PAGE.path}>
          <FlexBox width="100%" height="3rem" center cursor sx={{...buttonHoverEffect, backgroundColor: selectedMenu === ADMIN_PAGE.name ? '#e9e9e9' : 'white'}}>
              <AppleTg  sx={{fontSize: '1rem', color: selectedMenu === ADMIN_PAGE.name ? 'black' : 'gray'}}>{ADMIN_PAGE.label}</AppleTg>
          </FlexBox>
        </LinkFullSize>}
        <FlexBox fullWidth height="3rem" center cursor sx={buttonHoverEffect} onClick={handleSignoutClick}>
          <AppleTg  sx={{fontSize: '1rem', color: 'gray'}}>로그아웃</AppleTg>
        </FlexBox>
      </FlexBox>

      <ConfirmModal 
        open={isSignoutOpen} 
        bodyText="로그아웃 하시겠습니까?" 
        onConfirm={handleSignout} 
        onCancel={() => setIsSignoutOpen(false)} 
        onClose={() => setIsSignoutOpen(false)} />
    </FlexContainer>
  );
}