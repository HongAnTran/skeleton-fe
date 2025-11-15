import { Card, Tag, Button, Alert, Descriptions } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { TaskStatusV2 } from "../../types/task";
import type { TaskAssignment } from "../../types/task";

dayjs.extend(relativeTime);
dayjs.locale("vi");

interface EmployeeTaskCardProps {
  assignment: TaskAssignment;
  onComplete: (assignmentId: string) => void;
  loading?: boolean;
}

export function EmployeeTaskCard({
  assignment,
  onComplete,
  loading = false,
}: EmployeeTaskCardProps) {
  const getDaysLeft = () => {
    if (!assignment.cycle?.periodEnd) return 0;
    const now = dayjs();
    const end = dayjs(assignment.cycle.periodEnd);
    return end.diff(now, "day");
  };

  const getStatusTag = () => {
    switch (assignment.status) {
      case TaskStatusV2.REJECTED:
        return <Tag color="red">Bị từ chối</Tag>;
      case TaskStatusV2.PENDING:
      case TaskStatusV2.IN_PROGRESS:
        return <Tag color="blue">Đang thực hiện</Tag>;
      case TaskStatusV2.COMPLETED:
        return <Tag color="orange">Chờ duyệt</Tag>;
      case TaskStatusV2.APPROVED:
        return <Tag color="green">Đã duyệt</Tag>;
      default:
        return <Tag>{assignment.status}</Tag>;
    }
  };

  const daysLeft = getDaysLeft();
  const isOverdue = daysLeft < 0;
  const isUrgent = daysLeft >= 0 && daysLeft <= 3;

  const canComplete =
    assignment.status === TaskStatusV2.PENDING ||
    assignment.status === TaskStatusV2.IN_PROGRESS ||
    assignment.status === TaskStatusV2.REJECTED;

  return (
    <Card
      size="small"
      className={`${
        assignment.status === TaskStatusV2.REJECTED
          ? "border-red-300"
          : assignment.status === TaskStatusV2.APPROVED
            ? "border-green-300"
            : ""
      }`}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">
              {assignment.cycle?.task?.title}
            </h3>
            <div className="flex items-center gap-2">
              {getStatusTag()}
              {isOverdue && (
                <Tag color="red" icon={<WarningOutlined />}>
                  Quá hạn
                </Tag>
              )}
              {isUrgent && !isOverdue && (
                <Tag color="orange" icon={<ClockCircleOutlined />}>
                  Gấp
                </Tag>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {assignment.cycle?.task?.description && (
          <div className="text-gray-700 text-sm whitespace-pre-line">
            {assignment.cycle.task.description}
          </div>
        )}

        {/* Details */}
        <Descriptions size="small" column={2}>
          <Descriptions.Item label="Chu kỳ">
            {dayjs(assignment.cycle?.periodStart).format("DD/MM/YYYY")} -{" "}
            {dayjs(assignment.cycle?.periodEnd).format("DD/MM/YYYY")}
          </Descriptions.Item>
          <Descriptions.Item label="Thời hạn">
            <span
              className={
                isOverdue
                  ? "text-red-600 font-medium"
                  : isUrgent
                    ? "text-orange-600 font-medium"
                    : ""
              }
            >
              {isOverdue
                ? `Quá hạn ${Math.abs(daysLeft)} ngày`
                : `Còn ${daysLeft} ngày`}
            </span>
          </Descriptions.Item>
          {assignment.completedAt && (
            <Descriptions.Item label="Hoàn thành">
              {dayjs(assignment.completedAt).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
          )}
          {assignment.approvedAt && (
            <Descriptions.Item label="Được duyệt">
              {dayjs(assignment.approvedAt).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
          )}
        </Descriptions>

        {/* Rejection Alert */}
        {assignment.status === TaskStatusV2.REJECTED &&
          assignment.rejectedReason && (
            <Alert
              message="Lý do từ chối"
              description={assignment.rejectedReason}
              type="error"
              showIcon
              icon={<CloseCircleOutlined />}
            />
          )}

        {/* Completed Alert */}
        {assignment.status === TaskStatusV2.COMPLETED && (
          <Alert
            message="Đã hoàn thành - Chờ manager phê duyệt"
            type="warning"
            showIcon
          />
        )}

        {/* Approved Alert */}
        {assignment.status === TaskStatusV2.APPROVED && (
          <Alert message="Task đã được phê duyệt!" type="success" showIcon />
        )}

        {/* Action Button */}
        {canComplete && (
          <div className="flex justify-end">
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => onComplete(assignment.id)}
              loading={loading}
              size="large"
            >
              {assignment.status === TaskStatusV2.REJECTED
                ? "Hoàn thành lại"
                : "Đánh dấu hoàn thành"}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
