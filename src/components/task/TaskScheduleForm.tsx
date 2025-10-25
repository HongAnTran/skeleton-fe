import React, { useEffect } from "react";
import { Form, Select, InputNumber, DatePicker, Button, Space } from "antd";
import {
  useCreateTaskSchedule,
  useUpdateTaskSchedule,
} from "../../queries/task.queries";
import { useTaskTemplates } from "../../queries/task.queries";
import type {
  TaskSchedule,
  CreateTaskScheduleDto,
  UpdateTaskScheduleDto,
} from "../../types/task";
import { TaskFrequency } from "../../types/task";
import dayjs from "dayjs";

interface TaskScheduleFormProps {
  schedule?: TaskSchedule;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TaskScheduleForm: React.FC<TaskScheduleFormProps> = ({
  schedule,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const isEditing = !!schedule;

  const createMutation = useCreateTaskSchedule();
  const updateMutation = useUpdateTaskSchedule();
  const { data: templates } = useTaskTemplates();

  const handleSubmit = async (
    values: CreateTaskScheduleDto | UpdateTaskScheduleDto
  ) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: schedule!.id,
          data: values as UpdateTaskScheduleDto,
        });
      } else {
        await createMutation.mutateAsync(values as CreateTaskScheduleDto);
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error saving schedule:", error);
    }
  };

  const frequencyOptions = [
    { label: "Không lặp", value: TaskFrequency.NONE },
    { label: "Hàng ngày", value: TaskFrequency.DAILY },
    { label: "Hàng tuần", value: TaskFrequency.WEEKLY },
    { label: "Hàng tháng", value: TaskFrequency.MONTHLY },
    { label: "Hàng quý", value: TaskFrequency.QUARTERLY },
    { label: "Hàng năm", value: TaskFrequency.YEARLY },
  ];

  const templateOptions =
    templates?.map((template) => ({
      label: template.title,
      value: template.id,
    })) || [];

  const selectedFrequency = Form.useWatch("frequency", form);

  useEffect(() => {
    if (isEditing && schedule) {
      form.setFieldsValue({
        templateId: schedule.templateId,
        frequency: schedule.frequency,
        interval: schedule.interval,
        dayOfMonth: schedule.dayOfMonth,
        startDate: schedule.startDate ? dayjs(schedule.startDate) : undefined,
        endDate: schedule.endDate ? dayjs(schedule.endDate) : undefined,
      });
    }
  }, [schedule, form, isEditing]);

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        templateId: schedule?.templateId || "",
        frequency: schedule?.frequency || TaskFrequency.MONTHLY,
        interval: schedule?.interval || 1,
        dayOfMonth: schedule?.dayOfMonth || 1,
        startDate: schedule?.startDate ? dayjs(schedule.startDate) : dayjs(),
        endDate: schedule?.endDate ? dayjs(schedule.endDate) : undefined,
      }}
      onFinish={handleSubmit}
    >
      <Form.Item
        name="templateId"
        label="Mẫu nhiệm vụ"
        rules={[{ required: true, message: "Vui lòng chọn mẫu nhiệm vụ" }]}
      >
        <Select
          options={templateOptions}
          placeholder="Chọn mẫu nhiệm vụ"
          disabled={isEditing}
        />
      </Form.Item>

      <Form.Item
        name="frequency"
        label="Tần suất"
        rules={[{ required: true, message: "Vui lòng chọn tần suất" }]}
      >
        <Select options={frequencyOptions} placeholder="Chọn tần suất" />
      </Form.Item>

      {selectedFrequency && selectedFrequency !== TaskFrequency.NONE && (
        <Form.Item
          name="interval"
          label="Khoảng cách"
          rules={[{ required: true, message: "Vui lòng nhập khoảng cách" }]}
        >
          <InputNumber
            min={1}
            style={{ width: "100%" }}
            placeholder="VD: 1 = mỗi lần, 2 = cứ 2 lần"
          />
        </Form.Item>
      )}

      {selectedFrequency === TaskFrequency.MONTHLY && (
        <Form.Item
          name="dayOfMonth"
          label="Ngày trong tháng"
          rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
        >
          <InputNumber
            min={1}
            max={31}
            style={{ width: "100%" }}
            placeholder="Chọn ngày (1-31)"
          />
        </Form.Item>
      )}

      <Form.Item
        name="startDate"
        label="Ngày bắt đầu"
        rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
      >
        <DatePicker style={{ width: "100%" }} placeholder="Chọn ngày bắt đầu" />
      </Form.Item>

      <Form.Item name="endDate" label="Ngày kết thúc">
        <DatePicker
          style={{ width: "100%" }}
          placeholder="Chọn ngày kết thúc (tùy chọn)"
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button
            type="primary"
            htmlType="submit"
            loading={createMutation.isPending || updateMutation.isPending}
          >
            {isEditing ? "Cập nhật" : "Tạo mới"}
          </Button>
          <Button onClick={onCancel}>Hủy</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};
