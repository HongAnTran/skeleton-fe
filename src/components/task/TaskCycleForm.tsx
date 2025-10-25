import React, { useEffect } from "react";
import { Form, Select, DatePicker, Button, Space } from "antd";
import {
  useCreateTaskCycle,
  useUpdateTaskCycle,
} from "../../queries/task.queries";
import { useTaskSchedules } from "../../queries/task.queries";
import type {
  TaskCycle,
  CreateTaskCycleDto,
  UpdateTaskCycleDto,
} from "../../types/task";
import dayjs from "dayjs";

interface TaskCycleFormProps {
  cycle?: TaskCycle;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TaskCycleForm: React.FC<TaskCycleFormProps> = ({
  cycle,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const isEditing = !!cycle;

  const createMutation = useCreateTaskCycle();
  const updateMutation = useUpdateTaskCycle();
  const { data: schedules } = useTaskSchedules();

  const handleSubmit = async (
    values: CreateTaskCycleDto | UpdateTaskCycleDto
  ) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: cycle!.id,
          data: values as UpdateTaskCycleDto,
        });
      } else {
        await createMutation.mutateAsync(values as CreateTaskCycleDto);
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error saving cycle:", error);
    }
  };

  const scheduleOptions =
    schedules?.map((schedule) => ({
      label: `${schedule.template?.title} (${schedule.frequency})`,
      value: schedule.id,
    })) || [];

  useEffect(() => {
    if (isEditing && cycle) {
      form.setFieldsValue({
        scheduleId: cycle.scheduleId,
        periodStart: cycle.periodStart ? dayjs(cycle.periodStart) : undefined,
        periodEnd: cycle.periodEnd ? dayjs(cycle.periodEnd) : undefined,
      });
    }
  }, [cycle, form, isEditing]);

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        scheduleId: cycle?.scheduleId || "",
        periodStart: cycle?.periodStart ? dayjs(cycle.periodStart) : dayjs(),
        periodEnd: cycle?.periodEnd
          ? dayjs(cycle.periodEnd)
          : dayjs().add(1, "month"),
      }}
      onFinish={handleSubmit}
    >
      <Form.Item
        name="scheduleId"
        label="Lịch trình"
        rules={[{ required: true, message: "Vui lòng chọn lịch trình" }]}
      >
        <Select
          options={scheduleOptions}
          placeholder="Chọn lịch trình"
          disabled={isEditing}
        />
      </Form.Item>

      <Form.Item
        name="periodStart"
        label="Thời gian bắt đầu"
        rules={[{ required: true, message: "Vui lòng chọn thời gian bắt đầu" }]}
      >
        <DatePicker
          style={{ width: "100%" }}
          placeholder="Chọn thời gian bắt đầu"
        />
      </Form.Item>

      <Form.Item
        name="periodEnd"
        label="Thời gian kết thúc"
        rules={[
          { required: true, message: "Vui lòng chọn thời gian kết thúc" },
        ]}
      >
        <DatePicker
          style={{ width: "100%" }}
          placeholder="Chọn thời gian kết thúc"
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
