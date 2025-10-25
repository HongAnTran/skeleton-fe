import React from "react";
import { Modal, Form, Input, Button, Space, Radio, message } from "antd";
import { useApproveTask, useRejectTask } from "../../queries/task.queries";
import type { TaskInstance } from "../../types/task";

interface TaskApprovalModalProps {
  instance: TaskInstance;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const TaskApprovalModal: React.FC<TaskApprovalModalProps> = ({
  instance,
  open,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [action, setAction] = React.useState<"approve" | "reject">("approve");

  const approveMutation = useApproveTask();
  const rejectMutation = useRejectTask();

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      form.resetFields();
      setAction("approve");
    }
  }, [open, form]);

  const handleSubmit = async (values: any) => {
    try {
      if (action === "approve") {
        await approveMutation.mutateAsync({
          id: instance.id,
          data: {
            approvedBy: "current-user", // TODO: Get from auth context
            reason: values.reason || "Đã phê duyệt",
          },
        });
      } else {
        await rejectMutation.mutateAsync({
          id: instance.id,
          data: {
            rejectedBy: "current-user", // TODO: Get from auth context
            rejectedReason: values.reason,
          },
        });
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      message.error(
        `Không thể ${action === "approve" ? "phê duyệt" : "từ chối"} nhiệm vụ`
      );
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setAction("approve");
    onClose();
  };

  return (
    <Modal
      title={`${action === "approve" ? "Phê duyệt" : "Từ chối"} nhiệm vụ`}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={500}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 500, marginBottom: 8 }}>{instance.title}</div>
        <div style={{ color: "#666", fontSize: "14px" }}>
          Tiến độ: {instance.quantity} / {instance.target || 0} {instance.unit}
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="Hành động">
          <Radio.Group
            value={action}
            onChange={(e) => setAction(e.target.value)}
            style={{ width: "100%" }}
          >
            <Radio value="approve">Phê duyệt</Radio>
            <Radio value="reject">Từ chối</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="reason"
          label={
            action === "approve"
              ? "Lý do phê duyệt (tùy chọn)"
              : "Lý do từ chối"
          }
          rules={[
            {
              required: action === "reject",
              message: "Vui lòng nhập lý do từ chối",
            },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder={`Nhập lý do ${action === "approve" ? "phê duyệt" : "từ chối"} nhiệm vụ`}
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type={action === "approve" ? "primary" : "default"}
              htmlType="submit"
              loading={approveMutation.isPending || rejectMutation.isPending}
            >
              {action === "approve" ? "Phê duyệt" : "Từ chối"}
            </Button>
            <Button onClick={handleCancel}>Hủy</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
