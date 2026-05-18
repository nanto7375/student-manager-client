import React from "react";
import { Link, useLocation, useNavigate } from "react-router";

import { ROUTES, LEO_TITLE } from "./constants";
import { AdminRoleType } from "./constants/type";
import { tokenManager } from "./lib/token-manger";

import { FlexBox } from "./components/styled-elements";
import { AppleTg } from "./components/typography";
import { useConfirmModal } from "./hooks/use-confirm-modal";
import { auth } from "./lib/auth";

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
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = React.useMemo(() => location.pathname, [location]);
  const { ConfirmModal, openConfirmModal, closeConfirmModal } = useConfirmModal();

  const [selectedMenu, setSelectedMenu] = React.useState<string>(pathname.split("/")[1]);
  const user = auth.getMyInfo();
  const isAdmin = user?.role === AdminRoleType.SUPER_ADMIN || user?.role === AdminRoleType.ADMIN;

  React.useEffect(() => {
    setSelectedMenu(location.pathname.split("/")[1]);
  }, [location.pathname]);

  const handleSignoutClick = React.useCallback(() => {
    openConfirmModal();
  }, []);

  const handleSignout = React.useCallback(async () => {
    try {
      await auth.signout();
      closeConfirmModal();
    } catch (error) {
      console.error(error);
      tokenManager.clearAccessToken();
    } finally {
      navigate(ROUTES.SIGNIN);
    }
  }, []);

  return (
    <FlexBox
      fullWidth
      justifyContent="space-between"
      alignItems="center"
      sx={{
        height: '3rem',
        padding: '0 2rem',
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
        zIndex: 10,
      }}
    >
      {/* 로고 + 메뉴 */}
      <FlexBox alignItems="center" gap={2}>
        <Link to={ROUTES.HOME} style={{cursor: 'pointer', textDecoration: 'none'}}>
          <AppleTg sx={{fontSize: '0.9rem', color: 'primary.main', fontWeight: '600'}}>{LEO_TITLE.kor}</AppleTg>
        </Link>
        {MENU_PAGE_LIST.map((menu) => (
          <Link to={menu.path} key={menu.name} style={{textDecoration: 'none'}}>
            <AppleTg
              variant={selectedMenu === menu.name ? 'appleSDGothicNeoB' : 'appleSDGothicNeoM'}
              sx={{fontSize: '0.9rem', color: selectedMenu === menu.name ? 'black' : 'gray', ...buttonHoverEffect, padding: '0.4rem 0.6rem'}}
            >
              {menu.label}
            </AppleTg>
          </Link>
        ))}
      </FlexBox>

      {/* 유저 정보 + 관리자 + 로그아웃 */}
      <FlexBox alignItems="center" gap={1.5}>
        <AppleTg color="secondary.main" sx={{fontSize: '0.85rem', fontWeight: '600'}}>
          {user?.email.split("@")[0]}
        </AppleTg>
        {isAdmin && (
          <Link to={ADMIN_PAGE.path} style={{textDecoration: 'none'}}>
            <AppleTg sx={{fontSize: '0.85rem', color: selectedMenu === ADMIN_PAGE.name ? 'black' : 'gray', ...buttonHoverEffect, padding: '0.3rem 0.5rem'}}>
              {ADMIN_PAGE.label}
            </AppleTg>
          </Link>
        )}
        <FlexBox button sx={{...buttonHoverEffect, padding: '0.3rem 0.5rem'}} onClick={handleSignoutClick}>
          <AppleTg sx={{fontSize: '0.85rem', color: 'gray'}}>로그아웃</AppleTg>
        </FlexBox>
      </FlexBox>

      <ConfirmModal
        bodyText="로그아웃 하시겠습니까?"
        onConfirm={handleSignout}
      />
    </FlexBox>
  );
}