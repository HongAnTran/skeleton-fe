import { useQuery } from "@tanstack/react-query";
import { ReportsService } from "@/services/dashboard.service";
import type { DashboardQuery } from "@/types/dashboard";

export const useDashboardData = (query: DashboardQuery = {}) => {
  return useQuery({
    queryKey: ["dashboard", query],
    queryFn: () => ReportsService.getDashboardData(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
