import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/u/_userLayout/_dashboardLayout/tasks")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/u/_userLayout/task"!</div>;
}
