import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { Tabs } from "antd";

export const Route = createFileRoute("/admin/_reportLayout")({
  component: ReportLayout,
});

function ReportLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const active = pathname.includes("/dahahi") ? "dahahi" : "kiotviet";

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-6xl mx-auto pt-4 px-4 sm:px-6 lg:px-8">
        <Tabs
          activeKey={active}
          items={[
            {
              key: "kiotviet",
              label: (
                <Link to="/report/kiotviet" className="text-inherit">
                  Bán hàng
                </Link>
              ),
            },
            {
              key: "dahahi",
              label: (
                <Link to="/report/dahahi" className="text-inherit">
                  Chấm công
                </Link>
              ),
            },
          ]}
          className="[&_.ant-tabs-nav]:mb-0"
        />
      </div>
      <Outlet />
    </div>
  );
}
