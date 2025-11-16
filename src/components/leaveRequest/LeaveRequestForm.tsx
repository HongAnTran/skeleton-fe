import { useEffect } from "react";
import { Form, Input, Button, Space, DatePicker } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import type {
  LeaveRequest,
  CreateLeaveRequestDto,
} from "../../types/leaveRequest";

const { TextArea } = Input;

interface LeaveRequestFormProps {
  leaveRequest?: LeaveRequest | null;
  onSubmit: (data: CreateLeaveRequestDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  submitText?: string;
  cancelText?: string;
}

export function LeaveRequestForm({
  leaveRequest,
  onSubmit,
  onCancel,
  loading = false,
  submitText,
  cancelText = "Hủy",
}: LeaveRequestFormProps) {
  const [form] = Form.useForm();

  const isEditing = !!leaveRequest;

  const defaultSubmitText = isEditing ? "Cập nhật" : "Tạo";
  const finalSubmitText = submitText || `${defaultSubmitText} đơn xin nghỉ`;

  const handleSubmit = async (values: {
    dateRange: [Dayjs, Dayjs];
    reason?: string;
  }) => {
    const data: CreateLeaveRequestDto = {
      startDate: values.dateRange[0].startOf("day").toISOString(),
      endDate: values.dateRange[1].endOf("day").toISOString(),
      reason: values.reason || undefined,
    };
    await onSubmit(data);
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  useEffect(() => {
    if (leaveRequest) {
      form.setFieldsValue({
        dateRange: [dayjs(leaveRequest.startDate), dayjs(leaveRequest.endDate)],
        reason: leaveRequest.reason || "",
      });
    } else {
      form.resetFields();
    }
  }, [leaveRequest, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        dateRange: undefined,
        reason: "",
      }}
    >
      <Form.Item
        label="Khoảng thời gian nghỉ"
        name="dateRange"
        rules={[
          { required: true, message: "Vui lòng chọn khoảng thời gian nghỉ!" },
          {
            validator: (_, value) => {
              if (!value || !value[0] || !value[1]) {
                return Promise.reject(
                  new Error("Vui lòng chọn khoảng thời gian nghỉ!")
                );
              }
              if (value[0].isAfter(value[1])) {
                return Promise.reject(
                  new Error("Ngày bắt đầu không thể sau ngày kết thúc!")
                );
              }
              if (value[0].isBefore(dayjs().startOf("day"))) {
                return Promise.reject(
                  new Error(
                    "Không thể tạo đơn xin nghỉ cho ngày trong quá khứ!"
                  )
                );
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <DatePicker.RangePicker
          style={{ width: "100%" }}
          format="DD/MM/YYYY"
          defaultPickerValue={[dayjs(), dayjs()]}
          disabledDate={(current) => {
            // Disable past dates
            return current && current < dayjs().startOf("day");
          }}
        />
      </Form.Item>

      <Form.Item
        label="Lý do nghỉ (tùy chọn)"
        name="reason"
        rules={[{ max: 500, message: "Lý do không được quá 500 ký tự!" }]}
      >
        <TextArea
          rows={4}
          placeholder="Nhập lý do nghỉ (nếu có)"
          showCount
          maxLength={500}
        />
      </Form.Item>

      <Form.Item className="mb-0">
        <Space className="w-full justify-end">
          <Button onClick={handleCancel} disabled={loading}>
            {cancelText}
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {finalSubmitText}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
