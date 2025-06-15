'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import ClientOnly from '@/components/client-only';

// React Query Provider
function QueryProviders({ children }: { children: ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000, // 1 minute
						refetchOnWindowFocus: false,
						retry: false,
						refetchOnMount: false,
					},
				},
			})
	);

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			<ClientOnly>
				<ReactQueryDevtools initialIsOpen={false} />
			</ClientOnly>
		</QueryClientProvider>
	);
}

// Combined Providers
export function AppProviders({ children }: { children: ReactNode }) {
	return (
		<QueryProviders>
			<AuthProvider>{children}</AuthProvider>
		</QueryProviders>
	);
}
