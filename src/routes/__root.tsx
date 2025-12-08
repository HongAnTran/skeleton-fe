import { createRootRoute, Outlet } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { message } from "antd";
import { ConfigProvider } from "antd";
import locale from "antd/locale/vi_VN";
import dayjs from "dayjs";

import "dayjs/locale/vi";

dayjs.locale("vi");
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
    <ConfigProvider locale={locale}>
      <Outlet />
    </ConfigProvider>
  </QueryClientProvider>
);

export const Route = createRootRoute({ component: RootLayout });
