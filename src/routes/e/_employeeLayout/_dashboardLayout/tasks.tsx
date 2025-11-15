import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card, Row, Col, Statistic, Typography, Alert } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { EmployeeTaskList, TaskCompleteModal } from "../../../../components";
import {
  useEmployeeAssignments,
  useCompleteTask,
} from "../../../../queries/task.queries";
import { TaskStatusV2 } from "../../../../types/task";
import type { TaskAssignment } from "../../../../types/task";

const { Title } = Typography;

export const Route = createFileRoute(
  "/e/_employeeLayout/_dashboardLayout/tasks"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<TaskAssignment | null>(null);

  // Query
  const { data: assignments, isLoading } = useEmployeeAssignments();

  // Mutation
  const completeTaskMutation = useCompleteTask();

  // Handlers
  const handleCompleteClick = (assignmentId: string) => {
    const assignment = assignments?.find((a) => a.id === assignmentId);
    if (assignment) {
      setSelectedAssignment(assignment);
      setCompleteModalOpen(true);
    }
  };

  const handleCompleteConfirm = async () => {
    if (selectedAssignment) {
      await completeTaskMutation.mutateAsync(selectedAssignment.id);
      setCompleteModalOpen(false);
      setSelectedAssignment(null);
    }
  };

  // Statistics
  const stats = {
    rejected:
      assignments?.filter((a) => a.status === TaskStatusV2.REJECTED).length ||
      0,
    inProgress:
      assignments?.filter(
        (a) =>
          a.status === TaskStatusV2.PENDING ||
          a.status === TaskStatusV2.IN_PROGRESS
      ).length || 0,
    completed:
      assignments?.filter((a) => a.status === TaskStatusV2.COMPLETED).length ||
      0,
    approved:
      assignments?.filter((a) => a.status === TaskStatusV2.APPROVED).length ||
      0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Title level={2} className="!mb-2">
          📝 Tasks của tôi
        </Title>
        <p className="text-gray-600">
          Xem và quản lý các task được gán cho bạn
        </p>
      </div>

      {/* Statistics */}
      <Row gutter={16}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Bị từ chối"
              value={stats.rejected}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: stats.rejected > 0 ? "#ff4d4f" : "#8c8c8c" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đang thực hiện"
              value={stats.inProgress}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Chờ duyệt"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đã duyệt"
              value={stats.approved}
              prefix={<SafetyOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Alert for rejected tasks */}
      {stats.rejected > 0 && (
        <Alert
          message="Bạn có task bị từ chối!"
          description={`Có ${stats.rejected} task bị từ chối cần xem xét và hoàn thành lại.`}
          type="error"
          showIcon
          icon={<CloseCircleOutlined />}
        />
      )}

      {/* Task List */}
      <EmployeeTaskList
        assignments={assignments || []}
        loading={isLoading}
        onComplete={handleCompleteClick}
        completingId={undefined}
      />

      {/* Complete Modal */}
      <TaskCompleteModal
        assignment={selectedAssignment}
        open={completeModalOpen}
        onConfirm={handleCompleteConfirm}
        onCancel={() => {
          setCompleteModalOpen(false);
          setSelectedAssignment(null);
        }}
        loading={completeTaskMutation.isPending}
      />
    </div>
  );
}
