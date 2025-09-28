import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import UserDashboardLayout from "../../../components/layouts/UserDashboardLayout";
import { tokenStorage } from "../../../utils/token";

export const Route = createFileRoute("/u/_userLayout/_dashboardLayout")({
  beforeLoad: () => {
    if (!tokenStorage.isAuthenticated()) {
      throw redirect({
        to: "/u/login",
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <UserDashboardLayout>
      <Outlet />
    </UserDashboardLayout>
  );
}
