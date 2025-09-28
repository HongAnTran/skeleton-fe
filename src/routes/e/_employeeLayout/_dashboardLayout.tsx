import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { tokenStorage } from "../../../utils/token";
import EmployeeDashboardLayout from "../../../components/layouts/EmployeeDashboardLayout";

export const Route = createFileRoute("/e/_employeeLayout/_dashboardLayout")({
  beforeLoad: () => {
    if (!tokenStorage.isAuthenticated()) {
      throw redirect({
        to: "/e/login",
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <EmployeeDashboardLayout>
      <Outlet />
    </EmployeeDashboardLayout>
  );
}
