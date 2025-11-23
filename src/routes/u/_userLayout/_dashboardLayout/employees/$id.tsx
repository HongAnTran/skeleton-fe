import { createFileRoute } from "@tanstack/react-router";
import { EmployeeDetailPage } from "@/components";
import { useParams } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/u/_userLayout/_dashboardLayout/employees/$id"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const params = useParams({
    from: "/u/_userLayout/_dashboardLayout/employees/$id",
  });
  return <EmployeeDetailPage employeeId={params.id} />;
}
