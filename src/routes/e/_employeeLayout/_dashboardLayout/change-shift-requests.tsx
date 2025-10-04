import { createFileRoute } from "@tanstack/react-router";
import { ShiftSwapList } from "../../../../components";

export const Route = createFileRoute(
  "/e/_employeeLayout/_dashboardLayout/change-shift-requests"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <ShiftSwapList />;
}
