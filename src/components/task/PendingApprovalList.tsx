import { Card, List, Tag, Button, Space, Empty, Spin } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import type { TaskAssignment } from "../../types/task";

dayjs.extend(relativeTime);
dayjs.locale("vi");

interface PendingApprovalListProps {
  assignments: TaskAssignment[];
  loading?: boolean;
  onApprove: (assignment: TaskAssignment) => void;
  onReject: (assignment: TaskAssignment) => void;
}

export function PendingApprovalList({
  assignments,
  loading = false,
  onApprove,
  onReject,
}: PendingApprovalListProps) {
  if (loading) {
    return (
      <Card>
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <span>⏳ Chờ phê duyệt ({assignments.length})</span>
          {assignments.length > 0 && (
            <Tag color="orange">{assignments.length} tasks</Tag>
          )}
        </div>
      }
    >
      {assignments.length === 0 ? (
        <Empty description="Không có task chờ phê duyệt" />
      ) : (
        <List
          dataSource={assignments}
          renderItem={(assignment) => (
            <List.Item
              key={assignment.id}
              actions={[
                <Space key="actions">
                  <Button
                    type="primary"
                    size="small"
                    icon={<CheckCircleOutlined />}
                    onClick={() => onApprove(assignment)}
                  >
                    Duyệt
                  </Button>
                  <Button
                    danger
                    size="small"
                    icon={<CloseCircleOutlined />}
                    onClick={() => onReject(assignment)}
                  >
                    Từ chối
                  </Button>
                </Space>,
              ]}
            >
              <List.Item.Meta
                title={
                  <div>
                    <div className="font-medium">
                      {assignment.cycle?.task?.title}
                    </div>
                    <div className="text-sm text-gray-500 font-normal mt-1">
                      {assignment.employee?.name} -{" "}
                      {assignment.employee?.department?.name}
                    </div>
                  </div>
                }
                description={
                  <div className="space-y-1">
                    {assignment.cycle?.task?.description && (
                      <div className="text-gray-600 line-clamp-2">
                        {assignment.cycle.task.description}
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-xs">
                      <span>
                        Chu kỳ:{" "}
                        {dayjs(assignment.cycle?.periodStart).format(
                          "DD/MM/YYYY"
                        )}{" "}
                        -{" "}
                        {dayjs(assignment.cycle?.periodEnd).format(
                          "DD/MM/YYYY"
                        )}
                      </span>
                      <span className="text-orange-600">
                        Hoàn thành: {dayjs(assignment.completedAt).fromNow()}
                      </span>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
}
