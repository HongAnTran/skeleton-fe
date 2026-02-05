import { useMutation } from "@tanstack/react-query";
import { message } from "antd";
import { AuthEmployeeService } from "../services/authEmployee.service";
import type { ChangePasswordRequest } from "../types/auth";

// Change password mutation for employees
export const useEmployeeChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) =>
      AuthEmployeeService.changePassword(data),
    onSuccess: () => {
      message.success("Mật khẩu đã được thay đổi thành công!");
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Không thể thay đổi mật khẩu";
      message.error(errorMessage);
    },
  });
};
