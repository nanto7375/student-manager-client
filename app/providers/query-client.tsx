import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ 
    defaultOptions: { 
      queries: { 
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (
            error.status === 401
          ) return false;

          return failureCount < 2;
        }, 
      },
    }
  }));

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}