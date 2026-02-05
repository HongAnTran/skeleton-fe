import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { UserAdminService } from "@/services/userAdmin.service";

import type { ReactQueryOptions } from "@/types/reactQuery";
import type {
  CreateUserAdminDto,
  UpdateUserAdminDto,
  UserAdminListParams,
} from "@/types/userAdmin";

export const USER_ADMIN_KEYS = {
  all: ["user-admins"] as const,
  lists: () => [...USER_ADMIN_KEYS.all, "list"] as const,
  list: (params: UserAdminListParams) =>
    [...USER_ADMIN_KEYS.lists(), params] as const,
  details: () => [...USER_ADMIN_KEYS.all, "detail"] as const,
  detail: (id: string) => [...USER_ADMIN_KEYS.details(), id] as const,
};

export const useUserAdmins = (
  params: UserAdminListParams,
  options?: ReactQueryOptions,
) => {
  const onSuccess = options?.onSuccess;
  const query = useQuery({
    queryKey: USER_ADMIN_KEYS.list(params),
    queryFn: () => UserAdminService.getList(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
  if (query.isSuccess && query.data) {
    onSuccess?.(query.data);
  }
  return query;
};

export const useUserAdmin = (id: string, options?: ReactQueryOptions) => {
  return useQuery({
    queryKey: USER_ADMIN_KEYS.detail(id),
    queryFn: () => UserAdminService.getById(id),
    enabled: !!id,
    ...options,
  });
};

export const useCreateUserAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserAdminDto) => UserAdminService.create(data),
    onSuccess: (newUserAdmin) => {
      queryClient.invalidateQueries({ queryKey: USER_ADMIN_KEYS.lists() });
      queryClient.setQueryData(
        USER_ADMIN_KEYS.detail(newUserAdmin.id),
        newUserAdmin,
      );
      message.success("User admin đã được tạo thành công!");
    },
    onError: () => {
      message.error("Có lỗi xảy ra khi tạo user admin!");
    },
  });
};

export const useUpdateUserAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserAdminDto }) =>
      UserAdminService.update(id, data),
    onSuccess: (updated, { id }) => {
      queryClient.invalidateQueries({ queryKey: USER_ADMIN_KEYS.lists() });
      queryClient.setQueryData(USER_ADMIN_KEYS.detail(id), updated);
      message.success("User admin đã được cập nhật thành công!");
    },
    onError: () => {
      message.error("Có lỗi xảy ra khi cập nhật user admin!");
    },
  });
};

export const useDeleteUserAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => UserAdminService.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: USER_ADMIN_KEYS.lists() });
      queryClient.removeQueries({
        queryKey: USER_ADMIN_KEYS.detail(deletedId),
      });
      message.success("User admin đã được xóa thành công!");
    },
    onError: () => {
      message.error("Có lỗi xảy ra khi xóa user admin!");
    },
  });
};
