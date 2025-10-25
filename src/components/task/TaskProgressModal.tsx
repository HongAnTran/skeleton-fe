import React from "react";
import { Modal, Form, InputNumber, Input, Button, Space, message } from "antd";
import { useUpdateTaskProgress } from "../../queries/task.queries";
import type { TaskInstance, UpdateTaskProgressDto } from "../../types/task";

interface TaskProgressModalProps {
  instance: TaskInstance;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const TaskProgressModal: React.FC<TaskProgressModalProps> = ({
  instance,
  open,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const updateProgressMutation = useUpdateTaskProgress();

  const handleSubmit = async (values: UpdateTaskProgressDto) => {
    try {
      await updateProgressMutation.mutateAsync({
        id: instance.id,
        data: {
          ...values,
          source: "manual", // Manual update
          occurredAt: new Date().toISOString(),
        },
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      message.error("Không thể cập nhật tiến độ");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Cập nhật tiến độ nhiệm vụ"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={500}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 500, marginBottom: 8 }}>{instance.title}</div>
        <div style={{ color: "#666", fontSize: "14px" }}>
          Tiến độ hiện tại: {instance.quantity} / {instance.target || 0}{" "}
          {instance.unit}
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="delta"
          label="Thay đổi số lượng"
          rules={[
            { required: true, message: "Vui lòng nhập số lượng thay đổi" },
            { type: "number", message: "Vui lòng nhập số hợp lệ" },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder="Nhập số lượng thay đổi (có thể âm)"
            min={-instance.quantity} // Không cho phép âm hơn số hiện tại
          />
        </Form.Item>

        <Form.Item name="note" label="Ghi chú">
          <Input.TextArea
            rows={3}
            placeholder="Nhập ghi chú về tiến độ (tùy chọn)"
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={updateProgressMutation.isPending}
            >
              Cập nhật
            </Button>
            <Button onClick={handleCancel}>Hủy</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
