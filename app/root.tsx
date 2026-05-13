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

  const setAdminInfo = React.useCallback(async () => {
    try {
      const isSignedIn = !!tokenManager.getAccessToken();
      if (!isSignedIn) return navigate(ROUTES.SIGNIN);
      const adminInfo = await meApi();
      auth.setMyInfo(adminInfo);
    } catch (error) {
      console.log(error);
    }
  }, [])

  React.useEffect(() => {
    setAdminInfo();
  }, [setAdminInfo]);

  return (
    <FlexContainer style={{ minWidth: '48rem', height: '100%'}}>
      {pathname !== ROUTES.SIGNIN && <SideBar />}
      <FlexBox style={{flex: 1, overflow: 'auto'}}>
        <Outlet />
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
