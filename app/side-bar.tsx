import { Link, useLocation } from "react-router";
import { ROUTES, TITLE } from "./constants";
import { useState } from "react";
import { useAuth } from "./providers/use-auth";
import { AdminRoleType } from "./common/type";
import React from "react";

const BUTTON_STYLE = "w-full h-12 flex items-center justify-center transition-all duration-300 hover:shadow-[0_4px_8px_rgba(0,0,0,0.2)] hover:transform hover:scale-100 rounded";

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

export default function SideBar() {
  const location = useLocation();
  const [selectedMenu, setSelectedMenu] = useState<string>(location.pathname.split("/")[1]);
  const { user, signout } = useAuth();
  const [isSignoutOpen, setIsSignoutOpen] = useState(false);
  const isAdmin = React.useMemo(() => {
    return user?.role === AdminRoleType.SUPER_ADMIN || user?.role === AdminRoleType.ADMIN;
  }, [user]);

  React.useEffect(() => {
    setSelectedMenu(location.pathname.split("/")[1]);
  }, [location.pathname]);

  // const handleMenuClick = React.useCallback((menuName: string) => {
  //   setSelectedMenu(menuName);
  // }, []);


  const handleSignoutClick = React.useCallback(() => {
    setIsSignoutOpen(true);
  }, []);

  const handleSignout = React.useCallback(async () => {
    try {
      await signout();
      setIsSignoutOpen(false);
    } catch (error) {
      console.error(error);
    }
  }, [signout]);

  return (
    <div className="w-40 h-full border-r border-gray-200 flex flex-col items-center justify-between shadow-[2px_0_8px_rgba(0,0,0,0.1)]">
      <div className="side-top-wrapper w-full flex flex-col items-center">
        <div className="side-bar-header mb-1 border-b border-gray-200">
            <button className="flex items-center justify-center h-12 w-full">
              <Link to={ROUTES.HOME}><span className="text-xl font-apple-b leo-green-text">{TITLE.kor}</span></Link>
            </button>
        </div>
        <div className="side-bar-body w-full">
          {MENU_LIST.map((menu) => (
            <Link to={menu.path} key={menu.name}>
              <button 
                className={`${BUTTON_STYLE} ${
                  selectedMenu === menu.name 
                    ? "text-black bg-gray-100" 
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <span>{menu.label}</span>
              </button>
            </Link>
          ))}
        </div>
      </div>
      <div className="side-bar-footer w-full mb-1 flex flex-col items-center justify-center">
        <div className="text-sm leo-brown-text">{user?.email.split("@")[0]}</div>
        {isAdmin && 
          <Link to={ROUTES.ADMIN}>
            <button className={BUTTON_STYLE}>
              <span className="text-gray-500">관리자 페이지</span>
            </button>
          </Link>
        }
        <button className={BUTTON_STYLE} onClick={handleSignoutClick}>
          <span className="text-gray-500">로그아웃</span>
        </button>
      </div>
    </div>
  );
}