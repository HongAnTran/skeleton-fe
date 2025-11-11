import { Modal } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { TaskAssignment } from "../../types/task";

interface TaskCompleteModalProps {
  assignment: TaskAssignment | null;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function TaskCompleteModal({
  assignment,
  open,
  onConfirm,
  onCancel,
  loading = false,
}: TaskCompleteModalProps) {
  if (!assignment) return null;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <CheckCircleOutlined className="text-green-500" />
          <span>Xác nhận hoàn thành</span>
        </div>
      }
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Xác nhận hoàn thành"
      cancelText="Hủy"
      okButtonProps={{ loading }}
    >
      <div className="space-y-3">
        <p>Bạn có chắc chắn muốn đánh dấu task này là hoàn thành?</p>

        <div className="border rounded p-3 bg-gray-50">
          <div className="font-medium mb-2">
            {assignment.cycle?.task?.title}
          </div>
          {assignment.cycle?.task?.description && (
            <div className="text-sm text-gray-600 mb-2">
              {assignment.cycle.task.description}
            </div>
          )}
          <div className="text-xs text-gray-500">
            Chu kỳ: {dayjs(assignment.cycle?.periodStart).format("DD/MM/YYYY")}{" "}
            - {dayjs(assignment.cycle?.periodEnd).format("DD/MM/YYYY")}
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Sau khi đánh dấu hoàn thành, manager sẽ xem xét và phê duyệt task của
          bạn.
        </div>
      </div>
    </Modal>
  );
}
