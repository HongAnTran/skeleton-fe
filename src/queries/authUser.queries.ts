import { useMutation } from "@tanstack/react-query";
import { message } from "antd";
import { AuthUserService } from "../services/authUser.service";
import type { ChangePasswordRequest } from "../types/auth";

// Change password mutation for users
export const useUserChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) =>
      AuthUserService.changePassword(data),
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
