import { Link } from "react-router";
import { TITLE } from "./constants";
import { useState } from "react";
import { useAuth } from "./providers/use-auth";
import { AdminRoleType } from "./common/type";
import React from "react";

const MENU_LIST = [
  {
    name: "schedule",
    label: "스케쥴",
  },
  {
    name: "consultation",
    label: "상담 기록",
  },
  {
    name: "payment",
    label: "수납",
  },
];

export default function SideBar() {
  const [selectedMenu, setSelectedMenu] = useState<string>("");
  const { user, signout } = useAuth();
  const [isSignoutOpen, setIsSignoutOpen] = useState(false);
  const isAdmin = React.useMemo(() => {
    return user?.role === AdminRoleType.SUPER_ADMIN || user?.role === AdminRoleType.ADMIN;
  }, [user]);

  const handleMenuClick = React.useCallback((menuName: string) => {
    setSelectedMenu(menuName);
  }, []);

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
    <div className="w-48 h-full border-r border-gray-200 flex flex-col items-center justify-between shadow-[2px_0_8px_rgba(0,0,0,0.1)]">
      <div className="side-top-wrapper w-full flex flex-col items-center">
        <div className="side-bar-header">
            <button className="flex items-center justify-center h-16 mb-2 border-b border-gray-200 w-full">
              <Link to="/home"><span className="text-2xl font-bold leo-green-text">{TITLE.kor}</span></Link>
            </button>
        </div>
        <div className="side-bar-body w-full">
          {MENU_LIST.map((menu) => (
            <button 
              key={menu.name}
              className={`w-full h-12 flex items-center justify-center transition-all duration-300 hover:shadow-[0_4px_8px_rgba(0,0,0,0.2)] hover:transform hover:scale-102 rounded ${
                selectedMenu === menu.name 
                  ? "text-black bg-gray-100" 
                  : "text-gray-500 hover:bg-gray-50"
              }`}
              onClick={() => handleMenuClick(menu.name)}
            >
              <span>{menu.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="side-bar-footer w-full mb-1 flex flex-col items-center justify-center">
        <div className="text-sm leo-brown-text">{user?.email.split("@")[0]}</div>
        {isAdmin && 
          <button className="w-full h-12 flex items-center justify-center transition-all duration-300 hover:shadow-[0_4px_8px_rgba(0,0,0,0.2)] hover:transform hover:scale-102 rounded">
            <Link to="/admin"><span className="text-gray-500">관리자 페이지</span></Link>
          </button>
        }
        <button className="w-full h-12 flex items-center justify-center transition-all duration-300 hover:shadow-[0_4px_8px_rgba(0,0,0,0.2)] hover:transform hover:scale-102 rounded" onClick={handleSignoutClick}>
          <span className="text-gray-500">로그아웃</span>
        </button>
      </div>
    </div>
  );
}