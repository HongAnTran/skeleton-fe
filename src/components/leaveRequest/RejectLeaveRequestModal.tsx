import { Modal, Form, Input, Button, Space } from "antd";
import type { RejectLeaveRequestDto } from "@/types/leaveRequest";

const { TextArea } = Input;

interface RejectLeaveRequestModalProps {
  open: boolean;
  leaveRequest: any;
  onCancel: () => void;
  onSubmit: (data: RejectLeaveRequestDto) => Promise<void>;
  loading?: boolean;
}

export function RejectLeaveRequestModal({
  open,
  onCancel,
  onSubmit,
  loading = false,
}: RejectLeaveRequestModalProps) {
  const [form] = Form.useForm();

  const handleSubmit = async (values: { rejectedReason: string }) => {
    await onSubmit({ rejectedReason: values.rejectedReason });
    form.resetFields();
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Từ chối đơn xin nghỉ"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ rejectedReason: "" }}
      >
        <Form.Item
          label="Lý do từ chối"
          name="rejectedReason"
          rules={[
            { required: true, message: "Vui lòng nhập lý do từ chối!" },
            { max: 500, message: "Lý do không được quá 500 ký tự!" },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Nhập lý do từ chối đơn xin nghỉ"
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <Space className="w-full justify-end">
            <Button onClick={handleCancel} disabled={loading}>
              Hủy
            </Button>
            <Button type="primary" danger htmlType="submit" loading={loading}>
              Từ chối
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
