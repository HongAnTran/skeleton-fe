import { PendingApprovalList } from "@/components/task/PendingApprovalList";
import { useFilters } from "@/hooks/useFilters";
import {
  useApproveTask,
  useRejectTask,
  useTaskAssignments,
} from "@/queries/task.queries";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TaskApprovalModal } from "@/components/task/TaskApprovalModal";
import type { TaskAssignment } from "@/types/task";

export const Route = createFileRoute(
  "/u/_userLayout/_dashboardLayout/tasks/pending-approvel"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const [selectedAssignment, setSelectedAssignment] =
    useState<TaskAssignment | null>(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);

  const approveTaskMutation = useApproveTask();
  const rejectTaskMutation = useRejectTask();
  const { filters, setFilter, clearAllFilters, hasActiveFilters } = useFilters({
    department: { type: "string" },
    level: { type: "number" },
    employeeId: { type: "string" },
  });

  const { data: pendingApprovals, isLoading: approvalsLoading } =
    useTaskAssignments({
      departmentId: filters.department,
      employeeId: filters.employeeId,
      level: filters.level,
    });

  // Handlers - Approval
  const handleOpenApproval = (assignment: TaskAssignment) => {
    setSelectedAssignment(assignment);
    setApprovalModalOpen(true);
  };

  const handleApprove = async () => {
    if (selectedAssignment) {
      await approveTaskMutation.mutateAsync(selectedAssignment.id);
      setApprovalModalOpen(false);
      setSelectedAssignment(null);
    }
  };

  const handleReject = async (reason: string) => {
    if (selectedAssignment) {
      await rejectTaskMutation.mutateAsync({
        id: selectedAssignment.id,
        data: { rejectedReason: reason },
      });
      setApprovalModalOpen(false);
      setSelectedAssignment(null);
    }
  };

  return (
    <>
      <PendingApprovalList
        assignments={pendingApprovals || []}
        loading={approvalsLoading}
        onApprove={handleOpenApproval}
        onReject={handleOpenApproval}
      />

      <TaskApprovalModal
        assignment={selectedAssignment}
        open={approvalModalOpen}
        onApprove={handleApprove}
        onReject={handleReject}
        onCancel={() => {
          setApprovalModalOpen(false);
          setSelectedAssignment(null);
        }}
        loading={approveTaskMutation.isPending || rejectTaskMutation.isPending}
      />
    </>
  );
}
