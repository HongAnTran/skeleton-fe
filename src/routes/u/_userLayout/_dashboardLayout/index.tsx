import { createFileRoute } from "@tanstack/react-router";
import { useUserAuth } from "../../../../contexts/AuthUserContext";
export const Route = createFileRoute("/u/_userLayout/_dashboardLayout/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useUserAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Welcome back, {user?.name || "User"}! 👋
      </h1>
    </div>
  );
}
