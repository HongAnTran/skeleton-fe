import { Modal, Input, Alert, Typography, Tag } from "antd";
import { DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { ShiftSignup } from "../types/shiftSignup";

const { Text } = Typography;
const { TextArea } = Input;

interface ShiftSignupCancelModalProps {
  open: boolean;
  signup: ShiftSignup | null;
  cancelReason: string;
  onCancelReasonChange: (reason: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLoading?: boolean;
}

export function ShiftSignupCancelModal({
  open,
  signup,
  cancelReason,
  onCancelReasonChange,
  onConfirm,
  onCancel,
  confirmLoading = false,
}: ShiftSignupCancelModalProps) {
  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <ExclamationCircleOutlined className="text-orange-500" />
          <span>Xác nhận hủy đăng ký ca làm việc</span>
        </div>
      }
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Hủy đăng ký"
      cancelText="Không"
      confirmLoading={confirmLoading}
      okButtonProps={{
        danger: true,
        icon: <DeleteOutlined />,
        disabled: !cancelReason.trim(),
      }}
    >
      {signup && (
        <div className="space-y-4">
          <Alert
            message="Bạn có chắc chắn muốn hủy đăng ký ca làm việc này không?"
            type="warning"
            showIcon
          />

          <div>
            <Text strong>Chi tiết ca làm việc:</Text>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="mb-2">
              <Text strong>{signup.slot?.type?.name}</Text>
              {signup.slot?.branch && (
                <Tag color="green" className="ml-2">
                  {signup.slot.branch.name}
                </Tag>
              )}
            </div>
            <div className="mb-2">
              <Text type="secondary">
                Ngày: {dayjs(signup.slot?.date).format("DD/MM/YYYY")}
              </Text>
            </div>
            <div>
              <Text type="secondary">
                Thời gian:{" "}
                {signup.slot?.type?.startDate
                  ? `${dayjs(signup.slot.type.startDate).format("HH:mm")} - ${dayjs(signup.slot.type.endDate).format("HH:mm")}`
                  : "N/A"}
              </Text>
            </div>
          </div>
          <div>
            <Text strong className="text-red-600">
              Lý do hủy <span className="text-red-500">*</span>:
            </Text>
            <TextArea
              value={cancelReason}
              onChange={(e) => onCancelReasonChange(e.target.value)}
              placeholder="Vui lòng nhập lý do hủy đăng ký..."
              rows={3}
              className="mt-2"
              required
            />
            {!cancelReason.trim() && (
              <Text type="danger" className="text-sm mt-1">
                Vui lòng nhập lý do hủy đăng ký
              </Text>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
