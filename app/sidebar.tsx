import React from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { styled } from "@mui/material";

import { ROUTES, LEO_TITLE } from "./constants";
import { AdminRoleType } from "./constants/type";
import { tokenManager } from "./lib/token-manger";
import { useAuth } from "./providers/auth-provider";

import { FlexBox, FlexContainer } from "./components/styled-elements";
import { AppleTg } from "./components/typography";
// import { ConfirmModal } from "./components/confirm-modal";
import { useConfirmModal } from "./hooks/use-confirm-modal";

const LinkFullSize = styled(Link)({
  width: '100%',
  height: '100%',
});

export const buttonHoverEffect = {
  transition: 'all',
  borderRadius: '0.25rem',
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    transform: 'scale(1)',
  }
}

const MENU_PAGE_LIST = [
  {
    name: "schedule",
    label: "스케쥴",
    path: ROUTES.SCHEDULE,
  },
  {
    name: "student",
    label: "학생",
    path: ROUTES.STUDENT,
  },
];
const ADMIN_PAGE = {
  name: "admin",
  label: "관리자 페이지",
  path: ROUTES.ADMIN,
}

export default function SideBar() {
  const { user, signout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pathname = location.pathname;
  const { ConfirmModal, openConfirmModal, closeConfirmModal } = useConfirmModal();

  const [selectedMenu, setSelectedMenu] = React.useState<string>(pathname.split("/")[1]);
  const isAdmin = React.useMemo(() => user?.role === AdminRoleType.SUPER_ADMIN || user?.role === AdminRoleType.ADMIN, [user]);

  React.useEffect(() => {
    setSelectedMenu(location.pathname.split("/")[1]);
  }, [location.pathname]);

  const handleSignoutClick = React.useCallback(() => {
    openConfirmModal();
  }, []);

  const handleSignout = React.useCallback(async () => {
    try {
      await signout();
      closeConfirmModal();
    } catch (error) {
      console.error(error);
      tokenManager.clearAccessToken();
    } finally {
      navigate(ROUTES.SIGNIN);
    }
  }, [signout]);

  return (
    <FlexContainer 
      width="7rem" 
      fullHeight 
      flexDirection="column" 
      justifyContent="space-between" 
      alignItems="center" 
      sx={{
        boxShadow: '2px 0 6px rgba(0,0,0,0.1)',
      }}
    >

      <FlexBox fullWidth flexDirection="column" center>
        <FlexBox fullWidth height="3rem" center sx={{marginBottom: '0.5rem', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}}>
          <Link to={ROUTES.HOME} style={{cursor: 'pointer'}}>
            <AppleTg sx={{fontSize: '0.9rem', color: 'primary.main', fontWeight: '600'}}>{LEO_TITLE.kor}</AppleTg>
          </Link>
        </FlexBox>
        <FlexBox flexDirection="column" fullWidth center>
          {MENU_PAGE_LIST.map((menu) => (<LinkFullSize 
            to={{
              pathname: pathname.includes(menu.path) ? pathname : menu.path, 
              // search: searchParams.toString()
            }} 
            key={menu.name}
          >
            <FlexBox width="100%" height="3rem" center button sx={buttonHoverEffect}>
              <AppleTg 
                variant={selectedMenu === menu.name ? 'appleSDGothicNeoB' : 'appleSDGothicNeoM'} 
                sx={{fontSize: '1rem', color: selectedMenu === menu.name ? 'black' : 'gray'}}
              >
                {menu.label}
              </AppleTg>
            </FlexBox>
          </LinkFullSize>))}
        </FlexBox>
      </FlexBox>

      <FlexBox flexDirection="column" fullWidth center sx={{marginBottom: '0.5rem'}}>
        <FlexBox flexDirection="column" fullWidth center sx={{marginBottom: '1rem'}}>
          <FlexBox sx={{marginBottom: '0.2rem'}}>
            <AppleTg  color="secondary.main" sx={{fontSize: '0.9rem', fontWeight: '600'}}>
              {user?.email.split("@")[0]}
            </AppleTg>
          </FlexBox>
          {isAdmin && <LinkFullSize to={ADMIN_PAGE.path}>
            <FlexBox width="100%" height="2.5rem" center button sx={{...buttonHoverEffect, backgroundColor: selectedMenu === ADMIN_PAGE.name ? '#e9e9e9' : 'white'}}>
                <AppleTg  sx={{fontSize: '0.9rem', color: selectedMenu === ADMIN_PAGE.name ? 'black' : 'gray'}}>{ADMIN_PAGE.label}</AppleTg>
            </FlexBox>
          </LinkFullSize>}
        </FlexBox>
        <FlexBox fullWidth height="2.5rem" center button sx={buttonHoverEffect} onClick={handleSignoutClick}>
          <AppleTg  sx={{fontSize: '0.9rem', color: 'gray'}}>로그아웃</AppleTg>
        </FlexBox>
      </FlexBox>

      <ConfirmModal 
        bodyText="로그아웃 하시겠습니까?" 
        onConfirm={handleSignout} 
      />
    </FlexContainer>
  );
}