import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthEmployeeProvider } from "../../contexts/AuthEmployeeContext";

export const Route = createFileRoute("/e/_employeeLayout")({
  component: EmployeeLayout,
});

function EmployeeLayout() {
  return (
    <AuthEmployeeProvider>
      <Outlet />
    </AuthEmployeeProvider>
  );
}
