import { Modal, Form, Input, Button, Space } from "antd";
import type { CancelLeaveRequestDto } from "../../types/leaveRequest";

const { TextArea } = Input;

interface CancelLeaveRequestModalProps {
  open: boolean;
  leaveRequest: any;
  onCancel: () => void;
  onSubmit: (data: CancelLeaveRequestDto) => Promise<void>;
  loading?: boolean;
}

export function CancelLeaveRequestModal({
  open,
  onCancel,
  onSubmit,
  loading = false,
}: CancelLeaveRequestModalProps) {
  const [form] = Form.useForm();

  const handleSubmit = async (values: { cancelReason: string }) => {
    await onSubmit({ cancelReason: values.cancelReason });
    form.resetFields();
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Hủy đơn xin nghỉ"
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
        initialValues={{ cancelReason: "" }}
      >
        <Form.Item
          label="Lý do hủy"
          name="cancelReason"
          rules={[
            { required: true, message: "Vui lòng nhập lý do hủy!" },
            { max: 500, message: "Lý do không được quá 500 ký tự!" },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Nhập lý do hủy đơn xin nghỉ"
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <Space className="w-full justify-end">
            <Button onClick={handleCancel} disabled={loading}>
              Đóng
            </Button>
            <Button type="primary" danger htmlType="submit" loading={loading}>
              Hủy đơn
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
