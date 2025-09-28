import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/e/_employeeLayout/_dashboardLayout/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Navigate to="/e/shift-slots" />;
}
