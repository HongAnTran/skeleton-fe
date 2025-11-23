import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { BranchService } from "@/services/branch.service";
import type {
  CreateBranchRequest,
  UpdateBranchRequest,
  BranchListParams,
  Branch,
} from "@/types/branch";
import type { ReactQueryOptions } from "@/types/reactQuery";
import type { PaginatedResult } from "@/types/api";

export const BRANCH_KEYS = {
  all: ["branches"] as const,
  lists: () => [...BRANCH_KEYS.all, "list"] as const,
  list: (params: BranchListParams) => [...BRANCH_KEYS.lists(), params] as const,
  details: () => [...BRANCH_KEYS.all, "detail"] as const,
  detail: (id: string) => [...BRANCH_KEYS.details(), id] as const,
};

// Get branches with pagination
export const useBranches = (
  params: BranchListParams,
  options?: ReactQueryOptions<PaginatedResult<Branch>>
) => {
  const onSuccess = options?.onSuccess;
  const query = useQuery({
    queryKey: BRANCH_KEYS.list(params),
    queryFn: () => BranchService.getList(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });

  if (query.isSuccess && query.data) {
    onSuccess?.(query.data);
  }
  return query;
};

// Get single branch
export const useBranch = (id: string, options?: ReactQueryOptions) => {
  return useQuery({
    queryKey: BRANCH_KEYS.detail(id),
    queryFn: () => BranchService.getById(id),
    enabled: !!id,
    ...options,
  });
};

// Create branch mutation
export const useCreateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBranchRequest) => BranchService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRANCH_KEYS.lists() });
      message.success("Chi nhánh đã được tạo thành công!");
    },
  });
};

// Update branch mutation
export const useUpdateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBranchRequest }) =>
      BranchService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRANCH_KEYS.all });
      message.success("Chi nhánh đã được cập nhật thành công!");
    },
  });
};

// Delete branch mutation
export const useDeleteBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => BranchService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRANCH_KEYS.lists() });
      message.success("Chi nhánh đã được xóa thành công!");
    },
  });
};
