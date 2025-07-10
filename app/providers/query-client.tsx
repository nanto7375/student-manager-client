import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react';

// declare global {
//   interface Error {
//     errorCode?: number;
//     status?: number;
//     message: string;
//     url?: string;
//     method?: string;
//   }
// }

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ 
    defaultOptions: { 
      queries: { 
        retry: 2,
        networkMode: 'always',
      }
    }
  }));

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}