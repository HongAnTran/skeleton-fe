import { Card, Tabs, Empty, Spin, Badge } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { TaskStatusV2 } from "../../types/task";
import type { TaskAssignment } from "../../types/task";
import { EmployeeTaskCard } from "./EmployeeTaskCard";

interface EmployeeTaskListProps {
  assignments: TaskAssignment[];
  loading?: boolean;
  onComplete: (assignmentId: string) => void;
  completingId?: string;
}

export function EmployeeTaskList({
  assignments,
  loading = false,
  onComplete,
  completingId,
}: EmployeeTaskListProps) {
  // Group assignments by status
  const rejected = assignments.filter(
    (a) => a.status === TaskStatusV2.REJECTED
  );
  const inProgress = assignments.filter(
    (a) =>
      a.status === TaskStatusV2.PENDING || a.status === TaskStatusV2.IN_PROGRESS
  );
  const completed = assignments.filter(
    (a) => a.status === TaskStatusV2.COMPLETED
  );
  const approved = assignments.filter(
    (a) => a.status === TaskStatusV2.APPROVED
  );

  const tabItems = [
    {
      key: "rejected",
      label: (
        <span>
          <Badge count={rejected.length} offset={[10, 0]}>
            <CloseCircleOutlined className="mr-2" />
            Bị từ chối
          </Badge>
        </span>
      ),
      children: (
        <div className="space-y-3">
          {rejected.length > 0 ? (
            rejected.map((assignment) => (
              <EmployeeTaskCard
                key={assignment.id}
                assignment={assignment}
                onComplete={onComplete}
                loading={completingId === assignment.id}
              />
            ))
          ) : (
            <Empty description="Không có task bị từ chối" />
          )}
        </div>
      ),
    },
    {
      key: "in-progress",
      label: (
        <span>
          <Badge count={inProgress.length} offset={[10, 0]}>
            <ClockCircleOutlined className="mr-2" />
            Đang thực hiện
          </Badge>
        </span>
      ),
      children: (
        <div className="space-y-3">
          {inProgress.length > 0 ? (
            inProgress.map((assignment) => (
              <EmployeeTaskCard
                key={assignment.id}
                assignment={assignment}
                onComplete={onComplete}
                loading={completingId === assignment.id}
              />
            ))
          ) : (
            <Empty description="Không có task đang thực hiện" />
          )}
        </div>
      ),
    },
    {
      key: "completed",
      label: (
        <span>
          <Badge count={completed.length} offset={[10, 0]}>
            <CheckCircleOutlined className="mr-2" />
            Chờ duyệt
          </Badge>
        </span>
      ),
      children: (
        <div className="space-y-3">
          {completed.length > 0 ? (
            completed.map((assignment) => (
              <EmployeeTaskCard
                key={assignment.id}
                assignment={assignment}
                onComplete={onComplete}
                loading={false}
              />
            ))
          ) : (
            <Empty description="Không có task chờ duyệt" />
          )}
        </div>
      ),
    },
    {
      key: "approved",
      label: (
        <span>
          <Badge count={approved.length} offset={[10, 0]}>
            <SafetyOutlined className="mr-2" />
            Đã duyệt
          </Badge>
        </span>
      ),
      children: (
        <div className="space-y-3">
          {approved.length > 0 ? (
            approved.map((assignment) => (
              <EmployeeTaskCard
                key={assignment.id}
                assignment={assignment}
                onComplete={onComplete}
                loading={false}
              />
            ))
          ) : (
            <Empty description="Chưa có task được duyệt" />
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card>
      <Tabs
        defaultActiveKey={rejected.length > 0 ? "rejected" : "in-progress"}
        items={tabItems}
      />
    </Card>
  );
}
