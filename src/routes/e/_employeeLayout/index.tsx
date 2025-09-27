import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEmployeeAuth } from "../../../contexts/AuthEmployeeContext";
import { tokenStorage } from "../../../utils/token";

export const Route = createFileRoute("/e/_employeeLayout/")({
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
  const { employee } = useEmployeeAuth();
  return <h1>hẹ hẹ hẹ {employee.fullName}.</h1>;
}
