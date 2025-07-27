import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react';
import { expiredTokenCode } from '~/lib/api-builder';
import { FETCH_JSON_ERROR_CODE, UNAUTHORIZED_ERRROR_CODE, UNSTABLE_NETWORK_ERROR_CODE } from '~/lib/error';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ 
    defaultOptions: { 
      queries: { retry: (failureCount, error) => {
        if (
          error.code === expiredTokenCode ||
          error.code === UNSTABLE_NETWORK_ERROR_CODE ||
          error.code === FETCH_JSON_ERROR_CODE ||
          error.code === UNAUTHORIZED_ERRROR_CODE ||
          error.code === 401
        ) return false;

        return failureCount < 2;
      }, networkMode: 'always' },
    }
  }));

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}