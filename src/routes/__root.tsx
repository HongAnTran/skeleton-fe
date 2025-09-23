import { createRootRoute, Outlet } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 200,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});
const RootLayout = () => (
  <QueryClientProvider client={queryClient}>
    <Outlet />
  </QueryClientProvider>
);

export const Route = createRootRoute({ component: RootLayout });
