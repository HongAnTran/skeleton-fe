import { createFileRoute } from "@tanstack/react-router";
import { ChangePasswordForm } from "../../../../components/ChangePasswordForm";
import { useEmployeeChangePassword } from "../../../../queries/authEmployee.queries";
import type { ChangePasswordRequest } from "../../../../types/auth";

export const Route = createFileRoute(
  "/e/_employeeLayout/_dashboardLayout/settings"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const changePasswordMutation = useEmployeeChangePassword();

  const handleChangePassword = async (values: ChangePasswordRequest) => {
    await changePasswordMutation.mutateAsync(values);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Cài đặt</h1>
      <ChangePasswordForm
        onSubmit={handleChangePassword}
        loading={changePasswordMutation.isPending}
      />
    </div>
  );
}

