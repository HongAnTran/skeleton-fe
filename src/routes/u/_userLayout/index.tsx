import { createFileRoute, redirect } from "@tanstack/react-router";
import { useUserAuth } from "../../../contexts/AuthUserContext";
import { Button } from "antd";
import { tokenStorage } from "../../../utils/token";
export const Route = createFileRoute("/u/_userLayout/")({
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
  const { user, logout } = useUserAuth();
  return (
    <h1>
      hẹ hẹ hẹ {user?.name}
      <Button
        onClick={() => {
          logout();
        }}
      >
        Logout
      </Button>
    </h1>
  );
}
