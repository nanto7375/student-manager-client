import React from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  useLocation,
  useNavigate,
  useRouteError,
} from "react-router";

import "./app.css";
import { FlexBox, FlexContainer } from "./components/styled-elements";

import { ROUTES } from "./constants";
import NotFound from "./not-found";
import SideBar from "./sidebar";
import { buildApi } from "./lib/api-builder";
import { tokenManager } from "./lib/token-manger";
import { auth, type Admin } from "./lib/auth";

export { Layout, links } from "./layout";

const meApi = buildApi<Admin>({ path: '/admins/me', method: 'GET' });

export default function App() {
  const {pathname} = useLocation();
  const navigate = useNavigate();
  const [loaded, setLoaded] = React.useState(false);

  const setAdminInfo = React.useCallback(async () => {
    try {
      const isSignedIn = !!tokenManager.getAccessToken();
      if (!isSignedIn) return navigate(ROUTES.SIGNIN);
      const adminInfo = await meApi();
      auth.setMyInfo(adminInfo);
    } catch (error) {
      console.log(error);
    }
  }, [navigate]);

  React.useEffect(() => {
    setAdminInfo().then(() => setLoaded(true));
  }, [setAdminInfo]);

  return (
    <FlexContainer flexDirection="column" style={{ minWidth: '48rem', height: '100%'}}>
      {/* 공통 최대 너비 wrapper */}
      <FlexBox flexDirection="column" style={{ maxWidth: '95rem', width: '100%', height: '100%', margin: '0 auto' }}>
        {/* 상단 네비게이션 바 (로그인 페이지 제외) */}
        {(pathname !== ROUTES.SIGNIN && loaded) && <SideBar />}

        {/* 콘텐츠 영역 */}
        <FlexBox flexDirection="column" style={{flex: 1, overflow: 'auto', margin: '0.5rem 0', padding: '1rem 2rem', boxShadow: '0 0 20px rgba(0,0,0,0.06)', borderRadius: '0.5rem'}}>
          {loaded && <Outlet />}
        </FlexBox>
      </FlexBox>
    </FlexContainer>
  );
}

export function HydrateFallback() {
	return null
}

export function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound />;
  }
  
  // 다른 에러들에 대한 기본 처리
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <FlexContainer center style={{maxWidth: '1920px', minWidth: '960px', height: '100%'}}>
          <FlexBox center>
            <p>Error</p>
            <h1>
              {isRouteErrorResponse(error) ? error.status : 'Something went wrong'}
            </h1>
            <p>
              {isRouteErrorResponse(error) ? error.statusText : 'An unexpected error occurred.'}
            </p>
          </FlexBox>
        </FlexContainer>
        <Scripts />
      </body>
    </html>
  );
}
