import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FETCH_JSON_ERROR_CODE, TOKEN_EXPIRED_ERROR_CODE, TOKEN_NOT_FOUND_ERROR_CODE, UNAUTHORIZED_ERRROR_CODE, UNSTABLE_NETWORK_ERROR_CODE } from '~/lib/error';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ 
    defaultOptions: { 
      queries: { 
        retry: (failureCount, error) => {
          if (
            error.code === 401 ||
            error.code === TOKEN_EXPIRED_ERROR_CODE ||
            error.code === UNAUTHORIZED_ERRROR_CODE ||
            error.code === TOKEN_NOT_FOUND_ERROR_CODE ||
            error.code === UNSTABLE_NETWORK_ERROR_CODE ||
            error.code === FETCH_JSON_ERROR_CODE
          ) return false;

          return failureCount < 2;
        }, 
      },
    }
  }));

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}