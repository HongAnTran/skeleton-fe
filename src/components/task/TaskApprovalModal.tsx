import { Modal, Descriptions, Tag, Space, Button, Input } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import type { TaskAssignment } from "@/types/task";

dayjs.extend(relativeTime);
dayjs.locale("vi");

interface TaskApprovalModalProps {
  assignment: TaskAssignment | null;
  open: boolean;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function TaskApprovalModal({
  assignment,
  open,
  onApprove,
  onReject,
  onCancel,
  loading = false,
}: TaskApprovalModalProps) {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleRejectClick = () => {
    setShowRejectInput(true);
  };

  const handleRejectConfirm = () => {
    if (rejectReason.trim()) {
      onReject(rejectReason);
      setRejectReason("");
      setShowRejectInput(false);
    }
  };

  const handleCancel = () => {
    setShowRejectInput(false);
    setRejectReason("");
    onCancel();
  };

  if (!assignment) return null;

  return (
    <Modal
      title={<div className="text-lg font-semibold">Phê duyệt Task</div>}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <div className="space-y-4">
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Task">
            <div className="font-medium">{assignment.cycle?.task?.title}</div>
          </Descriptions.Item>
          <Descriptions.Item label="Nhân viên">
            <div>
              <div className="font-medium">{assignment.employee?.name}</div>
              {assignment.employee?.account?.email && (
                <div className="text-gray-500 text-sm">
                  {assignment.employee.account.email}
                </div>
              )}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Phòng ban">
            {assignment.employee?.department?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Chu kỳ">
            {dayjs(assignment.cycle?.periodStart).format("DD/MM/YYYY")} -{" "}
            {dayjs(assignment.cycle?.periodEnd).format("DD/MM/YYYY")}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color="orange">Chờ duyệt</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Hoàn thành lúc">
            {assignment.completedAt
              ? dayjs(assignment.completedAt).format("DD/MM/YYYY HH:mm")
              : "-"}
            {assignment.completedAt && (
              <span className="text-gray-500 ml-2">
                ({dayjs(assignment.completedAt).fromNow()})
              </span>
            )}
          </Descriptions.Item>
        </Descriptions>

        {assignment.cycle?.task?.description && (
          <div className="border rounded p-3 bg-gray-50">
            <div className="text-sm font-medium mb-2">Yêu cầu task:</div>
            <div className="text-sm text-gray-700 whitespace-pre-line">
              {assignment.cycle.task.description}
            </div>
          </div>
        )}

        {!showRejectInput ? (
          <Space className="w-full justify-end">
            <Button onClick={handleCancel} disabled={loading}>
              Đóng
            </Button>
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={handleRejectClick}
              disabled={loading}
            >
              Từ chối
            </Button>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={onApprove}
              loading={loading}
            >
              Phê duyệt
            </Button>
          </Space>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">
                Lý do từ chối <span className="text-red-500">*</span>
              </label>
              <Input.TextArea
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối task này..."
                autoFocus
              />
            </div>
            <Space className="w-full justify-end">
              <Button
                onClick={() => {
                  setShowRejectInput(false);
                  setRejectReason("");
                }}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button
                danger
                onClick={handleRejectConfirm}
                loading={loading}
                disabled={!rejectReason.trim()}
              >
                Xác nhận từ chối
              </Button>
            </Space>
          </div>
        )}
      </div>
    </Modal>
  );
}
