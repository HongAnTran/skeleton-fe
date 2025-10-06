import { createRootRoute, Outlet } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { message } from "antd";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 200,
      refetchOnWindowFocus: false,
      retry: false,
    },
    mutations: {
      onError: (error: Error) => {
        message.error(error?.message || "Đã xảy ra lỗi");
      },
    },
  },
});
const RootLayout = () => (
  <QueryClientProvider client={queryClient}>
    <Outlet />
  </QueryClientProvider>
);

export const Route = createRootRoute({ component: RootLayout });
