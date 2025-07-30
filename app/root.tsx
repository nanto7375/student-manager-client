import React from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useRouteError,
} from "react-router";
import type { LinksFunction } from "react-router";
import { ThemeProvider } from "@emotion/react";
import CssBaseline from "@mui/material/CssBaseline";

import "./app.css";
import theme from "./theme";
import { FlexBox, FlexContainer } from "./components/styled-elements";

import QueryProvider from "./providers/query-client";
import { AuthProvider } from "./providers/use-auth";
import { ToastProvider } from "./providers/toast-provider";
import { ROUTES } from "./constants";
import NotFound from "./not-found";
import SideBar from "./sidebar";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <QueryProvider>
            <ToastProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </ToastProvider>
          </QueryProvider>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const {pathname} = useLocation();
  
  return (
    <FlexContainer style={{maxWidth: '1920px', minWidth: '960px', height: '100vh'}}>
      {pathname !== ROUTES.SIGNIN && <SideBar />}
      <Outlet />
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
        <FlexContainer center style={{maxWidth: '1920px', minWidth: '960px', height: '100vh'}}>
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
