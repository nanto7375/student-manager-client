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

import "./app.css";
import QueryProvider from "./providers/query-client";
import { AuthProvider } from "./providers/use-auth";
import { ToastProvider } from "./providers/toast-provider";
import NotFound from "./not-found";
import SideBar from "./side-bar";
import { ROUTES } from "./constants";

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
        <QueryProvider>
          <ToastProvider>
            <AuthProvider>
              <div className="max-w-[1920px] min-w-[960px] h-screen">
                {children}
              </div>
            </AuthProvider>
          </ToastProvider>
        </QueryProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const {pathname} = useLocation();
  
  return (
    <div className="flex w-full h-full bor">
      {pathname !== ROUTES.SIGNIN && <SideBar />}
      <Outlet />
    </div>);
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
        <div className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
          <div className="text-center">
            <p className="text-base font-semibold text-red-600">Error</p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
              {isRouteErrorResponse(error) ? error.status : 'Something went wrong'}
            </h1>
            <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
              {isRouteErrorResponse(error) ? error.statusText : 'An unexpected error occurred.'}
            </p>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
