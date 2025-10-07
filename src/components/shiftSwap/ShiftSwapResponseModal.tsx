import {
  Modal,
  Form,
  Radio,
  Button,
  Space,
  Typography,
  Alert,
  Row,
  Col,
  Card,
} from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type {
  ShiftSwapRequest,
  RespondShiftSwapRequestDto,
} from "../../types/shiftSwap";

const { Text } = Typography;

interface ShiftSwapResponseModalProps {
  open: boolean;
  request?: ShiftSwapRequest;
  onCancel: () => void;
  onSubmit: (data: RespondShiftSwapRequestDto) => Promise<void>;
  loading?: boolean;
}

export function ShiftSwapResponseModal({
  open,
  request,
  onCancel,
  onSubmit,
  loading = false,
}: ShiftSwapResponseModalProps) {
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    try {
      const data: RespondShiftSwapRequestDto = {
        status: values.status,
        responseMessage: values.responseMessage,
      };
      await onSubmit(data);
      handleCancel();
    } catch (error) {
      // Error is handled by parent
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  if (!request) return null;

  return (
    <Modal
      title="Phản hồi yêu cầu đổi ca"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={700}
      destroyOnClose
    >
      <div className="space-y-4">
        {/* Request info */}
        <Card className="bg-gray-50">
          <div className="space-y-3">
            <div className="flex items-center flex-col lg:flex-row gap-2">
              <Text strong>Yêu cầu từ:</Text>
              <Text>{request.requester.name}</Text>
              <Text type="secondary" className="ml-4">
                {dayjs(request.createdAt).format("DD/MM/YYYY HH:mm")}
              </Text>
            </div>
          </div>
        </Card>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: "ACCEPTED" }}
        >
          <Form.Item
            label="Phản hồi"
            name="status"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn phản hồi!",
              },
            ]}
          >
            <Radio.Group className="w-full">
              <Row gutter={16}>
                <Col span={12}>
                  <Radio.Button
                    value="ACCEPTED"
                    className="w-full h-16 flex items-center justify-center"
                  >
                    <div className="text-center">
                      <CheckCircleOutlined className="text-green-500 text-xl mb-1" />
                      <div className="font-medium">Chấp nhận</div>
                      <div className="text-xs text-gray-500">
                        Đồng ý đổi ca làm việc
                      </div>
                    </div>
                  </Radio.Button>
                </Col>
                <Col span={12}>
                  <Radio.Button
                    value="REJECTED"
                    className="w-full h-16 flex items-center justify-center"
                  >
                    <div className="text-center">
                      <CloseCircleOutlined className="text-red-500 text-xl mb-1" />
                      <div className="font-medium">Từ chối</div>
                      <div className="text-xs text-gray-500">
                        Không thể đổi ca lúc này
                      </div>
                    </div>
                  </Radio.Button>
                </Col>
              </Row>
            </Radio.Group>
          </Form.Item>

          <Alert
            message="Lưu ý"
            description="Sau khi phản hồi, yêu cầu sẽ không thể thay đổi. Nếu chấp nhận, hệ thống sẽ tự động hoán đổi ca làm việc của hai bên."
            type="info"
            showIcon
            style={{ marginBottom: "16px" }}
          />

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={handleCancel} disabled={loading}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Xác nhận
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
