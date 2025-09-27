import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthUserProvider } from "../../contexts/AuthUserContext";

export const Route = createFileRoute("/u/_userLayout")({
  component: UserLayout,
});

function UserLayout() {
  return (
    <AuthUserProvider>
      <Outlet />
    </AuthUserProvider>
  );
}
