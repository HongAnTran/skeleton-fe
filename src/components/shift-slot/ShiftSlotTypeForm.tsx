import { useEffect } from "react";
import { Form, Input, TimePicker, Button, Space, Row, Col } from "antd";
import dayjs, { Dayjs } from "dayjs";
import type {
  ShiftSlotType,
  CreateShiftSlotTypeDto,
  UpdateShiftSlotTypeDto,
} from "../../types/shiftSlotType";

interface ShiftSlotTypeFormProps {
  shiftSlotType?: ShiftSlotType | null;
  onSubmit: (
    data: CreateShiftSlotTypeDto | UpdateShiftSlotTypeDto
  ) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  submitText?: string;
  cancelText?: string;
}

export function ShiftSlotTypeForm({
  shiftSlotType,
  onSubmit,
  onCancel,
  loading = false,
  submitText,
  cancelText = "Hủy",
}: ShiftSlotTypeFormProps) {
  const [form] = Form.useForm();

  const isEditing = !!shiftSlotType;
  const defaultSubmitText = isEditing ? "Cập nhật" : "Thêm";
  const finalSubmitText = submitText || `${defaultSubmitText} loại ca`;

  const handleSubmit = async (values: {
    name: string;
    timeRange: [Dayjs, Dayjs];
  }) => {
    try {
      const startTime = values.timeRange[0];
      const endTime = values.timeRange[1];

      const startDate = startTime.toISOString();
      const endDate = endTime.toISOString();

      if (isEditing && shiftSlotType) {
        const updateData: UpdateShiftSlotTypeDto = {
          name: values.name,
          startDate,
          endDate,
        };
        await onSubmit(updateData);
      } else {
        const createData: CreateShiftSlotTypeDto = {
          name: values.name,
          startDate,
          endDate,
        };
        await onSubmit(createData);
      }
      form.resetFields();
    } catch (error) {
      // Error handling is done by parent component
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  useEffect(() => {
    if (shiftSlotType) {
      const startTime = dayjs(shiftSlotType.startDate);
      const endTime = dayjs(shiftSlotType.endDate);

      form.setFieldsValue({
        name: shiftSlotType.name,
        timeRange: [startTime, endTime],
      });
    } else {
      form.resetFields();
    }
  }, [shiftSlotType, form]);

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="Tên loại ca"
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập tên loại ca!" },
              { min: 2, message: "Tên phải có ít nhất 2 ký tự!" },
              { max: 100, message: "Tên không được quá 100 ký tự!" },
            ]}
          >
            <Input placeholder="VD: Ca sáng, Ca chiều, Ca tối" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="Thời gian làm việc"
            name="timeRange"
            rules={[
              { required: true, message: "Vui lòng chọn thời gian làm việc!" },
              {
                validator: (_, value) => {
                  if (!value || !value[0] || !value[1]) {
                    return Promise.reject(
                      new Error(
                        "Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc!"
                      )
                    );
                  }
                  if (
                    value[1].isBefore(value[0]) ||
                    value[1].isSame(value[0])
                  ) {
                    return Promise.reject(
                      new Error(
                        "Thời gian kết thúc phải sau thời gian bắt đầu!"
                      )
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <TimePicker.RangePicker
              format="HH:mm"
              placeholder={["Thời gian bắt đầu", "Thời gian kết thúc"]}
              className="w-full"
            />
          </Form.Item>
        </Col>
      </Row>

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
